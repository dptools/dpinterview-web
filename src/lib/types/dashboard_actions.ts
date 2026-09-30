// da_id serial4 NOT NULL,
// interview_name varchar(255) NOT NULL,
// da_action varchar(255) NOT NULL,
// da_user_id varchar(255) NOT NULL,
// da_target_id varchar(255) NULL,
// da_target_type varchar(255) NULL,
// da_metadata jsonb NULL,
// da_timestamp timestamp DEFAULT CURRENT_TIMESTAMP NULL,
export type DbDashboardAction = {
    da_id: number;
    interview_name: string;
    da_action: string;
    da_user_id: string;
    da_target_id: string | null;
    da_target_type: string | null;
    da_metadata: Record<string, unknown> | null;
    da_timestamp: Date | null;
}

// The manual override/remediation features that write to dashboard_actions -
// this is the scope of the "Override Ledger" reporting page. Add here if a
// new override-style action is introduced elsewhere; not every da_action in
// the table is an override (e.g. mark_primary/clear_role are routine edits).
export const OVERRIDE_LEDGER_ACTIONS = [
    "override_audio_qc",
    "datetime_override_pipeline_failure",
] as const;

export type OverrideLedgerAction = (typeof OVERRIDE_LEDGER_ACTIONS)[number];