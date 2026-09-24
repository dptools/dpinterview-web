import {expect} from '@playwright/test';
import {test} from "./playwright";

test.describe("Interviews page", async () => {

    test("breadcrumbs match snapshot", async ({interviews}) => {
        await expect(interviews.breadcrumbs).toMatchAriaSnapshot();
    });

    test("sidebar matches snapshot", async ({interviews}) => {
        await expect(interviews.sidebar).toMatchAriaSnapshot();
    });

    test('alert text is present', async ({interviews}) => {
        await expect(interviews.main).toMatchAriaSnapshot(`
    - alert:
      - paragraph: Please use Superset Dashboard to look at the Aggregated Interview data.
    `);
    });

    test.describe("interviews table", async () => {

        test('info text is present', async ({interviews}) => {
            await expect(interviews.main).toMatchAriaSnapshot(`- paragraph: /The following \\d+ interviews have been identified for processing\\./`);
        });

        test('controls are present', async ({interviews}) => {
            await expect(interviews.selectColumnsButton).toBeVisible();
            await expect(interviews.filtersButton).toBeVisible();
            await expect(interviews.densityButton).toBeVisible();
            await expect(interviews.exportButton).toBeVisible();
        });

        test('columns are present', async ({interviews}) => {
            await expect(interviews.selectRowHeader).toBeVisible();
            await expect(interviews.nameColumn).toBeVisible();
            await expect(interviews.typeColumn).toBeVisible();
            await expect(interviews.subjectColumn).toBeVisible();
            await expect(interviews.studyColumn).toBeVisible();
        });

        test('table footer is present', async ({interviews}) => {
            await expect(interviews.main).toMatchAriaSnapshot(`
    - paragraph: "Rows per page:"
    - 'combobox /Rows per page: \\d+/'
    - paragraph: /1–\\d+ of \\d+/
    - button "Go to previous page" [disabled]
    - button "Go to next page"
    `);
        });
    });
});