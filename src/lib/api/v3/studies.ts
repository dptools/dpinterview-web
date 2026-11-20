import {fetcher} from "@/lib/api";
import {InterviewsKeys} from "@/lib/api/v1/interviews";
import {DbAudioJournal} from "@/lib/types/audio_journals";
import {TranscriptionPipelineStatus} from "@/lib/types/transcribeme";
import {QueryFunctionContext, queryOptions} from "@tanstack/react-query";
import {ApiError} from "next/dist/server/api-utils";

export const studyKeys = {
    all: ["studies"] as const,
    study: (id: string) => [...studyKeys.all, id] as const,
    studySubjects: (id: string) => [...studyKeys.study(id), "subjects"] as const,
    studySubject: (studyId: string, subjectId: string) => [...studyKeys.studySubjects(studyId), subjectId] as const,
    studySubjectAudioJournals: (studyId: string, subjectId: string) => [...studyKeys.studySubject(studyId, subjectId), "audioJournals"] as const,
    studySubjectAudioJournal: (studyId: string, subjectId: string, journalId: string) => [...studyKeys.studySubjectAudioJournals(studyId, subjectId), journalId] as const,
    studySubjectAudioJournalTranscript: (studyId: string, subjectId: string, journalId: string) => [...studyKeys.studySubjectAudioJournal(studyId, subjectId, journalId), "transcript"] as const,
    studySubjectAudioJournalTranscriptionStatus: (studyId: string, subjectId: string, journalId: string) => [...studyKeys.studySubjectAudioJournal(studyId, subjectId, journalId), "transcription-status"] as const,
};

async function fetchStudySubjectJournal({queryKey}: QueryFunctionContext<ReturnType<(typeof studyKeys)['studySubjectAudioJournal']>>){
    const [,studyId,,subjectId,,journalName] = queryKey;
    const url = `/api/v3/studies/${studyId}/subjects/${subjectId}/audioJournals/${journalName}`;
    return fetcher(DbAudioJournal,url);
}
async function fetchStudySubjectJournalStatus({queryKey}: QueryFunctionContext<ReturnType<(typeof studyKeys)['studySubjectAudioJournalTranscriptionStatus']>>){
    const [,studyId,,subjectId,,journalName] = queryKey;
    const url = `/api/v3/studies/${studyId}/subjects/${subjectId}/audioJournals/${journalName}/transcription-status`;
    return fetcher(TranscriptionPipelineStatus,url);
}

export const studyQueries = {
    studySubjectAudioJournal: (studyId: string, subjectId: string, journalId: string) => {
        return queryOptions({
            queryKey: studyKeys.studySubjectAudioJournal(studyId,subjectId,journalId),
            queryFn: fetchStudySubjectJournal
        })
    },
    studySubjectAudioJournalTranscriptionStatus: (studyId: string, subjectId: string, journalId: string)=> {
        return queryOptions({
            queryKey: studyKeys.studySubjectAudioJournalTranscriptionStatus(studyId,subjectId,journalId),
            queryFn: fetchStudySubjectJournalStatus,
        });
    }
}