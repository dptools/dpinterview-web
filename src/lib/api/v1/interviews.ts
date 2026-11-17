import {fetcher} from "@/lib/api";
import {ApiKeys} from "@/lib/api/v1";
import {InterviewsResponse} from "@/lib/types/api";
import {QueryFunctionContext, queryOptions} from "@tanstack/react-query";
import {z} from "zod";


const PaginationOptions = z.object({
    limit: z.number().positive().optional(),
    offset: z.number().gte(0).optional(),
})

const ListFilterOptions = z.object({
    study_id: z.string().optional(),
    subject_id: z.string().optional(),
    type: z.string().optional(),
});

const ListInterviewsOptions = z.object({
    ...ListFilterOptions.shape,
    ...PaginationOptions.shape,
});

type ListInterviewsOptions = z.infer<typeof ListInterviewsOptions>;

const ProcessingFilters = z.object({});
type ProcessingFilters = z.infer<typeof ProcessingFilters>;

export const InterviewsKeys = {
    all: () => [...ApiKeys.all, 'interviews'] as const,
    lists: () => [...InterviewsKeys.all(), 'list'] as const,
    list: (filters: ListInterviewsOptions) => [...InterviewsKeys.lists(), filters] as const,
    processings: () => [...InterviewsKeys.all(), "processing"] as const,
    processing: (filters: ProcessingFilters) => [...InterviewsKeys.processings(), filters] as const,
}


async function fetchInterviews({queryKey}: QueryFunctionContext<ReturnType<(typeof InterviewsKeys)['list']>>) {
    const filter = queryKey[3];
    const searchParams = new URLSearchParams();
    if (filter.study_id) {
        searchParams.set("study_id", filter.study_id);
    }
    if (filter.subject_id) {
        searchParams.set("subject_id", filter.subject_id);
    }
    if (filter.type) {
        searchParams.set("type", filter.type);
    }
    if (filter.limit) {
        searchParams.set("limit", filter.limit.toString(10));
    }
    if (filter.offset) {
        searchParams.set("offset", filter.offset.toString(10));
    }
    return fetcher(InterviewsResponse, `/api/v1/interviews/list?${searchParams}`);
}

const interviewsQueries = {
    list: (filters: ListInterviewsOptions) => {
        return queryOptions({
            queryKey: InterviewsKeys.list(filters),
            queryFn: fetchInterviews,
        });
    },
}

export default interviewsQueries;
