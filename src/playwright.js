// playwright.js

const { exec } = require("child_process");
const { webkit } = require("playwright");
const path = require("path");
const { PDP_LINK } = require("./config");

const USER_DATA_DIR = path.resolve(__dirname, "./pw-profile");

const CO_LINK = "https://www.target.com/checkout/start"

let browser;
let context;
let page;

async function initBrowser() {
    if (!browser) {
        browser = await webkit.launchPersistentContext(USER_DATA_DIR, {
            headless: false, // Must be false to stay logged in
        });

        context = browser;
        page = await context.newPage();
    }
}

async function addToCartPlaywright() {
    await initBrowser();

    try {
        await page.goto(PDP_LINK, { waitUntil: "domcontentloaded" });

        if (page.locator('[data-test="orderPickupButton"][aria-label*="Add to cart"]')) {
            const shippingBtn = page.locator('[data-test="fulfillment-cell-shipping"]');
            await shippingBtn.waitFor({ state: "visible", timeout: 1_000 });
            await shippingBtn.click();
            console.log("test");
        }
        const btn = page.locator(
            'button[data-test="shippingButton"][aria-label*="Add to cart"]'
        );
        await btn.waitFor({ state: "visible", timeout: 1_000 });
        await btn.click();

        console.log("✅ Add to Cart clicked");
        const cartLink = page.locator('[data-test="@web/CartLink"]');

        await Promise.all([
            page.waitForFunction(() => {
                const el = document.querySelector('[data-test="@web/CartLink"]');
                return el && !el.getAttribute('aria-label').includes('0 items');
            }),
            btn.click(),
        ]);

        exec(`open "${CO_LINK}"`);
        
        await browser?.close();
    } catch (err) {
        console.error("❌ Playwright Error:", err.message);
    }
}

module.exports = { addToCartPlaywright };
