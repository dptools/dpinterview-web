import { useEffect, useState, useRef } from 'react';

import { Skeleton } from '@mui/material';
import { ExpandLess } from '@mui/icons-material';

import { Empty } from 'antd';

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { toast } from "sonner";

export type InterviewTranscriptProps = {
    identifier: string;
    identifier_type: string;
    study_id?: string;
    subject_id?: string;
    currentAudioTime?: number;
    updateAudioTime?: (time: number) => void;
}

type ParsedLine = {
    speaker: string | null;
    time_str: string | null;
    start_time_s: number | null;
    end_time_s: number | null;
    text: string;
    highlight?: boolean;
    tags?: string[];
}

export default function Transcript(props: InterviewTranscriptProps) {
    const { identifier, identifier_type, study_id, subject_id, updateAudioTime } = props;
    const [transcriptData, setTranscriptData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [parsedData, setParsedData] = useState<ParsedLine[]>([]);
    const [enableAutoScroll, setEnableAutoScroll] = useState(false);
    const [activeLinePercentComplete, setActiveLinePercentComplete] = useState<number>(100);

    useEffect(() => {
        const fetchInterviewData = async (interviewName: any) => {
            // const response = await fetch(`http://localhost:45000/payload=[/mnt/ProNET/Lochness/PHOENIX/PROTECTED/PronetYA/processed/YA03473/interviews/open/transcripts/PronetYA_YA03473_interviewAudioTranscript_open_day0015_session001.txt]`);
            const response = await fetch(`/api/v2/interviews/${interviewName}/transcript`);
            if (!response.ok) {
                // Check for 404
                if (response.status === 404) {
                    toast.message('Uh oh! Transcript file not found.', {
                        description: 'Transcript file not found.',
                    })
                    setMissing(true);
                } else {
                    toast.message('Uh oh! Something went wrong.', {
                        description: 'Request for interview processing data failed.',
                    })
                    throw new Error('Network response was not ok');
                }
                setLoading(false);
                return;
            }

            // Parse / Read as text
            const text = await response.text();
            setTranscriptData(text);
            setLoading(false);
        };

        const fetchAudioJournalData = async (studyId: string, subjectId: string, journalName: any) => {
            const response = await fetch(`/api/v3/studies/${studyId}/subjects/${subjectId}/audioJournals/${journalName}/transcript`);
            if (!response.ok) {
                // Check for 404
                if (response.status === 404) {
                    toast.message('Uh oh! Transcript file not found.', {
                        description: 'Transcript file not found.',
                    })
                    setMissing(true);
                } else {
                    toast.message('Uh oh! Something went wrong.', {
                        description: 'Request for interview processing data failed.',
                    })
                    throw new Error('Network response was not ok');
                }
                setLoading(false);
                return;
            }
            // Parse / Read as text
            const text = await response.text();
            setTranscriptData(text);
            setLoading(false);
        };

        if (!identifier) {
            return;
        }
        if (identifier_type === 'interview') {
            fetchInterviewData(identifier);
        }
        else if (identifier_type === 'audio_journal') {
            if (!study_id || !subject_id) {
                toast.message('Uh oh! Missing study_id or subject_id.')
                return;
            }
            fetchAudioJournalData(study_id, subject_id, identifier);
        }
        else {
            toast.message('Uh oh! Invalid identifier_type.')
            return;
        }
    }, [identifier, identifier_type, study_id, subject_id]);

    useEffect(() => {
        // Highlight only the most recent parsed line, if currentAudioTime is within the time range of the line
        if (parsedData.length > 0 && props.currentAudioTime) {
            const currentTime = props.currentAudioTime;
            let lastHighlightedIndex = -1;

            setParsedData((prevParsedData) =>
                prevParsedData.map((line, index) => {
                    if (line.start_time_s !== null && line.start_time_s <= currentTime) {
                        lastHighlightedIndex = index;
                    }
                    return {
                        ...line,
                        highlight: false, // Reset all highlights
                    };
                }).map((line, index) => {
                    if (index === lastHighlightedIndex) {
                        if (line.end_time_s !== null && line.start_time_s != null) {
                            const percentComplete = ((currentTime - line.start_time_s) / (line.end_time_s! - line.start_time_s!)) * 100;
                            setActiveLinePercentComplete(percentComplete);
                        } else {
                            setActiveLinePercentComplete(100);
                        }
                        return {
                            ...line,
                            highlight: true, // Highlight only the most recent line
                        };
                    }
                    return line;
                })
            );
        }
    }, [parsedData.length, props.currentAudioTime]);


    useEffect(() => {
        if (transcriptData) {
            // Sample Data
            // S1: 00:00:00.638 It's been a good week so far.
            //
            // S1: 00:00:03.088 Um, I am kind of on break, I guess you can say.
            //
            // S1: 00:00:09.564 Um, what else?
            //
            // S1 00:00:03.259 Ooh, okay.
            //
            // S2 00:00:04.676 Sweet. Awesome. Uh, so yeah. So just wanted to thank you again for taking the time to talk, um, with me, and in general, for being a part of this study. It means a lot to us. Um, so like I mentioned, this is going to be recorded, um, and this interview is just going to be to get to know you and learn what your life, uh, is like. So, um, how have things been going for you?
            // 
            // S1 00:00:28.819 Uh, things have been going good.
            //
            // S2 00:00:32.552 Yeah. In what ways have they been going good? 

            const lines: string[] = transcriptData.split('\n');
            // Remove empty lines
            const nonEmptyLines = lines.filter(line => line.trim() !== '');

            // parse into time, speaker, text
            const parsedLines: ParsedLine[] = nonEmptyLines.map((line) => {
                const match = line.match(/^(S\d+):?\s*([\d:.]+)\s+(.*)/);
                if (match) {
                    const speaker = match[1];
                    const time_str = match[2];
                    const text = match[3];

                    // Convert time string to seconds
                    const timeParts = time_str.split(':');
                    let time = 0;
                    if (timeParts.length === 3) {
                        time += parseInt(timeParts[0], 10) * 3600; // hours
                        time += parseInt(timeParts[1], 10) * 60; // minutes
                        time += parseFloat(timeParts[2]); // seconds
                    } else if (timeParts.length === 2) {
                        time += parseInt(timeParts[0], 10) * 60; // minutes
                        time += parseFloat(timeParts[1]); // seconds
                    } else if (timeParts.length === 1) {
                        time += parseFloat(timeParts[0]); // seconds
                    }

                    const tagsSet: Set<string> = new Set();
                    // Check in string for text within '[]' for tags
                    const tags = text.match(/\[(.*?)\]/g);
                    if (tags) {
                        tags.forEach((tag) => {
                            const cleanTag = tag.replace(/\[|\]/g, '').trim(); // Remove brackets

                            const knownTags = ['inaudible', 'laughter', 'crosstalk'];

                            if (!knownTags.includes(cleanTag)) {
                                tagsSet.add("uncertain");
                            } else {
                                tagsSet.add(cleanTag);
                            }
                        });
                    }
                    // Check if text in '{}' for redacted text
                    const redactedText = text.match(/\{(.*?)\}/g);
                    if (redactedText) {
                        tagsSet.add('redacted');
                    }
                    const tagsList = Array.from(tagsSet);

                    return { speaker, time_str, start_time_s: time, text, tags: tagsList, end_time_s: null };
                }
                return {
                    speaker: null,
                    time_str: null,
                    start_time_s: null,
                    text: line,
                    end_time_s: null,
                }
            }
            );

            // Set end_time_s as start_time_s of next line
            parsedLines.forEach((line, index) => {
                if (index < parsedLines.length - 1) {
                    line.end_time_s = parsedLines[index + 1].start_time_s;
                } else {
                    line.end_time_s = null; // Last line has no end time
                }
            });

            setParsedData(parsedLines);
        }
    }, [transcriptData]);

    useEffect(() => {
        if (!enableAutoScroll) return;
        const container = scrollRef.current;
        if (!container) return;

        // Ensure the container has overflow set to auto or scroll
        // container.style.overflow = 'auto';

        const highlightedElement = container.querySelector('.active-line');
        if (highlightedElement) {
            // Scroll only the container without affecting the parent
            if (highlightedElement) {
                container.scrollTo({
                    top: highlightedElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - container.clientHeight / 2 + highlightedElement.clientHeight / 2,
                    behavior: 'smooth',
                });
            }
        }
    }, [parsedData, enableAutoScroll])

    return (
        <div>
            {missing ? (
                <div className='m-32'>
                    <Empty description="No Transcript File Found" />
                </div>
            ) : null}

            {!loading ? (
                <div className="p-4 max-w-full relative">
                    <div className="flex items-center space-x-2 justify-end mb-4">
                        <Switch
                            id="auto-scroll-toggle"
                            checked={enableAutoScroll}
                            onCheckedChange={(checked) => setEnableAutoScroll(checked)}
                        />
                        <Label htmlFor="auto-scroll-toggle">Enable Auto-Scroll</Label>
                    </div>
                    <div
                        ref={scrollRef}
                        className={`bg-gray-50 rounded-md shadow p-3 text-gray-800 space-y-2 ${enableAutoScroll ? 'overflow-y-auto' : ''}`}
                        style={enableAutoScroll ? { maxHeight: '400px' } : undefined}
                    >
                        {parsedData.map((line, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    if (line.start_time_s != null && updateAudioTime) {
                                        updateAudioTime(line.start_time_s)
                                    }
                                }}
                                className={`relative flex items-start space-x-2 p-2 rounded cursor-pointer transition-all ${line.highlight ? 'active-line bg-yellow-100 border-l-4 border-yellow-400 shadow-sm' : 'hover:bg-gray-100'}`}
                                style={{ fontFamily: 'monospace' }}
                            >
                                {line.highlight && (
                                    <div
                                        className="absolute top-0 left-0 h-full bg-yellow-200 opacity-50"
                                        style={{ width: `${activeLinePercentComplete}%`, zIndex: 0 }}
                                    />
                                )}
                                <div style={{ position: 'relative', zIndex: 1 }} className="flex items-start space-x-2 w-full">
                                    {line.speaker && (
                                        <span className="font-semibold text-gray-900">
                                            {line.speaker}:
                                        </span>
                                    )}
                                    <div className="flex-1 text-sm leading-tight">
                                        {line.time_str && (
                                            <span className="text-gray-500 block">
                                                [{line.time_str}]
                                            </span>
                                        )}
                                        <p className="text-gray-700">{line.text}</p>
                                        {line.tags && line.tags.length > 0 && (
                                            <div className="mt-1 flex flex-wrap space-x-2">
                                                {line.tags.map((tag, tagIdx) => (
                                                    <span
                                                        key={tagIdx}
                                                        className={`text-xs font-medium px-2 py-1 rounded ${tag === 'redacted'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {transcriptData && (
                        // Scroll to top button
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="fixed bottom-6 right-6 bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-all"
                            aria-label="Scroll to top"
                        >
                            <ExpandLess />
                        </button>
                    )}
                </div>
            ) : (
                <div className="p-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="mb-6">
                            <Skeleton variant="text" width="30%" height={28} className="mb-2" />

                            {Array(2 + Math.floor(Math.random() * 4)).fill(0).map((_, j) => (
                                <Skeleton
                                    key={j}
                                    variant="text"
                                    width={`${70 + Math.random() * 30}%`}
                                    height={24}
                                    className="my-1"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}