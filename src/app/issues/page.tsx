import Link from '@mui/material/Link';
import * as React from 'react';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Home() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-slate-50 rounded-lg shadow-lg p-8 border-l-4 border-indigo-500">
                <h2 className={"typeset typeset-joy-h2  mb-4 font-bold text-(--mui-palette-primary-main) "}>
                    Issues
                </h2>

                <p className={"typeset typeset-body-lg mb-3, text-(--mui-palette-text-secondary) "}>
                    This section covers various issues raised / detected by the AV QC pipeline.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <Link href="/issues/multiPart" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary)"}>
                                📹 Multi-Part Interviews
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Mark parts of the interview to process, or ignore.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/multiCombinedAudio" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📹 Multi-Combined Audio Interviews
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Help identify the audio files that should be transcribed (and what should be ignored)
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/unlabelledAudio" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-teal-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-teal-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                🎧 Unlabelled Diarized Audio
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Label unlabelled audio files with the correct roles, for further downstream processing.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/missing" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-blue-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📁 Missing Interviews
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                List interviews with Runsheets marked as conducted, but no data associated with them.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/noTranscript" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-red-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📜 Missing Transcripts
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                List interviews with video / audio data, but no associated transcripts.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/noRunsheet" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-red-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📜 Missing Runsheets
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                List interviews with video / audio data, but no associated runsheets.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/audioQcFailed" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                🎙️ Failed Audio QC
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Combined audio that failed pre-transcription QC (silence, clipping, voice activity) and
                                is not being transcribed.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/pendingTranscriptionPush" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📤 Pending Transcription Push
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Audio that passed QC but has not yet been pushed to TranscribeMe.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/awaitingVendorTranscription" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                ⏳ Awaiting Vendor Transcription
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Audio pushed to TranscribeMe with no transcript delivered back yet.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/transcriptNotImported" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                📥 Transcript Not Imported
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Transcripts delivered by TranscribeMe that have not yet appeared in transcript_files.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/pipelineFailures" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-rose-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-rose-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                🧾 Pipeline Failures
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Errors raised across pipeline stages/crawlers, with occurrence counts and resolution
                                tracking.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/runsheetMatch" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-rose-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-rose-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary) "}>
                                🔗 Runsheet Match
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Match interview files the crawler couldn&apos;t date (unparseable names, loose files) to
                                missing runsheet entries, subject by subject.
                            </p>
                        </div>
                    </Link>
                    <Link href="/issues/overrideLedger" underline="none" color="inherit">
                        <div
                            className="border border-l-4 border-l-rose-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-rose-50/30">
                            <h4 className={"typeset typeset-joy-h4 mb-2 text-(--mui-palette-text-secondary)"}>
                                📋 Override Ledger
                            </h4>
                            <p className={"typeset typeset-body-md"}>
                                Audit trail of manual overrides (audio QC bypasses, runsheet datetime matches) - which
                                files were addressed and by what mechanism.
                            </p>
                        </div>
                    </Link>
                </div>

                <p className={"typeset typeset-body-md mt-4 text-(--mui-palette-text-tertiary)"}>
                    This project is under active development. If you need more issues catalogued, please reach out to
                    developers.
                </p>
            </div>
        </div>
    );
}
