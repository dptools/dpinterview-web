import type {Locator, Page} from '@playwright/test';

export class MultipartInterviewsPage {

    readonly helpBox: Locator;
    readonly multipartTable: Locator;
    readonly resultCount: Locator;
    readonly nextPageButton: Locator;
    readonly previousPageButton: Locator;

    constructor(public readonly page: Page) {
        this.helpBox = this.page.getByText('Help differentiate interviews with:1Multi-part Interviews - Interviews that are');
        this.resultCount = this.page.getByText(/The following \d+ interviews have multiple parts/);
        this.multipartTable = this.page.getByText('ColumnsFiltersDensityExportInterview NameInterview TypeSubject IDStudy IDParts');
        this.nextPageButton = this.page.getByRole("button", {description: "Go to next page"});
        this.previousPageButton = this.page.getByRole("button", {description: "Go to previous page",});
    }

    async goto() {
        await this.page.goto("/issues/multiPart"); // Assumes baseURL is set correctly in playwright.config.ts
    }
}
