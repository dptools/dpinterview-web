import {expect, test} from './test';

test('can navigate to page', async ({page}) => {
    await page.goto("")
    await expect(page.getByRole('navigation', {name: 'breadcrumb'})).toBeVisible();
    await page.locator('a').filter({hasText: 'Multi-Part Interviews'}).click();
    await expect(page.getByRole('heading')).toContainText('Interviews with Multiple Parts');
    await expect(page.getByRole('main')).toContainText('Help differentiate interviews with:');
    await expect(page.getByRole('main')).toContainText('Multi-part Interviews - Interviews that are split into multiple parts. Common with PSYCHS interviews, where interviews could happen over multiple days.');
    await expect(page.getByRole('main')).toContainText('Duplicate Interviews - Interviews that are duplicates of each other. Probably related to Data Flow and renaming files at the source.');
});

test.describe("Multipart Interviews page", async () => {

    /**
     * Checks all the major static parts of the page are present
     */
    test("main components present", async ({page, multipartInterviews}) => {
        await expect(multipartInterviews.helpBox).toBeVisible();
        await expect(page.getByRole('main')).toContainText('Multi-part Interviews - Interviews that are split into multiple parts. Common with PSYCHS interviews, where interviews could happen over multiple days.');
        await expect(page.getByRole('main')).toContainText('Duplicate Interviews - Interviews that are duplicates of each other. Probably related to Data Flow and renaming files at the source.');
        await expect(multipartInterviews.multipartTable).toBeVisible();
    });

    /**
     * Checks the results table is well-formed
     */
    test('interviews loaded', async ({multipartInterviews}) => {
        await expect(multipartInterviews.resultCount).toBeVisible();

        // We're on the first page of results so there should be no previous page
        await expect(multipartInterviews.previousPageButton).toBeVisible();
        await expect(multipartInterviews.previousPageButton).toBeDisabled();

        // We're on the next button should be present by may not be enabled
        await expect(multipartInterviews.nextPageButton).toBeVisible();
        await expect.soft(multipartInterviews.nextPageButton).toBeEnabled();
    });
});
