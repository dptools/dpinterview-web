import { Transcribeme } from "@/lib/models/Transcribeme";

/**
 * Manually overrides a failed audio QC result, marking it approved for
 * transcription despite failing the automated check. One-directional: the
 * dpinterview push runners pick this up and push the file to TranscribeMe,
 * an external action that can't be undone from here.
 */
export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        const {
            aqc_source_path,
            interview_name,
            source_type,
            study_id,
            subject_id,
            journal_name,
            aqc_metrics,
            aqc_fail_reasons,
        } = body;
        if (!aqc_source_path) {
            return new Response(JSON.stringify({ error: "Missing aqc_source_path parameter" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const { DashboardActions } = await import("@/lib/models/DashboardActions");
            await DashboardActions.recordAction(
                interview_name || "unknown",
                "override_audio_qc",
                aqc_source_path,
                source_type || "other",
                {
                    study_id,
                    subject_id,
                    // interview_name is the "unknown" placeholder above for audio
                    // journals (that column is reserved for real interview_name
                    // values) - journal_name carries the actual identifier so the
                    // ledger can still link/group audio-journal overrides.
                    interview_name: interview_name ?? journal_name,
                    source_type,
                    aqc_metrics,
                    aqc_fail_reasons,
                }
            );
        } catch (e) {
            // If DashboardActions fails, continue but log error
            console.error("Failed to record dashboard action", e);
        }

        await Transcribeme.setAudioQcOverride(aqc_source_path);

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
