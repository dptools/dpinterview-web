import {InterviewPartUpdate} from "@/app/api/v1/interview-parts/route";
import {postJson} from "@/lib/api";
import {InterviewPart} from "@/lib/types/interview";
import {mutationOptions} from "@tanstack/react-query";
import {ApiError} from "next/dist/server/api-utils";

type update = Pick<InterviewPart, "interview_path" | "interview_name" | "is_duplicate" | "is_primary">;

const InterviewPartsKeys = {
    all: ["interview-parts"] as const,
    update: (param: update) => [...InterviewPartsKeys.all, param],
}

async function putInterviewParts(params: update) {
    const response = await postJson(`/api/v1/interview-parts`, await InterviewPartUpdate.encodeAsync(params));
    if(!response.ok){
        throw new ApiError(response.status,"");
    }

}

const mutations = {
    changeInterviewParts: mutationOptions({
        mutationKey: InterviewPartsKeys.update(params),
        mutationFn: () => putInterviewParts(params),
    }),
}

const mod = {
    mutations,
}

export default mod;