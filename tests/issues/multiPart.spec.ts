import {expect} from '@playwright/test';
import {test} from "@tests/playwright";

test.describe("landing page", async () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/issues/multiPart");
    });

    test("info text", async ({page}) => {
        await expect(page.getByRole('heading', {name: 'Interviews with Multiple Parts', level: 2})).toBeVisible();
        await expect(page.getByRole("paragraph")
            .filter({has: page.getByText(/The following \d+ interviews have multiple parts:/)}))
            .toBeAttached();
    });

    test.describe("results table", async () => {

        test("controls menu present", async ({page}) => {
            await expect(page.getByRole('button', {name: 'Select columns'})).toBeVisible();
            await expect(page.getByRole('button', {name: 'Show filters'})).toBeVisible();
            await expect(page.getByRole('button', {name: 'Density'})).toBeVisible();
            await expect(page.getByRole('button', {name: 'Export'})).toBeVisible();
        });

        test("table headers present", async ({page}) => {
            const gridElement = page.getByRole("grid");
            await expect(gridElement).toBeAttached();
            await expect(gridElement.getByRole('columnheader', {name: 'Interview Name'})).toBeVisible();
            await expect(gridElement.getByRole('columnheader', {name: 'Interview Type'})).toBeVisible();
            await expect(gridElement.getByRole('columnheader', {name: 'Subject ID'})).toBeVisible();
            await expect(gridElement.getByRole('columnheader', {name: 'Parts Count'})).toBeVisible();
        });
    });

    test("sidebar", async ({page}) => {
        await expect(page.getByRole('navigation', {name: 'sidebar'})).toMatchAriaSnapshot();
    });
});