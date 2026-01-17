# Daily News Training for JARVIS - Setup Guide

**Purpose:** Automatically train JARVIS daily with Tamil news from Dailythanthi, Dinamalar, etc.  
**Created:** January 11, 2026  
**Update Frequency:** Daily at 8 AM  
**News Sources:** Dailythanthi, Dinamalar, Thanthi TV, and more

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Scheduler Package

```bash
npm install node-cron
```

**What it does:** Schedules daily news updates at 8 AM without needing external services.

### Step 2: Add to Backend Startup

In `backend/index.js`, add at the top (after other requires):

```javascript
// Daily News Trainer
const { initializeNewsStorage, startDailyUpdates } = require('./daily-news-trainer');

// Initialize news storage on startup
initializeNewsStorage();

// Start daily news updates (runs at 8 AM every day)
startDailyUpdates();

console.log('✅ Daily news trainer activated');
```

### Step 3: Enable News in Chat Responses

In the `/api/chat` endpoint, add before sending the AI request:

```javascript
// Load today's news for context
const { getLatestNews, getTodayTraining } = require('./daily-news-trainer');
const todayNews = getTodayTraining();
const latestHeadlines = getLatestNews(3);

// Add to system prompt
let systemMessage = getSystemMessage();
if (todayNews) {
  systemMessage += `\n\n📰 TODAY'S NEWS CONTEXT:\n${todayNews.trainingPrompt}`;
}
if (latestHeadlines.length > 0) {
  systemMessage += `\n\nLatest headlines:`;
  latestHeadlines.forEach(news => {
    systemMessage += `\n- [${news.source}] ${news.title}`;
  });
}
```

---

## 📊 How It Works

```
Daily at 8:00 AM:
   ↓
Fetch news from Dailythanthi, Dinamalar, etc.
   ↓
Extract headlines and articles
   ↓
Store in daily_news.json file
   ↓
Train JARVIS with today's news
   ↓
Store training data in today_training.json
   ↓
JARVIS now knows today's news!
```

---

## 🎯 What JARVIS Can Now Answer

### Before Daily Training:
- "What's the news today?" → "I don't have current news information"

### After Daily Training:
- "What's the news today?" → Lists latest headlines from Dailythanthi, Dinamalar, Thanthi TV
- "Tell me about today's top stories" → Summarizes headlines with sources
- "What's happening in Tamil Nadu today?" → Uses latest scraped news
- "Show me news from Dailythanthi" → Filters news by source

---

## 📁 File Structure

```
backend/
├── index.js (main server - add 3 lines)
├── daily-news-trainer.js (NEW - 300+ lines)
└── data/
    ├── daily_news.json (auto-created, stores all news)
    ├── today_training.json (auto-created, today's training)
    └── news_backups/
        ├── news_backup_1704873600000.json
        ├── news_backup_1704960000000.json
        └── ... (keeps 30-day history)
```

---

## ⚙️ Configuration

### Change Update Time

In `daily-news-trainer.js`, line 12:

```javascript
updateFrequency: '0 8 * * *'  // 8 AM (default)

// Other examples:
// '0 0 * * *'   = Midnight
// '0 12 * * *'  = Noon
// '30 6 * * *'  = 6:30 AM
// '0 18 * * 1'  = 6 PM every Monday
```

### Add More News Sources

In `daily-news-trainer.js`, lines 13-25:

```javascript
sources: [
  {
    name: 'Dailythanthi',
    url: 'https://www.dailythanthi.com/News',
    category: 'general'
  },
  // ADD MORE SOURCES HERE
  {
    name: 'NewspaperName',
    url: 'https://website.com/news',
    category: 'category'
  }
]
```

### Change History Duration

In `daily-news-trainer.js`, line 21:

```javascript
maxStoredDays: 30  // Keep last 30 days (default)
// Change to: maxStoredDays: 60  // for 60 days
// Or: maxStoredDays: 7  // for 1 week only
```

---

## 📊 Features

### ✅ Automatic Daily Updates
- Runs at 8 AM every day without manual intervention
- No need to restart server

### ✅ News Storage
- Keeps last 30 days of news
- Removes duplicates automatically
- Backs up old data

### ✅ JARVIS Training
- Creates daily training file with today's news
- Updates system prompt with latest headlines
- Filters top 5 headlines for each response

### ✅ Statistics Tracking
- Tracks total news items
- Shows sources
- Logs last update time
- Counts training cycles

### ✅ Error Handling
- Gracefully handles network errors
- Falls back if source is down
- Continues with other sources
- Logs all errors

---

## 🔍 Monitoring Daily Updates

### View Latest News

```javascript
// In any API endpoint
const { getLatestNews } = require('./daily-news-trainer');
const latestNews = getLatestNews(10); // Get last 10 headlines
console.log(latestNews);
```

### View Statistics

```bash
# In Node.js console
const trainer = require('./daily-news-trainer');
const stats = trainer.getNewsStats();
console.log(stats);
```

**Output:**
```
{
  totalNews: 324,
  lastUpdate: "2026-01-11T08:00:00.000Z",
  trainingCount: 5,
  sourceStats: {
    "Dailythanthi": 120,
    "Dinamalar": 104,
    "Thanthi TV": 100
  },
  oldestNews: "2025-12-13T08:15:00.000Z",
  newestNews: "2026-01-11T08:02:00.000Z"
}
```

### Manual Update (Force)

```bash
# In terminal
node -e "require('./backend/daily-news-trainer').performDailyUpdate()"
```

---

## 🐛 Troubleshooting

### Issue: News not updating
**Solution:** Check if `node-cron` is installed
```bash
npm install node-cron
```

### Issue: Getting 404 errors from websites
**Solution:** Update URLs in `sources` array - websites may have changed their structure

### Issue: Too many news items stored
**Solution:** Reduce `maxStoredDays` in configuration

### Issue: Slow performance with too much news
**Solution:** 
1. Reduce number of sources
2. Reduce `maxStoredDays` 
3. Change update frequency (less often)

---

## 📈 Sample Output

### Console Logs
```
========== DAILY NEWS UPDATE ==========
⏱️  Time: 1/11/2026, 8:00:15 AM
🔄 Starting daily news fetch...
📰 Fetching news from Dailythanthi...
✅ Found 45 headlines from Dailythanthi
📰 Fetching news from Dinamalar...
✅ Found 38 headlines from Dinamalar
📱 Fetching news from Thanthi TV...
✅ Found 32 headlines from Thanthi TV
📊 Total news items fetched: 115
✅ Saved 324 news items
📅 Last update: 2026-01-11T08:00:15.000Z
🧠 Training JARVIS with latest news...
✅ JARVIS trained with today's news
📰 News sources: Dailythanthi, Dinamalar, Thanthi TV
📊 Headlines stored: 324
========== UPDATE COMPLETE ==========
```

### JARVIS Chat Response
```
User: "What's the news today?"

JARVIS: "Here are today's top headlines:

📰 [Dailythanthi] Chief Minister announces new welfare scheme for farmers
📰 [Dinamalar] Tamil Nadu breaks record in renewable energy generation
📰 [Thanthi TV] College admissions process streamlined with new online portal

And 321 more stories from various Tamil news sources updated at 8:00 AM today."
```

---

## 🎯 Integration with KSRCE College Training

### Option 1: College-Specific News
Update sources to include KSRCE-related news:

```javascript
{
  name: 'KSRCE News',
  url: 'https://ksrce.ac.in/index.php/page?id=1070', // Newsletter
  category: 'college'
}
```

### Option 2: Course Updates
Add curriculum change notifications:

```javascript
{
  name: 'KSRCE Curriculum',
  url: 'https://ksrce.ac.in/index.php/page?id=539&item=481',
  category: 'academic'
}
```

---

## 📝 Example: Full Integration

Here's complete code to add to `backend/index.js`:

```javascript
// ===== DAILY NEWS TRAINER =====
const { 
  initializeNewsStorage, 
  startDailyUpdates, 
  getLatestNews,
  getTodayTraining,
  getNewsStats 
} = require('./daily-news-trainer');

// Initialize and start daily updates
initializeNewsStorage();
startDailyUpdates();

// New endpoint: Get today's news
app.get('/api/daily-news', apiLimiter, (req, res) => {
  try {
    const todayNews = getTodayTraining();
    const latestHeadlines = getLatestNews(10);
    const stats = getNewsStats();
    
    res.json({
      success: true,
      todayTraining: todayNews,
      headlines: latestHeadlines,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching daily news' });
  }
});

// New endpoint: Get news stats
app.get('/api/news-stats', apiLimiter, (req, res) => {
  try {
    const stats = getNewsStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching news stats' });
  }
});

// Enhance /api/chat with daily news context
app.post('/api/chat', apiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Load today's news
    const todayNews = getTodayTraining();
    const latestHeadlines = getLatestNews(3);
    
    let systemMessage = getSystemMessage();
    
    // Add news context
    if (todayNews) {
      systemMessage += `\n\n📰 TODAY'S NEWS:\n${todayNews.trainingPrompt}`;
    }
    
    if (latestHeadlines.length > 0) {
      systemMessage += `\n\n🔴 Latest Headlines:`;
      latestHeadlines.forEach(news => {
        systemMessage += `\n- [${news.source}] ${news.title}`;
      });
    }

    // Rest of chat logic...
    const response = await callAIAPI({
      system: systemMessage,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ answer: response.answer });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
});
```

---

## ✅ Verification Checklist

- [ ] `node-cron` installed: `npm list node-cron`
- [ ] `daily-news-trainer.js` created in backend folder
- [ ] 3 lines added to `backend/index.js` (initialize and start)
- [ ] `/api/daily-news` endpoint working
- [ ] `/api/news-stats` endpoint working
- [ ] First update runs automatically within 1 hour
- [ ] Check `backend/data/daily_news.json` file exists
- [ ] Check `backend/data/today_training.json` file exists
- [ ] JARVIS responds with today's news when asked

---

## 🎓 Demo Example (Jan 19)

```
Demo Show:
Judge: "What's the news in Tamil Nadu today?"

JARVIS: "Based on today's news fetch at 8:00 AM:

📰 TOP STORIES:
1. [Dailythanthi] Government announces new tech policy for startups
2. [Dinamalar] Universities gear up for spring admissions  
3. [Thanthi TV] Chennai records 28°C temperature, rain expected

Plus 321 more stories from Dailythanthi, Dinamalar, Thanthi TV, and other Tamil news sources, all automatically updated daily at 8 AM.

This system is live-trained daily with zero manual intervention."

Judge Reaction: "Wow, real-time news updates in the AI system!"
```

---

**Status:** ✅ Ready to implement  
**Time to integrate:** 15 minutes  
**Benefits:** Real-time news awareness for JARVIS  

This makes JARVIS even more impressive - it has KSRCE college knowledge + fresh daily Tamil news!
