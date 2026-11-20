import * as React from 'react';
import Link from 'next/link';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';


import { TimelineEvent } from '@/lib/types/timeline';

const EMPHASISED_TEXTS = [
    'Pending',
    'In Progress',
    'Completed',
]


export type MuiTimelineProps = {
    events: TimelineEvent[];
};

export default function MuiTimeline({events}: MuiTimelineProps) {
    if (!events || events.length === 0) {
        return (
            <span className={"typography typography-body-lg"}>
                No events to display
            </span>
        );
    }

    return (
        <Timeline>
            {events.map((event, index) => (
        <TimelineItem key={index}>
            {(event.altText || event.altDescription) && (
                <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    variant="body2"
                    color="text.secondary"
                >
                    {event.altText && (
                        <span className={"typography typography-body-md"}>
                            <strong>{event.altText}</strong>
                        </span>
                    )}
                    {event.altDescription && (
                        <p className={"typography"}>
                            {event.altDescription}
                        </p>
                    )}
                </TimelineOppositeContent>
            )}
            <TimelineSeparator>
                {index !== 0 && <TimelineConnector />}
                <TimelineDot color={event.iconColor ? event.iconColor : 'grey'}>
                    {event.href ? (
                        <Link
                            href={event.href}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {event.icon}
                        </Link>
                    ) : (
                        event.icon
                    )}
                </TimelineDot>
                {index !== events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
                <span className={"typography typography-body-md"}>
                    <strong>{event.title}</strong>
                </span>
                <p className={"typography"}>
                    {EMPHASISED_TEXTS.includes(event.description)
                        ? <em>{event.description}</em>
                        : event.description}
                </p>
            </TimelineContent>
        </TimelineItem>
    ))}
        </Timeline>);
}
