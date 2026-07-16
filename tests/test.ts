import { test as base } from '@playwright/test';
import { MultipartInterviewsPage } from './fixtures/multipartInterviewPage';


// Declare the types of your fixtures.
type DashboardFixtures = {
    multipartInterviews: MultipartInterviewsPage;
};

/*
 * Adds custom fixtures to basic test object.
 */
export const test = base.extend<DashboardFixtures>({
    multipartInterviews: async ({ page }, use) => {
        // Set up the fixture.
        const multipartInterviews = new MultipartInterviewsPage(page);
        await multipartInterviews.goto();

        // eslint-disable-next-line react-hooks/rules-of-hooks -- Not actually a React Hook
        await use(multipartInterviews);
    },
});

export { expect } from '@playwright/test';
