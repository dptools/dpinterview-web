'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';
import Alert from '@mui/joy/Alert';

import {DbInterview} from '@/lib/types/interview';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

type GridRow = { id: string; interview_name: string; interview_type: string; subject_id: string; study_id: string };

const GROUP_BY_OPTIONS: GroupByOption<GridRow>[] = [
    { field: 'interview_type', label: 'Interview Type' },
    { field: 'study_id', label: 'Study ID' },
    { field: 'subject_id', label: 'Subject ID' },
];

export default function MissingRunsheet() {
    const [dataGridProps, setDataGridProps] = useState<MuiDataGridProps | null>(null);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'interview_name',
            headerName: 'Interview Name',
            width: 350,
            renderCell: (params) => (
                <Link href={`/interviews/${params.value}`}>{params.value}</Link>
            )
        },
        { field: 'interview_type', headerName: 'Interview Type', width: 150 },
        { field: 'subject_id', headerName: 'Subject ID', width: 150 },
        { field: 'study_id', headerName: 'Study ID', width: 150 },
    ], []);

    useEffect(() => {
        // Fetch data from the API
        fetch('/api/v1/issues/unresolved/missing-runsheet?limit=3000')
            .then((res) => res.json())
            .then((data) => {

                // parse to grid rows
                const gridRows = data.rows.map((interview: DbInterview) => ({
                    id: interview.interview_name,
                    interview_name: interview.interview_name,
                    interview_type: interview.interview_type,
                    subject_id: interview.subject_id,
                    study_id: interview.study_id,
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
                Missing Runsheets
            </Typography>
            
            <Alert
                variant="soft"
                color="neutral"
                size='md'
                sx={{ mb: 4 }}
            >
            <div className="m-4">
                <Typography level="title-md" sx={{ mb: 2, fontWeight: 'medium' }}>
                We expect a Runsheet to be filled in REDCap / RPMS for each interview. If we do do not have the runsheet it could mean:
                </Typography>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full w-6 h-6 flex items-center justify-center">
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>1</Typography>
                        </div>
                        <Typography level="body-md">
                        The runsheet was not filled out in REDCap / RPMS. This is a required step for all interviews.
                        </Typography>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full w-6 h-6 flex items-center justify-center">
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>2</Typography>
                        </div>
                        <Typography level="body-md">
                        Data Flow issues, the runsheet was filled out in REDCap / RPMS but the data flow to the database failed. This is a rare issue.
                        </Typography>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full w-6 h-6 flex items-center justify-center">
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>3</Typography>
                        </div>
                        <Typography level="body-md">
                        The runsheet was not linked to this interview. This can happen if the date in the runsheet is off by more than 10 days from the interview date.
                        </Typography>
                    </div>
                </div>
            </div>
            </Alert>

            {!dataGridProps ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-center">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                <Typography level="body-sm" color="neutral">Loading interview data...</Typography>
                </div>
            </div>
            ) : dataGridProps.rows.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <Typography level="body-md">
                    No interviews with missing runsheets found.
                </Typography>
            </div>
            ) : (
            <>
                <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                The following {dataGridProps.rows.length} interviews have data uploaded, but no runsheets associated with them.
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
