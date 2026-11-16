'use client'
import SubjectTimelineS from '@/components/domain/SubjectTimelineS';
import {use} from 'react';

interface PageProps {
    params: Promise<{
        study_id: string
        subject_id: string
    }>;
}

export default function Page({
                                 params: paramsPromise,
                             }: PageProps) {
    const {study_id, subject_id} = use(paramsPromise);

    return (
        <div className="container mx-auto p-6">
            <h4 className={"typography typography-h4"}>
                {subject_id}
            </h4>


            <div>
                <SubjectTimelineS
                    studyId={study_id}
                    subjectId={subject_id}
                />
            </div>
        </div>
    );
}