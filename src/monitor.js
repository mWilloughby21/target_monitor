// monitor.js

const {
    REFIRE_COOLDOWN_MS,
    SUCCESS_COOLDOWN_MS,
    MIN_QTY_CONSOLE,
    TCIN,
    STORE_ID,
    ZIP,
} = require("./config");

const { randomInt } = require("crypto");
const { fetchStock } = require("./network");
const { addToCartPlaywright } = require("./playwright");
const {
    genVisitorId,
    computeAvailability,
    formatQty,
    getNextDelay,
} = require("./utils");
const { ensureLogs, logEvent, logWindow } = require("./logging");

// == STATE ==
let lastIsAvail = null;
let currWinStartTs = null;
let lastQtySeen = null;
let lastShippingSeen = null;

let atcInProgress = false;
let firedThisWave = false;
let lastSuccessTs = 0;
let nextArmAfterTs = 0;

let visitorId = genVisitorId();
let visitorPollCount = 0;
let visitorRotationInterval = randomInt(27, 33)
let lastEtag = null;

// == CORE LOOP ==
async function checkStock() {
    try {
        if (++visitorPollCount >= visitorRotationInterval) {
            visitorId = genVisitorId();
            visitorPollCount = 0;
            visitorRotationInterval = randomInt(27, 33)
            lastEtag = null;
        }

        const res = await fetchStock(visitorId, lastEtag);
        if (!res) {
            console.log("FetchStock result not found.");
            return;
        }

        if (res.status === 304) return;
        if (res.headers?.etag) lastEtag = res.headers.etag;
        if (res.status === 403 || res.status === 429) {
            visitorId = genVisitorId();
            visitorPollCount = 0;
            lastEtag = null;
            return;
        }

        const ship = 
            res.data?.data?.product?.fulfillment?.shipping_options;
        if (!ship) {
            console.log("res.data keys:", Object.keys(res.data || {}));
            console.log("res.data.data keys:", Object.keys(res.data?.data || {}));
            console.log("product keys:", Object.keys(res.data?.product || res.data?.data?.product || {}));
            return;
        }
        const shipping = ship.availability_status;
        const qtyRaw = ship.available_to_promise_quantity;
        const isAvail = computeAvailability(shipping);
        const qty = formatQty(qtyRaw);

        const now = Date.now();
        const ts = new Date().toLocaleString()

        if (!isAvail || Number(qtyRaw) >= MIN_QTY_CONSOLE) {
            console.log(`[${ts}] Shipping: ${shipping} | Qty: ${qty}`);
        }

        if (lastIsAvail === null) {
            logEvent(isAvail ? "IN_STOCK" : "OUT_OF_STOCK", shipping, qtyRaw);
            if (isAvail)currWinStartTs = now;
        } else if (isAvail !== lastIsAvail) {
            if (isAvail) {
                logEvent("IN_STOCK", shipping, qtyRaw);
                currWinStartTs = now;
            } else {
                logEvent("OUT_OF_STOCK", shipping, qtyRaw);
                if (currWinStartTs) {
                    logWindow(currWinStartTs, now, lastShippingSeen, lastQtySeen);
                    currWinStartTs = null;
                }
            }
        }

        lastIsAvail = isAvail;
        lastShippingSeen = shipping;
        lastQtySeen = qtyRaw;

        if (
            isAvail &&
            !firedThisWave &&
            now >= nextArmAfterTs &&
            now - lastSuccessTs >= SUCCESS_COOLDOWN_MS &&
            !atcInProgress
        ) {
            firedThisWave = true;
            atcInProgress = true;
            nextArmAfterTs = now + REFIRE_COOLDOWN_MS;

            try {
                await Promise.race([
                    addToCartPlaywright(),
                    new Promise((_, rej) =>
                        setTimeout(() => rej(new Error("ATC timeout")), 30_000)
                    ),
                ]);

                lastSuccessTs = now;
            } catch (err) {
                firedThisWave = false;
                console.error("Error:", err.message);
            } finally {
                atcInProgress = false;
            }
        }

        if (!isAvail) firedThisWave = false;

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

function loop() {
    setTimeout(async () => {
        await checkStock();
        loop();
    }, getNextDelay(lastIsAvail));
}

function setupShutdownHandlers() {
    const closeWindow = () => {
        if (currWinStartTs) {
            logWindow(
                currWinStartTs,
                Date.now(),
                lastShippingSeen,
                lastQtySeen
            );
        }
    };

    ["SIGINT", "SIGTERM"].forEach((sig) =>
        process.on(sig, () => {
            closeWindow();
            process.exit(0);
        })
    );
}

// == INIT ==
ensureLogs();
setupShutdownHandlers();

console.log("====================================");
console.log("    Target Monitor (Optimized)       ");
console.log("====================================");
console.log(`TCIN: ${TCIN}`);
console.log(`Store: ${STORE_ID} | ZIP: ${ZIP}`);
console.log("====================================\n");

checkStock();
loop();