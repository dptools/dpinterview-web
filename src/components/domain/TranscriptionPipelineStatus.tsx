"use client"
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import { Empty } from 'antd';

import Skeleton from '@mui/material/Skeleton';
import {Badge} from "@/components/ui/badge";

import { TranscriptionPipelineStatus as StatusType } from '@/lib/types/transcribeme';

export function TranscriptionPipelineStatusSkeleton(){
    return <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />;
}

export default function TranscriptionPipelineStatus({status}:{status: StatusType}) {

    if (!status.wav_conversion) {
        return (
            <div className="m-16">
                <Empty description="This recording has not entered the dpinterview transcription pipeline yet" />
            </div>
        );
    }

    const { wav_conversion, audio_qc, push, pull } = status;

    const wavConversionItems: DescriptionsProps['items'] = [
        { key: 'source', label: 'Source Audio', children: wav_conversion.wc_source_path },
        { key: 'destination', label: 'Converted WAV', children: wav_conversion.wc_destination_path },
        { key: 'duration', label: 'Duration (s)', children: wav_conversion.wc_duration_s },
        { key: 'timestamp', label: 'Converted At', children: new Date(wav_conversion.wc_timestamp).toLocaleString() },
    ];

    const audioQcItems: DescriptionsProps['items'] = audio_qc ? [
        { key: 'passed', label: 'Passed', children: audio_qc.aqc_passed ? '✅ Yes' : '❌ No' },
        { key: 'override', label: 'Manual Override', children: audio_qc.aqc_override ? 'Yes' : 'No' },
        {
            key: 'fail_reasons',
            label: 'Fail Reasons',
            children: audio_qc.aqc_fail_reasons && Object.keys(audio_qc.aqc_fail_reasons).length > 0
                ? Object.keys(audio_qc.aqc_fail_reasons).join(', ')
                : 'None',
        },
        {
            key: 'metrics',
            label: 'Metrics',
            children: <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(audio_qc.aqc_metrics, null, 2)}</pre>,
        },
        { key: 'timestamp', label: 'QC Timestamp', children: new Date(audio_qc.aqc_timestamp).toLocaleString() },
    ] : [];

    const pushItems: DescriptionsProps['items'] = push ? [
        { key: 'language', label: 'Source Language', children: push.source_language },
        { key: 'destination', label: 'Destination Path', children: push.transcription_destination_path },
        { key: 'timestamp', label: 'Pushed At', children: new Date(push.sftp_upload_timestamp).toLocaleString() },
    ] : [];

    const pullItems: DescriptionsProps['items'] = pull ? [
        { key: 'downloaded', label: 'Downloaded At', children: new Date(pull.sftp_download_timestamp).toLocaleString() },
        { key: 'archive', label: 'Archived (Vendor)', children: pull.sftp_archive_path },
        { key: 'completed_audio', label: 'Completed Audio Path', children: pull.completed_audio_file_path },
    ] : [];

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <strong>1. WAV Conversion</strong>
                    <Badge color="success">Done</Badge>
                </div>
                <Descriptions bordered size="small" column={1} items={wavConversionItems} />
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <strong>2. Audio QC</strong>
                    {audio_qc ? (
                        <Badge color={audio_qc.aqc_passed ? 'success' : 'danger'}>
                            {audio_qc.aqc_passed ? 'Passed' : 'Failed'}
                        </Badge>
                    ) : (
                        <Badge color="neutral">Not Run</Badge>
                    )}
                </div>
                {audio_qc ? (
                    <Descriptions bordered size="small" column={1} items={audioQcItems} />
                ) : (
                    <Empty description="Audio QC has not run yet" />
                )}
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <strong>3. Pushed to TranscribeMe</strong>
                    <Badge color={push ? 'success' : 'neutral'}>{push ? 'Done' : 'Not Yet'}</Badge>
                </div>
                {push ? (
                    <Descriptions bordered size="small" column={1} items={pushItems} />
                ) : (
                    <Empty description="Not pushed to TranscribeMe yet" />
                )}
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <strong>4. Pulled from TranscribeMe</strong>
                    <Badge color={pull ? 'success' : 'neutral'}>{pull ? 'Done' : 'Not Yet'}</Badge>
                </div>
                {pull ? (
                    <Descriptions bordered size="small" column={1} items={pullItems} />
                ) : (
                    <Empty description="No transcript delivered back yet" />
                )}
            </div>
        </div>
    );
}
