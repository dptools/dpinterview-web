import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto("/utils");
    await expect(page.getByRole('link', { name: '🔍 Quality Control Monitor' })).toBeVisible();
    await page.getByRole('link', { name: '🔍 Quality Control Monitor' }).click();
    await expect(page.getByRole('link', { name: '📹 Multi-Part Interviews Mark' })).toBeVisible();
    await expect(page.getByRole('link', { name: '🎧 Unlabelled Diarized Audio' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📁 Missing Interviews List' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📜 Missing Transcripts List' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📜 Missing Runsheets List' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Issues' })).toBeVisible();
    await expect(page.getByRole('main')).toContainText('This section covers various issues raised / detected by the AV QC pipeline.');
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "Issues" [level=2]
    - paragraph: This section covers various issues raised / detected by the AV QC pipeline.
    - link "📹 Multi-Part Interviews Mark parts of the interview to process, or ignore.":
      - /url: /issues/multiPart
      - heading "📹 Multi-Part Interviews" [level=4]
      - paragraph: Mark parts of the interview to process, or ignore.
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
    - paragraph: This project is under active development. If you need more issues catalogued, please reach out to developers.
    `);
});
