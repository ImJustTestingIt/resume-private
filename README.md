# People Notes

People Notes is a small Chrome Manifest V3 extension for intentionally saving notes about public pages while you browse.

## Privacy-first behavior

- No background collection.
- No automatic profiling.
- No social-media scraping.
- No remote server or analytics.
- Notes stay in `chrome.storage.local` on the user's browser.
- Page title, URL, and selected text are captured only after the user clicks a button.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this repository folder.

## Use

1. Open the extension popup on a page you want to remember.
2. Click **Use current page** to fill in the page title and URL.
3. Optionally select text on the page and click **Add selected text**.
4. Add your own note and click **Save note**.
5. Use **Export** to download a JSON copy of your local notes.

## Scope

This project intentionally avoids hidden collection or background identity profiling. It is meant for user-directed research notes where the person using the browser remains in control of what gets stored.
