import {ApiKeys} from "@/lib/api/v1";
import {queryOptions} from "@tanstack/react-query";
import {fetchInterviews} from "./api";
import {ListInterviewsOptions} from "./types";

const all = () => [...ApiKeys.all, 'interviews'] as const;
const lists = () => [...all(), 'list'] as const;

export function list(filters: ListInterviewsOptions) {
    return queryOptions({
        queryKey: [...lists(), filters] as const,
        queryFn: () => fetchInterviews(filters),
    });
}
