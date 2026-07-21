import { getConnection } from "@/lib/db";

import {
    DbAudioQc,
    DbTranscribemePull,
    DbTranscribemePush,
    DbWavConversion,
    FailedAudioQcRow,
    PendingPushRow,
    AwaitingVendorRow,
    TranscriptNotImportedRow,
    TranscriptionPipelineStatus,
} from "@/lib/types/transcribeme";

// transcribeme.* rows trace back to a source file that is either a combined
// interview audio file or an audio journal recording - there's no direct
// study_id/subject_id column on any transcribeme table, so every query joins
// through one of these two chains off `wc.wc_source_path` / `wc_destination_path`.
// AMPSCZ is the only study writing to transcribeme.*, so no study_id filter is needed.
//
// These are INNER joins on purpose: every browse query below UNIONs an
// interview-side query with a journal-side query, and a given wc_source_path
// belongs to exactly one of the two trees, never both. Using LEFT JOIN here
// let every row leak into *both* branches - matched with real data in the
// branch it actually belongs to, and as an all-NULL "ghost" row with no
// name/subject/study in the other branch. INNER JOIN drops the ghost row by
// only letting a wav_conversion row through the branch it actually resolves in.
const INTERVIEW_JOIN = `
    JOIN interview_files ifi ON ifi.interview_file = wc.wc_source_path
    JOIN interview_parts ip ON ip.interview_path = ifi.interview_path
    JOIN interviews i ON i.interview_name = ip.interview_name
`;

const JOURNAL_JOIN = `
    JOIN audio_journals aj ON aj.aj_path = wc.wc_source_path
`;

export class Transcribeme {
    static async getFailedAudioQc(limit: number, offset: number): Promise<{ rows: FailedAudioQcRow[]; totalRows: number }> {
        const connection = getConnection();

        const baseQuery = `
            SELECT 'interview' AS source_type, i.interview_name, i.subject_id, i.study_id,
                aqc.aqc_source_path, aqc.aqc_metrics, aqc.aqc_fail_reasons, aqc.aqc_timestamp, aqc.aqc_override
            FROM transcribeme.wav_conversion wc
            JOIN transcribeme.audio_qc aqc ON aqc.aqc_source_path = wc.wc_destination_path
            ${INTERVIEW_JOIN}
            WHERE aqc.aqc_passed IS FALSE

            UNION ALL

            SELECT 'audio_journal' AS source_type, aj.aj_name AS interview_name, aj.subject_id, aj.study_id,
                aqc.aqc_source_path, aqc.aqc_metrics, aqc.aqc_fail_reasons, aqc.aqc_timestamp, aqc.aqc_override
            FROM transcribeme.wav_conversion wc
            JOIN transcribeme.audio_qc aqc ON aqc.aqc_source_path = wc.wc_destination_path
            ${JOURNAL_JOIN}
            WHERE aqc.aqc_passed IS FALSE
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY aqc_timestamp DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return { rows: rows as FailedAudioQcRow[], totalRows };
    }

    static async getPendingPush(limit: number, offset: number): Promise<{ rows: PendingPushRow[]; totalRows: number }> {
        const connection = getConnection();

        const baseQuery = `
            SELECT 'interview' AS source_type, i.interview_name, i.subject_id, i.study_id,
                wc.wc_destination_path, aqc.aqc_timestamp
            FROM transcribeme.wav_conversion wc
            JOIN transcribeme.audio_qc aqc ON aqc.aqc_source_path = wc.wc_destination_path
            ${INTERVIEW_JOIN}
            WHERE aqc.aqc_passed IS TRUE
                AND wc.wc_destination_path NOT IN (SELECT transcription_source_path FROM transcribeme.transcribeme_push)

            UNION ALL

            SELECT 'audio_journal' AS source_type, aj.aj_name AS interview_name, aj.subject_id, aj.study_id,
                wc.wc_destination_path, aqc.aqc_timestamp
            FROM transcribeme.wav_conversion wc
            JOIN transcribeme.audio_qc aqc ON aqc.aqc_source_path = wc.wc_destination_path
            ${JOURNAL_JOIN}
            WHERE aqc.aqc_passed IS TRUE
                AND wc.wc_destination_path NOT IN (SELECT transcription_source_path FROM transcribeme.transcribeme_push)
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY aqc_timestamp ASC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return { rows: rows as PendingPushRow[], totalRows };
    }

    static async getAwaitingVendor(limit: number, offset: number): Promise<{ rows: AwaitingVendorRow[]; totalRows: number }> {
        const connection = getConnection();

        const baseQuery = `
            SELECT 'interview' AS source_type, i.interview_name, i.subject_id, i.study_id,
                tp.transcription_source_path, tp.source_language, tp.sftp_upload_timestamp,
                EXTRACT(EPOCH FROM (NOW() - tp.sftp_upload_timestamp)) / 3600.0 AS hours_waiting
            FROM transcribeme.transcribeme_push tp
            LEFT JOIN transcribeme.wav_conversion wc ON wc.wc_destination_path = tp.transcription_source_path
            ${INTERVIEW_JOIN}
            WHERE tp.transcription_destination_path NOT IN (
                SELECT transcription_destination_path FROM transcribeme.transcribeme_pull
            )

            UNION ALL

            SELECT 'audio_journal' AS source_type, aj.aj_name AS interview_name, aj.subject_id, aj.study_id,
                tp.transcription_source_path, tp.source_language, tp.sftp_upload_timestamp,
                EXTRACT(EPOCH FROM (NOW() - tp.sftp_upload_timestamp)) / 3600.0 AS hours_waiting
            FROM transcribeme.transcribeme_push tp
            LEFT JOIN transcribeme.wav_conversion wc ON wc.wc_destination_path = tp.transcription_source_path
            ${JOURNAL_JOIN}
            WHERE tp.transcription_destination_path NOT IN (
                SELECT transcription_destination_path FROM transcribeme.transcribeme_pull
            )
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY hours_waiting DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return { rows: rows as AwaitingVendorRow[], totalRows };
    }

    static async getDownloadedNotImported(limit: number, offset: number): Promise<{ rows: TranscriptNotImportedRow[]; totalRows: number }> {
        const connection = getConnection();

        // NOTE: the audio-journal transcript importer (5_import_journal_transcripts.py)
        // writes identifier_type = 'audioJounal' - that's an upstream typo, not a bug
        // here. It must be matched exactly or every journal row will look "not imported".
        const baseQuery = `
            SELECT 'interview' AS source_type, i.interview_name, i.subject_id, i.study_id,
                pull.transcription_destination_path, pull.sftp_download_timestamp
            FROM transcribeme.transcribeme_pull pull
            LEFT JOIN transcribeme.transcribeme_push tp ON tp.transcription_destination_path = pull.transcription_destination_path
            LEFT JOIN transcribeme.wav_conversion wc ON wc.wc_destination_path = tp.transcription_source_path
            ${INTERVIEW_JOIN}
            WHERE NOT EXISTS (
                SELECT 1 FROM transcript_files tf
                WHERE tf.identifier_name = i.interview_name AND tf.identifier_type = 'interview'
            )

            UNION ALL

            SELECT 'audio_journal' AS source_type, aj.aj_name AS interview_name, aj.subject_id, aj.study_id,
                pull.transcription_destination_path, pull.sftp_download_timestamp
            FROM transcribeme.transcribeme_pull pull
            LEFT JOIN transcribeme.transcribeme_push tp ON tp.transcription_destination_path = pull.transcription_destination_path
            LEFT JOIN transcribeme.wav_conversion wc ON wc.wc_destination_path = tp.transcription_source_path
            ${JOURNAL_JOIN}
            WHERE NOT EXISTS (
                SELECT 1 FROM transcript_files tf
                WHERE tf.identifier_name = aj.aj_name AND tf.identifier_type = 'audioJounal'
            )
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY sftp_download_timestamp DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return { rows: rows as TranscriptNotImportedRow[], totalRows };
    }

    static async getStatusForInterview(interview_name: string): Promise<TranscriptionPipelineStatus> {
        const connection = getConnection();

        const result = await connection.query(
            `
            SELECT wc.wc_source_path, wc.wc_destination_path, wc.wc_duration_s, wc.wc_timestamp
            FROM transcribeme.wav_conversion wc
            JOIN interview_files ifi ON ifi.interview_file = wc.wc_source_path
            JOIN interview_parts ip ON ip.interview_path = ifi.interview_path
            WHERE ip.interview_name = $1
            ORDER BY wc.wc_timestamp DESC
            LIMIT 1
            `,
            [interview_name]
        );

        return Transcribeme.buildStatusFromWavConversion(result.rows[0] ?? null);
    }

    static async getStatusForAudioJournal(
        study_id: string,
        subject_id: string,
        journal_name: string
    ): Promise<TranscriptionPipelineStatus> {
        const connection = getConnection();

        const result = await connection.query(
            `
            SELECT wc.wc_source_path, wc.wc_destination_path, wc.wc_duration_s, wc.wc_timestamp
            FROM transcribeme.wav_conversion wc
            JOIN audio_journals aj ON aj.aj_path = wc.wc_source_path
            WHERE aj.study_id = $1 AND aj.subject_id = $2 AND aj.aj_name = $3
            ORDER BY wc.wc_timestamp DESC
            LIMIT 1
            `,
            [study_id, subject_id, journal_name]
        );

        return Transcribeme.buildStatusFromWavConversion(result.rows[0] ?? null);
    }

    private static async buildStatusFromWavConversion(
        wav_conversion: DbWavConversion | null
    ): Promise<TranscriptionPipelineStatus> {
        if (!wav_conversion) {
            return { wav_conversion: null, audio_qc: null, push: null, pull: null };
        }

        const connection = getConnection();

        const aqcResult = await connection.query(
            `SELECT * FROM transcribeme.audio_qc WHERE aqc_source_path = $1`,
            [wav_conversion.wc_destination_path]
        );
        const audio_qc: DbAudioQc | null = aqcResult.rows[0] ?? null;

        const pushResult = await connection.query(
            `SELECT * FROM transcribeme.transcribeme_push WHERE transcription_source_path = $1`,
            [wav_conversion.wc_destination_path]
        );
        const push: DbTranscribemePush | null = pushResult.rows[0] ?? null;

        let pull: DbTranscribemePull | null = null;
        if (push) {
            const pullResult = await connection.query(
                `SELECT * FROM transcribeme.transcribeme_pull WHERE transcription_destination_path = $1`,
                [push.transcription_destination_path]
            );
            pull = pullResult.rows[0] ?? null;
        }

        return { wav_conversion, audio_qc, push, pull };
    }
}
