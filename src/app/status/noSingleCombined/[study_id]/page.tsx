'use client'
import * as React from 'react';
import { use, useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';
import { NO_SINGLE_COMBINED_CATEGORY_LABELS, NoSingleCombinedRow } from '@/lib/types/status_summary';

const GROUP_BY_OPTIONS: GroupByOption<NoSingleCombinedRow>[] = [
    { field: 'category', label: 'Category' },
    { field: 'interview_type', label: 'Type' },
    { field: 'subject_id', label: 'Subject ID' },
];

// Only these two have a page to resolve them on; the rest need files from the site
function actionFor(row: NoSingleCombinedRow): { label: string; href: string } | null {
    switch (row.category) {
        case 'multiple_combined':
            return { label: 'Multiple Combined Audio', href: '/issues/multiCombinedAudio' };
        case 'unrecognized_audio':
            return { label: 'Unlabelled Audio', href: '/issues/unlabelledAudio' };
        default:
            return null;
    }
}

const COLUMNS: GridColDef[] = [
    { field: 'subject_id', headerName: 'Subject ID', width: 130 },
    { field: 'interview_type', headerName: 'Type', width: 90 },
    {
        field: 'interview_name',
        headerName: 'Interview',
        width: 320,
        renderCell: (params) => <Link href={`/interviews/${params.value}`}>{params.value}</Link>,
    },
    {
        field: 'category',
        headerName: 'Category',
        width: 170,
        valueFormatter: (value: NoSingleCombinedRow['category']) => NO_SINGLE_COMBINED_CATEGORY_LABELS[value],
    },
    { field: 'n_combined_audio', headerName: 'Combined', width: 100, type: 'number' },
    { field: 'n_participant_audio', headerName: 'Participant', width: 110, type: 'number' },
    { field: 'n_interviewer_audio', headerName: 'Interviewer', width: 110, type: 'number' },
    { field: 'n_audio', headerName: 'All audio', width: 100, type: 'number' },
    {
        field: 'action',
        headerName: 'Resolve',
        width: 190,
        sortable: false,
        renderCell: (params) => {
            const action = actionFor(params.row);
            return action
                ? <Link href={action.href}>{action.label}</Link>
                : <span className="text-muted-foreground">Follow up with site</span>;
        },
    },
];

export default function NoSingleCombinedSite({ params }: { params: Promise<{ study_id: string }> }) {
    const { study_id } = use(params);
    const [rows, setRows] = useState<NoSingleCombinedRow[] | null>(null);

    useEffect(() => {
        fetch(`/api/v3/status/noSingleCombined?study_id=${encodeURIComponent(study_id)}`)
            .then((res) => res.json())
            .then((data: NoSingleCombinedRow[]) => setRows(data));
    }, [study_id]);

    const gridRows = React.useMemo(
        () => (rows ?? []).map((row) => ({ id: row.expected_name, ...row })),
        [rows],
    );

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div>
                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    No Single Combined Audio · {study_id}
                </Typography>
                <Typography level="body-md" sx={{ maxWidth: '800px' }}>
                    <Link href="/status/noSingleCombined">All sites</Link> · Each row is a matched interview
                    with its audio file counts by role, ignored files and non-primary parts excluded.
                </Typography>
            </div>

            {!rows ? (
                <Typography level="body-sm" color="neutral">Loading data...</Typography>
            ) : rows.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <Typography level="body-md">No interviews without a single combined-audio file for this site.</Typography>
                </div>
            ) : (
                <>
                    <AggregationSummary rows={gridRows} groupByOptions={GROUP_BY_OPTIONS} />
                    <MuiDataGrid columns={COLUMNS} rows={gridRows} height={670} pageSizeOptions={[50, 100]} />
                </>
            )}
        </div>
    );
}
