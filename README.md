# lap.fun

Set the fastest lap. Take today's fees. One coin per Trackmania Track of the Day; when the next track drops, the fastest time takes that coin's fees.

- `index.html` - the whole site, no build step.
- `api/totd.js`, `api/lb.js` - tiny Vercel functions that read trackmania.io (it sends no CORS headers) and cache for a minute.

Nothing is live on-chain yet: pots show a dash. Edit `CONFIG` at the top of the script in `index.html` to add the X link.
