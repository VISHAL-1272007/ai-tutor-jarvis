# JARVIS Backend Information

## How It Works

JARVIS uses a **free Render backend** that automatically handles chat requests with multiple AI APIs (Groq, Gemini, OpenRouter, HuggingFace).

## Important: First Visit Behavior

### What Happens on First Visit

**Render's free tier puts services to sleep after 15 minutes of inactivity.**

When a student visits your site for the first time (or after 15+ minutes):
1. ⏰ **Backend wakes up** (takes 30-60 seconds)
2. 🔄 **Page shows "Connecting to JARVIS..."** status
3. ✅ **Once awake, JARVIS responds instantly**

### Solution Implemented

The frontend now **automatically wakes up the backend** when the page loads:

```javascript
// Automatically pings backend on page load
wakeUpBackend();
```

**What Students See:**
- ✅ Top of page shows: "Connecting to JARVIS..."
- ✅ Changes to: "✅ JARVIS is ready!" (2 seconds later)
- ✅ All subsequent messages work instantly

## No More Delays!

### For Continuous Usage:
- ✅ **First student** waits 30-60 seconds
- ✅ **All other students** within 15 minutes get instant response
- ✅ **College lab usage** = always fast (someone is always using it)

### Keep Backend Awake 24/7 (Optional)

If you want **zero delays ever**, run this on your PC:

```bash
node keep-alive.js
```

This pings the backend every 14 minutes to prevent sleep.

## Backend Features

- 🚀 **75 requests/minute capacity**
- 🔄 **Auto-fallback** between 4 AI APIs
- 🆓 **100% Free** (Groq, Gemini, OpenRouter, HuggingFace)
- 🌐 **Firebase Auth integration**
- 💾 **No database required** (uses localStorage)

## For Students

**First message might take 30-60 seconds to wake up the server.**
After that, everything works instantly!

Think of it like turning on a computer - first boot takes time, then it's fast!

## Upgrade Options (If Needed)

If you need **instant responses 24/7** for high traffic:

1. **Render Paid** ($7/month) - Always on, no sleep
2. **Railway** (Free tier) - 500 hours/month
3. **Fly.io** (Free tier) - Always on
4. **Local Backend** - Run on your college server

Current setup is perfect for college projects with occasional usage! 🎓
