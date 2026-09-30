'use client'
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';

import { PipelineFailureRow } from '@/lib/types/pipeline_failures';
import { InterviewIssue } from '@/app/api/v1/issues/unresolved/missing/route';
import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import AggregationSummary, { GroupByOption } from '@/components/mui/AggregationSummary';

const FETCH_LIMIT = 3000;

type SubjectGroupRow = {
    id: string;
    study_id: string;
    subject_id: string;
    failureCount: number;
    missingCount: number;
    lastFailureSeen: string;
};

const GROUP_BY_OPTIONS: GroupByOption<PipelineFailureRow>[] = [
    { field: 'pf_study_id', label: 'Study ID' },
    { field: 'pf_subject_id', label: 'Subject ID' },
];

export default function RunsheetMatchIndex() {
    const [failures, setFailures] = useState<PipelineFailureRow[] | null>(null);
    const [missing, setMissing] = useState<InterviewIssue[] | null>(null);

    useEffect(() => {
        fetch(`/api/v1/issues/unresolved/pipeline-failures?limit=${FETCH_LIMIT}&includeResolved=false&errorCode=datetime_parse`)
            .then((res) => res.json())
            .then((data) => setFailures(data.rows));
        fetch(`/api/v1/issues/unresolved/missing?limit=${FETCH_LIMIT}`)
            .then((res) => res.json())
            .then((data) => setMissing(data.rows));
    }, []);

    const subjectRows: SubjectGroupRow[] | null = useMemo(() => {
        if (!failures || !missing) return null;

        const missingCounts = new Map<string, number>();
        for (const row of missing) {
            const key = `${row.study_id}::${row.subject_id}`;
            missingCounts.set(key, (missingCounts.get(key) ?? 0) + 1);
        }

        const groups = new Map<string, SubjectGroupRow>();
        for (const row of failures) {
            if (!row.pf_study_id || !row.pf_subject_id) continue;
            const key = `${row.pf_study_id}::${row.pf_subject_id}`;
            const existing = groups.get(key);
            const lastSeen = new Date(row.pf_last_seen_at).toISOString();
            if (existing) {
                existing.failureCount += 1;
                if (lastSeen > existing.lastFailureSeen) existing.lastFailureSeen = lastSeen;
            } else {
                groups.set(key, {
                    id: key,
                    study_id: row.pf_study_id,
                    subject_id: row.pf_subject_id,
                    failureCount: 1,
                    missingCount: missingCounts.get(key) ?? 0,
                    lastFailureSeen: lastSeen,
                });
            }
        }

        return Array.from(groups.values()).sort((a, b) => b.failureCount - a.failureCount);
    }, [failures, missing]);

    const columns: GridColDef[] = useMemo(() => [
        {
            field: 'subject_id',
            headerName: 'Subject',
            width: 200,
            renderCell: (params) => (
                <Link href={`/issues/runsheetMatch/${params.row.study_id}/${params.row.subject_id}`}>
                    {params.value}
                </Link>
            ),
        },
        { field: 'study_id', headerName: 'Study ID', width: 130 },
        { field: 'failureCount', headerName: 'Unmatched Files', width: 150, type: 'number' },
        { field: 'missingCount', headerName: 'Missing Interviews', width: 160, type: 'number' },
        { field: 'lastFailureSeen', headerName: 'Last Seen', width: 200 },
    ], []);

    const dataGridProps: MuiDataGridProps | null = useMemo(() => {
        if (!subjectRows) return null;
        return {
            columns,
            rows: subjectRows,
            height: 670,
            pageSizeOptions: [10, 20, 50],
        };
    }, [subjectRows, columns]);

    return (
        <div className="container mx-auto p-4">
            <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Runsheet Match
            </Typography>

            <Alert variant="soft" color="neutral" sx={{ mb: 4 }}>
                Subjects with unresolved &quot;datetime_parse&quot; pipeline failures - raw interview
                files/directories whose names couldn&apos;t be date-parsed, so they were skipped
                entirely and never imported. These are strong candidates for the &quot;Missing
                Interviews&quot; on the same subject: matching a malformed file to its runsheet
                entry recovers it without renaming anything on disk. Click a subject to compare its
                unmatched files against its missing runsheet entries.
            </Alert>

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
                        No subjects with unresolved datetime_parse failures found.
                    </Typography>
                </div>
            ) : (
                <>
                    <Typography level="body-md" sx={{ mb: 2, fontWeight: 'medium', color: 'neutral.600' }}>
                        The following {dataGridProps.rows.length} subjects have unresolved datetime_parse failures:
                    </Typography>

                    <AggregationSummary
                        rows={failures ?? []}
                        groupByOptions={GROUP_BY_OPTIONS}
                        defaultGroupBy="pf_study_id"
                    />

                    <MuiDataGrid {...dataGridProps} />
                </>
            )}
        </div>
    );
}
