import {ApiError} from "next/dist/server/api-utils";
import {z} from "zod";

export const ApiKeys = {
    all: ["api"] as const,
}

/**
 * Generic GET function that parses resultant JSON as supplied Zod schema
 * @param schema
 * @param url
 * @throws ApiError
 */
export async function fetcher<T extends z.ZodType>(schema: T, url: URL | string): Promise<z.output<T>> {
    const result = await fetch(url);
    if (!result.ok) {
        throw new ApiError(result.status, "Error fetching data");
    }
    const jsonData = await result.json();
    const parseResult = await schema.safeParseAsync(jsonData);
    if (!parseResult.success) {
        throw new ApiError(500, parseResult.error.message);
    }
    return parseResult.data;
}

