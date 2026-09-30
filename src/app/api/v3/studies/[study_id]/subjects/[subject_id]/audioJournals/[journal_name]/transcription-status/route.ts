import { Transcribeme } from "@/lib/models/Transcribeme";

export async function GET(
    _: Request,
    props: { params: Promise<{ study_id: string; subject_id: string; journal_name: string }> }
): Promise<Response> {
    const params = await props.params;
    const { study_id, subject_id, journal_name } = params;

    if (!study_id || !subject_id || !journal_name) {
        return new Response(JSON.stringify({ error: "Missing study_id, subject_id or journal_name parameter" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const status = await Transcribeme.getStatusForAudioJournal(study_id, subject_id, journal_name);

    return new Response(JSON.stringify(status), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
