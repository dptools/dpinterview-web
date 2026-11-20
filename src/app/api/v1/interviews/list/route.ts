import {connection} from "@/lib/db";
import {unformatSQL} from "@/lib/query";
import {InterviewsResponse, stringToInt} from "@/lib/types/api";
import {DbInterview} from "@/lib/types/interview";
import {NextRequest, NextResponse} from "next/server";
import sql, {empty, join} from "sql-template-tag";
import {z} from "zod";

// Schema to automatically decode and validate search parameters
const paramsSchema = z.compile(z.object({
    study_id: z.string().optional(),
    subject_id: z.string().optional(),
    type: z.string().optional(),
    limit: stringToInt.optional().default(5),
    offset: stringToInt.optional().default(0),
}));

/**
 * Handles the GET request to fetch interviews from the database.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched interviews in JSON format.
 *
 */
export async function GET(request: NextRequest): Promise<NextResponse> {

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const {offset, type, limit, study_id: studyId, subject_id: subjectId} = await paramsSchema.decodeAsync(params);

    const filters = [];

    if (studyId) {
        filters.push(sql`study_id = ${studyId}`);
    }
    if (subjectId) {
        filters.push(sql`subject_id = ${subjectId}`);
    }
    if (type) {
        filters.push(sql`interview_type = ${type}`);
    }

    const filter = sql`${filters.length > 0 ? sql`WHERE ${join(filters, " AND ")}` : empty}`
    const baseQuery = sql`SELECT *
                          FROM interviews
                              ${filter}
                          ORDER BY subject_id
                          LIMIT ${limit} OFFSET ${offset}`;

    // manually specifies that count is an integer so we get a number back. JS can handle integers beyond 10^12 so this should be safe
    const countQuery = sql`SELECT COUNT(*)::integer AS total_count FROM interviews ${filter}`;

    const countResult = await connection.query<{ total_count: number }>(countQuery);
    const totalRows = countResult.rows[0].total_count;

    const {rows} = await connection.query<DbInterview>(baseQuery);

    const result = await InterviewsResponse.encodeAsync({
        metadata: {
            query: unformatSQL(baseQuery.sql),
            totalRows,
            limit,
            offset,
        }, rows
    });
    return NextResponse.json(result);
}
