import {expect, test} from '@playwright/test';

test.describe("issues page", async () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/issues");
    });

    test('test main content', async ({page}) => {
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "Issues" [level=2]
    - paragraph: This section covers various issues raised / detected by the AV QC pipeline.
    - link "📹 Multi-Part Interviews Mark parts of the interview to process, or ignore.":
      - /url: /issues/multiPart
      - heading "📹 Multi-Part Interviews" [level=4]
      - paragraph: Mark parts of the interview to process, or ignore.
    - link "📹 Multi-Combined Audio Interviews Help identify the audio files that should be transcribed (and what should be ignored)":
      - /url: /issues/multiCombinedAudio
      - heading "📹 Multi-Combined Audio Interviews" [level=4]
      - paragraph: Help identify the audio files that should be transcribed (and what should be ignored)
    - link "🎧 Unlabelled Diarized Audio Label unlabelled audio files with the correct roles, for further downstream processing.":
      - /url: /issues/unlabelledAudio
      - heading "🎧 Unlabelled Diarized Audio" [level=4]
      - paragraph: Label unlabelled audio files with the correct roles, for further downstream processing.
    - link "📁 Missing Interviews List interviews with Runsheets marked as conducted, but no data associated with them.":
      - /url: /issues/missing
      - heading "📁 Missing Interviews" [level=4]
      - paragraph: List interviews with Runsheets marked as conducted, but no data associated with them.
    - link "📜 Missing Transcripts List interviews with video / audio data, but no associated transcripts.":
      - /url: /issues/noTranscript
      - heading "📜 Missing Transcripts" [level=4]
      - paragraph: List interviews with video / audio data, but no associated transcripts.
    - link "📜 Missing Runsheets List interviews with video / audio data, but no associated runsheets.":
      - /url: /issues/noRunsheet
      - heading "📜 Missing Runsheets" [level=4]
      - paragraph: List interviews with video / audio data, but no associated runsheets.
    - link "🎙️ Failed Audio QC Combined audio that failed pre-transcription QC (silence, clipping, voice activity) and is not being transcribed.":
      - /url: /issues/audioQcFailed
      - heading "🎙️ Failed Audio QC" [level=4]
      - paragraph: Combined audio that failed pre-transcription QC (silence, clipping, voice activity) and is not being transcribed.
    - link "📤 Pending Transcription Push Audio that passed QC but has not yet been pushed to TranscribeMe.":
      - /url: /issues/pendingTranscriptionPush
      - heading "📤 Pending Transcription Push" [level=4]
      - paragraph: Audio that passed QC but has not yet been pushed to TranscribeMe.
    - link "⏳ Awaiting Vendor Transcription Audio pushed to TranscribeMe with no transcript delivered back yet.":
      - /url: /issues/awaitingVendorTranscription
      - heading "⏳ Awaiting Vendor Transcription" [level=4]
      - paragraph: Audio pushed to TranscribeMe with no transcript delivered back yet.
    - link "📥 Transcript Not Imported Transcripts delivered by TranscribeMe that have not yet appeared in transcript_files.":
      - /url: /issues/transcriptNotImported
      - heading "📥 Transcript Not Imported" [level=4]
      - paragraph: Transcripts delivered by TranscribeMe that have not yet appeared in transcript_files.
    - link "🧾 Pipeline Failures Errors raised across pipeline stages/crawlers, with occurrence counts and resolution tracking.":
      - /url: /issues/pipelineFailures
      - heading "🧾 Pipeline Failures" [level=4]
      - paragraph: Errors raised across pipeline stages/crawlers, with occurrence counts and resolution tracking.
    - link "🔗 Runsheet Match Match malformed interview files (datetime_parse failures) to missing runsheet entries, subject by subject.":
      - /url: /issues/runsheetMatch
      - heading "🔗 Runsheet Match" [level=4]
      - paragraph: Match malformed interview files (datetime_parse failures) to missing runsheet entries, subject by subject.
    - link "📋 Override Ledger Audit trail of manual overrides (audio QC bypasses, runsheet datetime matches) - which files were addressed and by what mechanism.":
      - /url: /issues/overrideLedger
      - heading "📋 Override Ledger" [level=4]
      - paragraph: Audit trail of manual overrides (audio QC bypasses, runsheet datetime matches) - which files were addressed and by what mechanism.
    - paragraph: This project is under active development. If you need more issues catalogued, please reach out to developers.
    `);
    });
    test('main + breadcrumbs snapshot', async ({page}) => {
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: Navigation
    - list:
      - listitem:
        - link "Issues":
          - /url: /issues
          - img
          - text: ""
        - button "Toggle" [expanded]:
          - img
          - text: ""
        - list:
          - listitem:
            - link "Multi-Part Interviews":
              - /url: /issues/multiPart
          - listitem:
            - link "Multi-Combined Audio Files":
              - /url: /issues/multiCombinedAudio
          - listitem:
            - link "Unlabelled Audio":
              - /url: /issues/unlabelledAudio
          - listitem:
            - link "Missing Interviews":
              - /url: /issues/missing
          - listitem:
            - link "Missing Runsheets":
              - /url: /issues/noRunsheet
          - listitem:
            - link "Missing Transcripts":
              - /url: /issues/noTranscript
          - listitem:
            - link "Failed Audio QC":
              - /url: /issues/audioQcFailed
          - listitem:
            - link "Pending Transcription Push":
              - /url: /issues/pendingTranscriptionPush
          - listitem:
            - link "Awaiting Vendor Transcription":
              - /url: /issues/awaitingVendorTranscription
          - listitem:
            - link "Transcript Not Imported":
              - /url: /issues/transcriptNotImported
          - listitem:
            - link "Pipeline Failures":
              - /url: /issues/pipelineFailures
          - listitem:
            - link "Runsheet Match":
              - /url: /issues/runsheetMatch
          - listitem:
            - link "Override Ledger":
              - /url: /issues/overrideLedger
      - listitem:
        - link "Interviews":
          - /url: /interviews
          - img
          - text: ""
        - button "Toggle":
          - img
          - text: ""
      - listitem:
        - link "Audio Journals":
          - /url: /journals
          - img
          - text: ""
    `);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "📹 Multi-Part Interviews" [level=4]
    - paragraph: Mark parts of the interview to process, or ignore.
    `);
    });

    test('test issue type links', async ({page}) => {
        await expect(page.getByRole('link', {name: '📹 Multi-Combined Audio'})).toBeVisible();
        await expect(page.getByRole('link', {name: '🎧 Unlabelled Diarized Audio'})).toBeVisible();
        await expect(page.getByRole('link', {name: '📁 Missing Interviews List'})).toBeVisible();
        await expect(page.getByRole('link', {name: '🎙️ Failed Audio QC Combined'})).toBeVisible();
        await expect(page.getByRole('link', {name: '📤 Pending Transcription Push'})).toBeVisible();
        await expect(page.getByRole('link', {name: '⏳ Awaiting Vendor'})).toBeVisible();
        await expect(page.getByRole('link', {name: '📥 Transcript Not Imported'})).toBeVisible();
        await expect(page.getByRole('link', {name: '🧾 Pipeline Failures Errors'})).toBeVisible();
        await expect(page.getByRole('link', {name: '🔗 Runsheet Match Match'})).toBeVisible();
        await expect(page.getByRole('link', {name: '📋 Override Ledger Audit'})).toBeVisible();
    });
});