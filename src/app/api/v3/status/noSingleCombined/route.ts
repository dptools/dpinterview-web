import { StatusSummary } from '@/lib/models/StatusSummary';

/**
 * Expected interviews without a single combined-audio file, each categorized by the audio it has.
 * Pass ?study_id= to restrict to one site.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const study_id = url.searchParams.get('study_id') ?? undefined;

    const rows = await StatusSummary.getNoSingleCombined(study_id);

    return new Response(JSON.stringify(rows), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
