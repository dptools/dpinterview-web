import {expect, test} from '@playwright/test';

test('main components are present', async ({page}) => {
    await page.goto("");
    await expect(page.getByRole('link', {name: 'AV QC Portal v0.2.0'})).toBeVisible();
    await expect(page.getByText('Toggle SidebarHome')).toBeVisible();
    await expect(page.getByText('NavigationIssuesToggleMulti-')).toBeVisible();
    await expect(page.locator('body')).toMatchAriaSnapshot(`
    - list:
      - listitem:
        - link "AV QC Portal v0.2.0":
          - /url: /
          - img
          - text: ""
    `);
});

test.describe("main matter", async () => {

    test.beforeEach(async ({page}) => {
        await page.goto("");
    });

    test("Info box", async ({page}) => {
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("heading", {name: "👋 Welcome to AV QC Portal"})).toBeVisible()
        await expect(page.getByText("This web portal is actively being developed as a companion to theAV QC pipelineproject, designed to streamline audiovisual quality control processes.")).toBeVisible();
    })
});

test.describe("The sidebar", async () => {

    test.beforeEach(async ({page}) => {
        await page.goto("");
    });

    test('Sidebar', async ({page}) => {
        await page.goto("");
        await expect(page.locator('body')).toMatchAriaSnapshot(`- text: Navigation`);
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - list:
      - listitem:
        - link "Multi-Part Interviews":
          - /url: /issues/multiPart
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
    `);
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - link "Interviews":
      - /url: /interviews
      - img
      - text: ""
    `);
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - link "Audio Journals":
      - /url: /journals
      - img
      - text: ""
    `);
    })
});
