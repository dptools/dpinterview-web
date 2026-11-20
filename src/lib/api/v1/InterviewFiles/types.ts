import {z} from "zod";

export const SetIgnore = z.object({
    file_path: z.string(),
    ignored: z.boolean(),
    interview_name: z.string(),
});

export type SetIgnore = z.infer<typeof SetIgnore>;

export const SetIgnoreFail = z.object({
    error: z.string(),
})

export const SetIgnoreSuccess = z.object({
    success: z.boolean(),
})
