import {Interviews} from "@/lib/models/Interviews";
import {notFound} from "next/navigation";
import {NextResponse} from "next/server";

export async function GET(
    _request: Request,
    ctx: RouteContext<'/api/v2/interviews/[interview_name]/info'>
): Promise<NextResponse> {
    const {interview_name} = await ctx.params;

    if (!interview_name) {
        return NextResponse.json({error: 'Missing name parameter'}, {status: 400});
    }

    const interviews = await Interviews.get(interview_name);

    if (!interviews) {
        notFound();
    }

    return NextResponse.json(interviews);
}
