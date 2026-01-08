# 🔑 NEWS API SETUP - QUICK GUIDE

## Get Free API Keys (2 minutes)

### 1. NewsAPI (100 requests/day FREE)
1. Go to: https://newsapi.org/register
2. Enter your email and name
3. Click "Submit"
4. Copy your API key
5. **Add to JARVIS:**
   ```javascript
   // Open browser console (F12) on JARVIS website
   localStorage.setItem('newsapi_api_key', 'YOUR_KEY_HERE');
   ```

### 2. GNews API (100 requests/day FREE)
1. Go to: https://gnews.io/register
2. Sign up with email
3. Verify email
4. Copy API key from dashboard
5. **Add to JARVIS:**
   ```javascript
   // Open browser console (F12) on JARVIS website
   localStorage.setItem('gnews_api_key', 'YOUR_KEY_HERE');
   ```

## Test It Works

After adding keys, open browser console and run:
```javascript
// Force refresh news
window.jarvisNews.fetchLatestNews();

// Check if it worked (wait 5 seconds)
setTimeout(() => {
    console.log(window.jarvisNews.newsCache.length + ' articles loaded!');
}, 5000);
```

## Without API Keys

JARVIS still works perfectly! You get:
- ✅ Full AI capabilities
- ✅ User memory and personalization
- ✅ A-Z comprehensive knowledge
- ✅ All features except live news

News system uses **RSS feeds as fallback** (no API key needed).

## Premium Option (Optional)

For unlimited news updates:
- **NewsAPI Pro**: $449/month (5M requests)
- **GNews Pro**: $99/month (50K requests)

**Not needed for students!** Free tier is more than enough.

---

**Your JARVIS is already a master AI - news APIs just add extra current events knowledge! 🧠**
