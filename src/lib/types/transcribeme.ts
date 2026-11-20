// transcribeme.wav_conversion
import {isoDatetimeToDate} from "@/lib/api";
import {z} from "zod";

export type DbWavConversion = {
    wc_source_path: string;
    wc_destination_path: string;
    wc_duration_s: number;
    wc_timestamp: Date;
};

export const DbWavConversion = z.toZod<DbWavConversion>()(z.object({
    wc_source_path: z.string(),
    wc_destination_path: z.string(),
    wc_duration_s: z.number(),
    wc_timestamp: z.date(),
}));

// transcribeme.audio_qc
export type DbAudioQc = {
    aqc_source_path: string;
    aqc_passed: boolean;
    aqc_metrics: Record<string, number>;
    aqc_fail_reasons: Record<string, boolean> | null;
    aqc_duration_s: number;
    aqc_timestamp: Date;
    aqc_override: boolean;
};

export const DbAudioQc = z.toZod<DbAudioQc>()(z.object({
    aqc_source_path: z.string(),
    aqc_passed: z.boolean(),
    aqc_metrics: z.record(z.string(), z.number()),
    aqc_fail_reasons: z.record(z.string(), z.boolean()).nullable(),
    aqc_duration_s: z.number(),
    aqc_timestamp: z.date(),
    aqc_override: z.boolean(),
}));

// transcribeme.transcribeme_push
export type DbTranscribemePush = {
    transcription_source_path: string;
    source_language: string;
    sftp_upload_path: string;
    transcription_destination_path: string;
    sftp_upload_duration_s: number;
    sftp_upload_timestamp: Date;
};

export const DbTranscribemePush = z.toZod<DbTranscribemePush>()(z.object({
    transcription_source_path: z.string(),
    source_language: z.string(),
    sftp_upload_path: z.string(),
    transcription_destination_path: z.string(),
    sftp_upload_duration_s: z.number(),
    sftp_upload_timestamp: z.date(),
}));

// transcribeme.transcribeme_pull
export type DbTranscribemePull = {
    transcription_destination_path: string;
    sftp_download_path: string;
    sftp_archive_path: string;
    sftp_download_duration_s: number;
    sftp_download_timestamp: Date;
    completed_audio_file_path: string;
};

export const DbTranscribemePull = z.toZod<DbTranscribemePull>()(z.object({
    transcription_destination_path: z.string(),
    sftp_download_path: z.string(),
    sftp_archive_path: z.string(),
    sftp_download_duration_s: z.number(),
    sftp_download_timestamp: z.date(),
    completed_audio_file_path: z.string(),
}));

// Every transcribeme.* row traces back to either a combined interview audio
// file or an audio journal - the two identifier trees join back differently
// (see Transcribeme model), so every browse row is tagged with which one it is.
export type TranscriptionSourceType = "interview" | "audio_journal";

export type FailedAudioQcRow = {
    source_type: TranscriptionSourceType;
    interview_name: string;
    subject_id: string;
    study_id: string;
    aqc_source_path: string;
    aqc_metrics: Record<string, number>;
    aqc_fail_reasons: Record<string, boolean> | null;
    aqc_timestamp: Date;
    aqc_override: boolean;
};

export type PendingPushRow = {
    source_type: TranscriptionSourceType;
    interview_name: string;
    subject_id: string;
    study_id: string;
    wc_destination_path: string;
    aqc_timestamp: Date;
};

export type AwaitingVendorRow = {
    source_type: TranscriptionSourceType;
    interview_name: string;
    subject_id: string;
    study_id: string;
    transcription_source_path: string;
    source_language: string;
    sftp_upload_timestamp: Date;
};

export type TranscriptNotImportedRow = {
    source_type: TranscriptionSourceType;
    interview_name: string;
    subject_id: string;
    study_id: string;
    transcription_destination_path: string;
    sftp_download_timestamp: Date;
};

export type TranscriptionPipelineStatus = {
    wav_conversion: DbWavConversion | null;
    audio_qc: DbAudioQc | null;
    push: DbTranscribemePush | null;
    pull: DbTranscribemePull | null;
};

export const TranscriptionPipelineStatus = z.toZod<TranscriptionPipelineStatus>()(z.object({
    wav_conversion: DbWavConversion.nullable(),
    audio_qc: DbAudioQc.nullable(),
    push: DbTranscribemePush.nullable(),
    pull: DbTranscribemePull.nullable(),
}));


export const ApiDbWavConversion = z.object({
    ...DbWavConversion.omit({wc_timestamp: true}).shape,
    wc_timestamp: isoDatetimeToDate,
});

