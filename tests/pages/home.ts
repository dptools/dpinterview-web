import {Locator, Page} from '@playwright/test';
import {AbstractPageModel} from "./page";


export class HomePageModel extends AbstractPageModel {

    static readonly path = "/";

    readonly selectColumnsButton: Locator;
    readonly filtersButton: Locator;
    readonly densityButton: Locator;
    readonly exportButton: Locator;

    readonly selectRowHeader: Locator;
    readonly nameColumn: Locator;
    readonly typeColumn: Locator;
    readonly subjectColumn: Locator;
    readonly studyColumn: Locator;

    constructor(page: Page) {
        super(page);
    }

    async goto() {
        return this.page.goto(HomePageModel.path);
    }

}