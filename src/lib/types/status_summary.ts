// Per-site interview status for the pipeline status dashboard.
// Every runsheet-expected interview lands in exactly one state; the
// outside-denominator counts sit alongside without adding to `expected`.

export const INTERVIEW_STATES = [
    "completed",
    "awaiting_transcribeme",
    "pending",
    "failed_qc",
    "unmatched",
] as const;

export type InterviewState = (typeof INTERVIEW_STATES)[number];

export const INTERVIEW_STATE_LABELS: Record<InterviewState, string> = {
    completed: "Completed",
    awaiting_transcribeme: "Awaiting TranscribeMe",
    pending: "Pending",
    failed_qc: "Failed QC",
    unmatched: "Unmatched",
};

export type SiteStatusRow = Record<InterviewState, number> & {
    site: string;
    expected: number;
    // Outside the denominator
    declared_missing: number;
    no_runsheet: number;
    // Annotations over the expected interviews
    ambiguous_match: number;
    manually_matched: number;
};

export type SiteJournalRow = {
    site: string;
    journals: number;
    subjects_with_journals: number;
};

export type StatusSummary = {
    sites: SiteStatusRow[];
    journals: SiteJournalRow[];
};
