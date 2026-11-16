'use client'
import * as React from 'react';
import { use, useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';
import { UNMATCHED_CATEGORY_LABELS, UnmatchedRow } from '@/lib/types/status_summary';

const GROUP_BY_OPTIONS: GroupByOption<UnmatchedRow>[] = [
    { field: 'category', label: 'Category' },
    { field: 'interview_type', label: 'Type' },
    { field: 'subject_id', label: 'Subject ID' },
];

function actionFor(row: UnmatchedRow): { label: string; href: string } | null {
    switch (row.category) {
        case 'link_candidate':
        case 'other_type':
            return { label: 'Open QC form', href: `/interviews/${row.candidate_interview}` };
        case 'unparsed_file':
            return { label: 'Runsheet Match', href: `/issues/runsheetMatch/${row.site}/${row.subject_id}` };
        case 'no_trace':
            return null;
    }
}

const COLUMNS: GridColDef[] = [
    { field: 'subject_id', headerName: 'Subject ID', width: 130 },
    { field: 'interview_type', headerName: 'Type', width: 90 },
    { field: 'event_name', headerName: 'Event', width: 220 },
    { field: 'expected_date', headerName: 'Runsheet Date', width: 130 },
    { field: 'expected_day', headerName: 'Day', width: 80, type: 'number' },
    {
        field: 'category',
        headerName: 'Category',
        width: 140,
        valueFormatter: (value: UnmatchedRow['category']) => UNMATCHED_CATEGORY_LABELS[value],
    },
    {
        field: 'candidate_interview',
        headerName: 'Candidate Interview',
        width: 320,
        renderCell: (params) => params.value
            ? <Link href={`/interviews/${params.value}`}>{params.value}</Link>
            : null,
    },
    { field: 'candidate_offset_days', headerName: 'Days Off', width: 100, type: 'number' },
    {
        field: 'action',
        headerName: 'Resolve',
        width: 150,
        sortable: false,
        renderCell: (params) => {
            const action = actionFor(params.row);
            return action
                ? <Link href={action.href}>{action.label}</Link>
                : <span className="text-muted-foreground">Follow up with site</span>;
        },
    },
];

export default function UnmatchedSite({ params }: { params: Promise<{ study_id: string }> }) {
    const { study_id } = use(params);
    const [rows, setRows] = useState<UnmatchedRow[] | null>(null);

    useEffect(() => {
        fetch(`/api/v3/status/unmatched?study_id=${encodeURIComponent(study_id)}`)
            .then((res) => res.json())
            .then((data: UnmatchedRow[]) => setRows(data));
    }, [study_id]);

    const gridRows = React.useMemo(
        () => (rows ?? []).map((row) => ({ id: row.expected_name, ...row })),
        [rows],
    );

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div>
                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Unmatched Runsheets · {study_id}
                </Typography>
                <Typography level="body-md" sx={{ maxWidth: '800px' }}>
                    <Link href="/status/unmatched">All sites</Link> · Each row is a runsheet entry with no
                    matched recording, with the evidence found and where to resolve it.
                </Typography>
            </div>

            {!rows ? (
                <Typography level="body-sm" color="neutral">Loading data...</Typography>
            ) : rows.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <Typography level="body-md">No unmatched runsheet entries for this site.</Typography>
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
