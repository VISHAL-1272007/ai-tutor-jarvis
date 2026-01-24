const axios = require('axios');
const cheerio = require('cheerio');

class DeepScraper {
    async scrapeFullContent(url) {
        try {
            const { data } = await axios.get(url, { 
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
            });
            const $ = cheerio.load(data);
            $('script, style, nav, footer, header, .ads, .sidebar').remove();
            let textContent = $('article, main, .content, #main-content').text().trim();
            if (!textContent) textContent = $('body').text().trim();
            return textContent.replace(/\s+/g, ' ').substring(0, 8000);
        } catch (error) {
            return null;
        }
    }

    async getDeepInsight(searchResults) {
        console.log("🧠 JARVIS: Performing Deep Research on top sources...");
        const topLinks = searchResults.slice(0, 3); 
        const scrapePromises = topLinks.map(link => this.scrapeFullContent(link.url || link.link));
        const scrapedContents = await Promise.all(scrapePromises);
        return scrapedContents.filter(content => content !== null).join("\n\n---\n\n");
    }
}

module.exports = DeepScraper;