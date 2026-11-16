'use client'
import * as React from 'react';

import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import { DbAudioJournal } from '@/lib/types/audio_journals';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';

export default function Journals() {
    const [dataGridProps, setDataGridProps] = React.useState<MuiDataGridProps | null>(null);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'aj_name',
            headerName: 'Journal Name',
            width: 400,
            renderCell: (params) => (
                <Link href={`/studies/${params.row.study_id}/subjects/${params.row.subject_id}/journals/${params.value}`}>
                    {params.value}
                </Link>
            )
        },
        { field: 'aj_datetime', headerName: 'Journal Date', width: 150 },
        {
            field: 'subject_id',
            headerName: 'Subject ID',
            width: 150,
            renderCell: (params) => (
                <Link href={`/studies/${params.row.study_id}/subjects/${params.row.subject_id}`}>{params.value}</Link>
            )
        },
        {
            field: 'study_id',
            headerName: 'Study ID',
            width: 150,
        },
    ], []);

    React.useEffect(() => {
        // Fetch data from the API
        fetch('/api/v1/journals/list?limit=20000')
            .then((res) => res.json())
            .then((data) => {

                // parse to grid rows
                const gridRows = data.rows.map((journal: DbAudioJournal) => ({
                    id: journal.aj_name,
                    aj_name: journal.aj_name,
                    aj_datetime: new Date(journal.aj_datetime).toISOString().replace('T', ' ').substring(0, 19),
                    subject_id: journal.subject_id,
                    study_id: journal.study_id,
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

                {!dataGridProps ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse text-center">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                            <p className={"typeset typeset-body-sm text-neutral-600"}>Loading journal data...</p>
                        </div>
                    </div>
                ) : dataGridProps.rows.length === 0 ? (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                        <p className={"typeset typeset-body-md"}>
                            No Audio Journals found.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className={"typeset typeset-body-md mb-2 font-medium text-neutral-600"}>
                            The following {dataGridProps.rows.length} journals have been identified for processing.
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
