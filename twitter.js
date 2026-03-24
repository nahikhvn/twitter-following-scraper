// ============================================================
// Twitter/X Followers & Following Scraper
// ============================================================
// USAGE:
//   1. Go to https://x.com/YOUR_USERNAME/following
//      or https://x.com/YOUR_USERNAME/followers
//   2. Open DevTools (F12 or Cmd+Shift+J / Ctrl+Shift+J)
//   3. Paste this entire script into the Console tab
//   4. Press Enter — it will auto-scroll and collect all accounts
//   5. When done, it auto-downloads a CSV file
// ============================================================

(async () => {
    const SCROLL_DELAY = 1500;       // ms between scrolls (increase if you get rate-limited)
    const MAX_STALE_ROUNDS = 8;      // stop after this many scrolls with no new accounts
    const SCROLL_AMOUNT = 800;       // pixels per scroll
  
    const accounts = new Map();      // username → account data (dedupes automatically)
    let staleCount = 0;
    let scrollCount = 0;
  
    // Determine if we're on followers or following page
    const pageType = window.location.pathname.includes('/followers') ? 'followers'
                   : window.location.pathname.includes('/following') ? 'following'
                   : 'unknown';
  
    console.log(`%c🐦 Twitter/X Scraper started — collecting ${pageType}...`, 'color: #1da1f2; font-size: 14px; font-weight: bold;');
    console.log(`Tip: Keep this tab in focus. Scroll delay: ${SCROLL_DELAY}ms`);
  
    function extractAccounts() {
      // Twitter renders user cells with data-testid="UserCell"
      const cells = document.querySelectorAll('[data-testid="UserCell"]');
      let newCount = 0;
  
      cells.forEach(cell => {
        try {
          // Extract username from the profile link (the one starting with /)
          const links = cell.querySelectorAll('a[href^="/"]');
          let username = null;
          let profileUrl = null;
  
          for (const link of links) {
            const href = link.getAttribute('href');
            // Skip non-profile links like /i/verified, /settings, etc.
            if (href && href.match(/^\/[A-Za-z0-9_]{1,15}$/) && !href.startsWith('/i/')) {
              username = href.replace('/', '');
              profileUrl = `https://x.com${href}`;
              break;
            }
          }
  
          if (!username || accounts.has(username)) return;
  
          // Extract display name
          const displayNameEl = cell.querySelector('a[href^="/"] span');
          const displayName = displayNameEl ? displayNameEl.textContent.trim() : '';
  
          // Extract bio — usually in a div after the name/username section
          const bioEl = cell.querySelector('[data-testid="UserCell"] > div > div:last-child > div:last-child');
          let bio = '';
          if (bioEl) {
            // Get text content but skip the name/username parts
            const allText = cell.textContent;
            // Bio is typically everything after the @username
            const atIndex = allText.indexOf(`@${username}`);
            if (atIndex !== -1) {
              bio = allText.substring(atIndex + username.length + 1).trim();
            }
          }
  
          // Check for verified badge
          const verified = cell.querySelector('[data-testid="icon-verified"]') !== null;
  
          accounts.set(username, {
            username: `@${username}`,
            displayName,
            profileUrl,
            verified: verified ? 'Yes' : 'No',
            bio: bio.substring(0, 300) // cap bio length for CSV sanity
          });
  
          newCount++;
        } catch (e) {
          // Skip malformed cells silently
        }
      });
  
      return newCount;
    }
  
    function downloadCSV() {
      const headers = ['Username', 'Display Name', 'Profile URL', 'Verified', 'Bio'];
      const rows = Array.from(accounts.values()).map(a => [
        a.username,
        `"${(a.displayName || '').replace(/"/g, '""')}"`,
        a.profileUrl,
        a.verified,
        `"${(a.bio || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ]);
  
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
  
      const timestamp = new Date().toISOString().slice(0, 10);
      const handle = window.location.pathname.split('/')[1];
      link.href = url;
      link.download = `${handle}_${pageType}_${timestamp}.csv`;
      link.click();
  
      URL.revokeObjectURL(url);
    }
  
    // Main scroll loop
    while (staleCount < MAX_STALE_ROUNDS) {
      const prevSize = accounts.size;
      extractAccounts();
      const newFound = accounts.size - prevSize;
  
      scrollCount++;
  
      if (newFound > 0) {
        staleCount = 0;
        console.log(`Scroll #${scrollCount} — Found ${newFound} new (${accounts.size} total)`);
      } else {
        staleCount++;
        console.log(`Scroll #${scrollCount} — No new accounts (stale ${staleCount}/${MAX_STALE_ROUNDS})`);
      }
  
      // Scroll down
      window.scrollBy(0, SCROLL_AMOUNT);
  
      // Wait for new content to load
      await new Promise(r => setTimeout(r, SCROLL_DELAY));
    }
  
    // Final extraction pass
    extractAccounts();
  
    console.log(`%c✅ Done! Scraped ${accounts.size} ${pageType}.`, 'color: #00ba7c; font-size: 14px; font-weight: bold;');
    console.log('Downloading CSV...');
  
    downloadCSV();
  
    console.log(`%c📁 CSV saved as ${window.location.pathname.split('/')[1]}_${pageType}_${new Date().toISOString().slice(0, 10)}.csv`, 'color: #1da1f2; font-size: 12px;');
    console.log('');
    console.log('Accounts collected:', Array.from(accounts.keys()));
  
  })();