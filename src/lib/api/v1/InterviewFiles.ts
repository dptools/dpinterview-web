import {ApiKeys} from "@/lib/api/v1/index";



const InterviewFilesKeys = {
    all: () => [...ApiKeys.all, 'interview-files'] as const,
    setIgnore: () => [...InterviewFilesKeys.all(), 'set-ignore'] as const,
}
