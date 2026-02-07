// config.js

const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env"),
    override: true,
});

const envNum = (k, def) => {
    const n = Number(process.env[k]);
    return Number.isFinite(n) ? n : def;
};

const TCIN = process.argv[2] || process.env.TCIN; // WHT Bundle: 94681785, PRE 3pk: 94300075, ASC 3pk char: 1007935778, ASC 3pk gastly: 95120822

module.exports = {
    // Product
    TCIN,
    PDP_LINK: `https://www.target.com/p/-/A-${TCIN}`,

    // Timing
    REFIRE_COOLDOWN_MS: envNum("REFIRE_COOLDOWN_MS", 25_000),
    SUCCESS_COOLDOWN_MS: envNum("SUCCESS_COOLDOWN_MS", 300_000),
    MIN_QTY_CONSOLE: envNum("MIN_QTY_CONSOLE", 1),

    // Store
    STORE_ID: String(process.env.STORE_ID),
    ZIP: String(process.env.ZIP),
    STATE: String(process.env.STATE),
    LATITUDE: String(process.env.LATITUDE),
    LONGITUDE: String(process.env.LONGITUDE),

    // Paths
    LOG_DIR: path.resolve(__dirname, process.env.LOG_DIR || "./logs"),

    // Endpoints
    REDSKY_URL:
        "https://redsky.target.com/redsky_aggregations/v1/web/product_fulfillment_v1",
}