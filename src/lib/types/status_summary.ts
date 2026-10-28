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

// Unmatched runsheet entries, by the action that would resolve them
export const UNMATCHED_CATEGORIES = [
    "link_candidate",
    "other_type",
    "unparsed_file",
    "no_trace",
] as const;

export type UnmatchedCategory = (typeof UNMATCHED_CATEGORIES)[number];

export const UNMATCHED_CATEGORY_LABELS: Record<UnmatchedCategory, string> = {
    link_candidate: "Link candidate",
    other_type: "Other type",
    unparsed_file: "Unparsed folder",
    no_trace: "No trace",
};

export const UNMATCHED_CATEGORY_DESCRIPTIONS: Record<UnmatchedCategory, string> = {
    link_candidate: "An unclaimed interview of the same type is nearest this runsheet entry. Link it on the interview's QC form.",
    other_type: "An unclaimed interview of the other type sits within 10 days; the type may be mislabelled.",
    unparsed_file: "The subject has a raw folder the crawler couldn't date, which may or may not hold this interview. Resolve it on Runsheet Match.",
    no_trace: "Nothing in the pipeline explains the gap. Follow up with the site.",
};

export type UnmatchedRow = {
    expected_name: string;
    site: string;
    subject_id: string;
    interview_type: string;
    event_name: string;
    expected_date: string;
    expected_day: number;
    category: UnmatchedCategory;
    candidate_interview: string | null;
    candidate_offset_days: number | null;
};

// Newest imported recording date (YYYY-MM-DD) of each kind
export type NewestRecordings = {
    interview: string | null;
    journal: string | null;
};

export type StatusSummary = {
    sites: SiteStatusRow[];
    journals: SiteJournalRow[];
    newest_recordings: NewestRecordings;
};
