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

import { FailedAudioQcRow } from '@/lib/types/transcribeme';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

type GridRow = FailedAudioQcRow & { id: number };

const GROUP_BY_OPTIONS: GroupByOption<FailedAudioQcRow>[] = [
    { field: 'source_type', label: 'Source' },
    { field: 'study_id', label: 'Study ID' },
    { field: 'subject_id', label: 'Subject ID' },
    {
        field: 'aqc_fail_reasons',
        label: 'Fail Reason',
        // A row can fail for several reasons at once, so it's counted once per reason
        // rather than once per distinct reason-combination.
        extractKeys: (row) => row.aqc_fail_reasons
            ? Object.entries(row.aqc_fail_reasons).filter(([, failed]) => failed).map(([reason]) => reason)
            : [],
    },
];

function linkFor(row: FailedAudioQcRow): string {
    if (row.source_type === 'audio_journal') {
        return `/studies/${row.study_id}/subjects/${row.subject_id}/journals/${row.interview_name}`;
    }
    return `/interviews/${row.interview_name}`;
}

async function overrideAudioQc(row: FailedAudioQcRow): Promise<void> {
    const response = await fetch('/api/v1/issues/unresolved/audio-qc-failed/override', {
        method: 'POST',
        body: JSON.stringify({
            aqc_source_path: row.aqc_source_path,
            interview_name: row.source_type === 'interview' ? row.interview_name : undefined,
            source_type: row.source_type,
        }),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Failed to override audio QC');
    }
}

export default function AudioQcFailedIssues() {
    const [rows, setRows] = useState<FailedAudioQcRow[] | null>(null);
    const [includeOverridden, setIncludeOverridden] = useState(false);

    const loadRows = useCallback(() => {
        setRows(null);
        fetch(`/api/v1/issues/unresolved/audio-qc-failed?limit=2000&includeOverridden=${includeOverridden}`)
            .then((res) => res.json())
            .then((data) => setRows(data.rows));
    }, [includeOverridden]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const handleOverride = useCallback((row: FailedAudioQcRow) => {
        const confirmed = window.confirm(
            `Push "${row.interview_name}" to TranscribeMe despite failing audio QC?\n\n` +
            'This cannot be undone from the dashboard - once a push runner picks it up, ' +
            'the file is uploaded to TranscribeMe.'
        );
        if (!confirmed) {
            return;
        }

        const promise = overrideAudioQc(row).then(() => loadRows());
        toast.promise(promise, {
            loading: 'Overriding audio QC...',
            success: 'Audio QC overridden - will be pushed to TranscribeMe',
            error: 'Failed to override audio QC',
        });
    }, [loadRows]);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'interview_name',
            headerName: 'Name',
            width: 300,
            renderCell: (params) => (
                <Link href={linkFor(params.row)}>{params.value}</Link>
            )
        },
        {
            field: 'aqc_override',
            headerName: 'QC Override',
            width: 140,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                params.row.aqc_override ? (
                    <span>✅ Bypassed</span>
                ) : (
                    <Button size="small" onClick={() => handleOverride(params.row)}>
                        Bypass QC
                    </Button>
                )
            ),
        },
        { field: 'source_type', headerName: 'Source', width: 130 },
        { field: 'subject_id', headerName: 'Subject ID', width: 150 },
        { field: 'study_id', headerName: 'Study ID', width: 150 },
        {
            field: 'aqc_fail_reasons',
            headerName: 'Fail Reasons',
            width: 350,
            valueGetter: (value) => value ? Object.keys(value).join(', ') : '',
        },
        { field: 'aqc_timestamp', headerName: 'QC Timestamp', width: 200 },
    ], [handleOverride]);

    const gridRows: GridRow[] | null = useMemo(
        () => rows?.map((row, index) => ({ id: index, ...row })) ?? null,
        [rows]
    );

    const dataGridProps: MuiDataGridProps | null = useMemo(() => {
        if (!gridRows) return null;
        return {
            columns,
            rows: gridRows,
            height: 670,
            pageSizeOptions: [10, 20],
            selectable: true,
        };
    }, [gridRows, columns]);

    return (
        <div className="container mx-auto p-4">
            <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Failed Audio QC
            </Typography>

            <Typography level="body-md" sx={{ mb: 3, maxWidth: '800px' }}>
                Before being sent to TranscribeMe, combined audio is checked for basic
                quality issues (silence, clipping, DC offset, voice activity). These
                interviews / audio journals failed that check and are not being
                transcribed until someone looks at why - or manually overrides the
                result below.
            </Typography>

            <FormControlLabel
                control={<Switch checked={includeOverridden} onChange={(e) => setIncludeOverridden(e.target.checked)} />}
                label="Show overridden files"
                sx={{ mb: 3 }}
            />

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
                        No audio QC failures found.
                    </Typography>
                </div>
            ) : (
                <>
                    <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                        The following {dataGridProps.rows.length} recordings failed audio QC:
                    </Typography>
                    <AggregationSummary rows={dataGridProps.rows} groupByOptions={GROUP_BY_OPTIONS} />
                    <div className="mt-4">
                        <MuiDataGrid {...dataGridProps} />
                    </div>
                </>
            )}
        </div>
    );
}
