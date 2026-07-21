import { getConnection } from "@/lib/db";

import { DbDashboardAction } from "@/lib/types/dashboard_actions";

export class DashboardActions {
    // Backs the Override Ledger reporting page - filtered to a caller-supplied
    // set of da_action values (e.g. OVERRIDE_LEDGER_ACTIONS) since this table
    // also logs routine, non-override dashboard edits (mark_primary, clear_role,
    // etc.) that shouldn't count toward the override audit trail.
    static async getByActions(
        actions: string[],
        limit: number,
        offset: number,
        filters: { study_id?: string; subject_id?: string } = {}
    ): Promise<{ rows: DbDashboardAction[]; totalRows: number }> {
        const connection = getConnection();

        const conditions: string[] = ["da_action = ANY($1)"];
        const params: (string | string[])[] = [actions];

        // study_id/subject_id aren't real columns on this general-purpose
        // table - every override call site is expected to record them inside
        // da_metadata instead.
        if (filters.study_id) {
            params.push(filters.study_id);
            conditions.push(`da_metadata->>'study_id' = $${params.length}`);
        }
        if (filters.subject_id) {
            params.push(filters.subject_id);
            conditions.push(`da_metadata->>'subject_id' = $${params.length}`);
        }

        const baseQuery = `
            SELECT *
            FROM dashboard_actions
            WHERE ${conditions.join(" AND ")}
        `;

        const countResult = await connection.query(`SELECT COUNT(*) FROM (${baseQuery}) AS total`, params);
        const totalRows = parseInt(countResult.rows[0].count, 10);

        const { rows } = await connection.query(
            `${baseQuery} ORDER BY da_timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        return { rows: rows as DbDashboardAction[], totalRows };
    }

    static async recordAction(
        interview_name: string,
        action: string,
        target_id: string,
        target_type: string,
        metadata?: object
    ) {
        const connection = getConnection();

        if (metadata) {
            const metadataString = JSON.stringify(metadata);
            await connection.query(
                `
                INSERT INTO dashboard_actions (interview_name, da_action, da_user_id, da_target_id, da_target_type, da_metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    interview_name,
                    action,
                    "dashboard_user",
                    target_id,
                    target_type,
                    metadataString,
                ]
            );
        } else {
            await connection.query(
                `
                INSERT INTO dashboard_actions (interview_name, da_action, da_user_id, da_target_id, da_target_type)
                VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    interview_name,
                    action,
                    "dashboard_user",
                    target_id,
                    target_type,
                ]
            );
        }
    }
}

