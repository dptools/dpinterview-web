import {isoDatetimeToDate} from "@/lib/api";
import { DbFile, File as ApiFile } from '@/lib/types/file';
import {z} from "zod";

export type DbInterview = {
    interview_name: string;
    interview_type: string;
    subject_id: string;
    study_id: string;
};

export const DbInterview = z.toZod<DbInterview>()(z.object({
    interview_name: z.string(),
    interview_type: z.string(),
    subject_id: z.string(),
    study_id: z.string(),
}));

export type DbInterviewEnhanced = {
    interview_name: string;
    interview_type: string;
    subject_id: string;
    study_id: string;
    interview_day: number;
    interview_datetime: Date;
};

export type DbExpectedInterview = {
    interview_name: string;
    subject_id: string;
    study_id: string;
    form_name: string;
    event_name: string;
    expected_interview_day: number;
    expected_interview_date: Date;
    expected_interview_type: string;
}

export type Interview = {
    interview_name: string;
    interview_type: string;
    subject_id: string;
    study_id: string;
    parts: InterviewPart[];
    transcript_files: InterviewTranscriptFile[];
};

export type DbInterviewPart = {
    interview_path: string;
    interview_name: string;
    interview_day: number;
    interview_part: number;
    interview_datetime: Date;
    is_primary: boolean;
    is_duplicate: boolean;
};

export type InterviewPart = {
    interview_path: string;
    interview_name: string;
    interview_day: number;
    interview_part: number;
    interview_datetime: Date;
    is_primary: boolean;
    is_duplicate: boolean;
    interview_files: InterviewFile[];
};

export type DbTranscriptFiles = {
    transcript_file: string;
    identifier_name: string;
    identifier_type: string;
    transcript_file_tags: string;
}

export type InterviewTranscriptFile = {
    interview_name: string;
    transcript_file: ApiFile;
    transcript_file_tags: string[];
}

export type DbInterviewFile = {
    interview_path: string;
    interview_file: string;
    interview_file_tags: string;
    ignored: boolean;
};

export type InterviewFile = {
    interview_file: ApiFile;
    interview_file_tags: string[];
    ignored: boolean;
};

export type InterviewProcessingData = {
    interview_name: string;
    interview_date: Date | undefined;
    data_received_date: Date | undefined;
    has_duplicates: boolean;
    has_primary: boolean;
    ffprobe_metadata_extraction_date: Date | null;
    video_quick_qc: {
        has_black_bars: boolean | null;
        timestamp: Date | null;
    } | null;
    video_streams: {
        count: number;
        timestamp: Date;
    } | null;
    openface: {
        count: number;
        timestamp: Date;
    } | null;
    openface_qc: {
        successful_frames_count: number;
        successful_frames_percentage: number;
        successful_frames_confidence_mean: number | null;
        successful_frames_confidence_std: number | null;
        successful_frames_confidence_median: number | null;
        passed: boolean;
        timestamp: Date;
    } | null;
    pdf_report: {
        pdf_report_path: string;
        timestamp: Date;
    } | null;
};


export const InterviewFile = z.toZod<InterviewFile>()(z.object({
    interview_file: ApiFile,
    interview_file_tags: z.array(z.string()),
    ignored: z.boolean(),
}));

export const InterviewTranscriptFile = z.toZod<InterviewTranscriptFile>()(z.object({
    interview_name: z.string(),
    transcript_file: ApiFile,
    transcript_file_tags: z.array(z.string()),
}));

export const InterviewPart = z.toZod<InterviewPart>()(z.object({
    interview_path: z.string(),
    interview_name: z.string(),
    interview_day: z.number(),
    interview_part: z.number(),
    interview_datetime: isoDatetimeToDate,
    is_primary: z.boolean(),
    is_duplicate: z.boolean(),
    interview_files: z.array(InterviewFile),
}));

export const Interview = z.toZod<Interview>()(z.object({
    interview_name: z.string(),
    interview_type: z.string(),
    subject_id: z.string(),
    study_id: z.string(),
    parts: z.array(InterviewPart),
    transcript_files: z.array(InterviewTranscriptFile),
}));