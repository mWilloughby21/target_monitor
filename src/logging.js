// logging.js

const fs = require("fs");
const path = require("path");
const { LOG_DIR, TCIN, STORE_ID, ZIP, STATE } = require("./config");

const EVENT_LOG = path.join(LOG_DIR, `events_${TCIN}.csv`);
const WINDOW_LOG = path.join(LOG_DIR, `windows_${TCIN}.csv`);

const tsIso = (ms = Date.now()) => new Date(ms).toISOString();
const tsLocal = (ms = Date.now()) => new Date(ms).toLocaleString();

function ensureLogs() {
    fs.mkdirSync(LOG_DIR, { recursive: true });

    if (!fs.existsSync(EVENT_LOG)) {
        fs.writeFileSync(
            EVENT_LOG,
            "iso_ts,local_ts,event,shipping,qty,tcin,store_id,zip,state\n",
        );
    }

    if (!fs.existsSync(WINDOW_LOG)) {
        fs.writeFileSync(
            WINDOW_LOG,
            "start_iso,start_local,end_iso,end_local,duration_ms,duration_sec,shipping_last,qty_last,tcin,store_id,zip,state\n",
        );
    }
}

function appendCsv(fp, line) {
    fs.appendFileSync(fp, line, "utf8");
}

function logEvent(evt, shipping, qty) {
    appendCsv(
        EVENT_LOG,
        [
            tsIso(),
            `"${tsLocal().replace(/"/g, '""')}"`,
            evt,
            shipping ?? "",
            qty ?? "",
            TCIN,
            STORE_ID,
            ZIP,
            STATE,
        ].join(",") + "\n",
    );
}

function logWindow(startMs, endMs, shippingLast, qtyLast) {
    const dur = Math.max(0, endMs - startMs);
    appendCsv(
        WINDOW_LOG,
        [
            tsIso(startMs),
            `"${tsLocal(startMs).replace(/"/g, '""')}"`,
            tsIso(endMs),
            `"${tsLocal(endMs).replace(/"/g, '""')}"`,
            dur,
            Math.round(dur / 1000),
            shippingLast ?? "",
            qtyLast ?? "",
            TCIN,
            STORE_ID,
            ZIP,
            STATE,
        ].join(",") + "\n",
    );
}

module.exports = {
    ensureLogs,
    logEvent,
    logWindow,
};