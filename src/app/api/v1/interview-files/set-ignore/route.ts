import {SetIgnore, SetIgnoreSuccess} from "@/lib/api/v1/InterviewFiles/types";
import {InterviewFiles} from "@/lib/models/InterviewFiles";
import {BasicErrorResponse} from "@/lib/types/api";
import {NextResponse} from "next/server";

const {DashboardActions} = await import("@/lib/models/DashboardActions");

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        const result = await SetIgnore.safeDecodeAsync(body);

        if (!result.success) {
            return NextResponse.json(await BasicErrorResponse.encodeAsync({error: result.error.message}), {status: 400});
        }

        const {file_path, ignored, interview_name} = result.data;

        // Record dashboard action
        try {
            await DashboardActions.recordAction(
                interview_name || "unknown",
                ignored ? "mark_ignored" : "unmark_ignored",
                file_path,
                "file_path"
            );
        } catch (e) {
            // If DashboardActions fails, continue but log error
            console.error("Failed to record dashboard action", e);
        }

        await InterviewFiles.setIgnoreFile(file_path, ignored);

        return NextResponse.json(await SetIgnoreSuccess.encodeAsync({success: true}));

    } catch (error: any) {
        return NextResponse.json(await BasicErrorResponse.encodeAsync({error: error.message || "Unknown error"}), {status: 500,});
    }
}
