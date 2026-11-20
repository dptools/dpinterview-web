import {DbInterview} from "@/lib/types/interview";
import {z} from "zod";

export const stringToInt = z.codec(z.string().regex(z.regexes.integer), z.int(), {
    decode: (str) => Number.parseInt(str, 10),
    encode: (num) => num.toString(),
});

export const Metadata = z.object({
    totalRows: z.int().gte(0),
    limit: z.int().positive(),
    offset: z.int().gte(0),
    query: z.string(),
});

export type Metadata = z.infer<typeof Metadata>;

export function V1Response<T extends z.ZodType>(schema: T) {
    return z.object({
        metadata: Metadata,
        rows: z.array(schema),
    });
}

export const InterviewsResponse = V1Response(DbInterview);
export type InterviewsResponse = z.infer<typeof InterviewsResponse>;


export const AudioTagClearUpdate = z.object({
    audio_path: z.string(),
    role: z.string(),
})

export const AudioTagClearRequest = z.object({
    audio_path: z.string(),
})

export const BasicErrorResponse = z.object({
    error: z.string(),
})

export type BasicErrorResponse = z.infer<typeof BasicErrorResponse>;