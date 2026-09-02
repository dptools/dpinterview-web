import { useEffect, useState } from 'react';

import { Skeleton } from '@mui/material';
import { ExpandLess } from '@mui/icons-material';

import { Empty } from 'antd';

import { toast } from "sonner";

export type InterviewTranscriptProps = {
    identifier: string;
    identifier_type: string;
    study_id?: string;
    subject_id?: string;
}

export default function Transcript(props: InterviewTranscriptProps) {
    const { identifier, identifier_type, study_id, subject_id } = props;
    const [transcriptData, setTranscriptData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

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
        if (transcriptData) {
            // Sample Data
            // S1: 00:00:00.638 It's been a good week so far.
            //
            // S1: 00:00:03.088 Um, I am kind of on break, I guess you can say.
            //
            // S1: 00:00:09.564 Um, what else?
            //
            // S1: 00:00:12.641 I have-- my brother and my sister-in-law are coming to my dad's house tomorrow, so I'm actually in the middle of cleaning.

            // S1: 00:00:00.696 Recording in progress.

            // S2: 00:00:03.093 Okay.

            // S3: 00:00:06.676 Okay. Um, so first, I'd like to thank you for taking the time to talk with me. Um, like I mentioned, our conversation will be recorded for analysis. Um, in this part, I would r-- like to get to know you and learn what your life is like. Um, so how have things been going for you lately?

            // S2: 00:00:25.342 Okay, I would say.

            const lines: string[] = transcriptData.split('\n');
            // Remove empty lines
            const nonEmptyLines = lines.filter(line => line.trim() !== '');

            // parse into time, speaker, text
            const parsedLines = nonEmptyLines.map((line) => {
                const match = line.match(/^(S\d+):\s*([\d:.]+)\s+(.*)/);
                if (match) {
                    const speaker = match[1];
                    const time = match[2];
                    const text = match[3];
                    return { speaker, time, text };
                }
                return {
                    speaker: null,
                    time: null,
                    text: line,
                }
            }
            );

            console.log('Parsed Lines:', parsedLines);
        }
    }, [transcriptData]);

    return (
        <div>
            {missing ? (
                <div className='m-32'>
                    <Empty description="No Transcript File Found" />
                </div>
            ) : null}

            {!loading ? (
                <div className="p-4 max-w-full relative">
                    <div className="bg-white rounded-lg shadow-sm p-6 font-light text-gray-800 leading-relaxed">
                        <pre className="whitespace-pre-wrap break-words text-base">{transcriptData}</pre>
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