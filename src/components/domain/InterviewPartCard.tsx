import {FolderCopy, Star} from '@mui/icons-material';
import List from '@mui/icons-material/List';

import {toast} from "sonner";

export interface InterviewPartCardProps {
    interview_path: string,
    interview_name: string,
    is_primary: boolean,
    is_duplicate: boolean,
    onChange?: (is_primary: boolean, is_duplicate: boolean) => void;
}

function updateInterviewPart(
    props: Omit<InterviewPartCardProps,"is_primary"|"is_duplicate">,
    is_primary: boolean,
    is_duplicate: boolean,
): Promise<void> {
    const interview_path = props.interview_path;

    const body: Record<string, any> = {};
    body.interview_path = interview_path;
    body.interview_name = props.interview_name;

    console.log('Updating interview part:', interview_path, JSON.stringify(body));

    return fetch(`/api/v1/interview-parts`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                // console.error(response);
                throw new Error('Failed to update interview part');
            }
            return response.json();
        })
        .then(() => {
            // Update the UI
            if (props.onChange) {
                props.onChange(is_primary, is_duplicate);
            }
            // props.setShowBackDrop?.(false);
        })
}

export default function InterviewPartCard({
                                              is_primary = false,
                                              is_duplicate = false,
                                              ...props
                                          }: InterviewPartCardProps) {

    if (!props.interview_path) {
        return null;
    }
    const interview_part_name = props.interview_path.split('/').pop();

    return (
        <div className="border border-gray-800 rounded p-4">
            <div className="flex items-center mb-3">
                <List className="mr-2 text-gray-600"/>
                <p className="font-medium">{interview_part_name}</p>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span
                        className={`text-sm ${is_primary ? 'text-green-600 font-medium' : 'text-gray-600'} flex items-center`}>
                        <Star className={`mr-1 text-sm ${is_primary ? 'text-green-600' : 'text-gray-400'}`}
                              fontSize="small"/>
                        {is_primary ? 'Primary' : 'Not Primary'}
                    </span>
                    <button
                        className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        onClick={() => {
                            // props.setShowBackDrop?.(true);
                            const promise = updateInterviewPart(props, !is_primary, is_duplicate);
                            toast.promise(promise, {
                                loading: is_primary ? 'Removing primary mark...' : 'Marking as primary...',
                                success: is_primary ? 'Removed as Primary' : 'Marked as Primary',
                                error: is_primary ? 'Failed to remove as Primary' : 'Failed to mark as Primary',
                            });
                        }}
                    >
                        {is_primary ? 'Unmark as Primary' : 'Mark Primary'}
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <span
                        className={`text-sm ${is_duplicate ? 'text-amber-600 font-medium' : 'text-gray-600'} flex items-center`}>
                        <FolderCopy className={`mr-1 text-sm ${is_duplicate ? 'text-amber-600' : 'text-gray-400'}`}
                                    fontSize="small"/>
                        {is_duplicate ? 'Duplicate' : 'Not Duplicate'}
                    </span>
                    <button
                        className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        onClick={() => {
                            // props.setShowBackDrop?.(true);
                            const promise = updateInterviewPart(props, is_primary, !is_duplicate);
                            toast.promise(promise, {
                                loading: is_duplicate ? 'Removing duplicate mark...' : 'Marking as duplicate...',
                                success: is_duplicate ? 'Duplicate mark removed' : 'Marked as duplicate',
                                error: is_duplicate ? 'Failed to remove duplicate mark' : 'Failed to mark as duplicate',
                            });
                        }}
                    >
                        {is_duplicate ? 'Unmark as Duplicate' : 'Mark Duplicate'}
                    </button>
                </div>
            </div>
        </div>
    );
}