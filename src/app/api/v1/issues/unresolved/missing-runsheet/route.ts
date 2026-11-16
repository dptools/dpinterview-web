import { getConnection } from "@/lib/db";
import { unformatSQL } from "@/lib/query";

export type InterviewIssue = {
    interview_name: string;
    interview_type: string;
    subject_id: string;
    study_id: string;
    earliest_interview_day: number;
};

/**
 * Handles the GET request to fetch interviews interviews with missing runsheets from the database.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched interviews in JSON format.
 *
 */
export async function GET(request: Request): Promise<Response> {
    const connection = getConnection();
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 5;
    const offset = url.searchParams.get('offset') || 0;

    const baseQuery = `
SELECT  
    i.interview_name,  
    i.interview_type AS interview_type,  
    i.subject_id,  
    i.study_id,  
    MIN(ip.interview_day) AS earliest_interview_day  
FROM  
    public.interviews i  
    INNER JOIN public.interview_parts ip ON i.interview_name = ip.interview_name  
WHERE  
    NOT EXISTS (  
        SELECT 1  
        FROM public.expected_interviews e  
        WHERE  
            e.subject_id = i.subject_id  
            AND e.study_id = i.study_id  
            AND e.expected_interview_type = i.interview_type  
            AND ABS(e.expected_interview_day - ip.interview_day) <= 10  
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public.manual_qc mq
        WHERE 
            mq.qc_target_id = i.interview_name
            AND mq.qc_target_type = 'interview'
            AND nullif(mq.qc_data->>'runsheetIdentifier', '') IS NOT NULL
    )
GROUP BY  
    i.interview_name,  
    i.interview_type,  
    i.subject_id,  
    i.study_id
ORDER BY i.interview_name
`;

    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS total_count`;
    const countResult = await connection.query(countQuery);
    const totalRows = countResult.rows[0].count;

    const limitedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    const { rows } = await connection.query(limitedQuery);

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
