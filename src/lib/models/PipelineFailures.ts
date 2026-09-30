import { getConnection } from "@/lib/db";

import { PipelineFailureRow } from "@/lib/types/pipeline_failures";

export class PipelineFailures {
    static async getAll(
        includeResolved: boolean,
        limit: number,
        offset: number,
        filters?: { study_id?: string; subject_id?: string; error_code?: string }
    ): Promise<{ rows: PipelineFailureRow[]; totalRows: number }> {
        const connection = getConnection();

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (!includeResolved) {
            conditions.push("pf_resolved IS FALSE");
        }
        if (filters?.study_id) {
            params.push(filters.study_id);
            conditions.push(`pf_study_id = $${params.length}`);
        }
        if (filters?.subject_id) {
            params.push(filters.subject_id);
            conditions.push(`pf_subject_id = $${params.length}`);
        }
        if (filters?.error_code) {
            params.push(filters.error_code);
            conditions.push(`pf_error_code = $${params.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const baseQuery = `
            SELECT *
            FROM pipeline_ledger.pipeline_failures
            ${whereClause}
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`, params);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY pf_last_seen_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        return { rows: rows as PipelineFailureRow[], totalRows };
    }

    // Mirrors dpinterview's pipeline/helpers/db.py:resolve_failure - that
    // function has no call sites on the Python side today, so this is
    // currently the only place a failure ever gets marked resolved.
    static async resolve(pf_stage: string, pf_identifier: string, note?: string): Promise<void> {
        const connection = getConnection();

        await connection.query(
            `
            UPDATE pipeline_ledger.pipeline_failures
            SET pf_resolved = TRUE, pf_resolved_at = CURRENT_TIMESTAMP, pf_resolved_note = $3
            WHERE pf_stage = $1 AND pf_identifier = $2
            `,
            [pf_stage, pf_identifier, note ?? null]
        );
    }
}
