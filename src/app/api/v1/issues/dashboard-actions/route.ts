import { DashboardActions } from "@/lib/models/DashboardActions";
import { OVERRIDE_LEDGER_ACTIONS } from "@/lib/types/dashboard_actions";

/**
 * Handles the GET request to fetch rows from the dashboard_actions ledger,
 * scoped to the manual override actions (audio QC bypass, runsheet datetime
 * match) - not every dashboard_actions row, since the same table also logs
 * routine edits (mark_primary, clear_role, etc.) unrelated to QC overrides.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched rows in JSON format.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "", 10) || 50, 1), 5000);
    const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "", 10) || 0, 0);
    const study_id = url.searchParams.get("study_id") ?? undefined;
    const subject_id = url.searchParams.get("subject_id") ?? undefined;

    const { rows, totalRows } = await DashboardActions.getByActions(
        [...OVERRIDE_LEDGER_ACTIONS],
        limit,
        offset,
        { study_id, subject_id }
    );

    const metadata = { totalRows, limit, offset };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
