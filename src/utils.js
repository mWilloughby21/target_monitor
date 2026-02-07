// utils.js

const { randomInt } = require('crypto');

function genVisitorId() {
    return [...Buffer.from(Array.from({ length: 16 }, () => randomInt(0, 256)))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function computeAvailability(shipping) {
    return (
        !!shipping &&
        ![
            "OUT_OF_STOCK",
            "PRE_ORDER_UNSELLABLE",
            "DISCONTINUED",
            "UNAVAILABLE",
            "COMING_SOON",
        ].includes(shipping)
    );
}

function formatQty(qty) {
    const n = Number(qty);
    if (!Number.isFinite(n)) return "?";
    if (n === 0) return "0";
    if (n < 10) return String(n);
    return "10+";
}

function getNextDelay(isAvail) {
    return isAvail ? randomInt(250, 500) : randomInt(900, 1500);
}

module.exports = {
    genVisitorId,
    computeAvailability,
    formatQty,
    getNextDelay,
};