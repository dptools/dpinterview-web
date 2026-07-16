import { DatetimeOverrides } from "@/lib/models/DatetimeOverrides";

/**
 * Looks up pending/consumed datetime overrides for a set of raw
 * pipeline_failures identifiers, so the UI can show "pending crawler
 * pickup" for a failure that already has an override recorded.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const identifiersParam = url.searchParams.get("identifiers");
    const identifiers = identifiersParam ? identifiersParam.split(",").filter(Boolean) : [];

    const overrides = await DatetimeOverrides.getByIdentifiers(identifiers);

    return new Response(JSON.stringify({ overrides }), {
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Records a staff-confirmed datetime for a raw file/directory that failed to
 * date-parse (a "datetime_parse" pipeline_failures row), after a human has
 * matched it to a runsheet entry on the Runsheet Match page. Does not mark
 * the pipeline_failures row resolved directly - the Python crawler consumes
 * this override on its next pass, imports the file normally, and resolves
 * the ledger row itself.
 */
export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        const { pf_identifier, study_id, subject_id, override_datetime } = body;

        if (!pf_identifier || !override_datetime) {
            return new Response(
                JSON.stringify({ error: "Missing pf_identifier or override_datetime parameter" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        try {
            const { DashboardActions } = await import("@/lib/models/DashboardActions");
            await DashboardActions.recordAction(
                "unknown",
                "datetime_override_pipeline_failure",
                pf_identifier,
                "file_path",
                { study_id, subject_id, override_datetime }
            );
        } catch (e) {
            // If DashboardActions fails, continue but log error
            console.error("Failed to record dashboard action", e);
        }

        await DatetimeOverrides.create(
            pf_identifier,
            study_id ?? null,
            subject_id ?? null,
            override_datetime
        );

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
