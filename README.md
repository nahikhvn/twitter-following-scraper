# Twitter/X Following & Followers Scraper

A browser console script that scrapes your Twitter/X following or followers list and exports it as a CSV file.

## Usage

1. Go to `https://x.com/YOUR_USERNAME/following` or `https://x.com/YOUR_USERNAME/followers`
2. Open DevTools (`F12` or `Cmd+Shift+J` / `Ctrl+Shift+J`)
3. Paste the contents of `twitter.js` into the Console tab
4. Press Enter — it auto-scrolls the page, collecting accounts as it goes
5. When finished, a CSV file downloads automatically

## Output

The CSV includes these columns:

| Column | Example |
|---|---|
| Username | @jack |
| Display Name | Jack |
| Profile URL | https://x.com/jack |
| Verified | Yes / No |
| Bio | (first 300 chars) |

The filename follows the pattern `{handle}_{followers|following}_{date}.csv`.

## Configuration

These constants at the top of the script can be adjusted:

| Variable | Default | Description |
|---|---|---|
| `SCROLL_DELAY` | 1500ms | Delay between scrolls — increase if rate-limited |
| `MAX_STALE_ROUNDS` | 8 | Stops after this many consecutive scrolls with no new accounts |
| `SCROLL_AMOUNT` | 800px | Pixels scrolled per step |

## Notes

- Keep the browser tab in focus while the script runs
- Accounts are deduplicated by username
- The CSV includes a BOM for proper Excel encoding
