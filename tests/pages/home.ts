import {Page} from '@playwright/test';
import {AbstractPageModel} from "@tests/pages/page";

export class HomePageModel extends AbstractPageModel {

    static readonly path = "/";

    constructor(page: Page) {
        super(page);
    }

    async goto() {
        return this.page.goto(HomePageModel.path);
    }

}