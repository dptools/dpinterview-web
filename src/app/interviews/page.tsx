'use client'
import MuiDataGrid from '@/components/mui/MuiDataGrid';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import InterviewApi from "@/lib/api/v1/interviews";
import {DbInterview} from "@/lib/types/interview";
import {Dashboard} from '@mui/icons-material';

import Link from '@mui/material/Link';
import {GridColDef} from '@mui/x-data-grid';
import {useQuery} from "@tanstack/react-query";
import {AlertCircle} from "lucide-react";
import * as React from 'react';

function getRowId(row: DbInterview) {
    return row.interview_name;
}

export default function Interviews() {
    const {isSuccess, data: interviews, isError, error, isLoading} = useQuery(InterviewApi.list({limit: 20_000}));
    const height = 670;
    const pageSizeOptions = [10, 20];
    const selectable = true;

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'interview_name',
            headerName: 'Interview Name',
            width: 350,
            renderCell: (params) => (
                <Link href={`/interviews/${params.value}`}>{params.value}</Link>
            )
        },
        {field: 'interview_type', headerName: 'Interview Type', width: 150},
        {field: 'subject_id', headerName: 'Subject ID', width: 150},
        {field: 'study_id', headerName: 'Study ID', width: 150},
    ], []);

    if (isError) return (
        <Alert>
            <AlertCircle/>
            <AlertTitle>Error fetching data</AlertTitle>
            <AlertDescription>
                {error ? (
                    <div>
                        <p>The following error occurred</p>
                        <p>{error.message}</p>
                    </div>
                ) : (
                    <p>An error occurred</p>
                )}
            </AlertDescription>
        </Alert>);
    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-center">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                <p className={"typeset typeset-body-sm text-neutral"}>Loading interview data...</p>
            </div>
        </div>
    );
    if (isSuccess) return (
        <>
            <div className="container mx-auto p-4">
                <div className={"p-[2rem] m-auto mw-[800px]"}>
                    <Alert className={"mb-2 p-3 text-center rounded-md text-neutral-600"}>
                        <Dashboard/>
                        <AlertDescription className={"typeset typeset-body-md"}>
                            Please use Superset Dashboard to look at the Aggregated Interview data.
                        </AlertDescription>
                    </Alert>
                </div>
                {interviews.rows.length === 0 ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                        <p className={"typeset typeset-body-md"}>
                            No interviews found.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className={"typeset typeset-body-md mb-2 font-medium text-neutral-600"}>
                            The following {interviews.rows.length} interviews have been identified for processing.
                        </p>
                        <div className="mt-4">
                            <MuiDataGrid height={height}
                                         selectable={selectable}
                                         pageSizeOptions={pageSizeOptions}
                                         rows={interviews.rows}
                                         columns={columns}
                                         getRowId={getRowId}/>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
