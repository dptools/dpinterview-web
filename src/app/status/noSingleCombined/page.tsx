'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';

import MuiDataGrid from '@/components/mui/MuiDataGrid';
import {
    NO_SINGLE_COMBINED_CATEGORIES,
    NO_SINGLE_COMBINED_CATEGORY_DESCRIPTIONS,
    NO_SINGLE_COMBINED_CATEGORY_LABELS,
    NoSingleCombinedCategory,
    NoSingleCombinedRow,
} from '@/lib/types/status_summary';

type SiteCounts = Record<NoSingleCombinedCategory, number> & { id: string; site: string; total: number };

function countBySite(rows: NoSingleCombinedRow[]): SiteCounts[] {
    const bySite = new Map<string, SiteCounts>();
    for (const row of rows) {
        let counts = bySite.get(row.site);
        if (!counts) {
            counts = {
                id: row.site,
                site: row.site,
                total: 0,
                multiple_combined: 0,
                separate_tracks: 0,
                one_track: 0,
                unrecognized_audio: 0,
                no_audio: 0,
            };
            bySite.set(row.site, counts);
        }
        counts.total += 1;
        counts[row.category] += 1;
    }
    return [...bySite.values()].sort((a, b) => a.site.localeCompare(b.site));
}

const COLUMNS: GridColDef[] = [
    {
        field: 'site',
        headerName: 'Site',
        width: 140,
        renderCell: (params) => <Link href={`/status/noSingleCombined/${params.value}`}>{params.value}</Link>,
    },
    { field: 'total', headerName: 'Total', width: 100, type: 'number' },
    ...NO_SINGLE_COMBINED_CATEGORIES.map((category): GridColDef => ({
        field: category,
        headerName: NO_SINGLE_COMBINED_CATEGORY_LABELS[category],
        width: 170,
        type: 'number',
    })),
];

export default function NoSingleCombinedIndex() {
    const [siteCounts, setSiteCounts] = useState<SiteCounts[] | null>(null);

    useEffect(() => {
        fetch('/api/v3/status/noSingleCombined')
            .then((res) => res.json())
            .then((rows: NoSingleCombinedRow[]) => setSiteCounts(countBySite(rows)));
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div>
                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    No Single Combined Audio
                </Typography>
                <Typography level="body-md" sx={{ mb: 2, maxWidth: '800px' }}>
                    Matched interviews that transcription can&apos;t take, because they have no one combined-audio
                    file. Audio QC hasn&apos;t run on these, so none of them failed it. Each interview takes the
                    first category that applies, in the order below.
                </Typography>
                <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1 max-w-3xl text-sm">
                    {NO_SINGLE_COMBINED_CATEGORIES.map((category) => (
                        <React.Fragment key={category}>
                            <dt className="font-medium">{NO_SINGLE_COMBINED_CATEGORY_LABELS[category]}</dt>
                            <dd className="text-muted-foreground">{NO_SINGLE_COMBINED_CATEGORY_DESCRIPTIONS[category]}</dd>
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
