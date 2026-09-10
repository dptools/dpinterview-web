import * as React from 'react';

import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Home() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-slate-50 rounded-lg shadow-lg p-8 border-l-4 border-indigo-500">
                <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    👋 Welcome to AV QC Portal
                </Typography>

                <Typography level="body-lg" sx={{ mb: 3 }}>
                    This web portal is actively being developed as a companion to the
                    <Link href="https://github.com/dptools/dpinterview" sx={{ mx: 1, fontWeight: 'medium' }}>
                        AV QC pipeline
                    </Link>
                    project, designed to streamline audiovisual quality control processes.
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <Link href="/issues" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                🔍 Quality Control
                            </Typography>
                            <Typography level="body-md">
                                Monitor and manage quality issues in your audio/video recordings with more intuitive interfaces.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="http://localhost:8088" underline="none" color="inherit" target="_blank">
                        <div className="border border-l-4 border-l-teal-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-teal-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📊 Real-time Monitoring
                            </Typography>
                            <Typography level="body-md">
                                Track performance metrics and health indicators of your audio/video processing systems in real time. [Superset]
                            </Typography>
                        </div>
                    </Link>
                </div>

                <Typography level="body-md" sx={{ mt: 4 }}>
                    This project is under active development. Check back for updates or contribute on <Link href="https://github.com/dheshanm/dpinterview-web" target="_blank" sx={{ fontWeight: 'medium' }}>GitHub</Link>.
                </Typography>
            </div>
        </div>
    );
}
