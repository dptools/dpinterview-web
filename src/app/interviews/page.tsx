'use client'
import * as React from 'react';

import Link from '@mui/material/Link';
import {Alert, AlertDescription} from '@/components/ui/alert';
import { GridColDef } from '@mui/x-data-grid';
import { Dashboard } from '@mui/icons-material';

import { DbInterview } from '@/lib/types/interview';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';

export default function Interviews() {
    const [dataGridProps, setDataGridProps] = React.useState<MuiDataGridProps | null>(null);

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

    React.useEffect(() => {
        // Fetch data from the API
        fetch('/api/v1/interviews/list?limit=20000')
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
        <>
            <div className="container mx-auto p-4">
                <div className={"p-[2rem] m-auto mw-[800px]"}>
                    <Alert  className={"mb-2 p-3 text-center rounded-md text-neutral-600"}>
                        <Dashboard />
                        <AlertDescription className={"typeset typeset-body-md"}>
                            Please use Superset Dashboard to look at the Aggregated Interview data.
                        </AlertDescription>
                    </Alert>
                </div>

                {!dataGridProps ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse text-center">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                            <p className={"typeset typeset-body-sm text-neutral"}>Loading interview data...</p>
                        </div>
                    </div>
                ) : dataGridProps.rows.length === 0 ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                        <p className={"typeset typeset-body-md"}>
                            No interviews found.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className={"typeset typeset-body-md mb-2 font-medium text-neutral-600"}>
                            The following {dataGridProps.rows.length} interviews have been identified for processing.
                        </p>
                        <div className="mt-4">
                            <MuiDataGrid {...dataGridProps} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
