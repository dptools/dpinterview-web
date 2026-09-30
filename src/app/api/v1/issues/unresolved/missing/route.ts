import { getConnection } from "@/lib/db";
import { unformatSQL } from "@/lib/query";

export type InterviewIssue = {
    interview_name: string;
    event_name: string;
    interview_type: string;
    subject_id: string;
    study_id: string;
    expected_date: Date;
    expected_day: number;
};

/**
 * Handles the GET request to fetch interviews from the database.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched interviews in JSON format.
 *
 */
export async function GET(request: Request): Promise<Response> {
    const connection = getConnection();
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 5;
    const offset = url.searchParams.get('offset') || 0;
    const study_id = url.searchParams.get('study_id');
    const subject_id = url.searchParams.get('subject_id');

    const params: string[] = [];
    const extraConditions: string[] = [];
    if (study_id) {
        params.push(study_id);
        extraConditions.push(`e.study_id = $${params.length}`);
    }
    if (subject_id) {
        params.push(subject_id);
        extraConditions.push(`e.subject_id = $${params.length}`);
    }
    const extraWhere = extraConditions.length > 0 ? `AND ${extraConditions.join(' AND ')}` : '';

    const baseQuery = `
    SELECT
        e.interview_name,
        e.event_name,
        e.expected_interview_type AS interview_type,
        e.subject_id,
        e.study_id,
        e.expected_interview_date::timestamp::date::text AS expected_date,
        e.expected_interview_day AS expected_day
    FROM
        public.expected_interviews e
    WHERE
        NOT EXISTS (
            SELECT
                1
            FROM
                public.interview_parts ip
                INNER JOIN public.interviews i ON ip.interview_name = i.interview_name
            WHERE
                i.subject_id = e.subject_id
                AND i.study_id = e.study_id
                AND i.interview_type = e.expected_interview_type
                AND ABS(e.expected_interview_day - ip.interview_day) <= 10
        )
        ${extraWhere}
`;

    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS total_count`;
    const countResult = await connection.query(countQuery, params);
    const totalRows = countResult.rows[0].count;

    const limitedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    const { rows } = await connection.query(limitedQuery, params);

    const metadata = {
        query: unformatSQL(limitedQuery),
        totalRows,
        limit,
        offset,
    };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
