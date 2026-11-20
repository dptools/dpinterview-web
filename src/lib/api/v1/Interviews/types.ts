import {z} from "zod";

// const ProcessingFilters = z.object({});
// export type ProcessingFilters = z.infer<typeof ProcessingFilters>;

const PaginationOptions = z.object({
    limit: z.number().positive().optional(),
    offset: z.number().gte(0).optional(),
})

const ListFilterOptions = z.object({
    study_id: z.string().optional(),
    subject_id: z.string().optional(),
    type: z.string().optional(),
});

export const ListInterviewsOptions = z.object({
    ...ListFilterOptions.shape,
    ...PaginationOptions.shape,
});

export type ListInterviewsOptions = z.infer<typeof ListInterviewsOptions>;
