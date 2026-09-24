import {expect, Locator, Page} from '@playwright/test';


export class InterviewsPageModel {

    readonly breadcrumbs: Locator;
    readonly sidebar: Locator;
    readonly main: Locator;
    readonly page: Page;
    readonly selectColumnsButton: Locator;
    readonly filtersButton: Locator;
    readonly densityButton: Locator;
    readonly exportButton: Locator;

    readonly selectRowHeader : Locator;
    readonly nameColumn: Locator;
    readonly typeColumn: Locator;
    readonly subjectColumn: Locator;
    readonly studyColumn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.breadcrumbs = page.locator('header');
        this.sidebar = page.locator('body');
        this.main = page.getByRole('main');

        this.selectColumnsButton = page.getByRole('button', {name: 'Select columns'});
        this.filtersButton = page.getByRole('button', {name: 'Show filters'});
        this.densityButton = page.getByRole('button', {name: 'Density'});
        this.exportButton = page.getByRole('button', {name: 'Export'});
        this.selectRowHeader = page.getByRole('checkbox', {name: 'Select all rows'});

        this.nameColumn = page.getByRole('columnheader', {name: 'Interview Name'});
        this.typeColumn = page.getByRole('columnheader', {name: 'Interview Type'});
        this.subjectColumn = page.getByRole('columnheader', {name: 'Subject ID'});
        this.studyColumn = page.getByRole('columnheader', {name: 'Study ID'});
    }

    async goto() {
        await this.page.goto("/interviews");
    }

}