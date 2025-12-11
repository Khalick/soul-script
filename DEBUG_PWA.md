# PWA Installation Debug Guide

## Why `beforeinstallprompt` might not fire on Chrome Mobile:

### 1. **User Engagement Requirements** (Most Common)
Chrome requires the user to interact with your site before showing the install prompt:
- Visit the site at least **once** before
- Spend at least **30 seconds** on the site
- Click/tap on something (any interaction)

**Solution**: Browse around the app for 30+ seconds, click buttons, then wait.

### 2. **Already Dismissed**
If you clicked "Not now" or dismissed the prompt before, Chrome won't show it again for a while.

**Solution**: Clear your browser data for the site:
- Chrome Menu (⋮) → Settings → Privacy → Clear browsing data
- Or in DevTools: Application → Clear storage → Clear site data

### 3. **Already Installed**
If the app is already on your home screen.

**Check**: Look for "Soul Script" on your home screen or app drawer.

### 4. **Service Worker Not Active**
The service worker must be registered and active.

**Debug in Console**:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('State:', reg.active?.state));
});
```

### 5. **Manifest Issues**
The manifest must be valid and accessible.

**Debug in Console**:
```javascript
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m))
  .catch(e => console.error('Manifest error:', e));
```

### 6. **HTTPS Required**
Must be served over HTTPS (Vercel does this automatically ✅)

---

## Manual Testing Steps:

### Step 1: Clear Everything
```javascript
// Run in Console
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Unregister Service Workers
```javascript
// Run in Console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

### Step 3: Check PWA Criteria
```javascript
// Run in Console
console.log('HTTPS:', location.protocol === 'https:');
console.log('Has manifest:', document.querySelector('link[rel="manifest"]') !== null);
console.log('Has SW:', 'serviceWorker' in navigator);
console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
```

### Step 4: Force Reload
- Close all tabs for the site
- Reopen in a new tab
- Wait 30 seconds
- Click around the site
- Wait for the prompt

---

## Chrome Flags (For Testing Only)

You can bypass some restrictions for testing:

1. Open `chrome://flags`
2. Search for "PWA"
3. Enable: `#bypass-app-banner-engagement-checks`
4. Restart Chrome

⚠️ **Warning**: This only works for testing. Real users won't have this enabled.

---

## Alternative: Use Chrome's Built-in Install

Even if the `beforeinstallprompt` doesn't fire, users can ALWAYS install via:

**Chrome Mobile**:
1. Tap the ⋮ menu (top right)
2. Look for "Add to Home screen" or "Install app"
3. Tap it

**Chrome Desktop**:
1. Look for the ➕ icon in the address bar
2. Or click ⋮ → "Install Soul Script"

---

## Debugging Commands

### Check if event was dismissed:
```javascript
console.log('Dismissed?', localStorage.getItem('installPromptDismissed'));
```

### Clear dismissal:
```javascript
localStorage.removeItem('installPromptDismissed');
location.reload();
```

### Check manifest:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW active:', !!reg?.active);
  console.log('SW scope:', reg?.scope);
});
```

### Check icons exist:
```javascript
fetch('/web-app-manifest-192x192.png').then(r => console.log('192 icon:', r.ok));
fetch('/web-app-manifest-512x512.png').then(r => console.log('512 icon:', r.ok));
```

---

## Real-World Behavior

**First Visit**: Chrome rarely shows the prompt  
**Second Visit (after 30s)**: More likely  
**Third Visit**: Very likely if user is engaged  

This is intentional - Chrome doesn't want to spam users with install prompts on first visit.

---

## Verification Checklist

Run these in your deployed site console:

```javascript
// Complete PWA Check
const pwaCheck = async () => {
  const checks = {
    'HTTPS': location.protocol === 'https:',
    'Has Manifest': !!document.querySelector('link[rel="manifest"]'),
    'Service Worker': 'serviceWorker' in navigator,
    'SW Registered': !!(await navigator.serviceWorker.getRegistration()),
    'Not Standalone': !window.matchMedia('(display-mode: standalone)').matches,
    'Not Dismissed': !localStorage.getItem('installPromptDismissed')
  };
  
  console.table(checks);
  
  const allPass = Object.values(checks).every(v => v);
  if (allPass) {
    console.log('✅ All PWA criteria met! Prompt should fire after user engagement.');
  } else {
    console.log('❌ Some criteria not met. Check above.');
  }
};

pwaCheck();
```

---

## TL;DR

**The event is working correctly!** Chrome just has engagement requirements. Try:

1. Clear site data (Chrome → Settings → Site settings → soul-script → Clear data)
2. Visit the site
3. Interact with it for 30+ seconds (click buttons, scroll, etc.)
4. Wait a few seconds
5. The prompt should appear

**Or just use the browser's built-in "Add to Home screen" option!**
