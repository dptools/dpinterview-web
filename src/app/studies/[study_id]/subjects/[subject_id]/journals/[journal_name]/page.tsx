"use client"
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";
import {studyQueries} from "@/lib/api/v3/studies";
import {useQuery} from "@tanstack/react-query";
import {use} from "react";
import * as React from 'react';
import Link from 'next/link';

import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';

import Box from '@mui/material/Box';

import {
    Tabs,
    TabsTrigger,
    TabsList,
    TabsContent,
} from "@/components/ui/tabs";

import Transcript from '@/components/domain/TranscriptE';
import TranscriptionPipelineStatus, {
    TranscriptionPipelineStatusSkeleton
} from '@/components/domain/TranscriptionPipelineStatus';

import { toast } from "sonner";

export default function Page({
    params,
}: {
    params: Promise<{
        study_id: string;
        subject_id: string;
        journal_name: string;
    }>
}) {
    const {study_id: studyId, subject_id: subjectId,journal_name: journalName} = use(params);
    const [currentAudioTime, setCurrentAudioTime] = React.useState<number>(0);

    const journalFetch = useQuery(studyQueries.studySubjectAudioJournal(studyId,subjectId,journalName));
    const journalTranscriptionFetch = useQuery(studyQueries.studySubjectAudioJournalTranscriptionStatus(studyId,subjectId,journalName));

    function updateAudioTime(newTime: number) {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.currentTime = newTime;
        }
    }

    if(journalFetch.isError || journalTranscriptionFetch.isError) return (
        <Alert>
            <AlertDescription>error fetching audio journal data </AlertDescription>
            <AlertDescription>
                {journalFetch.error && (
                    <div>
                    {journalFetch.error.message}
                    </div>
                )}
                {journalTranscriptionFetch.error && (
                    <div>
                        {journalTranscriptionFetch.error.message}
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );

    if(journalFetch.isLoading || journalTranscriptionFetch.isLoading) return (
        <div className="container mx-auto p-4">
            <div className='mb-32'>
                Loading audio journal {journalName} for {subjectId} {studyId}.
                <Skeleton />
            </div>
        </div>
    );

    if(journalFetch.isSuccess) {

        const descriptionItems: DescriptionsProps['items'] = [
            {
                label: 'Journal Name',
                children: journalFetch.data.aj_name,
            },
            {
                label: 'Study ID',
                children: journalFetch.data.study_id,
            },
            {
                label: 'Journal Day',
                children: journalFetch.data.aj_day,
            },
            {
                label: 'Journal Session',
                children: journalFetch.data.aj_session,
            },
            {
                label: 'Journal DateTime',
                children: new Date(journalFetch.data.aj_datetime).toISOString().replace('T', ' ').substring(0, 19),
            },
            {
                label: 'Subject ID',
                children: (
                    <Link href={`/studies/${studyId}/subjects/${subjectId}`}>{subjectId}</Link>
                ),
            },
        ];

        return (
            <div className="container mx-auto p-4">
                <div className='mb-32'>
                    <Descriptions
                        title="Journal Info"
                        bordered
                        column={{xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2}}
                        size='small'
                        items={descriptionItems}
                    />
                    <div className="flex justify-center my-4">
                        <audio
                            src={`http://localhost:45000/payload=%5B${journalFetch.data.aj_path}%5D`}
                            controls
                            style={{width: '100%'}}
                            onError={() => {
                                toast.error("Failed to load audio file. The file may be missing or the media server is not running.");
                            }}
                            onTimeUpdate={(e) => {
                                const audio = e.target as HTMLAudioElement;
                                setCurrentAudioTime(audio.currentTime);
                            }}
                        />
                    </div>
                    <p className={"typeset typeset-title-lg mt-3"}>
                        <strong>Further Information</strong>
                    </p>

                    <Box>
                        <Tabs aria-label="Basic tabs" defaultValue={"transcript"} className={"mt-3"}>
                            <TabsList>
                                <TabsTrigger value={"transcript"}>📄 Transcript</TabsTrigger>
                                <TabsTrigger value={"pipeline"}>🔊 Transcription Pipeline</TabsTrigger>
                            </TabsList>
                            <TabsContent value={"transcript"}>
                                <Transcript
                                    identifier={journalName}
                                    identifier_type='audio_journal'
                                    subject_id={subjectId}
                                    study_id={studyId}
                                    currentAudioTime={currentAudioTime}
                                    updateAudioTime={updateAudioTime}
                                />
                            </TabsContent>
                            <TabsContent value={"pipeline"}>
                                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3 mb-2"}>
                                    <strong>Transcription Pipeline</strong>
                                </p>
                                {journalTranscriptionFetch.isSuccess ? (
                                    <TranscriptionPipelineStatus
                                        status={journalTranscriptionFetch.data}
                                    />
                                ) : (
                                    <TranscriptionPipelineStatusSkeleton/>
                                )}
                            </TabsContent>
                        </Tabs>
                    </Box>
                </div>
            </div>
        );
    }
}