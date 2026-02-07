# Target Stock Monitor & Auto Add-to-Cart

A Node.js stock monitoring tool for Target products that polls Target’s RedSky API in near-real time and automatically attempts to add an item to cart using Playwright when stock becomes available.

This project is designed to:
- Monitor shipping availability and quantity changes
- Log in-stock / out-of-stock windows
- Automatically add an item to cart when availability conditions are met
- Maintain a persistent logged-in Target session via Playwright

---

## Features

- 📡 **Real-time stock polling** using Target’s RedSky API
- 🧠 **Smart availability detection** with cooldown logic to prevent spam
- 🛒 **Automated Add-to-Cart** via Playwright (persistent browser profile)
- 📝 **CSV logging** of stock events and availability windows
- 🔁 **Visitor rotation + ETag handling** to reduce request blocking
- ⏱️ Adaptive polling intervals based on stock state

---

## Project Structure

.
├── .env                    # Environment variables (not committed)
├── README.md               
└── src/
    ├── monitor.js          # Main monitoring loop and state machine
    ├── network.js          # RedSky API request logic
    ├── playwright.js       # Add-to-cart automation
    ├── rebuild_profile.js  # Rebuild persistent Playwright login profile
    ├── config.js           # Environment and runtime configuration
    ├── utils.js            # Helper utilities
    └── logging.js          # CSV logging for events and windows

---

## Requirements

- **Node.js 18+**
- **npm**
- **Playwright**
- A Target account (logged in via Playwright)

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mWilloughby21/target_monitor.git
cd target_monitor
npm install
npx playwright install webkit
```

---

## Environment Configuration

Create a **.env** file in the project root: (Intentionally excluded from version control)

TCIN=YOUR_PRODUCT_TCIN
STORE_ID=1234
ZIP=12345
STATE=CA
LATITUDE=34.0522
LONGITUDE=-118.2437

REFIRE_COOLDOWN_MS=25000
SUCCESS_COOLDOWN_MS=300000
MIN_QTY_CONSOLE=1
LOG_DIR=./logs

---

## Playwright Login Setup

This project uses a persistent browser profile to remain logged into Target

Run:
    node rebuild_profile.js

- A browser window will open
- Log into your Target account manually
- Close the browser or press Enter in the terminal
- The session will be saved in pw-profile/

---

## Running the Monitor

Start the monitor:
    node monitor.js

Optionally override the product TCIN:
    node monitor.js 91347441

---

## Logging

Two CSV files are generated per product:

•   events_<TCIN>.csv
    Tracks stock state transitions (IN_STOCK / OUT_OF_STOCK)

•   windows_<TCIN>.csv
    Records availability window durations

Logs are written to the directory specified by LOG_DIR

---

## Notes & Warnings

- This project is for **educational and personal use**
- Excessive polling may result in temporary request blocking
- DOM selectors may break if Target updates their site
- Do not run multiple instances simultaneously

---

## Disclaimer

This project **is not affiliated with or endorsed by Target**
Use responsibly and at your own risk