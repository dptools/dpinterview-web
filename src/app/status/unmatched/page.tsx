'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import {
    UNMATCHED_CATEGORIES,
    UNMATCHED_CATEGORY_DESCRIPTIONS,
    UNMATCHED_CATEGORY_LABELS,
    UnmatchedCategory,
    UnmatchedRow,
} from '@/lib/types/status_summary';

type SiteCounts = Record<UnmatchedCategory, number> & { id: string; site: string; unmatched: number };

function countBySite(rows: UnmatchedRow[]): SiteCounts[] {
    const bySite = new Map<string, SiteCounts>();
    for (const row of rows) {
        let counts = bySite.get(row.site);
        if (!counts) {
            counts = { id: row.site, site: row.site, unmatched: 0, link_candidate: 0, other_type: 0, unparsed_file: 0, no_trace: 0 };
            bySite.set(row.site, counts);
        }
        counts.unmatched += 1;
        counts[row.category] += 1;
    }
    return [...bySite.values()].sort((a, b) => a.site.localeCompare(b.site));
}

const COLUMNS: GridColDef[] = [
    {
        field: 'site',
        headerName: 'Site',
        width: 140,
        renderCell: (params) => <Link href={`/status/unmatched/${params.value}`}>{params.value}</Link>,
    },
    { field: 'unmatched', headerName: 'Unmatched', width: 120, type: 'number' },
    ...UNMATCHED_CATEGORIES.map((category): GridColDef => ({
        field: category,
        headerName: UNMATCHED_CATEGORY_LABELS[category],
        width: 150,
        type: 'number',
    })),
];

export default function UnmatchedIndex() {
    const [siteCounts, setSiteCounts] = useState<SiteCounts[] | null>(null);

    useEffect(() => {
        fetch('/api/v3/status/unmatched')
            .then((res) => res.json())
            .then((rows: UnmatchedRow[]) => setSiteCounts(countBySite(rows)));
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div>
                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Unmatched Runsheets
                </Typography>
                <Typography level="body-md" sx={{ mb: 2, maxWidth: '800px' }}>
                    Runsheet entries with no matched recording, grouped by what would resolve them.
                    Each entry takes the first category that applies, in the order below.
                </Typography>
                <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1 max-w-3xl text-sm">
                    {UNMATCHED_CATEGORIES.map((category) => (
                        <React.Fragment key={category}>
                            <dt className="font-medium">{UNMATCHED_CATEGORY_LABELS[category]}</dt>
                            <dd className="text-muted-foreground">{UNMATCHED_CATEGORY_DESCRIPTIONS[category]}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            </div>

            {!siteCounts ? (
                <Typography level="body-sm" color="neutral">Loading data...</Typography>
            ) : (
                <MuiDataGrid columns={COLUMNS} rows={siteCounts} height={600} pageSizeOptions={[50, 100]} />
            )}
        </div>
    );
}
