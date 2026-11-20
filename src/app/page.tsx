import * as React from 'react';

import Link from '@mui/material/Link';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Home() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-slate-50 rounded-lg shadow-lg p-8 border-l-4 border-indigo-500">
                <h2 className={"typeset typeset-joy-heading mb-4 font-bold text-(--mui-palette-primary-main)"}>
                    👋 Welcome to AV QC Portal
                </h2>

                <p className={"typeset typeset-body-lg mb-3"}>
                    This web portal is actively being developed as a companion to the
                    <Link href="https://github.com/dptools/dpinterview" className={"mx-1 font-medium"}>
                        AV QC pipeline
                    </Link>
                    project, designed to streamline audiovisual quality control processes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <Link href="/issues" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <h4 className={"typeset typeset-joy-heading mb-2 text-(--mui-palette-text-secondary)"}>
                                🔍 Quality Control
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Monitor and manage quality issues in your audio/video recordings with more intuitive interfaces.
                            </p>
                        </div>
                    </Link>
                    <Link href="http://localhost:8088" underline="none" color="inherit" target="_blank">
                        <div className="border border-l-4 border-l-teal-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-teal-50/30">
                            <h4 className={"typeset typeset-joy-heading mb-2  text-(--mui-palette-text-secondary)"}>
                                📊 Real-time Monitoring
                            </h4>
                            <p className={"typeset typeset-body-md body-md"}>
                                Track performance metrics and health indicators of your audio/video processing systems in real time. [Superset]
                            </p>
                        </div>
                    </Link>
                </div>

                <p className={"typeset typeset-body-md mt-4"}>
                    This project is under active development. Check back for updates or contribute on <Link href="https://github.com/dheshanm/dpinterview-web" target="_blank" sx={{ fontWeight: 'medium' }}>GitHub</Link>.
                </p>
            </div>
        </div>
    );
}
