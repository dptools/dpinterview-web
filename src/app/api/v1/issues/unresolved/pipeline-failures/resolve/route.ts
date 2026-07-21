import { PipelineFailures } from "@/lib/models/PipelineFailures";

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        const { pf_stage, pf_identifier, pf_identifier_type, note } = body;
        if (!pf_stage || !pf_identifier) {
            return new Response(JSON.stringify({ error: "Missing pf_stage or pf_identifier parameter" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Record dashboard action. dashboard_actions.interview_name is NOT NULL,
        // but not every ledger row is tied to an interview (e.g. study/batch/other
        // identifier types) - only pass the identifier through as interview_name
        // when it actually is one; da_target_id/da_target_type carry the real
        // identifier either way.
        try {
            const { DashboardActions } = await import("@/lib/models/DashboardActions");
            await DashboardActions.recordAction(
                pf_identifier_type === "interview_name" ? pf_identifier : "unknown",
                "resolve_pipeline_failure",
                pf_identifier,
                pf_identifier_type || "other",
                note ? { pf_stage, note } : { pf_stage }
            );
        } catch (e) {
            // If DashboardActions fails, continue but log error
            console.error("Failed to record dashboard action", e);
        }

        await PipelineFailures.resolve(pf_stage, pf_identifier, note);

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
