import {AudioTagClearResponse} from "@/app/api/v2/interviews/[interview_name]/audio/clearRole/route";
import {fetcher} from "@/lib/api";
import {AudioTagClearRequest} from "@/lib/types/api";
import {Interview} from "@/lib/types/interview";
import {TranscriptionPipelineStatus} from "@/lib/types/transcribeme";
import {mutationOptions, QueryFunctionContext, queryOptions} from "@tanstack/react-query";
import {ApiError} from "next/dist/server/api-utils";


export const interviewsKeys = {
    all: ["interviews"] as const,
    interview: (id: string) => [...interviewsKeys.all, id] as const,
    interviewTranscriptionStatus: (id: string) => [...interviewsKeys.interview(id), "transcription-status"] as const,
    interviewInfo: (id: string) => [...interviewsKeys.interview(id), "info"] as const,
    interviewAudio: (id: string) => [...interviewsKeys.interview(id), "audio"] as const,
    interviewAudioClearRole: (id: string) => [...interviewsKeys.interviewAudio(id), "clearRole"] as const,
};

async function fetchInterviewInfo({queryKey}: QueryFunctionContext<ReturnType<(typeof interviewsKeys)['interviewInfo']>>) {
    const [, interviewId,] = queryKey;
    const url = `/api/v2/interviews/${interviewId}/info`;
    return fetcher(Interview, url);
}

async function fetchInterviewTranscriptionStatus({queryKey}: QueryFunctionContext<ReturnType<(typeof interviewsKeys)['interviewTranscriptionStatus']>>) {
    const [, interviewId,] = queryKey;
    const url = `/api/v2/interviews/${interviewId}/transcription-status`;
    return fetcher(TranscriptionPipelineStatus, url);
}

async function putInterviewAudioUpdateRole(interviewName: string, part: string) {

    const reqBody = AudioTagClearRequest.encode({
        audio_path: part,
    });

    const result = await fetch(`/api/v2/interviews/${interviewName}/audio/[part]/updateRole`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!result.ok) {
        const x = await result.json()
        throw new ApiError(result.status, x);
    }
}

async function putInterviewAudioClearRole(interviewName: string, part: string) : Promise<void> {

    const result = await fetch(`/api/v2/interviews/${interviewName}/audio/[part]/clearRole`, {
        method: 'POST',
        body: JSON.stringify(AudioTagClearRequest.encode({
            audio_path: part,
        })),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!result.ok) {
        if (result.status === 404) {
            new ApiError(404, "not found");
        }
        throw new ApiError(result.status, "An error occurred");
    }
    //await AudioTagClearResponse.decodeAsync(await result.json());
}

export const interviewsQueries = {
    interviewTranscriptionStatus: (id: string) => queryOptions({
        queryKey: interviewsKeys.interviewTranscriptionStatus(id),
        queryFn: fetchInterviewTranscriptionStatus,
    }),
    interviewInfo: (id: string) => queryOptions({
        queryKey: interviewsKeys.interviewInfo(id),
        queryFn: fetchInterviewInfo,
    }),
};

export const interviewMutations = {
    interviewClearAudioRole: (interviewName: string, part: string) => mutationOptions({
        mutationFn: () => putInterviewAudioClearRole(interviewName,part),
        mutationKey: interviewsKeys.interviewAudioClearRole(interviewName),
        onMutate: (variables, context) => {
            console.log("Clearing roles ",variables);
        },
        onSuccess: (data, variables, onMutateResult, context) => {
            console.log("Happu")
        },
        meta: {
            invalidates: [[interviewsKeys.interview(interviewName)]]
        }
    }),
}

const mod = {
    queries: interviewsQueries,
    mutations: interviewMutations,
    keys: interviewsKeys,
}

export default mod;