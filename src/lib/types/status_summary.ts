// Per-site interview status for the pipeline status dashboard.
// Every runsheet-expected interview lands in exactly one state; the
// outside-denominator counts sit alongside without adding to `expected`.

export const INTERVIEW_STATES = [
    "completed",
    "awaiting_transcribeme",
    "pending",
    "failed_qc",
    "unmatched",
    "no_single_combined_audio",
] as const;

export type InterviewState = (typeof INTERVIEW_STATES)[number];

export const INTERVIEW_STATE_LABELS: Record<InterviewState, string> = {
    completed: "Completed",
    awaiting_transcribeme: "Awaiting TranscribeMe",
    pending: "Pending",
    failed_qc: "Failed QC",
    unmatched: "Unmatched",
    no_single_combined_audio: "No single combined audio",
};

export const INTERVIEW_STATE_DESCRIPTIONS: Record<InterviewState, string> = {
    completed: "A transcript of the matched recording has been imported.",
    awaiting_transcribeme: "Audio has been sent to TranscribeMe and the transcript hasn't come back yet.",
    pending: "The matched recording has the one combined-audio file transcription needs, but it hasn't been sent to TranscribeMe yet.",
    failed_qc: "The combined audio failed audio QC and hasn't been overridden, so it won't be sent for transcription.",
    unmatched: "No recording in the pipeline matches this runsheet entry: none of the same subject and type within 10 days, and no manual link.",
    no_single_combined_audio: "The matched recording has no combined-audio file, or several, so audio QC and transcription can't start on their own.",
};

export type SiteStatusRow = Record<InterviewState, number> & {
    site: string;
    expected: number;
    // Outside the denominator
    declared_missing: number;
    no_runsheet: number;
    not_uploaded: number;
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

// Expected interviews without a single combined-audio file, by the audio they do have
export const NO_SINGLE_COMBINED_CATEGORIES = [
    "multiple_combined",
    "separate_tracks",
    "one_track",
    "unrecognized_audio",
    "no_audio",
] as const;

export type NoSingleCombinedCategory = (typeof NO_SINGLE_COMBINED_CATEGORIES)[number];

export const NO_SINGLE_COMBINED_CATEGORY_LABELS: Record<NoSingleCombinedCategory, string> = {
    multiple_combined: "Several combined",
    separate_tracks: "Separate tracks only",
    one_track: "One track only",
    unrecognized_audio: "Unrecognized audio",
    no_audio: "No audio",
};

export const NO_SINGLE_COMBINED_CATEGORY_DESCRIPTIONS: Record<NoSingleCombinedCategory, string> = {
    multiple_combined: "More than one combined-audio file, often one per part of a multi-part interview, and the QC runner won't choose between them. Review on Multiple Combined Audio.",
    separate_tracks: "Participant and interviewer tracks both arrived, but nothing in the pipeline combines them. A combined recording has to come from the site.",
    one_track: "Only one of the participant or interviewer tracks arrived, and no combined recording. Follow up with the site.",
    unrecognized_audio: "Audio files the crawler couldn't assign a role. If one is the combined recording, tag it on Unlabelled Audio.",
    no_audio: "The matched interview has no audio file, or every one is ignored. Follow up with the site.",
};

export type NoSingleCombinedRow = {
    expected_name: string;
    interview_name: string;
    site: string;
    subject_id: string;
    interview_type: string;
    category: NoSingleCombinedCategory;
    n_combined_audio: number;
    n_participant_audio: number;
    n_interviewer_audio: number;
    n_audio: number;
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
