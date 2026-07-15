'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';

import { AwaitingVendorRow } from '@/lib/types/transcribeme';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';

function linkFor(row: AwaitingVendorRow): string {
    if (row.source_type === 'audio_journal') {
        return `/studies/${row.study_id}/subjects/${row.subject_id}/journals/${row.interview_name}`;
    }
    return `/interviews/${row.interview_name}`;
}

export default function AwaitingVendorTranscriptionIssues() {
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
        { field: 'source_language', headerName: 'Language', width: 120 },
        { field: 'sftp_upload_timestamp', headerName: 'Pushed At', width: 200 },
        {
            field: 'hours_waiting',
            headerName: 'Hours Waiting',
            width: 140,
            valueGetter: (value) => typeof value === 'number' ? Math.round(value) : value,
        },
    ], []);

    useEffect(() => {
        fetch('/api/v1/issues/unresolved/awaiting-vendor-transcription?limit=2000')
            .then((res) => res.json())
            .then((data) => {
                const gridRows = data.rows.map((row: AwaitingVendorRow, index: number) => ({
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
                Awaiting Vendor Transcription
            </Typography>

            <Typography level="body-md" sx={{ mb: 3, maxWidth: '800px' }}>
                These interviews / audio journals have been pushed to TranscribeMe
                but no transcript has been pulled back yet. A long wait here may mean
                the file is stuck at the vendor rather than simply queued.
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
                        No recordings awaiting vendor transcription found.
                    </Typography>
                </div>
            ) : (
                <>
                    <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                        The following {dataGridProps.rows.length} recordings are awaiting a transcript from TranscribeMe:
                    </Typography>
                    <div className="mt-4">
                        <MuiDataGrid {...dataGridProps} />
                    </div>
                </>
            )}
        </div>
    );
}
