'use client'
import * as React from 'react';
// import { useEffect, useState } from 'react';

import Typography from '@mui/joy/Typography';
// import { GridColDef } from '@mui/x-data-grid';
// import Link from '@mui/material/Link';

// import MuiDataGrid, { MuiDataGridProps } from '@/components/mui/MuiDataGrid';
import SubjectTimelineS from '@/components/domain/SubjectTimelineS';


interface PageProps {
    params: Promise<{
        study_id: string
        subject_id: string
    }>;
}

export default function Page({
    params: paramsPromise,
}: PageProps) {
    const { study_id, subject_id } =  React.use(paramsPromise);

    return (
        <div className="container mx-auto p-6">
            <Typography level="h4">
                {subject_id}
            </Typography>


            <div>
                <SubjectTimelineS
                    studyId={study_id}
                    subjectId={subject_id}
                />
            </div>
        </div>
    );
}