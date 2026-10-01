import {Locator, Page} from "@playwright/test";
import {AbstractPageModel} from "@tests/pages/page";

export class JournalsPage extends AbstractPageModel {

    constructor(page: Page) {
        super(page);
    }

    async goto() {
        return this.page.goto("/journals")
    }



}