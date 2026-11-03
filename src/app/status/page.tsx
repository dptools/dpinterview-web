'use client'
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';
import { ChevronRight } from 'lucide-react';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import SiteStatusChart, { completionRate } from '@/components/domain/SiteStatusChart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { INTERVIEW_STATES, INTERVIEW_STATE_LABELS, SiteStatusRow, StatusSummary } from '@/lib/types/status_summary';

function sumBy<T>(rows: T[], pick: (row: T) => number): number {
    return rows.reduce((total, row) => total + pick(row), 0);
}

function daysAgo(date: string | null): string {
    if (!date) return '—';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
    return `${days} days ago`;
}

function StatTile({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
    const tile = (
        <div className={`rounded-lg border p-4 h-full ${href ? 'hover:shadow-md transition-shadow' : ''}`}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>{label}</Typography>
            <Typography level="h3" sx={{ fontWeight: 600 }}>{value}</Typography>
            {note && <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>{note}</Typography>}
        </div>
    );
    return href ? <Link href={href} underline="none" color="inherit">{tile}</Link> : tile;
}

const TABLE_COLUMNS: GridColDef[] = [
    { field: 'site', headerName: 'Site', width: 120 },
    { field: 'completion', headerName: '% Complete', width: 110, type: 'number' },
    { field: 'expected', headerName: 'Expected', width: 100, type: 'number' },
    ...INTERVIEW_STATES.map((state): GridColDef => ({
        field: state,
        headerName: INTERVIEW_STATE_LABELS[state],
        width: 150,
        type: 'number',
    })),
];

// Counts kept out of the completion rate, plus annotations over the expected interviews,
// split by whether someone has something to resolve
const APPENDIX_COUNTS = {
    needs_action: [
        { field: 'no_runsheet', label: 'No runsheet', description: 'Imported interviews no runsheet claims.' },
        { field: 'not_uploaded', label: 'Not uploaded', description: 'Runsheets neither declared missing nor confirming an upload with a date.' },
        { field: 'ambiguous_match', label: 'Ambiguous match', description: 'Expected interviews matched to several recordings.' },
    ],
    reference: [
        { field: 'declared_missing', label: 'Declared missing', description: 'Runsheets marked as missing all their data, with an M1–M6 reason code.' },
        { field: 'manually_matched', label: 'Manually matched', description: 'Expected interviews linked by hand on the QC form.' },
    ],
} as const satisfies Record<string, { field: keyof SiteStatusRow; label: string; description: string }[]>;

const APPENDIX_COLUMNS: GridColDef[] = [
    { field: 'site', headerName: 'Site', width: 120 },
    ...[...APPENDIX_COUNTS.needs_action, ...APPENDIX_COUNTS.reference].map((count): GridColDef => ({
        field: count.field,
        headerName: count.label,
        width: 150,
        type: 'number',
    })),
];

function AppendixGroup({ title, counts, sites }: {
    title: string;
    counts: readonly { field: keyof SiteStatusRow; label: string; description: string }[];
    sites: SiteStatusRow[];
}) {
    return (
        <div className="space-y-3">
            <Typography level="title-md">{title}</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {counts.map((count) => (
                    <StatTile
                        key={count.field}
                        label={count.label}
                        value={sumBy(sites, (row) => Number(row[count.field])).toLocaleString()}
                        note={count.description}
                    />
                ))}
            </div>
        </div>
    );
}

export default function PipelineStatus() {
    const [summary, setSummary] = useState<StatusSummary | null>(null);

    useEffect(() => {
        fetch('/api/v3/status')
            .then((res) => res.json())
            .then((data: StatusSummary) => setSummary(data));
    }, []);

    // Lowest completion first, so the sites needing attention lead
    const sortedSites = useMemo(() => {
        if (!summary) return [];
        return [...summary.sites].sort((a, b) => (completionRate(a) ?? 2) - (completionRate(b) ?? 2));
    }, [summary]);

    if (!summary) {
        return (
            <div className="container mx-auto p-4">
                <Typography level="body-sm" color="neutral">Loading data...</Typography>
            </div>
        );
    }

    const sites = summary.sites;
    const expected = sumBy(sites, (row) => row.expected);
    const completed = sumBy(sites, (row) => row.completed);
    const journals = sumBy(summary.journals, (row) => row.journals);
    const journalSubjects = sumBy(summary.journals, (row) => row.subjects_with_journals);

    const needsAction = sumBy(APPENDIX_COUNTS.needs_action, (count) => sumBy(sites, (row) => Number(row[count.field])));

    const tableRows = sites.map((row) => ({
        id: row.site,
        completion: row.expected > 0 ? Math.round((row.completed / row.expected) * 100) : null,
        ...row,
    }));

    return (
        <div className="container mx-auto p-4 space-y-8">
            <div>
                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Pipeline Status
                </Typography>
                <Typography level="body-md" sx={{ maxWidth: '800px' }}>
                    Every interview a runsheet expects, in exactly one state. Completed means a transcript
                    has been imported. No single combined audio means there is no one combined-audio file
                    (none, or several) for transcription to take, so the interview won&apos;t progress on its own.
                    It is distinct from Failed QC, since audio QC only runs once that file exists. Counts kept out of the
                    completion rate are in the appendix at the bottom.
                </Typography>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="col-span-2 md:col-span-1 rounded-lg border p-4">
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Completion rate</Typography>
                    <div className="text-5xl font-semibold">{expected > 0 ? `${Math.round((completed / expected) * 100)}%` : '—'}</div>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        {completed.toLocaleString()} of {expected.toLocaleString()} expected
                    </Typography>
                </div>
                <StatTile label="Unmatched" value={sumBy(sites, (row) => row.unmatched).toLocaleString()} note="By resolution action →" href="/status/unmatched" />
                <StatTile
                    label="No single combined audio"
                    value={sumBy(sites, (row) => row.no_single_combined_audio).toLocaleString()}
                    note="By audio present →"
                    href="/status/noSingleCombined"
                />
                <StatTile
                    label="Newest interview recording"
                    value={summary.newest_recordings.interview ?? '—'}
                    note={`${daysAgo(summary.newest_recordings.interview)} · journals: ${summary.newest_recordings.journal ?? '—'}`}
                />
                <StatTile
                    label="Audio journals"
                    value={journals.toLocaleString()}
                    note={`${journalSubjects.toLocaleString()} subjects · ${journalSubjects > 0 ? (journals / journalSubjects).toFixed(1) : '—'} per subject`}
                />
            </div>

            <div>
                <Typography level="h4" sx={{ mb: 1 }}>Expected interviews by site</Typography>
                <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
                    Sorted by completion rate, lowest first. Bar length is the site&apos;s expected count.
                </Typography>
                <SiteStatusChart rows={sortedSites} />
            </div>

            <div>
                <Typography level="h4" sx={{ mb: 2 }}>Table view</Typography>
                <MuiDataGrid columns={TABLE_COLUMNS} rows={tableRows} height={600} pageSizeOptions={[50, 100]} />
            </div>

            <Collapsible className="border-t pt-4">
                <CollapsibleTrigger className="group flex items-center gap-2 cursor-pointer">
                    <ChevronRight className="size-4 transition-transform group-data-[state=open]:rotate-90" />
                    <Typography level="h4">Appendix: outside the completion rate</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {needsAction.toLocaleString()} need action
                    </Typography>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 pt-4">
                    <AppendixGroup title="Needs action" counts={APPENDIX_COUNTS.needs_action} sites={sites} />
                    <AppendixGroup title="For reference" counts={APPENDIX_COUNTS.reference} sites={sites} />
                    <MuiDataGrid columns={APPENDIX_COLUMNS} rows={tableRows} height={400} pageSizeOptions={[50, 100]} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
