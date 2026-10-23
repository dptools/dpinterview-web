'use client'
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import SiteStatusChart, { completionRate } from '@/components/domain/SiteStatusChart';
import { INTERVIEW_STATES, INTERVIEW_STATE_LABELS, StatusSummary } from '@/lib/types/status_summary';

function sumBy<T>(rows: T[], pick: (row: T) => number): number {
    return rows.reduce((total, row) => total + pick(row), 0);
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
    { field: 'no_runsheet', headerName: 'No Runsheet', width: 120, type: 'number' },
    { field: 'declared_missing', headerName: 'Declared Missing', width: 140, type: 'number' },
    { field: 'ambiguous_match', headerName: 'Ambiguous Match', width: 140, type: 'number' },
    { field: 'manually_matched', headerName: 'Manually Matched', width: 140, type: 'number' },
];

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
                    has been imported. Runsheets declared missing and interviews with no runsheet are
                    counted alongside but kept out of the completion rate.
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
                <StatTile label="No runsheet" value={sumBy(sites, (row) => row.no_runsheet).toLocaleString()} note="Outside the denominator" />
                <StatTile label="Declared missing" value={sumBy(sites, (row) => row.declared_missing).toLocaleString()} note="Outside the denominator" />
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
        </div>
    );
}
