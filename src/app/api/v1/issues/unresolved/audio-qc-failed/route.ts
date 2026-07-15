import { Transcribeme } from "@/lib/models/Transcribeme";

/**
 * Handles the GET request to fetch AMPSCZ interviews / audio journals whose
 * combined audio failed the pre-transcription audio QC (transcribeme.audio_qc).
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the fetched rows in JSON format.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "", 10) || 50, 1), 5000);
    const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "", 10) || 0, 0);

    const { rows, totalRows } = await Transcribeme.getFailedAudioQc(limit, offset);

    const metadata = { totalRows, limit, offset };

    return new Response(JSON.stringify({ metadata, rows }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
