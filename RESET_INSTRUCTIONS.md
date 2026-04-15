# Frontend Reset Instructions

## Quick Reset (Run these commands in order)

### 1. Stop Development Server
Press `Ctrl+C` in your terminal

### 2. Clear Cache
```bash
# Remove Next.js cache
rmdir /s /q .next

# Or if that doesn't work:
Remove-Item -Path ".next" -Recurse -Force
```

### 3. Clear Browser Data
Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
```

### 4. Restart Development Server
```bash
npm run dev
```

## Complete Reset (If needed)

```bash
# Stop dev server first (Ctrl+C)

# Clear all caches
rmdir /s /q .next
rmdir /s /q node_modules\.cache
del package-lock.json

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

## Alternative: Use the Reset Script
```bash
# After stopping dev server
node scripts/clear-frontend-data.js
npm run dev
```

## What This Clears
- Next.js build cache (.next)
- Module cache (node_modules/.cache)
- Browser localStorage/sessionStorage
- Forces fresh data fetch from backend

Your exam eligibility changes should now work properly!
