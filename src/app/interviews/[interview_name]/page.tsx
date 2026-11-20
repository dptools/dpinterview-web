"use client"
import FileInfoCard from '@/components/domain/FileInfoCard';
import InterviewPartCard, {InterviewPartCardProps} from '@/components/domain/InterviewPartCard';
import InterviewPdfReport from '@/components/domain/InterviewPdfReport';
import InterviewRunsheet from '@/components/domain/InterviewRunsheet';

import InterviewTimelineS from '@/components/domain/InterviewTimelineS';
import QcForm from '@/components/domain/QcForm';
import Transcript from '@/components/domain/TranscriptE';
import TranscriptionPipelineStatus from '@/components/domain/TranscriptionPipelineStatus';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import v2Interviews from "@/lib/api/v2/interviews";
import {DbFile} from "@/lib/types/file";

import {type Interview, Interview as ApiInterview, InterviewFile, InterviewPart} from '@/lib/types/interview';

import Box from '@mui/material/Box';

import {SimpleTreeView} from '@mui/x-tree-view/SimpleTreeView';
import {TreeItem} from '@mui/x-tree-view/TreeItem';
import {useQuery} from "@tanstack/react-query";

import {Descriptions, Empty, Typography as AntTypography} from 'antd';
import Link from 'next/link';
import * as React from 'react';
import {SyntheticEvent, use} from 'react';
import {z} from "zod";

const {Paragraph} = AntTypography;


function getInterviewPartInfo(interview_part_path: string, interview_data: Interview): InterviewPartCardProps | null {
    for (const part of interview_data.parts) {
        if (part.interview_path === interview_part_path) {
            part.interview_name = interview_data.interview_name;
            return part;
        }
    }
    return null;
}


function interviewPartOnChange(
    interview_part_path: string,
    interview: Interview,
    is_primary: boolean,
    is_duplicate: boolean,
    setInterview: (interview: Interview) => void
) {
    const updatedParts = interview.parts.map((part) => {
        if (part.interview_path === interview_part_path) {
            return {
                ...part,
                is_primary: is_primary,
                is_duplicate: is_duplicate,
            };
        }
        return part;
    });

    // console.log('Updated interview parts:', updatedParts);

    setInterview({
        ...interview,
        parts: updatedParts,
    });
}

function interviewFileOnTagsChange(
    interview_file_path: string,
    interview: Interview,
    tags: string[],
    setInterview: (interview: Interview) => void
) {
    const updatedFiles = interview.parts.map((part) => {
        part.interview_files.map((file) => {
            if (file.interview_file.file_path === interview_file_path) {
                file.interview_file_tags = tags;
            }
            return file;
        });
        return part;
    });

    const newInterview = {
        ...interview,
        parts: updatedFiles,
    };
    setInterview(newInterview);
    // console.log('Updated interview files:', newInterview);
}

function interviewFileOnIgnore(
    interview_file_path: string,
    interview: Interview,
    ignored: boolean,
    setInterview: (interview: Interview) => void
) {
    const updatedFiles = interview.parts.map((part) => {
        part.interview_files.map((file) => {
            if (file.interview_file.file_path === interview_file_path) {
                file.ignored = ignored;
            }
            return file;
        });
        return part;
    });

    const newInterview = {
        ...interview,
        parts: updatedFiles,
    };
    setInterview(newInterview);
}

const File = z.object({
    ...DbFile.shape,
    ...InterviewFile.omit({interview_file: true}).shape,
    relative_path: z.string(),
});

type File = z.infer<typeof File>;

const Files = z.record(z.string(), InterviewFile);


const Interview = z.object({
    ...ApiInterview.omit({"parts": true}).shape,
    parts: z.array(InterviewPart)
});

const ApiFiles = z.transform<Interview, Record<string, File>>((val: Interview, ctx) => {
    const result: Record<string, File> = {};

    for (const part of val.parts) {
        const interviewPathParts = part.interview_path.split('/');
        const partPath = interviewPathParts.slice(0, -1).join("/");
        for (const file of part.interview_files) {
            const relativePath = file.interview_file.file_path.replace(partPath, "");
            result[file.interview_file.file_path] = {
                ...file.interview_file,
                interview_file_tags: file.interview_file_tags,
                ignored: file.ignored,
                relative_path: relativePath === file.interview_file.file_path ? file.interview_file.file_name : relativePath
            }
        }
    }
    return result;
});


// ts-ignore
export default function Page({
                                 params,
                             }: {
    params: Promise<{ interview_name: string }>
}) {

    const {interview_name: interviewName} = use(params);
    const interviewInfoQuery = useQuery(v2Interviews.queries.interviewInfo(interviewName));
    const transcriptionStatus = useQuery(v2Interviews.queries.interviewTranscriptionStatus(interviewName));
    const [selectedPart, setSelectedPart] = React.useState(0);
    const [selectedItem, setSelectedItem] = React.useState(0);
    const [selectedItems, setSelectedItems] = React.useState<string | null>();
    const [selectedPartProps, setSelectedPartProps] = React.useState<InterviewPartCardProps | null>(
        null,
    );
    const [currentAudioTime, setCurrentAudioTime] = React.useState<number>(0);

    function handleItemSelectionToggle(event: SyntheticEvent<Element, Event> | null, itemId: string, isSelected: boolean) {
        if (isSelected) {
            setLastSelectedItem(itemId);
        }
    }

    if (interviewInfoQuery.isLoading || transcriptionStatus.isLoading) return (
        <div>
            <Skeleton/>
            <div className='mb-32'>
                <p className={"typeset typeset-title-md mb-3"}>
                    <strong>Interview Info</strong>
                </p>
                <Skeleton className={"h-[150px]"}/>

                <p className={"typeset typeset-title-lg mt-3"}>
                    <strong>Interview Parts</strong>
                </p>

                <div>
                    <Skeleton className={"text-[3rem]"}/>
                </div>

                <p className={"typeset typeset-title-lg mt-3"}>
                    <strong>Further Information</strong>
                </p>

                <Skeleton className={"height-[400px] mt-4"}/>
            </div>
        </div>
    );

    if (interviewInfoQuery.isError || transcriptionStatus.isError) return (
        <div>
            <Alert>
                <AlertTitle>Interview not found</AlertTitle>
                <AlertDescription>
                    {interviewInfoQuery.error && (
                        <p>{interviewInfoQuery.error.message}</p>
                    )}
                    {transcriptionStatus.error && (
                        <p>{transcriptionStatus.error.message}</p>
                    )}
                </AlertDescription>
            </Alert>
            <div className='m-32'>
                <Empty description="No interview data available"/>
            </div>
            <div className='mb-32'>
                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                    <strong>Run Sheet</strong>
                </p>
                <InterviewRunsheet interviewName={interviewName}/>
            </div>
        </div>
    )

    if (interviewInfoQuery.isSuccess && transcriptionStatus.isSuccess) {
        const interview = interviewInfoQuery.data;
        const interviewPart = interview.parts[selectedPart];

        function handleSelectItemChange(event: React.SyntheticEvent | null,
                                        id: string | null) {
            console.info("Selected item ", id);
            if (id?.startsWith("p_")) {
                for (const [idx, part] of interview.parts.entries()) {
                    if (part.interview_path === id.slice(2)) {
                        setSelectedPart(idx);
                    }
                }
            } else {
                for (const [idx, file] of interview.parts[selectedPart].interview_files.entries()) {
                    if (file.interview_file.file_name === id) {
                        if (selectedItem !== idx) {
                            setSelectedItem(idx);
                        }
                    }
                }
            }
            setSelectedItems(id);
        }

        const descriptionItems = [
            {
                label: 'Interview Name',
                children: <Paragraph
                    copyable={{text: interview.interview_name}}>{interview.interview_name ?? 'null'}</Paragraph>,
            },
            {
                label: 'Interview Type',
                children: interview.interview_type,
            },
            {
                label: 'Subject ID',
                children: (
                    <Link href={`/studies/${interview.study_id}/subjects/${interview.subject_id}`}>
                        {interview.subject_id}
                    </Link>
                ),
            },
            {
                label: 'Study ID',
                children: interview.study_id,
            },
            {
                label: '# Parts',
                children: interview.parts.length,
            },
            {
                label: '# Transcript Files',
                children: interview.transcript_files.length,
            }
        ];

        return (
            <div className="container mx-auto p-4">
                {/* <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={showBackDrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop> */}
                <div>
                    <h4 className={"typography typography-h4"}>
                        Interview Details
                    </h4>
                    <p className={"typography text-(--mui-palette-text-secondary) mb-2"}>{interviewName}</p>
                </div>
                <div className='mb-32'>
                    <Descriptions
                        title="Interview Info"
                        bordered
                        column={{xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2}}
                        size='small'
                        items={descriptionItems}
                    />

                    <p className={"typeset typeset-title-lg mt-3"}>
                        <strong>Interview Parts</strong>
                    </p>

                    <div className='m-4'>

                        <FileInfoCard {
                                          ...interviewPart.interview_files[selectedItem].interview_file
                                      }
                                      tags={interviewPart.interview_files[selectedItem].interview_file_tags}
                                      ignored={interviewPart.interview_files[selectedItem].ignored}
                                      interview_name={interview.interview_name}
                                      onTagsChange={(tags: string[]) => {

                                      }}
                                      onIgnoredChange={(ignored: boolean) => {

                                      }}
                                      currentAudioTime={currentAudioTime}
                                      setCurrentAudioTime={setCurrentAudioTime}
                        />


                        <InterviewPartCard
                            interview_path={interviewPart.interview_path}
                            interview_name={interviewPart.interview_name || interviewName}
                            is_primary={interviewPart.is_primary}
                            is_duplicate={interviewPart.is_duplicate}
                            onChange={(is_primary, is_duplicate) => {
                            }}
                        />
                    </div>
                    <div>
                        <h3>Interview Parts</h3>
                        <SimpleTreeView defaultSelectedItems={`p_${interview.parts[0].interview_name}_0`}
                                        selectedItems={selectedItems} onSelectedItemsChange={handleSelectItemChange}>
                            {interview.parts.map((part, index) => (

                                <TreeItem key={index} itemId={`p_${part.interview_name}_${index}`}
                                          label={`${part.interview_path.split("/").pop()}`}>
                                    {part.interview_files.map((file, fileIndex) => (
                                        <TreeItem key={fileIndex} itemId={file.interview_file.file_name}
                                                  label={file.interview_file.file_name}/>
                                    ))}
                                </TreeItem>
                            ))}
                        </SimpleTreeView>
                    </div>
                    <p className={"typeset typeset-title-lg mt-3"}>
                        <strong>Further Information</strong>
                    </p>

                    <Box
                        // sx={{ display: { xs: 'block', md: 'none' }}}
                    >
                        <Tabs aria-label="Basic tabs" defaultValue={"timeline"} className={"mt-3"}>
                            <TabsList>
                                <TabsTrigger value={"timeline"}>⏱️ Interview Timeline</TabsTrigger>
                                <TabsTrigger value={"runsSheet"}>📝 Run Sheet</TabsTrigger>
                                <TabsTrigger value={"issues"}>🚩 QC Issues</TabsTrigger>
                                <TabsTrigger value={"report"}>📄 PDF Report</TabsTrigger>
                                <TabsTrigger value={"transcript"}>📄 Transcript</TabsTrigger>
                                <TabsTrigger value={"pipeline"}>🔊 Transcription Pipeline</TabsTrigger>
                            </TabsList>
                            <TabsContent value={"timeline"}>
                                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                                    <strong>Interview Timeline</strong>
                                </p>

                                <InterviewTimelineS interviewName={interviewName}/>
                            </TabsContent>
                            <TabsContent value={"runsSheet"}>
                                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                                    <strong>Run Sheet</strong>
                                </p>

                                <InterviewRunsheet interviewName={interviewName}/>
                            </TabsContent>
                            <TabsContent value={"issues"}>
                                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                                    <strong>QC Issues</strong>
                                </p>

                                <QcForm interviewName={interviewName}/>
                            </TabsContent>
                            <TabsContent value={"report"}>
                                <InterviewPdfReport interviewName={interviewName}/>
                            </TabsContent>
                            <TabsContent value={"transcript"}>
                                <Transcript
                                    identifier={interviewName} identifier_type='interview'
                                    currentAudioTime={currentAudioTime}
                                    updateAudioTime={setCurrentAudioTime}
                                />
                            </TabsContent>
                            <TabsContent value={"pipeline"}>
                                <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3 mb-2 "}>
                                    <strong>Transcription Pipeline</strong>
                                </p>
                                <TranscriptionPipelineStatus status={transcriptionStatus.data}/>
                            </TabsContent>
                        </Tabs>
                    </Box>

                    {/* <Stack
                    direction="row"
                    spacing={2}
                    sx={{ width: '100%', display: { xs: 'none', md: 'flex' } }}
                >
                    <Box sx={{ width: '50%' }}>
                        <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                            <strong>Interview Timeline</strong>
                        </Typography>

                        <InterviewTimelineS interviewName={interview_name} />
                    </Box>
                    <Box sx={{ width: '50%' }}>
                        <p className={"typeset typeset-title-lg text-(--mui-palette-text-secondary) mt-3"}>
                            <strong>Run Sheet</strong>
                        </Typography>

                        <InterviewRunsheet interviewName={interview_name} />

                    </Box>
                </Stack> */}

                </div>
            </div>
        )
    }
}