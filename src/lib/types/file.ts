import {isoDatetimeToDate} from "@/lib/api";
import {z} from "zod";

export type DbFile = {
    file_path: string;
    file_name: string;
    file_type: string;
    file_size_mb: number;
    m_time: Date;
    md5: string;
};

export const DbFile = z.toZod<DbFile>()(z.object({
    file_path: z.string(),
    file_name: z.string(),
    file_type: z.string(),
    file_size_mb: z.number(),
    m_time: z.date(),
    md5: z.string(),
}));


export const File = z.object({
    file_path: z.string(),
    file_name: z.string(),
    file_type: z.string(),
    file_size_mb: z.number(),
    m_time: isoDatetimeToDate,
    md5: z.string(),
});

export type File = z.infer<typeof File>;