import {DashboardActions} from "@/lib/models/DashboardActions";
import {InterviewFiles} from "@/lib/models/InterviewFiles";
import {NextResponse} from "next/server";
import {z} from "zod";

export const AudioTagClearRequest = z.object({
    audio_path: z.string(),
});

export const AudioTagClearResponse = z.object({
    message: z.string(),
    new_tags: z.string(),
})

export type AudioTagClearResponse = z.infer<typeof AudioTagClearResponse>;

export async function POST(
    request: Request,
    ctx: RouteContext<"/api/v2/interviews/[interview_name]/audio/clearRole">,
): Promise<Response> {
    const {interview_name} = await ctx.params;

    const body = await request.json();
    const parseResult = await AudioTagClearRequest.safeDecodeAsync(body);
    if (!parseResult.success) {
        return NextResponse.json(parseResult.error, {status: 400,})
    }

    const {audio_path} = parseResult.data;

    await DashboardActions.recordAction(
        interview_name,
        "clear_role",
        audio_path,
        "audio_path"
    )

    const newTags = await InterviewFiles.removeRoleTag(
        audio_path,
    );

    const response = AudioTagClearResponse.parse({
        message: "Role cleared successfully",
        new_tags: newTags
    });

    return NextResponse.json(response);
}