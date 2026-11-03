import { StatusSummary } from '@/lib/models/StatusSummary';

/**
 * Per-site interview status (one state per runsheet-expected interview,
 * plus outside-denominator counts) and per-site audio journal aggregates.
 */
export async function GET(): Promise<Response> {
    const summary = await StatusSummary.get();

    return new Response(JSON.stringify(summary), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
