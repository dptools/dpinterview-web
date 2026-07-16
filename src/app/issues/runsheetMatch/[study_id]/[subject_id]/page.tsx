'use client'
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { PipelineFailureRow } from '@/lib/types/pipeline_failures';
import { InterviewIssue } from '@/app/api/v1/issues/unresolved/missing/route';
import { DbInterviewEnhanced } from '@/lib/types/interview';

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
}

// pf_identifier is a raw path like ".../raw/{subject_id}/interviews/{interview_type}/{leaf}"
// - the leaf is what failed to parse, but the segment structure above it is
// reliable, so the interview_type can still be read off the path.
function extractInterviewType(pfIdentifier: string): string | null {
    const parts = pfIdentifier.split('/');
    const idx = parts.indexOf('interviews');
    if (idx === -1 || idx + 1 >= parts.length) return null;
    return parts[idx + 1];
}

type TimelineEntry = {
    key: string;
    date: string | null;
    interview_type: string;
    status: 'matched' | 'missing';
    label: string;
    missingRow?: InterviewIssue;
};

export default function RunsheetMatchDetail({
    params,
}: {
    params: Promise<{ study_id: string; subject_id: string }>;
}) {
    const [studyId, setStudyId] = useState<string>('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [failures, setFailures] = useState<PipelineFailureRow[] | null>(null);
    const [missing, setMissing] = useState<InterviewIssue[] | null>(null);
    const [matched, setMatched] = useState<DbInterviewEnhanced[] | null>(null);
    const [pendingIdentifiers, setPendingIdentifiers] = useState<Set<string>>(new Set());

    const [selectedFailure, setSelectedFailure] = useState<PipelineFailureRow | null>(null);
    const [selectedMissing, setSelectedMissing] = useState<InterviewIssue | null>(null);
    const [overrideDate, setOverrideDate] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback((study: string, subject: string) => {
        setFailures(null);
        setMissing(null);
        setMatched(null);
        fetch(`/api/v1/issues/unresolved/pipeline-failures?limit=3000&includeResolved=false&errorCode=datetime_parse&study_id=${study}&subject_id=${subject}`)
            .then((res) => res.json())
            .then((data) => setFailures(data.rows));
        fetch(`/api/v1/issues/unresolved/missing?limit=3000&study_id=${study}&subject_id=${subject}`)
            .then((res) => res.json())
            .then((data) => setMissing(data.rows));
        fetch(`/api/v3/studies/${study}/subjects/${subject}/interviews`)
            .then((res) => res.json())
            .then((data) => setMatched(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        (async () => {
            const resolved = await params;
            setStudyId(resolved.study_id);
            setSubjectId(resolved.subject_id);
            loadData(resolved.study_id, resolved.subject_id);
        })();
    }, [params, loadData]);

    // Best-effort: mark any failure that already has a pending (unconsumed)
    // override as such, so staff don't re-submit a match that's already
    // waiting on the crawler's next pass.
    useEffect(() => {
        if (!failures || failures.length === 0) {
            setPendingIdentifiers(new Set());
            return;
        }
        const identifiers = failures.map((f) => f.pf_identifier).join(',');
        fetch(`/api/v1/issues/unresolved/pipeline-failures/datetime-override?identifiers=${encodeURIComponent(identifiers)}`)
            .then((res) => res.json())
            .then((data) => {
                const pending = new Set<string>(
                    (data.overrides ?? [])
                        .filter((o: { do_consumed_at: string | null }) => !o.do_consumed_at)
                        .map((o: { do_identifier: string }) => o.do_identifier)
                );
                setPendingIdentifiers(pending);
            })
            .catch(() => undefined);
    }, [failures]);

    const timeline: TimelineEntry[] = useMemo(() => {
        if (!matched || !missing) return [];
        const matchedEntries: TimelineEntry[] = matched.map((m) => ({
            key: `matched-${m.interview_name}`,
            date: m.interview_datetime ? new Date(m.interview_datetime).toISOString() : null,
            interview_type: m.interview_type,
            status: 'matched',
            label: m.interview_name,
        }));
        const missingEntries: TimelineEntry[] = missing.map((m) => ({
            key: `missing-${m.interview_name}`,
            date: m.expected_date ? new Date(m.expected_date).toISOString() : null,
            interview_type: m.interview_type,
            status: 'missing',
            label: `${m.interview_type} - expected day ${m.expected_day}`,
            missingRow: m,
        }));
        return [...matchedEntries, ...missingEntries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
    }, [matched, missing]);

    const unmatchedFiles: PipelineFailureRow[] = useMemo(() => {
        if (!failures) return [];
        return [...failures].sort((a, b) => {
            const ta = extractInterviewType(a.pf_identifier) ?? '';
            const tb = extractInterviewType(b.pf_identifier) ?? '';
            return ta.localeCompare(tb) || a.pf_identifier.localeCompare(b.pf_identifier);
        });
    }, [failures]);

    const handleSelectMissing = (entry: TimelineEntry) => {
        if (entry.status !== 'missing' || !entry.missingRow) return;
        setSelectedMissing(entry.missingRow);
        setOverrideDate(entry.missingRow.expected_date ? String(entry.missingRow.expected_date).slice(0, 10) : '');
    };

    const handleConfirmMatch = async () => {
        if (!selectedFailure || !overrideDate) return;
        setSubmitting(true);
        try {
            const response = await fetch('/api/v1/issues/unresolved/pipeline-failures/datetime-override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pf_identifier: selectedFailure.pf_identifier,
                    study_id: studyId,
                    subject_id: subjectId,
                    override_datetime: overrideDate,
                }),
            });
            if (!response.ok) throw new Error('Failed to submit match');
            toast.success('Match submitted - will be picked up on the crawler\'s next pass');
            setPendingIdentifiers((prev) => new Set(prev).add(selectedFailure.pf_identifier));
            setSelectedFailure(null);
            setSelectedMissing(null);
            setOverrideDate('');
        } catch {
            toast.error('Failed to submit match');
        } finally {
            setSubmitting(false);
        }
    };

    const loading = !failures || !missing || !matched;

    return (
        <div className="container mx-auto p-4">
            <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                Runsheet Match: {subjectId}
            </Typography>
            <Typography level="body-md" sx={{ mb: 3, color: 'neutral.600' }}>
                <Link href="/issues/runsheetMatch">&larr; Back to subjects</Link> &middot; Study {studyId}
            </Typography>

            <Alert variant="soft" color="neutral" sx={{ mb: 4 }}>
                Select an unmatched file on the right and a missing runsheet entry on the left, then
                confirm the match. The corrected datetime is picked up by the pipeline on its next
                run, which imports the file normally and resolves the pipeline failure - nothing on
                disk is renamed, and no note is required.
            </Alert>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-center">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                        <Typography level="body-sm" color="neutral">Loading data...</Typography>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="border rounded-lg p-4">
                            <Typography level="title-md" sx={{ mb: 2 }}>
                                Timeline (matched + missing runsheet entries)
                            </Typography>
                            {timeline.length === 0 ? (
                                <Typography level="body-sm" color="neutral">Nothing to show.</Typography>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                                    {timeline.map((entry) => {
                                        const selectable = entry.status === 'missing';
                                        const selected = selectedMissing && entry.missingRow === selectedMissing;
                                        return (
                                            <div
                                                key={entry.key}
                                                onClick={() => selectable && handleSelectMissing(entry)}
                                                className={[
                                                    'border rounded p-2 text-sm',
                                                    entry.status === 'matched' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200',
                                                    selectable ? 'cursor-pointer' : '',
                                                    selected ? 'ring-2 ring-blue-500' : '',
                                                ].join(' ')}
                                            >
                                                <div className="flex justify-between">
                                                    <span className="font-medium">
                                                        {entry.status === 'matched' ? '✓ Matched' : '○ Missing'} - {entry.interview_type}
                                                    </span>
                                                    <span className="text-neutral-500">{entry.date ? entry.date.slice(0, 10) : 'unknown date'}</span>
                                                </div>
                                                <div className="text-neutral-600">{entry.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="border rounded-lg p-4">
                            <Typography level="title-md" sx={{ mb: 2 }}>
                                Unmatched files (datetime_parse failures)
                            </Typography>
                            {unmatchedFiles.length === 0 ? (
                                <Typography level="body-sm" color="neutral">No unresolved datetime_parse failures for this subject.</Typography>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                                    {unmatchedFiles.map((failure) => {
                                        const pending = pendingIdentifiers.has(failure.pf_identifier);
                                        const selected = selectedFailure?.pf_identifier === failure.pf_identifier;
                                        return (
                                            <div
                                                key={failure.pf_id}
                                                onClick={() => !pending && setSelectedFailure(failure)}
                                                className={[
                                                    'border rounded p-2 text-sm',
                                                    pending ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200 cursor-pointer',
                                                    selected ? 'ring-2 ring-blue-500' : '',
                                                ].join(' ')}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="font-mono break-all">{failure.pf_identifier}</span>
                                                    <Button
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(failure.pf_identifier); }}
                                                    >
                                                        Copy
                                                    </Button>
                                                </div>
                                                <div className="text-neutral-600">
                                                    {extractInterviewType(failure.pf_identifier) ?? 'unknown type'}
                                                    {pending && ' — pending crawler pickup'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedFailure && (
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <Typography level="title-md" sx={{ mb: 2 }}>Confirm Match</Typography>
                            <Typography level="body-sm" sx={{ mb: 1 }} className="font-mono">{selectedFailure.pf_identifier}</Typography>
                            <Typography level="body-sm" sx={{ mb: 2 }}>
                                {selectedMissing
                                    ? `Matched to: ${selectedMissing.interview_type} (expected day ${selectedMissing.expected_day})`
                                    : 'Select a missing runsheet entry on the left, or enter a date directly.'}
                            </Typography>
                            <div className="flex items-center gap-3">
                                <label className="text-sm" htmlFor="override-date">Actual event date:</label>
                                <input
                                    id="override-date"
                                    type="date"
                                    value={overrideDate}
                                    onChange={(e) => setOverrideDate(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm"
                                />
                                <Button
                                    variant="contained"
                                    disabled={!overrideDate || submitting}
                                    onClick={handleConfirmMatch}
                                >
                                    Confirm Match
                                </Button>
                                <Button onClick={() => { setSelectedFailure(null); setSelectedMissing(null); setOverrideDate(''); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
