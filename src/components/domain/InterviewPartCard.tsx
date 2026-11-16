
import List from '@mui/icons-material/List';

import { Star } from '@mui/icons-material';
import { FolderCopy } from '@mui/icons-material';

import { toast } from "sonner";

export type updateInterviewPartCardProps = {
    interview_path: string;
    interview_name: string;
    is_primary: boolean;
    is_duplicate: boolean;
    onChange?: (is_primary: boolean, is_duplicate: boolean) => void;
};

updateInterviewPartCard.defaultProps = {
    is_primary: false,
    is_duplicate: false,
};

function updateInterviewPart(
    props: updateInterviewPartCardProps,
    is_primary?: boolean,
    is_duplicate?: boolean,
): Promise<void> {
    const interview_path = props.interview_path;

    const body: Record<string, any> = {};
    body.interview_path = interview_path;
    body.interview_name = props.interview_name;
    if (is_primary !== undefined) {
        body.is_primary = is_primary;
    }
    if (is_duplicate !== undefined) {
        body.is_duplicate = is_duplicate;
    }

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
                props.onChange(is_primary ?? props.is_primary, is_duplicate ?? props.is_duplicate);
            }
            // props.setShowBackDrop?.(false);
        })
}

export default function updateInterviewPartCard(props: updateInterviewPartCardProps) {

    if (!props.interview_path) {
        return null;
    }
    const interview_part_name = props.interview_path.split('/').pop();

    return (
        <div className="border border-gray-800 rounded p-4">
            <div className="flex items-center mb-3">
                <List className="mr-2 text-gray-600" />
                <p className="font-medium">{interview_part_name}</p>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${props.is_primary ? 'text-green-600 font-medium' : 'text-gray-600'} flex items-center`}>
                        <Star className={`mr-1 text-sm ${props.is_primary ? 'text-green-600' : 'text-gray-400'}`} fontSize="small" />
                        {props.is_primary ? 'Primary' : 'Not Primary'}
                    </span>
                    <button
                        className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        onClick={() => {
                            // props.setShowBackDrop?.(true);
                            const promise = updateInterviewPart(props, !props.is_primary);
                            toast.promise(promise, {
                                loading: props.is_primary ? 'Removing primary mark...' : 'Marking as primary...',
                                success: props.is_primary ? 'Removed as Primary' : 'Marked as Primary',
                                error: props.is_primary ? 'Failed to remove as Primary' : 'Failed to mark as Primary',
                            });
                        }}
                    >
                        {props.is_primary ? 'Unmark as Primary' : 'Mark Primary'}
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${props.is_duplicate ? 'text-amber-600 font-medium' : 'text-gray-600'} flex items-center`}>
                        <FolderCopy className={`mr-1 text-sm ${props.is_duplicate ? 'text-amber-600' : 'text-gray-400'}`} fontSize="small" />
                        {props.is_duplicate ? 'Duplicate' : 'Not Duplicate'}
                    </span>
                    <button
                        className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        onClick={() => {
                            // props.setShowBackDrop?.(true);
                            const promise = updateInterviewPart(props, undefined, !props.is_duplicate);
                            toast.promise(promise, {
                                loading: props.is_duplicate ? 'Removing duplicate mark...' : 'Marking as duplicate...',
                                success: props.is_duplicate ? 'Duplicate mark removed' : 'Marked as duplicate',
                                error: props.is_duplicate ? 'Failed to remove duplicate mark' : 'Failed to mark as duplicate',
                            });
                        }}
                    >
                        {props.is_duplicate ? 'Unmark as Duplicate' : 'Mark Duplicate'}
                    </button>
                </div>
            </div>
        </div>
    );
}