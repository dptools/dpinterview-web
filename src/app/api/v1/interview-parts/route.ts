import {DashboardActions} from "@/lib/models/DashboardActions";
import {InterviewParts} from "@/lib/models/InterviewParts";
import {notFound} from "next/navigation";
import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";

export const InterviewPartUpdate = z.object({
    interview_path: z.string(),
    interview_name: z.string(),
    is_primary: z.boolean().optional(),
    is_duplicate: z.boolean().optional(),
});

export type InterviewPartUpdate = z.infer<typeof InterviewPartUpdate>;

export async function GET(request: NextRequest): Promise<Response> {

    const interview_name = request.nextUrl.searchParams.get('interview_name');

    if (!interview_name) {
        return NextResponse.json({error: 'Missing interview_name parameter'}, {status: 400});
    }

    const interviewParts = await InterviewParts.get(interview_name);

    if (!interviewParts || interviewParts.length === 0) {
        notFound();
    }

    return NextResponse.json(interviewParts);
}

export async function POST(request: Request): Promise<Response> {
    // const url = new URL(request.url);
    // const interview_path = url.searchParams.get('interview_path');

    // if (!interview_path) {
    //     return new Response(JSON.stringify({ error: 'Missing interview_path parameter' }), {
    //         status: 400,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     });
    // }

    const body = await request.json();
    const {interview_path, interview_name, is_duplicate, is_primary} = await InterviewPartUpdate.decodeAsync(body);


    if (is_primary === undefined && is_duplicate === undefined) {
        return NextResponse.json({error: 'Missing is_primary or is_duplicate parameter'}, {status: 400,});
    }

    const interviewPart = await InterviewParts.fetch(interview_path);

    if (!interviewPart) {
        notFound();
    }
    if ((is_primary && interviewPart.is_primary === is_primary) && (is_duplicate && interviewPart.is_duplicate !== is_duplicate)) {
        // No changes
        return new NextResponse(null, {status: 204})
    }
    // Only flip value if changed
    if (is_primary && interviewPart.is_primary !== is_primary) {
        const action = body.is_primary ? "mark_primary" : "unmark_primary";
        await DashboardActions.recordAction(
            interview_name,
            action,
            interview_path,
            "interview_path"
        );
        await InterviewParts.setPrimary(interview_path, body.is_primary);
    }

    // Only flip value if changed
    if (is_duplicate && interviewPart.is_duplicate !== is_duplicate) {
        const action = body.is_duplicate ? "mark_duplicate" : "unmark_duplicate";
        await DashboardActions.recordAction(
            interview_name,
            action,
            interview_path,
            "interview_path"
        );
        await InterviewParts.setDuplicate(interview_path, body.is_duplicate);
    }
    return NextResponse.json({success: true});
}