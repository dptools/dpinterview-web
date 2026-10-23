import { getConnection } from "@/lib/db";

import { SiteJournalRow, SiteStatusRow, StatusSummary as StatusSummaryData } from "@/lib/types/status_summary";

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

}
