const { spawn } = require('child_process');
const path = require('path');

class SemanticVerifier {
  constructor() {
    this.pythonScript = path.join(__dirname, 'semantic-verifier.py');
  }

  /**
   * Verify semantic similarity between Groq's answer and live search results
   * @param {string} groqAnswer - The answer from Groq
   * @param {string} searchResultsText - The text from live search results
   * @param {number} threshold - Similarity threshold (default 0.5)
   * @returns {Promise<Object>} Verification result with similarity score
   */
  async verifyAnswer(groqAnswer, searchResultsText, threshold = 0.5) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        this.pythonScript,
        groqAnswer,
        searchResultsText,
        threshold.toString()
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
          console.error('❌ Semantic verification failed:', stderr);
          return resolve({
            status: 'error',
            message: `Python process failed: ${stderr}`,
            similarity_score: 0.0,
            is_verified: false,
            verdict: 'ERROR'
          });
        }

        try {
          // Extract JSON from stdout
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
          console.error('❌ Failed to parse verification result:', error.message);
          resolve({
            status: 'error',
            message: `Failed to parse JSON: ${error.message}`,
            similarity_score: 0.0,
            is_verified: false,
            verdict: 'ERROR'
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Python process error:', error.message);
        resolve({
          status: 'error',
          message: `Process error: ${error.message}`,
          similarity_score: 0.0,
          is_verified: false,
          verdict: 'ERROR'
        });
      });
    });
  }

  /**
   * Format verification result for display
   */
  formatVerificationBadge(verificationResult, searchResults) {
    if (!verificationResult || verificationResult.verdict === 'ERROR') {
      return '';
    }

    const { similarity_score, is_verified, verdict } = verificationResult;
    
    if (is_verified) {
      return `\n\n---\n\n✅ **Verified with Live Data** (Similarity: ${(similarity_score * 100).toFixed(1)}%)`;
    } else {
      // Build sources list
      let sourcesText = '';
      if (searchResults && searchResults.results && searchResults.results.length > 0) {
        sourcesText = '\n\n📰 **Live 2026 Sources:**\n';
        searchResults.results.slice(0, 3).forEach((result, i) => {
          sourcesText += `${i + 1}. [${result.title}](${result.url})\n`;
        });
      }

      return `\n\n---\n\n⚠️ **Potentially Outdated** (Similarity: ${(similarity_score * 100).toFixed(1)}%)\n\n*This answer may be based on older training data. Please refer to the live 2026 sources below for the most current information.*${sourcesText}`;
    }
  }
}

module.exports = SemanticVerifier;
