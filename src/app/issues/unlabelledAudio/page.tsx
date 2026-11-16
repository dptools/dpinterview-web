'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';

import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

import { DbInterview } from '@/lib/types/interview';

type GridRow = { id: string; interview_name: string; interview_type: string; subject_id: string; study_id: string };

const GROUP_BY_OPTIONS: GroupByOption<GridRow>[] = [
    { field: 'interview_type', label: 'Interview Type' },
    { field: 'study_id', label: 'Study ID' },
    { field: 'subject_id', label: 'Subject ID' },
];


export default function UnlabelledAudioIssues() {
    const [dataGridProps, setDataGridProps] = useState<MuiDataGridProps | null>(null);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'interview_name',
            headerName: 'Interview Name',
            width: 500,
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
        fetch('/api/v1/issues/unresolved/audio/unlabelled?limit=2000')
            .then((res) => res.json())
            .then((data) => {

                // parse to grid rows
                const gridRows = data.rows.map((interview: DbInterview) => ({
                    id: interview.interview_name,
                    interview_name: interview.interview_name,
                    interview_type: interview.interview_type,
                    subject_id: interview.subject_id,
                    study_id: interview.study_id
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
        <div className="container mx-auto p-6">
            <h2 className={"typeset typeset-h2 mb-2 font-bold text-(--mui-palette-primary.main)"}>
            Interviews with Unlabelled Diarized Audio
            </h2>

            <p className={"typeset typeset-body-md mb-3 max-w-[800px]"}>
            While the pipeline attempts to label all audio based on filenames, interviews may remain unlabelled if <Link href="https://zenodo.org/records/10475969" target="_blank" rel="noopener noreferrer">standard operating procedures</Link> are not followed.
            </p>

            {!dataGridProps ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-center">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                    <p className={"typeset typeset-body-sm text-neutral-600"}>Loading data...</p>
                </div>
            </div>
            ) : dataGridProps.rows.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <p className={"typeset typeset-body-md"}>No interviews with unlabelled audio found.</p>
            </div>
            ) : (
            <>
                <p className={"typeset typeset-body-md mb-2 font-medium text-neutral-600"}>
                The following {dataGridProps.rows.length} interviews have atleast one unassigned role from the diarized audio.
                </p>
                <AggregationSummary rows={dataGridProps.rows} groupByOptions={GROUP_BY_OPTIONS} />
                <div className="mt-4">
                <MuiDataGrid {...dataGridProps} />
                </div>
            </>
            )}
        </div>
    );
}