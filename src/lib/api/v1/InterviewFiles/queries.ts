import {ApiKeys} from "@/lib/api/v1";

export function all() {
    return [...ApiKeys.all, 'interview-files'] as const;
}

export function setIgnore(){
    return [...all(), 'set-ignore'] as const;
}
