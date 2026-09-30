'use client'
import * as React from 'react';

import Typography from '@mui/joy/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export type GroupByOption<T> = {
    field: keyof T;
    label: string;
    // For multi-valued fields (e.g. a Record<string, boolean> of flags) where a single
    // row can belong to several buckets at once - one row is counted once per key returned.
    extractKeys?: (row: T) => string[];
};
export type SumOption<T> = { field: keyof T; label: string };

function toKey(raw: unknown): string {
    return raw === null || raw === undefined || raw === '' ? '(none)' : String(raw);
}

function aggregate<T>(rows: T[], option: GroupByOption<T>, sumField?: keyof T) {
    const groups = new Map<string, { count: number; sum: number }>();

    for (const row of rows) {
        const keys = option.extractKeys
            ? option.extractKeys(row)
            : [toKey((row as Record<string, unknown>)[option.field as string])];
        const bucketKeys = keys.length > 0 ? keys : ['(none)'];

        const sumValue = sumField ? (row as Record<string, unknown>)[sumField as string] : undefined;

        for (const key of bucketKeys) {
            const existing = groups.get(key) ?? { count: 0, sum: 0 };
            existing.count += 1;
            if (typeof sumValue === 'number') {
                existing.sum += sumValue;
            }
            groups.set(key, existing);
        }
    }

    return Array.from(groups.entries())
        .map(([key, value]) => ({ key, ...value }))
        .sort((a, b) => (sumField ? b.sum - a.sum : b.count - a.count));
}

export type AggregationSummaryProps<T> = {
    rows: T[];
    groupByOptions: GroupByOption<T>[];
    sumField?: SumOption<T>;
    defaultGroupBy?: keyof T;
};

export default function AggregationSummary<T>({
    rows,
    groupByOptions,
    sumField,
    defaultGroupBy,
}: AggregationSummaryProps<T>) {
    const [groupBy, setGroupBy] = React.useState<keyof T>(defaultGroupBy ?? groupByOptions[0].field);

    const selectedOption = groupByOptions.find((o) => o.field === groupBy) ?? groupByOptions[0];

    const aggregationRows = React.useMemo(
        () => aggregate(rows, selectedOption, sumField?.field),
        [rows, selectedOption, sumField]
    );

    const currentLabel = selectedOption.label;

    return (
        <div className="mb-6 border rounded-lg p-4 bg-slate-50 max-w-xl">
            <div className="flex items-center gap-3 mb-3">
                <Typography level="body-md" sx={{ fontWeight: 'medium' }}>
                    Aggregate by
                </Typography>
                <Select
                    size="small"
                    value={String(groupBy)}
                    onChange={(e) => setGroupBy(e.target.value as keyof T)}
                >
                    {groupByOptions.map((opt) => (
                        <MenuItem key={String(opt.field)} value={String(opt.field)}>{opt.label}</MenuItem>
                    ))}
                </Select>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b">
                        <th className="py-1">{currentLabel}</th>
                        <th className="py-1 text-right">Rows</th>
                        {sumField && <th className="py-1 text-right">Sum({sumField.label})</th>}
                    </tr>
                </thead>
                <tbody>
                    {aggregationRows.map((agg) => (
                        <tr key={agg.key} className="border-b border-slate-100">
                            <td className="py-1">{agg.key}</td>
                            <td className="py-1 text-right">{agg.count}</td>
                            {sumField && <td className="py-1 text-right">{agg.sum}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
