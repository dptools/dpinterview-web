'use client'
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Typography from '@mui/joy/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';
import Alert from '@mui/joy/Alert';

import { DbDashboardAction } from '@/lib/types/dashboard_actions';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

const ACTION_LABELS: Record<string, string> = {
    override_audio_qc: 'Audio QC Bypass',
    datetime_override_pipeline_failure: 'Runsheet Datetime Match',
};

// study_id/subject_id aren't real dashboard_actions columns - every override
// call site records them inside da_metadata instead, so they're pulled out
// here into real fields the grid/aggregation can group and link on.
type LedgerRow = DbDashboardAction & {
    id: number;
    ledger_study_id: string | null;
    ledger_subject_id: string | null;
};

function metaString(row: DbDashboardAction, key: string): string | null {
    const value = row.da_metadata?.[key];
    return typeof value === 'string' ? value : null;
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
}

// Mirrors the linkFor helpers on the audioQcFailed / pipelineFailures pages -
// prefer a direct interview/journal link when we know the name, otherwise
// fall back to the subject page, otherwise there's nothing linkable.
function linkFor(row: LedgerRow): string | null {
    const interviewName = metaString(row, 'interview_name');
    const sourceType = metaString(row, 'source_type');
    if (interviewName && sourceType === 'audio_journal' && row.ledger_study_id && row.ledger_subject_id) {
        return `/studies/${row.ledger_study_id}/subjects/${row.ledger_subject_id}/journals/${interviewName}`;
    }
    if (interviewName) {
        return `/interviews/${interviewName}`;
    }
    if (row.ledger_study_id && row.ledger_subject_id) {
        return `/studies/${row.ledger_study_id}/subjects/${row.ledger_subject_id}`;
    }
    return null;
}

function detailsFor(row: LedgerRow): string {
    const meta = row.da_metadata ?? {};
    const overrideDatetime = metaString(row, 'override_datetime');
    if (overrideDatetime) {
        return `New datetime: ${overrideDatetime}`;
    }
    const reasons = meta.aqc_fail_reasons as Record<string, boolean> | undefined;
    if (reasons) {
        const failed = Object.entries(reasons).filter(([, wasFailed]) => wasFailed).map(([reason]) => reason);
        return failed.length ? `Failed: ${failed.join(', ')}` : 'No fail reasons recorded';
    }
    return '';
}

const GROUP_BY_OPTIONS: GroupByOption<LedgerRow>[] = [
    { field: 'da_action', label: 'Override Type' },
    { field: 'ledger_study_id', label: 'Study ID' },
    { field: 'ledger_subject_id', label: 'Subject ID' },
    {
        field: 'da_metadata',
        label: 'Audio QC Fail Reason',
        // A row can fail for several reasons at once, so it's counted once per
        // reason rather than once per distinct reason-combination. Rows with no
        // aqc_fail_reasons (e.g. datetime overrides) contribute nothing here.
        extractKeys: (row) => {
            const reasons = row.da_metadata?.aqc_fail_reasons as Record<string, boolean> | undefined;
            return reasons
                ? Object.entries(reasons).filter(([, wasFailed]) => wasFailed).map(([reason]) => reason)
                : [];
        },
    },
];

const FETCH_LIMIT = 3000;

export default function OverrideLedgerIssues() {
    const [rows, setRows] = useState<DbDashboardAction[] | null>(null);
    const [totalRows, setTotalRows] = useState<number | null>(null);

    const loadRows = useCallback(() => {
        setRows(null);
        fetch(`/api/v1/issues/dashboard-actions?limit=${FETCH_LIMIT}`)
            .then((res) => res.json())
            .then((data) => {
                setRows(data.rows);
                setTotalRows(data.metadata?.totalRows ?? null);
            });
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const columns: GridColDef[] = useMemo(() => [
        { field: 'da_timestamp', headerName: 'When', width: 200 },
        {
            field: 'da_action',
            headerName: 'Override Type',
            width: 210,
            valueGetter: (value) => ACTION_LABELS[value as string] ?? value,
        },
        {
            field: 'da_target_id',
            headerName: 'File / Identifier',
            width: 320,
            renderCell: (params) => (
                <Link component="button" onClick={() => copyToClipboard(params.value)}>
                    {params.value}
                </Link>
            ),
        },
        {
            field: 'linked_name',
            headerName: 'Interview / Subject',
            width: 220,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const href = linkFor(params.row as LedgerRow);
                const label = metaString(params.row, 'interview_name') ?? params.row.ledger_subject_id ?? '';
                if (!href) return label || null;
                return <Link href={href}>{label}</Link>;
            },
        },
        { field: 'ledger_study_id', headerName: 'Study ID', width: 130 },
        { field: 'ledger_subject_id', headerName: 'Subject ID', width: 130 },
        {
            field: 'details',
            headerName: 'Details',
            width: 320,
            sortable: false,
            filterable: false,
            valueGetter: (_value, row) => detailsFor(row as LedgerRow),
        },
        { field: 'da_user_id', headerName: 'Performed By', width: 150 },
    ], []);

    const gridRows: LedgerRow[] | null = useMemo(
        () => rows?.map((row) => ({
            id: row.da_id,
            ...row,
            ledger_study_id: metaString(row, 'study_id'),
            ledger_subject_id: metaString(row, 'subject_id'),
        })) ?? null,
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
                Override Ledger
            </Typography>

            <Typography level="body-md" sx={{ mb: 3, maxWidth: '800px' }}>
                Audit trail of manual overrides performed from the dashboard: audio QC
                bypasses and runsheet datetime matches. Use this to report on how many
                files were addressed through these mechanisms, and to trace back an
                individual action if it needs to be reviewed or undone.
            </Typography>

            {totalRows !== null && totalRows >= FETCH_LIMIT && (
                <Alert variant="soft" color="warning" sx={{ mb: 3 }}>
                    This page fetches at most {FETCH_LIMIT} rows, and the ledger currently has{' '}
                    {totalRows}{totalRows > FETCH_LIMIT ? '+' : ''} matching entries. Counts and
                    aggregates below may be incomplete — contact a maintainer to raise the limit
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
                        No manual overrides recorded yet.
                    </Typography>
                </div>
            ) : (
                <>
                    <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                        The following {dataGridProps.rows.length} override actions were recorded:
                    </Typography>

                    <AggregationSummary
                        rows={gridRows ?? []}
                        groupByOptions={GROUP_BY_OPTIONS}
                        defaultGroupBy="da_action"
                    />

                    <MuiDataGrid {...dataGridProps} />
                </>
            )}
        </div>
    );
}
