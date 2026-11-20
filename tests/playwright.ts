import {test as baseTest} from '@playwright/test';
import {HomePageModel, InterviewsPageModel, JournalsPage, PageModel} from "./pages";

interface PageFixtures {
    interviews: InterviewsPageModel;
    journals: JournalsPage,
    home: HomePageModel,
}

type UseFunction<T extends PageModel> = (x: T) => void;

export const test = baseTest.extend<PageFixtures>({
    interviews: async ({page}, using: UseFunction<InterviewsPageModel>) => {
        const interview = new InterviewsPageModel(page);
        await interview.goto();
        using(interview);
        // clean up
    },
    journals: async ({page}, using: UseFunction<JournalsPage>) => {
        const journalsPage = new JournalsPage(page);
        await journalsPage.goto();
        using(journalsPage);
        // clean up
    },
    home: async ({page}, using: UseFunction<HomePageModel>) => {
        const homePage = new HomePageModel(page);
        await homePage.goto();
        using(homePage);
        // clean up
    },
})