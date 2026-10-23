import { getConnection } from "@/lib/db";

import {
    SiteJournalRow,
    SiteStatusRow,
    StatusSummary as StatusSummaryData,
    UnmatchedRow,
} from "@/lib/types/status_summary";

// Runsheet -> interview links: staff-set links first, then the ±10-day rule (as /issues/missing).
// Shared by every query here so they all agree on what counts as a match.
const MATCH_CTES = `
-- Staff-set runsheetIdentifier links (manual_qc holds one row per interview);
-- the QC form saves an unset identifier as '', which is not a link
manual_link AS (
    SELECT nullif(mq.qc_data->>'runsheetIdentifier', '') AS expected_name, mq.qc_target_id AS interview_name
    FROM manual_qc mq
    WHERE mq.qc_target_type = 'interview'
        AND nullif(mq.qc_data->>'runsheetIdentifier', '') IS NOT NULL
),
-- ±10-day rule (as /issues/missing), skipping any runsheet or interview a manual link already claims
rule_link AS (
    SELECT DISTINCT e.interview_name AS expected_name, i.interview_name
    FROM expected_interviews e
    JOIN interviews i
        ON i.subject_id = e.subject_id
        AND i.study_id = e.study_id
        AND i.interview_type = e.expected_interview_type
    JOIN interview_parts ip ON ip.interview_name = i.interview_name
    WHERE abs(e.expected_interview_day - ip.interview_day) <= 10
        AND NOT EXISTS (SELECT 1 FROM manual_link ml WHERE ml.expected_name = e.interview_name)
        AND NOT EXISTS (SELECT 1 FROM manual_link ml WHERE ml.interview_name = i.interview_name)
),
candidates AS (
    SELECT expected_name, interview_name, 'manual' AS match_source FROM manual_link
    UNION ALL
    SELECT expected_name, interview_name, 'rule' FROM rule_link
)
`;

// One state per runsheet-expected interview. First matching state wins:
// unmatched > completed > failed_qc > awaiting_transcribeme > pending.
// Runsheets marked missing and interviews no runsheet claims are counted per
// site but kept out of `expected`, so they never move the completion rate.
const SITE_STATUS_QUERY = `
WITH
${MATCH_CTES},
matched AS (
    SELECT
        e.interview_name AS expected_name,
        e.study_id,
        min(c.interview_name) AS interview_name,
        count(DISTINCT c.interview_name) AS n_candidates,
        coalesce(bool_or(c.match_source = 'manual'), FALSE) AS manual_match
    FROM expected_interviews e
    LEFT JOIN candidates c ON c.expected_name = e.interview_name
    GROUP BY e.interview_name, e.study_id
),
interview_file AS (
    SELECT ip.interview_name, ifi.interview_file
    FROM interview_parts ip
    JOIN interview_files ifi ON ifi.interview_path = ip.interview_path
    WHERE NOT coalesce(ifi.ignored, FALSE)
),
-- Transcript is the deliverable: combined audio -> wav -> audio_qc -> push -> pull -> transcript_files
stage AS (
    SELECT
        m.*,
        EXISTS (
            SELECT 1 FROM transcript_files tf
            WHERE tf.identifier_name = m.interview_name AND tf.identifier_type = 'interview'
        ) AS transcript_imported,
        EXISTS (
            SELECT 1
            FROM interview_file f
            JOIN transcribeme.wav_conversion wc ON wc.wc_source_path = f.interview_file
            JOIN transcribeme.audio_qc aqc ON aqc.aqc_source_path = wc.wc_destination_path
            WHERE f.interview_name = m.interview_name
                AND aqc.aqc_passed IS FALSE
                AND NOT coalesce(aqc.aqc_override, FALSE)
        ) AS audio_failed_qc,
        EXISTS (
            SELECT 1
            FROM interview_file f
            JOIN transcribeme.wav_conversion wc ON wc.wc_source_path = f.interview_file
            JOIN transcribeme.transcribeme_push tp ON tp.transcription_source_path = wc.wc_destination_path
            WHERE f.interview_name = m.interview_name
                AND NOT EXISTS (
                    SELECT 1 FROM transcribeme.transcribeme_pull pull
                    WHERE pull.transcription_destination_path = tp.transcription_destination_path
                )
        ) AS awaiting_transcribeme
    FROM matched m
),
state AS (
    SELECT
        study_id,
        CASE
            WHEN interview_name IS NULL THEN 'unmatched'
            WHEN transcript_imported THEN 'completed'
            WHEN audio_failed_qc THEN 'failed_qc'
            WHEN awaiting_transcribeme THEN 'awaiting_transcribeme'
            ELSE 'pending'
        END AS state,
        n_candidates > 1 AS ambiguous,
        manual_match
    FROM stage
),
site_state AS (
    SELECT
        study_id,
        count(*)::int AS expected,
        count(*) FILTER (WHERE state = 'completed')::int AS completed,
        count(*) FILTER (WHERE state = 'awaiting_transcribeme')::int AS awaiting_transcribeme,
        count(*) FILTER (WHERE state = 'pending')::int AS pending,
        count(*) FILTER (WHERE state = 'failed_qc')::int AS failed_qc,
        count(*) FILTER (WHERE state = 'unmatched')::int AS unmatched,
        count(*) FILTER (WHERE ambiguous)::int AS ambiguous_match,
        count(*) FILTER (WHERE manual_match)::int AS manually_matched
    FROM state
    GROUP BY study_id
),
declared_missing AS (
    SELECT study_id, count(*)::int AS declared_missing
    FROM form_data
    WHERE (form_name = 'speech_sampling_run_sheet' AND form_data->>'chrspeech_missing' = '1')
        OR (form_name = 'psychs_av_recording_run_sheet' AND form_data->>'chrpsychs_av_missing' = '1')
    GROUP BY study_id
),
-- Imported interviews no runsheet claims (same rule as /issues/noRunsheet)
no_runsheet AS (
    SELECT i.study_id, count(*)::int AS no_runsheet
    FROM interviews i
    WHERE NOT EXISTS (
            SELECT 1
            FROM interview_parts ip
            JOIN expected_interviews e
                ON e.subject_id = i.subject_id
                AND e.study_id = i.study_id
                AND e.expected_interview_type = i.interview_type
                AND abs(e.expected_interview_day - ip.interview_day) <= 10
            WHERE ip.interview_name = i.interview_name
        )
        AND NOT EXISTS (SELECT 1 FROM manual_link ml WHERE ml.interview_name = i.interview_name)
    GROUP BY i.study_id
),
sites AS (
    SELECT study_id FROM site_state
    UNION SELECT study_id FROM declared_missing
    UNION SELECT study_id FROM no_runsheet
)
SELECT
    s.study_id AS site,
    coalesce(ss.expected, 0) AS expected,
    coalesce(ss.completed, 0) AS completed,
    coalesce(ss.awaiting_transcribeme, 0) AS awaiting_transcribeme,
    coalesce(ss.pending, 0) AS pending,
    coalesce(ss.failed_qc, 0) AS failed_qc,
    coalesce(ss.unmatched, 0) AS unmatched,
    coalesce(dm.declared_missing, 0) AS declared_missing,
    coalesce(nr.no_runsheet, 0) AS no_runsheet,
    coalesce(ss.ambiguous_match, 0) AS ambiguous_match,
    coalesce(ss.manually_matched, 0) AS manually_matched
FROM sites s
LEFT JOIN site_state ss USING (study_id)
LEFT JOIN declared_missing dm USING (study_id)
LEFT JOIN no_runsheet nr USING (study_id)
ORDER BY s.study_id
`;

// Each unmatched runsheet entry, categorized by the action that would resolve it.
// First match wins: link_candidate > other_type > unparsed_file > no_trace.
// $1 optionally restricts to one site.
const UNMATCHED_QUERY = `
WITH
${MATCH_CTES},
unmatched AS (
    SELECT e.*
    FROM expected_interviews e
    WHERE NOT EXISTS (SELECT 1 FROM candidates c WHERE c.expected_name = e.interview_name)
        AND ($1::text IS NULL OR e.study_id = $1)
),
-- Imported interviews no runsheet entry has claimed, with their first day
unclaimed AS (
    SELECT i.interview_name, i.study_id, i.subject_id, i.interview_type, min(ip.interview_day) AS interview_day
    FROM interviews i
    JOIN interview_parts ip ON ip.interview_name = i.interview_name
    WHERE NOT EXISTS (SELECT 1 FROM candidates c WHERE c.interview_name = i.interview_name)
        AND ($1::text IS NULL OR i.study_id = $1)
    GROUP BY i.interview_name, i.study_id, i.subject_id, i.interview_type
),
evidence AS (
    SELECT
        u.*,
        same_type.interview_name AS same_type_interview,
        same_type.offset_days AS same_type_offset,
        other_type.interview_name AS other_type_interview,
        other_type.offset_days AS other_type_offset,
        EXISTS (
            SELECT 1 FROM pipeline_ledger.pipeline_failures pf
            WHERE pf.pf_study_id = u.study_id AND pf.pf_subject_id = u.subject_id
                AND NOT pf.pf_resolved AND pf.pf_error_code = 'datetime_parse'
        ) AS has_unparsed_file
    FROM unmatched u
    -- Same-type unclaimed interview, only where this entry is its nearest runsheet entry of that type
    LEFT JOIN LATERAL (
        SELECT x.interview_name, abs(x.interview_day - u.expected_interview_day) AS offset_days
        FROM unclaimed x
        WHERE x.study_id = u.study_id AND x.subject_id = u.subject_id
            AND x.interview_type = u.expected_interview_type
            AND NOT EXISTS (
                SELECT 1 FROM expected_interviews e2
                WHERE e2.study_id = x.study_id AND e2.subject_id = x.subject_id
                    AND e2.expected_interview_type = x.interview_type
                    AND e2.interview_name <> u.interview_name
                    AND abs(e2.expected_interview_day - x.interview_day)
                        < abs(u.expected_interview_day - x.interview_day)
            )
        ORDER BY offset_days
        LIMIT 1
    ) same_type ON TRUE
    -- Other-type unclaimed interview within the ±10-day window: likely a mislabelled type
    LEFT JOIN LATERAL (
        SELECT x.interview_name, abs(x.interview_day - u.expected_interview_day) AS offset_days
        FROM unclaimed x
        WHERE x.study_id = u.study_id AND x.subject_id = u.subject_id
            AND x.interview_type <> u.expected_interview_type
            AND abs(x.interview_day - u.expected_interview_day) <= 10
        ORDER BY offset_days
        LIMIT 1
    ) other_type ON TRUE
)
SELECT
    interview_name AS expected_name,
    study_id AS site,
    subject_id,
    expected_interview_type AS interview_type,
    event_name,
    expected_interview_date::date::text AS expected_date,
    expected_interview_day AS expected_day,
    CASE
        WHEN same_type_interview IS NOT NULL THEN 'link_candidate'
        WHEN other_type_interview IS NOT NULL THEN 'other_type'
        WHEN has_unparsed_file THEN 'unparsed_file'
        ELSE 'no_trace'
    END AS category,
    coalesce(same_type_interview, other_type_interview) AS candidate_interview,
    coalesce(same_type_offset, other_type_offset)::int AS candidate_offset_days
FROM evidence
ORDER BY study_id, subject_id, expected_interview_day
`;

const SITE_JOURNAL_QUERY = `
SELECT
    study_id AS site,
    count(*)::int AS journals,
    count(DISTINCT subject_id)::int AS subjects_with_journals
FROM audio_journals
GROUP BY study_id
ORDER BY study_id
`;

export class StatusSummary {
    static async get(): Promise<StatusSummaryData> {
        const connection = getConnection();

        const [sitesResult, journalsResult] = await Promise.all([
            connection.query<SiteStatusRow>(SITE_STATUS_QUERY),
            connection.query<SiteJournalRow>(SITE_JOURNAL_QUERY),
        ]);

        return { sites: sitesResult.rows, journals: journalsResult.rows };
    }

    static async getUnmatched(study_id?: string): Promise<UnmatchedRow[]> {
        const connection = getConnection();

        const result = await connection.query<UnmatchedRow>(UNMATCHED_QUERY, [study_id ?? null]);
        return result.rows;
    }
}
