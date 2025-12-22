# Offline Functionality Test Guide

## What I Fixed:

1. **Service Worker Registration**: Changed from `prompt` to `autoUpdate` for automatic PWA updates
2. **Offline Detection**: Added better logging and dual-check (both `isOnline` store and `navigator.onLine`)
3. **Offline Fallback**: Added `navigateFallback` to workbox config for proper offline page loading
4. **Sync Logging**: Added console logs to track when entries are saved offline and synced
5. **Auto-Sync**: Improved online listener to wait 1s after connection before syncing

## How to Test Offline Mode:

### Method 1: Chrome DevTools (Recommended)
1. Deploy to Vercel: `git add . && git commit -m "Fix offline mode" && git push`
2. Open https://soul-script-ecru.vercel.app/ in Chrome
3. Open DevTools (F12) → **Application** tab → **Service Workers**
4. Check "Offline" checkbox
5. Try creating a journal entry
6. You should see: "💾 Adding offline entry: temp-XXXXX" in Console
7. Uncheck "Offline"
8. You should see: "🔄 Syncing X offline entries..." and "✅ Synced entry: temp-XXXXX"

### Method 2: Network Tab
1. Open DevTools → **Network** tab
2. Change throttling dropdown from "No throttling" to "Offline"
3. Try creating an entry
4. Check Console for offline save confirmation
5. Change back to "No throttling"
6. Entry should auto-sync

### Method 3: Airplane Mode (Real Device)
1. Install PWA on your phone
2. Enable Airplane Mode
3. Create a journal entry
4. You'll see: "Your entry has been saved locally and will automatically sync when you reconnect"
5. Disable Airplane Mode
6. Open the app - entries sync automatically

### Method 4: Disconnect WiFi
1. Install PWA on desktop
2. Disconnect your WiFi
3. Create entries
4. Reconnect WiFi
5. Refresh app - entries sync

## What You Should See:

### When Going Offline:
```
🔴 Offline
📵 Offline mode detected - saving locally
💾 Adding offline entry: temp-1734876543210
```

### When Saving Offline:
- ✅ Green notification: "Your entry has been saved locally and will automatically sync when you reconnect to the internet."
- Entry appears in your dashboard immediately

### When Coming Back Online:
```
🟢 Online
🌐 Connection restored - starting auto-sync...
🔄 Syncing 2 offline entries...
✅ Synced entry: temp-1734876543210
✅ Synced entry: temp-1734876554321
✅ Sync complete: 2 synced, 0 failed
```

## Known Limitations:

1. **Cannot edit existing entries offline** - Only new entries can be created offline
2. **Media files not cached offline** - Photos/videos require online connection to upload
3. **Service Worker requires HTTPS** - Offline mode only works in production (Vercel), not `localhost`

## Debugging Tips:

### Check Service Worker Status:
1. Open DevTools → Application → Service Workers
2. Should show "activated and is running"
3. If not, click "Update" or "Unregister" and refresh

### Check Offline Storage:
1. Open DevTools → Application → Local Storage
2. Find `soul-script-offline`
3. Check `offlineEntries` array for unsynced entries

### Force Sync Manually:
1. Open Console
2. Type: `window.location.reload()` after coming online
3. Check if entries sync

## Deploy & Test:

```bash
# Deploy the fixes
cd /home/peter/Desktop/diary/soul-script
git add .
git commit -m "Fix offline mode with better detection and logging"
git push

# Wait 1-2 minutes for Vercel deployment
# Then test at: https://soul-script-ecru.vercel.app/
```

## Success Criteria:

✅ Can create entries when Chrome DevTools shows "Offline"
✅ Entries save to localStorage (Check Application → Local Storage)
✅ Green notification appears confirming offline save
✅ Entries sync automatically when connection restored
✅ No errors in Console during offline/online transition
✅ Service worker shows "activated" in Application tab
