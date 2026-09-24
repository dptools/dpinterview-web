import {expect} from '@playwright/test';
import {test} from "./playwright";

test.describe("landing page", async () => {

    test("breadcrumbs match snapshot", async ({home}) => {
        await expect(home.breadcrumbs).toMatchAriaSnapshot();
    });

    test("sidebar matches snapshot", async ({home}) => {
        await expect(home.sidebar).toMatchAriaSnapshot();
    });

    test('main content matches snapshot', async ({home}) => {
        await expect(home.main).toMatchAriaSnapshot();
    });

});