import {test as baseTest} from '@playwright/test';
import {HomePageModel, InterviewsPageModel, JournalsPage, PageModel} from "./pages";

interface PageFixtures {
    interviews: InterviewsPageModel;
    journals: JournalsPage,
    home: HomePageModel,
}

type UseFunction<T extends PageModel> = (x: T) => void;

export const test = baseTest.extend<PageFixtures>({
    interviews: async ({page}, use: UseFunction<InterviewsPageModel>) => {
        const interview = new InterviewsPageModel(page);
        await interview.goto();
        use(interview);
        // clean up
    },
    journals: async ({page}, use: UseFunction<JournalsPage>) => {
        const journalsPage = new JournalsPage(page);
        await journalsPage.goto();
        use(journalsPage);
        // clean up
    },
    home: async ({page}, use: UseFunction<HomePageModel>) => {
        const homePage = new HomePageModel(page);
        await homePage.goto();
        use(homePage);
        // clean up
    },
})