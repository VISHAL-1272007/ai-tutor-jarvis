// Daily News Scraper & JARVIS Trainer
// Purpose: Automatically fetch and train JARVIS with daily Tamil news
// Schedule: Runs daily at 8 AM to fetch latest news from Dinamalar, Dailythanthi, etc.

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Daily News Configuration
const NEWS_CONFIG = {
  sources: [
    {
      name: 'Dailythanthi',
      url: 'https://www.dailythanthi.com/News',
      category: 'general'
    },
    {
      name: 'Dinamalar',
      url: 'https://www.dinamalar.com/',
      category: 'general'
    },
    {
      name: 'Thanthi TV',
      url: 'https://www.thanthitv.com/news',
      category: 'tv'
    }
  ],
  updateTime: '08:00', // 8 AM daily
  dataFile: path.join(__dirname, '../data/daily_news.json'),
  backupFolder: path.join(__dirname, '../data/news_backups'),
  maxStoredDays: 30, // Keep last 30 days of news
  updateFrequency: '0 8 * * *' // Cron: 8 AM every day
};

// Initialize data storage
const initializeNewsStorage = () => {
  const dataDir = path.dirname(NEWS_CONFIG.dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(NEWS_CONFIG.backupFolder)) {
    fs.mkdirSync(NEWS_CONFIG.backupFolder, { recursive: true });
  }
  
  if (!fs.existsSync(NEWS_CONFIG.dataFile)) {
    const initialData = {
      lastUpdate: null,
      news: [],
      trainingCount: 0
    };
    fs.writeFileSync(NEWS_CONFIG.dataFile, JSON.stringify(initialData, null, 2));
  }
};

// Scrape news from website
const scrapeNews = async (source) => {
  try {
    console.log(`📰 Fetching news from ${source.name}...`);
    
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // Parse HTML and extract headlines
    const newsItems = [];
    
    // Simple extraction (you may need to customize based on actual HTML structure)
    const headlineRegex = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
    let match;
    
    while ((match = headlineRegex.exec(response.data)) !== null) {
      const headline = match[1].trim();
      if (headline.length > 10 && headline.length < 500) {
        newsItems.push({
          title: headline,
          source: source.name,
          category: source.category,
          timestamp: new Date().toISOString(),
          url: source.url
        });
      }
    }

    console.log(`✅ Found ${newsItems.length} headlines from ${source.name}`);
    return newsItems;

  } catch (error) {
    console.error(`❌ Error scraping ${source.name}:`, error.message);
    return [];
  }
};

// Fetch news from all sources
const fetchAllNews = async () => {
  console.log('🔄 Starting daily news fetch...');
  const allNews = [];

  for (const source of NEWS_CONFIG.sources) {
    const news = await scrapeNews(source);
    allNews.push(...news);
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`📊 Total news items fetched: ${allNews.length}`);
  return allNews;
};

// Save news to file
const saveNews = (newsItems) => {
  try {
    const currentData = JSON.parse(fs.readFileSync(NEWS_CONFIG.dataFile, 'utf8'));
    
    // Add new news items
    currentData.news.unshift(...newsItems);
    
    // Remove duplicates based on title
    const uniqueTitles = new Set();
    currentData.news = currentData.news.filter(item => {
      if (uniqueTitles.has(item.title)) {
        return false;
      }
      uniqueTitles.add(item.title);
      return true;
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    currentData.news = currentData.news.filter(item => 
      new Date(item.timestamp) > thirtyDaysAgo
    );

    // Update metadata
    currentData.lastUpdate = new Date().toISOString();
    currentData.trainingCount = (currentData.trainingCount || 0) + 1;

    // Backup old file
    const backupFile = path.join(
      NEWS_CONFIG.backupFolder,
      `news_backup_${new Date().getTime()}.json`
    );
    fs.copyFileSync(NEWS_CONFIG.dataFile, backupFile);

    // Save updated file
    fs.writeFileSync(NEWS_CONFIG.dataFile, JSON.stringify(currentData, null, 2));
    
    console.log(`✅ Saved ${currentData.news.length} news items`);
    console.log(`📅 Last update: ${currentData.lastUpdate}`);
    
    return currentData;

  } catch (error) {
    console.error('❌ Error saving news:', error.message);
  }
};

// Train JARVIS with news content
const trainJarvisWithNews = (newsData) => {
  try {
    console.log('🧠 Training JARVIS with latest news...');
    
    // Create training prompt from news
    const newsSummary = newsData.news.slice(0, 20).map(item => 
      `📰 [${item.source}] ${item.title}`
    ).join('\n');

    const trainingContent = {
      timestamp: new Date().toISOString(),
      newsCount: newsData.news.length,
      sources: [...new Set(newsData.news.map(n => n.source))],
      headlines: newsSummary,
      trainingPrompt: `Today's news includes: ${newsSummary}. When asked about current news, refer to these headlines.`
    };

    // Store training data
    const trainingFile = path.join(__dirname, '../data/today_training.json');
    fs.writeFileSync(trainingFile, JSON.stringify(trainingContent, null, 2));

    console.log('✅ JARVIS trained with today\'s news');
    console.log(`📰 News sources: ${trainingContent.sources.join(', ')}`);
    console.log(`📊 Headlines stored: ${trainingContent.newsCount}`);

    return trainingContent;

  } catch (error) {
    console.error('❌ Error training JARVIS:', error.message);
  }
};

// Get latest news for JARVIS responses
const getLatestNews = (count = 5) => {
  try {
    if (!fs.existsSync(NEWS_CONFIG.dataFile)) {
      return [];
    }

    const data = JSON.parse(fs.readFileSync(NEWS_CONFIG.dataFile, 'utf8'));
    return data.news.slice(0, count);

  } catch (error) {
    console.error('❌ Error reading news:', error.message);
    return [];
  }
};

// Get today's training content
const getTodayTraining = () => {
  try {
    const trainingFile = path.join(__dirname, '../data/today_training.json');
    if (fs.existsSync(trainingFile)) {
      return JSON.parse(fs.readFileSync(trainingFile, 'utf8'));
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Daily update scheduler
const startDailyUpdates = () => {
  console.log('⏰ Setting up daily news scheduler...');
  
  // Initialize storage first
  initializeNewsStorage();
  
  // Run immediately on startup
  performDailyUpdate();

  // Schedule daily update at 8 AM
  cron.schedule(NEWS_CONFIG.updateFrequency, () => {
    console.log('⏰ Daily news update time reached!');
    performDailyUpdate();
  });

  console.log(`✅ Daily updates scheduled for 8:00 AM every day`);
};

// Perform daily update
const performDailyUpdate = async () => {
  console.log('\n========== DAILY NEWS UPDATE ==========');
  console.log(`⏱️  Time: ${new Date().toLocaleString()}`);
  
  // Step 1: Fetch news
  const newsItems = await fetchAllNews();
  
  // Step 2: Save to storage
  const savedData = saveNews(newsItems);
  
  // Step 3: Train JARVIS
  if (savedData) {
    trainJarvisWithNews(savedData);
  }
  
  console.log('========== UPDATE COMPLETE ==========\n');
};

// Get news statistics
const getNewsStats = () => {
  try {
    const data = JSON.parse(fs.readFileSync(NEWS_CONFIG.dataFile, 'utf8'));
    
    const sourceStats = {};
    data.news.forEach(item => {
      sourceStats[item.source] = (sourceStats[item.source] || 0) + 1;
    });

    return {
      totalNews: data.news.length,
      lastUpdate: data.lastUpdate,
      trainingCount: data.trainingCount,
      sourceStats: sourceStats,
      oldestNews: data.news[data.news.length - 1]?.timestamp,
      newestNews: data.news[0]?.timestamp
    };

  } catch (error) {
    return null;
  }
};

// Module exports
module.exports = {
  initializeNewsStorage,
  startDailyUpdates,
  getLatestNews,
  getTodayTraining,
  getNewsStats,
  performDailyUpdate,
  NEWS_CONFIG
};

// If run directly
if (require.main === module) {
  initializeNewsStorage();
  startDailyUpdates();
  
  // Show stats every hour
  setInterval(() => {
    const stats = getNewsStats();
    if (stats) {
      console.log('📊 Current news statistics:');
      console.log(`   Total news: ${stats.totalNews}`);
      console.log(`   Last update: ${stats.lastUpdate}`);
      console.log(`   Training cycles: ${stats.trainingCount}`);
    }
  }, 60 * 60 * 1000); // Every hour
}
