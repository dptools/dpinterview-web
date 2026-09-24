import {test as baseTest} from '@playwright/test';
import {InterviewsPageModel} from "./pages";


interface PageFixtures {
    interviews: InterviewsPageModel;
}

export const test = baseTest.extend<PageFixtures>({
    interviews: async ({page}, use) => {
        const interview = new InterviewsPageModel(page);
        await interview.goto();
        use(interview);
        // clean up
    },
})