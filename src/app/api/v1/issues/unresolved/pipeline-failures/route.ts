import { PipelineFailures } from "@/lib/models/PipelineFailures";

/**
 * Handles the GET request to fetch rows from the pipeline_ledger.pipeline_failures
 * ledger. Defaults to unresolved failures only; pass ?includeResolved=true to
 * also return failures that have already been marked resolved.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched rows in JSON format.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "", 10) || 50, 1), 5000);
    const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "", 10) || 0, 0);
    const includeResolved = url.searchParams.get("includeResolved") === "true";

    const { rows, totalRows } = await PipelineFailures.getAll(includeResolved, limit, offset);

    const metadata = { totalRows, limit, offset, includeResolved };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
