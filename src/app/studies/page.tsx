import {Alert, AlertDescription} from '@/components/ui/alert';
import { Dashboard } from '@mui/icons-material';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function Page() {

    return (
        <div className="container mx-auto p-4">
        <div className={"p-[2rem] max-w[800px] m-auto"}>
            <Alert className={"mb-2 p-3 rounded-md"}>
                <Dashboard />
                <AlertDescription className={"typography typography-body-md"}>
                    Please use Superset Dashboard to look at the Aggregated Site data.
                </AlertDescription>
            </Alert>
        </div>
        </div>
    );
}