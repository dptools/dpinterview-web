"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';

import { QuestionAnswer } from '@mui/icons-material';  // Open Interview
import { InterpreterMode } from '@mui/icons-material';  // PSYCHS Interview
import { Transcribe } from '@mui/icons-material';  // Audio Journal
import { Skeleton } from '@mui/material';

import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";

import { TimelineEvent, DataCollectionEvent } from '@/lib/types/timeline';

import MuiTimeline from '@/components/mui/MuiTimeline';


export type SubjectTimelineSProps = {
    subjectId: string;
    studyId: string;
};
export default function SubjectTimelineS(props: SubjectTimelineSProps) {
    const { subjectId, studyId } = props;
    const [processingData, setProcessingData] = useState<DataCollectionEvent[]>([]);
    const [subjectTimelineEvents, setsubjectTimelineEvents] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/v3/studies/${studyId}/subjects/${subjectId}/timeline`);
            if (!response.ok) {
                toast.message('Uh oh! Something went wrong.', {
                    description: 'Request for subject timeline data failed.',
                })
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProcessingData(data);
        };

        fetchData();
    }, [studyId, subjectId]);

    useEffect(() => {
        if (!processingData) {
            return;
        }

        const events: TimelineEvent[] = [];

        // Map the processing data to timeline events
        processingData.forEach((item: any) => {
            const eventDate = new Date(item.datetime);
            const eventDateString = eventDate.toLocaleDateString();
            let eventDateDistance = '';
            try {
                eventDateDistance = formatDistanceToNow(eventDate, { addSuffix: true });
            } catch (error) {
                console.error('Error formatting date:', item, error);
                eventDateDistance = '';
            }

            let event: TimelineEvent;

            if (item.type === 'psychs_interview') {
                event = {
                    title: item.identifier,
                    description: 'PSYCHS Interview',
                    icon: <InterpreterMode />,
                    iconColor: 'info',
                    altText: eventDateString,
                    altDescription: eventDateDistance,
                    href: `/interviews/${item.identifier}`,
                };
            } else if (item.type === 'open_interview') {
                event = {
                    title: item.identifier,
                    description: 'Open Interview',
                    icon: <QuestionAnswer />,
                    iconColor: 'success',
                    altText: eventDateString,
                    altDescription: eventDateDistance,
                    href: `/interviews/${item.identifier}`,
                };
            } else if (item.type === 'audio_journal') {
                event = {
                    title: item.identifier,
                    description: 'Audio Journal',
                    icon: <Transcribe />,
                    iconColor: 'secondary',
                    altText: eventDateString,
                    altDescription: eventDateDistance,
                    href: `/studies/${studyId}/subjects/${subjectId}/journals/${item.identifier}`,
                };
            } else {
                console.warn('Unknown event type:', item.type);
                event = {
                    title: 'Unknown Event',
                    description: item.identifier,
                    icon: <Transcribe />,
                    iconColor: 'error',
                    altText: eventDateString,
                    altDescription: eventDateDistance,
                };
            }

            events.push(event);
        });
        

        setsubjectTimelineEvents(events);
    }, [processingData, studyId, subjectId]);


    return (
        <div className="mt-4">
            {processingData ? (
                <MuiTimeline
                    events={subjectTimelineEvents}
                />
            ) : (
                <Skeleton variant="rectangular" height={500} sx={{ mt: 2 }} />
            )}
        </div>
    );
}

