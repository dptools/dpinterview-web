import { Transcribeme } from "@/lib/models/Transcribeme";

export async function GET(
    _: Request,
    props: { params: Promise<{ interview_name: string }> }
): Promise<Response> {
    const params = await props.params;
    const interview_name = params.interview_name;

    if (!interview_name) {
        return new Response(JSON.stringify({ error: "Missing interview_name parameter" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const status = await Transcribeme.getStatusForInterview(interview_name);

    return new Response(JSON.stringify(status), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
