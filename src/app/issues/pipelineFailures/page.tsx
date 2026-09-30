'use client'
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Typography from '@mui/joy/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/joy/Alert';

import { PipelineFailureRow } from '@/lib/types/pipeline_failures';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

type GridRow = PipelineFailureRow & { id: number };

// Not every ledger row is tied to an interview - only interview_name/study/subject
// identifiers (and file_path/batch/other rows where the study+subject happen to
// be known) can be drilled into. Everything else falls back to copyable text,
// since there's no portable way to link an arbitrary file_path in this app today.
function linkFor(row: PipelineFailureRow): string | null {
    if (row.pf_identifier_type === 'interview_name') {
        return `/interviews/${row.pf_identifier}`;
    }
    if (row.pf_study_id && row.pf_subject_id) {
        return `/studies/${row.pf_study_id}/subjects/${row.pf_subject_id}`;
    }
    if (row.pf_identifier_type === 'study' && row.pf_study_id) {
        return `/studies/${row.pf_study_id}`;
    }
    return null;
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
}

async function resolveFailure(row: PipelineFailureRow): Promise<void> {
    const note = window.prompt('Optional note for resolving this failure:') ?? undefined;

    const response = await fetch('/api/v1/issues/unresolved/pipeline-failures/resolve', {
        method: 'POST',
        body: JSON.stringify({
            pf_stage: row.pf_stage,
            pf_identifier: row.pf_identifier,
            pf_identifier_type: row.pf_identifier_type,
            note,
        }),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Failed to resolve failure');
    }
}

const GROUP_BY_OPTIONS: GroupByOption<PipelineFailureRow>[] = [
    { field: 'pf_stage', label: 'Stage' },
    { field: 'pf_error_code', label: 'Error Code' },
    { field: 'pf_identifier_type', label: 'Identifier Type' },
    { field: 'pf_study_id', label: 'Study ID' },
    { field: 'pf_resolved', label: 'Resolved' },
];

const FETCH_LIMIT = 3000;

export default function PipelineFailuresIssues() {
    const [rows, setRows] = useState<PipelineFailureRow[] | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);
    const [includeResolved, setIncludeResolved] = useState(false);

    const loadRows = useCallback(() => {
        setRows(null);
        fetch(`/api/v1/issues/unresolved/pipeline-failures?limit=${FETCH_LIMIT}&includeResolved=${includeResolved}`)
            .then((res) => res.json())
            .then((data) => {
                setRows(data.rows);
                setTotalRows(data.metadata?.totalRows ?? null);
            });
    }, [includeResolved]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const handleResolve = useCallback((row: PipelineFailureRow) => {
        const promise = resolveFailure(row).then(() => loadRows());
        toast.promise(promise, {
            loading: 'Resolving failure...',
            success: 'Failure resolved',
            error: 'Failed to resolve failure',
        });
    }, [loadRows]);

    const columns: GridColDef[] = useMemo(() => [
        { field: 'pf_stage', headerName: 'Stage', width: 180 },
        { field: 'pf_error_code', headerName: 'Error Code', width: 200 },
        {
            field: 'pf_identifier',
            headerName: 'Identifier',
            width: 320,
            renderCell: (params) => {
                const href = linkFor(params.row);
                if (href) {
                    return <Link href={href}>{params.value}</Link>;
                }
                return (
                    <Link component="button" onClick={() => copyToClipboard(params.value)}>
                        {params.value}
                    </Link>
                );
            },
        },
        { field: 'pf_identifier_type', headerName: 'Identifier Type', width: 140 },
        { field: 'pf_study_id', headerName: 'Study ID', width: 130 },
        { field: 'pf_subject_id', headerName: 'Subject ID', width: 130 },
        { field: 'pf_error', headerName: 'Error', width: 350 },
        { field: 'pf_occurrence_count', headerName: 'Occurrences', width: 120, type: 'number' },
        { field: 'pf_first_seen_at', headerName: 'First Seen', width: 200 },
        { field: 'pf_last_seen_at', headerName: 'Last Seen', width: 200 },
        { field: 'pf_resolved', headerName: 'Resolved', width: 110, type: 'boolean' },
        { field: 'pf_resolved_note', headerName: 'Resolved Note', width: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                params.row.pf_resolved ? null : (
                    <Button size="small" onClick={() => handleResolve(params.row)}>
                        Resolve
                    </Button>
                )
            ),
        },
    ], [handleResolve]);

    const gridRows: GridRow[] | null = useMemo(
        () => rows?.map((row) => ({ id: row.pf_id, ...row })) ?? null,
        [rows]
    );

    const dataGridProps: MuiDataGridProps | null = useMemo(() => {
        if (!gridRows) return null;
        return {
            columns,
            rows: gridRows,
            height: 670,
            pageSizeOptions: [10, 20, 50],
            selectable: true,
        };
    }, [gridRows, columns]);

    return (
        <div className="container mx-auto p-4">
            <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Pipeline Failures
            </Typography>

            <Typography level="body-md" sx={{ mb: 3, maxWidth: '800px' }}>
                Errors raised across every pipeline stage/crawler, deduplicated by stage +
                identifier (recurrences bump the occurrence count and refresh &quot;last seen&quot;
                instead of creating a new row).
            </Typography>

            <FormControlLabel
                control={<Switch checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} />}
                label="Show resolved failures"
                sx={{ mb: 3 }}
            />

            {totalRows !== null && totalRows >= FETCH_LIMIT && (
                <Alert variant="soft" color="warning" sx={{ mb: 3 }}>
                    This page fetches at most {FETCH_LIMIT} rows, and the ledger currently has{' '}
                    {totalRows}{totalRows > FETCH_LIMIT ? '+' : ''} unresolved failures matching this filter.
                    Counts and aggregates below may be incomplete — contact a maintainer to raise the limit
                    or add pagination.
                </Alert>
            )}

            {!dataGridProps ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-center">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                        <Typography level="body-sm" color="neutral">Loading data...</Typography>
                    </div>
                </div>
            ) : dataGridProps.rows.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                    <Typography level="body-md">
                        No pipeline failures found.
                    </Typography>
                </div>
            ) : (
                <>
                    <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                        The following {dataGridProps.rows.length} failures were found:
                    </Typography>

                    <AggregationSummary
                        rows={rows ?? []}
                        groupByOptions={GROUP_BY_OPTIONS}
                        sumField={{ field: 'pf_occurrence_count', label: 'Occurrences' }}
                        defaultGroupBy="pf_stage"
                    />

                    <MuiDataGrid {...dataGridProps} />
                </>
            )}
        </div>
    );
}
