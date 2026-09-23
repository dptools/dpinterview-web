import {expect, test} from '@playwright/test';

test.describe("landing page", async () => {
    test('test', async ({page}) => {
        await page.goto('/');
        await expect(page.getByRole('link', {name: 'Home'})).toBeVisible();
        await expect(page.getByRole('link', {name: 'AV QC Portal v0.2.0'})).toBeVisible();
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "👋 Welcome to AV QC Portal" [level=2]
    - paragraph:
      - text: This web portal is actively being developed as a companion to the
      - link "AV QC pipeline":
        - /url: https://github.com/dptools/dpinterview
      - text: project, designed to streamline audiovisual quality control processes.
    - link "🔍 Quality Control Monitor and manage quality issues in your audio/video recordings with more intuitive interfaces.":
      - /url: /issues
      - heading "🔍 Quality Control" [level=4]
      - paragraph: Monitor and manage quality issues in your audio/video recordings with more intuitive interfaces.
    - link "📊 Real-time Monitoring Track performance metrics and health indicators of your audio/video processing systems in real time. [Superset]":
      - /url: http://localhost:8088
      - heading "📊 Real-time Monitoring" [level=4]
      - paragraph: Track performance metrics and health indicators of your audio/video processing systems in real time. [Superset]
    - paragraph:
      - text: This project is under active development. Check back for updates or contribute on
      - link "GitHub":
        - /url: https://github.com/dheshanm/dpinterview-web
      - text: .
    `);
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - text: Navigation
    - list:
      - listitem:
        - link "Issues":
          - /url: /issues
          - img
          - text: ""
        - button "Toggle":
          - img
          - text: ""
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
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - link "AV QC Portal v0.2.0":
      - /url: /
      - img
      - text: ""
    `);
        await expect(page.locator('body')).toMatchAriaSnapshot(`
    - list:
      - listitem:
        - link "GitHub":
          - /url: https://github.com/dheshanm/dpinterview-web
          - img
          - text: ""
      - listitem:
        - link "Superset":
          - /url: http://localhost:8088
          - img
          - text: ""
    `);
    });
});