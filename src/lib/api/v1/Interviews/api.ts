import {ListInterviewsOptions} from "./types";
import {fetcher} from "@/lib/api";
import {InterviewsResponse} from "@/lib/types/api";

export async function fetchInterviews(filter: ListInterviewsOptions) {
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