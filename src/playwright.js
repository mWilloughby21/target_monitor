// playwright.js

const { webkit } = require("playwright");
const path = require("path");
const { PDP_LINK } = require("./config");
const { openLink } = require("./utils");

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

        const pickupBtn = page.locator('[data-test="fulfillment-cell-pickup"]');

        if (pickupBtn.count() > 0) {
            const shippingBtn = page.locator('[data-test="fulfillment-cell-shipping"]');
            await shippingBtn.waitFor({ state: "visible", timeout: 3_000 });
            await shippingBtn.click();
        }

        const atcBtn = page.getByRole("button", { name: /add to cart/i });
        await atcBtn.waitFor({ state: "visible", timeout: 3_000 });
        await atcBtn.click();

        console.log("✅ Add to Cart clicked");
        // const cartLink = page.locator('[data-test="@web/CartLink"]');

        await Promise.all([
            page.waitForFunction(() => {
                const el = document.querySelector('[data-test="@web/CartLink"]');
                return el && !el.getAttribute('aria-label').includes('0 items');
            }),
        ]);

        openLink(CO_LINK);

    } catch (err) {
        console.error("❌ Playwright Error:", err.message);
    }
}

module.exports = { addToCartPlaywright };
