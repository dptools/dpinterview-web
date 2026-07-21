// pipeline_ledger.pipeline_failures
// Mirrors pipeline/models/pipeline_failures.py on the dpinterview side.
// Kept in its own schema there (not `public`) so it can be permissioned/retained
// separately from the rest of the application tables.

export type PipelineFailureIdentifierType =
    | "file_path"
    | "study"
    | "interview_name"
    | "subject"
    | "batch"
    | "other";

export type PipelineFailureErrorCode =
    | "datetime_parse"
    | "subject_id_parse"
    | "filename_parse"
    | "consent_date_missing"
    | "missing_file"
    | "db_write_failure"
    | "data_dictionary_import_failed"
    | "ffprobe_streams_missing"
    | "openface_datatype_cast_failed"
    | "openface_load_failed"
    | "decryption_failed"
    | "llm_prompt_build_failed"
    | "llm_language_identification_failed"
    | "transcribeme_pull_failed"
    | "interview_not_in_study_list"
    | "crawler_stage_failed"
    | "other";

export type PipelineFailureRow = {
    pf_id: number;
    pf_stage: string;
    pf_error_code: PipelineFailureErrorCode;
    pf_identifier_type: PipelineFailureIdentifierType;
    pf_identifier: string;
    pf_study_id: string | null;
    pf_subject_id: string | null;
    pf_error: string;
    pf_error_type: string | null;
    pf_occurrence_count: number;
    pf_first_seen_at: Date;
    pf_last_seen_at: Date;
    pf_resolved: boolean;
    pf_resolved_at: Date | null;
    pf_resolved_note: string | null;
};
