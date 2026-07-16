import * as React from 'react';
import Typography from '@mui/joy/Typography';
import Link from '@mui/material/Link';

export default function Home() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-slate-50 rounded-lg shadow-lg p-8 border-l-4 border-indigo-500">
                <Typography level="h2" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    Issues
                </Typography>

                <Typography level="body-lg" sx={{ mb: 3, color: 'text.secondary' }}>
                    This section covers various issues raised / detected by the AV QC pipeline.
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <Link href="/issues/multiPart" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📹 Multi-Part Interviews
                            </Typography>
                            <Typography level="body-md">
                                Mark parts of the interview to process, or ignore.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/multiCombinedAudio" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-amber-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📹 Multi-Combined Audio Interviews
                            </Typography>
                            <Typography level="body-md">
                                Help identify the audio files that should be transcribed (and what should be ignored)
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/unlabelledAudio" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-teal-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-teal-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                🎧 Unlabelled Diarized Audio
                            </Typography>
                            <Typography level="body-md">
                                Label unlabelled audio files with the correct roles, for further downstream processing.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/missing" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-blue-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📁 Missing Interviews
                            </Typography>
                            <Typography level="body-md">
                                List interviews with Runsheets marked as conducted, but no data associated with them.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/noTranscript" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-red-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📜 Missing Transcripts
                            </Typography>
                            <Typography level="body-md">
                                List interviews with video / audio data, but no associated transcripts.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/noRunsheet" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-red-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📜 Missing Runsheets
                            </Typography>
                            <Typography level="body-md">
                                List interviews with video / audio data, but no associated runsheets.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/audioQcFailed" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                🎙️ Failed Audio QC
                            </Typography>
                            <Typography level="body-md">
                                Combined audio that failed pre-transcription QC (silence, clipping, voice activity) and is not being transcribed.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/pendingTranscriptionPush" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📤 Pending Transcription Push
                            </Typography>
                            <Typography level="body-md">
                                Audio that passed QC but has not yet been pushed to TranscribeMe.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/awaitingVendorTranscription" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                ⏳ Awaiting Vendor Transcription
                            </Typography>
                            <Typography level="body-md">
                                Audio pushed to TranscribeMe with no transcript delivered back yet.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/transcriptNotImported" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-orange-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                📥 Transcript Not Imported
                            </Typography>
                            <Typography level="body-md">
                                Transcripts delivered by TranscribeMe that have not yet appeared in transcript_files.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/pipelineFailures" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-rose-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-rose-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                🧾 Pipeline Failures
                            </Typography>
                            <Typography level="body-md">
                                Errors raised across pipeline stages/crawlers, with occurrence counts and resolution tracking.
                            </Typography>
                        </div>
                    </Link>
                    <Link href="/issues/runsheetMatch" underline="none" color="inherit">
                        <div className="border border-l-4 border-l-rose-400 rounded-lg p-4 hover:shadow-md transition-shadow bg-rose-50/30">
                            <Typography level="h4" sx={{ mb: 2, color: 'text.secondary' }}>
                                🔗 Runsheet Match
                            </Typography>
                            <Typography level="body-md">
                                Match malformed interview files (datetime_parse failures) to missing runsheet entries, subject by subject.
                            </Typography>
                        </div>
                    </Link>
                </div>

                <Typography level="body-md" sx={{ mt: 4, color: 'text.tertiary' }}>
                    This project is under active development. If you need more issues catalogued, please reach out to developers.
                </Typography>
            </div>
        </div >
    );
}
