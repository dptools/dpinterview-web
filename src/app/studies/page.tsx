import Alert from '@mui/joy/Alert';
import { Dashboard } from '@mui/icons-material';

import Typography from '@mui/joy/Typography';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function Page() {

    return (
        <div className="container mx-auto p-4">
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Alert
                variant="soft"
                color="neutral"
                startDecorator={<Dashboard />}
                sx={{
                    mb: 2,
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4
                }}
            >
                <Typography level="body-md">
                    Please use Superset Dashboard to look at the Aggregated Site data.
                </Typography>
            </Alert>
        </div>
        </div>
    );
}