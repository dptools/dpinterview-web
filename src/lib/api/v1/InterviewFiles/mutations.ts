import {postSetIgnore} from "@/lib/api/v1/InterviewFiles/api";
import {SetIgnore} from "@/lib/api/v1/InterviewFiles/types";
import {interviewsKeys} from "@/lib/api/v2/interviews";
import {mutationOptions} from "@tanstack/react-query";


export function all() {
    return ["interview-files"] as const;
}

export function setIgnores() {
    return [...all(), "set-ignore"] as const;
}


export function setIgnore() {
    return mutationOptions({
        mutationKey: [...setIgnores()],
        mutationFn: (props : SetIgnore) => postSetIgnore(props),
    })
}