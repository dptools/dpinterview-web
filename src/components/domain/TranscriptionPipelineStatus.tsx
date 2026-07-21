"use client"
import { useEffect, useState } from 'react';

import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import { Empty } from 'antd';

import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/joy/Chip';

import { TranscriptionPipelineStatus as StatusType } from '@/lib/types/transcribeme';

export type TranscriptionPipelineStatusProps = {
    identifier: string;
    identifier_type: 'interview' | 'audio_journal';
    study_id?: string;
    subject_id?: string;
};

export default function TranscriptionPipelineStatus(props: TranscriptionPipelineStatusProps) {
    const { identifier, identifier_type, study_id, subject_id } = props;
    const [status, setStatus] = useState<StatusType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviewStatus = async (interviewName: string) => {
            const res = await fetch(`/api/v2/interviews/${interviewName}/transcription-status`);
            if (res.ok) {
                setStatus(await res.json());
            }
            setLoading(false);
        };

        const fetchJournalStatus = async (studyId: string, subjectId: string, journalName: string) => {
            const res = await fetch(
                `/api/v3/studies/${studyId}/subjects/${subjectId}/audioJournals/${journalName}/transcription-status`
            );
            if (res.ok) {
                setStatus(await res.json());
            }
            setLoading(false);
        };

        if (!identifier) {
            return;
        }
        if (identifier_type === 'interview') {
            fetchInterviewStatus(identifier);
        } else if (identifier_type === 'audio_journal') {
            if (!study_id || !subject_id) {
                setLoading(false);
                return;
            }
            fetchJournalStatus(study_id, subject_id, identifier);
        }
    }, [identifier, identifier_type, study_id, subject_id]);

    if (loading) {
        return <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />;
    }

    if (!status || !status.wav_conversion) {
        return (
            <div className="m-16">
                <Empty description="This recording has not entered the AMPSCZ transcription pipeline yet" />
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
                    <Chip color="success" size="sm">Done</Chip>
                </div>
                <Descriptions bordered size="small" column={1} items={wavConversionItems} />
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <strong>2. Audio QC</strong>
                    {audio_qc ? (
                        <Chip color={audio_qc.aqc_passed ? 'success' : 'danger'} size="sm">
                            {audio_qc.aqc_passed ? 'Passed' : 'Failed'}
                        </Chip>
                    ) : (
                        <Chip color="neutral" size="sm">Not Run</Chip>
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
                    <Chip color={push ? 'success' : 'neutral'} size="sm">{push ? 'Done' : 'Not Yet'}</Chip>
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
                    <Chip color={pull ? 'success' : 'neutral'} size="sm">{pull ? 'Done' : 'Not Yet'}</Chip>
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
