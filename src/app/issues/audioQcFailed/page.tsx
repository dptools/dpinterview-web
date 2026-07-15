'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';

import { FailedAudioQcRow } from '@/lib/types/transcribeme';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';

function linkFor(row: FailedAudioQcRow): string {
    if (row.source_type === 'audio_journal') {
        return `/studies/${row.study_id}/subjects/${row.subject_id}/journals/${row.interview_name}`;
    }
    return `/interviews/${row.interview_name}`;
}

export default function AudioQcFailedIssues() {
    const [dataGridProps, setDataGridProps] = useState<MuiDataGridProps | null>(null);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'interview_name',
            headerName: 'Name',
            width: 350,
            renderCell: (params) => (
                <Link href={linkFor(params.row)}>{params.value}</Link>
            )
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
    ], []);

    useEffect(() => {
        fetch('/api/v1/issues/unresolved/audio-qc-failed?limit=2000')
            .then((res) => res.json())
            .then((data) => {
                const gridRows = data.rows.map((row: FailedAudioQcRow, index: number) => ({
                    id: index,
                    ...row,
                }));

                const props: MuiDataGridProps = {
                    columns,
                    rows: gridRows,
                    height: 670,
                    pageSizeOptions: [10, 20],
                    selectable: true
                };
                setDataGridProps(props);
            });
    }, [columns]);

    return (
        <div className="container mx-auto p-4">
            <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Failed Audio QC
            </Typography>

            <Typography level="body-md" sx={{ mb: 3, maxWidth: '800px' }}>
                Before being sent to TranscribeMe, combined audio is checked for basic
                quality issues (silence, clipping, DC offset, voice activity). These
                interviews / audio journals failed that check and are not being
                transcribed until someone looks at why.
            </Typography>

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
                    <div className="mt-4">
                        <MuiDataGrid {...dataGridProps} />
                    </div>
                </>
            )}
        </div>
    );
}
