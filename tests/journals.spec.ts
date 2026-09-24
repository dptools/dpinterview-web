import {expect} from '@playwright/test';
import {test} from "./playwright";

test.describe("Audio journals page", async () => {
    // test("",async ()=>{});

    test("breadcrumbs match snapshot", async ({journals}) => {
        await expect(journals.breadcrumbs).toMatchAriaSnapshot();
    });

    test("sidebar matches snapshot", async ({journals}) => {
        await expect(journals.sidebar).toMatchAriaSnapshot();
    });

    test.describe("main content", async () => {
        test("is present",async ({journals})=>{
            await expect(journals.main).toBeInViewport();
        });
    });

});