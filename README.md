# Memory Resume

Memory Resume is a small Chrome Manifest V3 extension for keeping a local list of remembered moments. It treats a resume less like a dossier about people and more like a collection of past memories.

## Privacy-first behavior

- No background collection.
- No page capture.
- No selected-text scraping.
- No personal profiles about other people.
- No remote server or analytics.
- Memories stay in `chrome.storage.local` on the user's browser.
- Every memory is written intentionally by the person using the extension.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this repository folder.

## Use

1. Open the extension popup.
2. Write a short title for a memory.
3. Add the memory itself, plus an optional when and feeling.
4. Click **Save memory**.
5. Use **Export** to download a JSON copy of your local memories.

## Scope

This project intentionally avoids collecting data about people or browsing activity. It is meant to be a quiet, local memory list: a resume as a record of moments you choose to keep.
