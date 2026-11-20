import {connection, getConnection} from "@/lib/db";
import {InterviewFiles} from "@/lib/models/InterviewFiles";

import {DbInterviewPart, InterviewPart} from "@/lib/types/interview";
import sql, {Sql} from "sql-template-tag";

export class InterviewParts {
    static async get(interview_name: string): Promise<InterviewPart[]> {
        const connection = getConnection();
        const results = await connection.query(
            `
                SELECT *
                FROM interview_parts
                WHERE interview_name = $1
                ORDER BY interview_day, interview_part
            `,
            [interview_name]
        );
        const interviewParts: InterviewPart[] = [];

        for (const row of results.rows as DbInterviewPart[]) {
            interviewParts.push({
                interview_path: row.interview_path,
                interview_name: row.interview_name,
                interview_day: row.interview_day,
                interview_part: row.interview_part,
                interview_datetime: row.interview_datetime,
                is_primary: row.is_primary,
                is_duplicate: row.is_duplicate,
                interview_files: await InterviewFiles.get(row.interview_path),
            });
        }

        return interviewParts;
    }

    static async fetch(interviewName: string, part: number): Promise<DbInterviewPart | null>;
    static async fetch(interviewPath: string): Promise<DbInterviewPart | null>;
    static async fetch(interviewPath: string, part?: number): Promise<DbInterviewPart | null> {
        let query: Sql;
        if (part) {
            query = sql`SELECT *
                        FROM interview_parts
                        WHERE interview_name = ${interviewPath}
                          AND interview_part = ${part}
                        LIMIT 1`;
        } else {
            query = sql`SELECT *
                        FROM interview_parts
                        WHERE interview_name = ${interviewPath}
                          AND interview_part = ${part}
                        LIMIT 1`;
        }

        const result = await connection.query<DbInterviewPart>(query);
        if (result.rowCount !== 1) {
            return null
        } else {
            return result.rows[0];
        }
    }

    static async setPrimary(interview_path: string, is_primary: boolean): Promise<void> {
        const connection = getConnection();
        await connection.query(
            `
                UPDATE interview_parts
                SET is_primary = $1
                WHERE interview_path = $2
            `,
            [is_primary, interview_path]
        );
    }

    static async setDuplicate(interview_path: string, is_duplicate: boolean): Promise<void> {
        const connection = getConnection();
        await connection.query(
            `
                UPDATE interview_parts
                SET is_duplicate = $1
                WHERE interview_path = $2
            `,
            [is_duplicate, interview_path]
        );
    }
}