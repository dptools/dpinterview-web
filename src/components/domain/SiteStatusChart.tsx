'use client'
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { INTERVIEW_STATES, INTERVIEW_STATE_LABELS, SiteStatusRow } from '@/lib/types/status_summary';

export function completionRate(row: SiteStatusRow): number | null {
    return row.expected > 0 ? row.completed / row.expected : null;
}

function formatRate(rate: number | null): string {
    return rate === null ? '—' : `${Math.round(rate * 100)}%`;
}

function StateLegend() {
    return (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
            {INTERVIEW_STATES.map((state) => (
                <span key={state} className="inline-flex items-center gap-2">
                    <span className="inline-block size-3 rounded-sm" style={{ background: `var(--state-${state})` }} />
                    {INTERVIEW_STATE_LABELS[state]}
                </span>
            ))}
        </div>
    );
}

function SiteTooltip({ row }: { row: SiteStatusRow }) {
    return (
        <div className="space-y-1 tabular-nums">
            <div className="font-semibold">{row.site} · {formatRate(completionRate(row))} complete</div>
            {INTERVIEW_STATES.map((state) => (
                <div key={state} className="flex justify-between gap-6">
                    <span>{INTERVIEW_STATE_LABELS[state]}</span>
                    <span>{row[state]}</span>
                </div>
            ))}
            <div className="flex justify-between gap-6 border-t border-current/20 pt-1">
                <span>Expected</span>
                <span>{row.expected}</span>
            </div>
            <div className="flex justify-between gap-6 opacity-80">
                <span>No runsheet (outside)</span>
                <span>{row.no_runsheet}</span>
            </div>
            <div className="flex justify-between gap-6 opacity-80">
                <span>Declared missing (outside)</span>
                <span>{row.declared_missing}</span>
            </div>
        </div>
    );
}

/**
 * Horizontal stacked bars, one per site, of runsheet-expected interviews by state.
 * Bars share one count scale; the no-runsheet excess is annotated past the bar end.
 */
export default function SiteStatusChart({ rows }: { rows: SiteStatusRow[] }) {
    const maxExpected = Math.max(1, ...rows.map((row) => row.expected));

    return (
        <div>
            <StateLegend />
            <div className="space-y-2">
                {rows.map((row) => {
                    const segments = INTERVIEW_STATES.filter((state) => row[state] > 0);
                    return (
                        <Tooltip key={row.site}>
                            <TooltipTrigger asChild>
                                <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-sm px-1 py-0.5 hover:bg-muted/60 cursor-default">
                                    <span className="text-sm text-muted-foreground truncate">{row.site}</span>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className="flex h-4 gap-[2px]"
                                            style={{ width: `${(row.expected / maxExpected) * 80}%` }}
                                        >
                                            {segments.map((state, index) => (
                                                <div
                                                    key={state}
                                                    className={index === segments.length - 1 ? 'rounded-r-[4px]' : ''}
                                                    style={{
                                                        flexGrow: row[state],
                                                        flexBasis: 0,
                                                        minWidth: 2,
                                                        background: `var(--state-${state})`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm tabular-nums text-foreground shrink-0">
                                            {formatRate(completionRate(row))}
                                        </span>
                                        {row.no_runsheet > 0 && (
                                            <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                                                +{row.no_runsheet} no runsheet
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <SiteTooltip row={row} />
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
