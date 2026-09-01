"use client"
import * as React from 'react';
import Link from 'next/link';

import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';

import Typography from '@mui/joy/Typography';
import Box from '@mui/material/Box';

import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';

import { DbAudioJournal } from '@/lib/types/audio_journals';
import Transcript from '@/components/domain/TranscriptE';
import TranscriptionPipelineStatus from '@/components/domain/TranscriptionPipelineStatus';

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
    const [study_id, setStudyId] = React.useState<string>('');
    const [subject_id, setSubjectId] = React.useState<string>('');
    const [journal_name, setJournalName] = React.useState<string>('');
    const [journalData, setJournalData] = React.useState<DbAudioJournal | null>(null);
    const [descriptionItems, setDescriptionItems] = React.useState<DescriptionsProps['items']>([]);
    const [currenntAudioTime, setCurrentAudioTime] = React.useState<number>(0);

    React.useEffect(() => {
        const fetchData = async () => {
            const { study_id, subject_id, journal_name } = await params;
            setStudyId(study_id);
            setSubjectId(subject_id);
            setJournalName(journal_name);

            const response = await fetch(`/api/v3/studies/${study_id}/subjects/${subject_id}/audioJournals/${journal_name}`);

            if (!response.ok) {
                console.error('Failed to fetch journal data');
                throw new Error('Failed to fetch journal data');
            }
            const data = await response.json();
            setJournalData(data);
        }
        fetchData();
    }, [study_id, subject_id, journal_name, params]);

    React.useEffect(() => {
        if (!journalData) return;

        const items: DescriptionsProps['items'] = [
            {
                label: 'Journal Name',
                children: journalData.aj_name,
            },
            {
                label: 'Study ID',
                children: journalData.study_id,
            },
            {
                label: 'Journal Day',
                children: journalData.aj_day,
            },
            {
                label: 'Journal Session',
                children: journalData.aj_session,
            },
            {
                label: 'Journal DateTime',
                children: new Date(journalData.aj_datetime).toISOString().replace('T', ' ').substring(0, 19),
            },
            {
                label: 'Subject ID',
                children: (
                    <Link href={`/studies/${journalData.study_id}/subjects/${journalData.subject_id}`}>
                        {journalData.subject_id}
                    </Link>
                ),
            },
        ];

        setDescriptionItems(items);
    }, [journalData]);


    function updateAudioTime(newTime: number) {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.currentTime = newTime;
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className='mb-32'>
                <Descriptions
                    title="Journal Info"
                    bordered
                    column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                    size='small'
                    items={descriptionItems}
                />

                {journalData && (
                    <div className="flex justify-center my-4">
                        <audio
                            src={`http://localhost:45000/payload=%5B${journalData.aj_path}%5D`}
                            controls
                            style={{ width: '100%' }}
                            onError={() => {
                                toast.error("Failed to load audio file. The file may be missing or the media server is not running.");
                            }}
                            onTimeUpdate={(e) => {
                                const audio = e.target as HTMLAudioElement;
                                setCurrentAudioTime(audio.currentTime);
                            }}
                        />
                    </div>
                )}

                <Typography level="title-lg" sx={{ mt: 3 }}>
                    <strong>Further Information</strong>
                </Typography>

                <Box>
                    <Tabs aria-label="Basic tabs" defaultValue={0} sx={{ mt: 3 }}>
                        <TabList>
                            <Tab>📄 Transcript</Tab>
                            <Tab>🔊 Transcription Pipeline</Tab>
                        </TabList>
                        <TabPanel value={0}>

                            <Transcript
                                identifier={journal_name}
                                identifier_type='audio_journal'
                                subject_id={subject_id}
                                study_id={study_id}
                                currentAudioTime={currenntAudioTime}
                                updateAudioTime={updateAudioTime}
                            />
                        </TabPanel>
                        <TabPanel value={1}>
                            <Typography level="title-lg" textColor="text.secondary" sx={{ mt: 3, mb: 2 }}>
                                <strong>Transcription Pipeline</strong>
                            </Typography>

                            <TranscriptionPipelineStatus
                                identifier={journal_name}
                                identifier_type='audio_journal'
                                study_id={study_id}
                                subject_id={subject_id}
                            />
                        </TabPanel>
                    </Tabs>
                </Box>
            </div>
        </div>
    );
}