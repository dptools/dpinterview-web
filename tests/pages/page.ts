import {Locator, Page, Response} from "@playwright/test";


export interface PageModel {

    readonly page: Page;
    readonly breadcrumbs: Locator;
    readonly sidebar: Locator;
    readonly main: Locator;

    goto() : Promise<Response | null>

}

export abstract class AbstractPageModel implements PageModel {
    readonly breadcrumbs: Locator;
    readonly main: Locator;
    readonly sidebar: Locator;
    readonly page: Page;

    protected constructor(page: Page) {
        this.page = page;
        this.breadcrumbs = page.locator('header');
        this.sidebar = page.getByRole("navigation",{name:"sidebar"});
        this.main = page.getByRole('main');

    }

    abstract goto(): Promise<Response | null>;

}