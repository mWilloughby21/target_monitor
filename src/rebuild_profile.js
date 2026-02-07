const { webkit } = require('playwright');
const path = require('path');

const USER_DATA_DIR = path.resolve(__dirname, './pw-profile');

async function rebuildPwProfile() {
  // Launch Playwright
    const context = await webkit.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    });
    const page = context.pages()[0] || await context.newPage();
    await page.goto('https://www.target.com/', {
    waitUntil: 'domcontentloaded',
    });
    console.log('👉 Log in manually. Close the browser when done.');

  // Check if logged in
    await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
    });
    console.log('✅ Profile refreshed at:', USER_DATA_DIR);

  // Close Playwright
    await context.close();
}

rebuildPwProfile().catch(err => {
    console.error('❌ Error rebuilding profile:', err.message);
    process.exit(1);
});

module.exports = { rebuildPwProfile };
