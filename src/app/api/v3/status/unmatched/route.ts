import { StatusSummary } from '@/lib/models/StatusSummary';

/**
 * Unmatched runsheet entries, each categorized by the action that would resolve it.
 * Pass ?study_id= to restrict to one site.
 */
export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const study_id = url.searchParams.get('study_id') ?? undefined;

    const rows = await StatusSummary.getUnmatched(study_id);

    return new Response(JSON.stringify(rows), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
