const { spawn } = require('child_process');
const path = require('path');

class JARVISLiveSearch {
  constructor() {
    this.pythonScript = path.join(__dirname, 'jarvis-live-search.py');
  }

  /**
   * Execute Python search script
   */
  async runPythonSearch(functionName, query, maxResults = 5) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        this.pythonScript,
        functionName,
        query,
        maxResults.toString()
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process failed: ${stderr}`));
          return;
        }

        try {
          // Extract JSON from stdout (skip any print statements before JSON)
          const output = stdout.trim();
          const jsonStart = output.indexOf('{');
          const jsonEnd = output.lastIndexOf('}');
          
          if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('No JSON found in output');
          }
          
          const jsonString = output.substring(jsonStart, jsonEnd + 1);
          const result = JSON.parse(jsonString);
          resolve(result);
        } catch (error) {
          // If not JSON, return as text
          resolve({
            status: 'error',
            message: `Failed to parse JSON: ${error.message}`,
            output: stdout.trim(),
            query: query
          });
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Search for live news
   */
  async searchNews(query, maxResults = 5) {
    try {
      console.log(`📰 JARVIS: Fetching live news for "${query}"...`);
      const result = await this.runPythonSearch('news', query, maxResults);
      return result;
    } catch (error) {
      console.error('❌ News search error:', error.message);
      return {
        status: 'error',
        message: `Failed to search news: ${error.message}`,
        query: query
      };
    }
  }

  /**
   * General web search
   */
  async searchWeb(query, maxResults = 10) {
    try {
      console.log(`🔍 JARVIS: Performing web search for "${query}"...`);
      const result = await this.runPythonSearch('web', query, maxResults);
      return result;
    } catch (error) {
      console.error('❌ Web search error:', error.message);
      return {
        status: 'error',
        message: `Failed to search web: ${error.message}`,
        query: query
      };
    }
  }

  /**
   * Combined search (news + web)
   */
  async comprehensiveSearch(query) {
    try {
      console.log(`🔍📰 JARVIS: Performing comprehensive search for "${query}"...`);

      const [newsResult, webResult] = await Promise.all([
        this.searchNews(query, 3),
        this.searchWeb(query, 5)
      ]);

      return {
        status: 'success',
        query: query,
        news: newsResult,
        web: webResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Comprehensive search error:', error.message);
      return {
        status: 'error',
        message: `Failed to perform comprehensive search: ${error.message}`,
        query: query
      };
    }
  }
}

module.exports = JARVISLiveSearch;