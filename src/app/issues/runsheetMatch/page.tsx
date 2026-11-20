'use client'
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import {Alert, AlertDescription} from '@/components/ui/alert';
import { GridColDef } from '@mui/x-data-grid';
import Link from '@mui/material/Link';

import { PipelineFailureRow, RUNSHEET_MATCH_ERROR_CODES } from '@/lib/types/pipeline_failures';
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
        fetch(`/api/v1/issues/unresolved/pipeline-failures?limit=${FETCH_LIMIT}&includeResolved=false&errorCode=${RUNSHEET_MATCH_ERROR_CODES.join(',')}`)
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
            <h2 className={"typeset typeset-h2 mb-4 font-bold text-(--mui-palette-primary.main)"}>
                Runsheet Match
            </h2>

            <Alert className={"mb-4 text-neutral-600"}>
                <AlertDescription>
                    Subjects with raw interview files the crawler couldn&apos;t date - a file or
                    directory name that couldn&apos;t be date-parsed, or a media file sitting loose in an
                    interview type folder - so they were skipped entirely and never imported. These are
                    strong candidates for the &quot;Missing Interviews&quot; on the same subject: matching
                    such a file to its runsheet entry recovers it without renaming or moving anything on
                    disk. Click a subject to compare its
                    unmatched files against its missing runsheet entries.
                </AlertDescription>
            </Alert>

            {!dataGridProps ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-center">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
                        <p className={"typeset typeset-body-sm"} color="neutral">Loading data...</p>
                    </div>
                </div>
            ) : dataGridProps.rows.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                    <p className={"typeset typeset-body-md"}>
                        No subjects with unmatched files found.
                    </p>
                </div>
            ) : (
                <>
                    <p className={"typeset typeset-body-md mb-2 font-medium text-neutral-600"}>
                        The following {dataGridProps.rows.length} subjects have unmatched files:
                    </p>

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
