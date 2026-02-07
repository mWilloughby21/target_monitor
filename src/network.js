// network.js

const axios = require("axios");
const https = require("https");
const {
    REDSKY_URL,
    TCIN,
    STORE_ID,
    ZIP,
    STATE,
    LATITUDE,
    LONGITUDE,
    PDP_LINK,
} = require("./config");

const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 45_000,
    maxSockets: 4,
});

const baseHeaders = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.target.com",
    "Referer": PDP_LINK,
}

async function fetchStock(visitorId, lastEtag) {
    try {
        const res = await axios.get(REDSKY_URL, {
            httpsAgent,
            headers: {
                ...baseHeaders,
                ...(lastEtag ? { "If-None-Match": lastEtag } : {}),
            },
            validateStatus: () => true,
            timeout: 12_000,
            params: {
                key: "9f36aeafbe60771e321a7cc95a78140772ab3e96",
                tcin: TCIN,
                store_id: STORE_ID,
                zip: ZIP,
                state: STATE,
                latitude: LATITUDE,
                longitude: LONGITUDE,
                visitor_id: visitorId,
                channel: "WEB",
                page: `/p/A-${TCIN}`,
            },
        });

        return res;
    } catch (err) {
        console.error("Error fetching stock:", err.message);
        return null;
    }
}

module.exports = { fetchStock };