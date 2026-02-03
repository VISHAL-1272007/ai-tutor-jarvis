/**
 * JARVIS Resilient Agent - Node.js Wrapper
 * Executes Python jarvis_standalone.py via child_process
 * Zero-failure logic with automatic fallbacks
 */

const { spawn } = require('child_process');
const path = require('path');

class JARVISResilientWrapper {
    constructor() {
        this.pythonPath = process.env.PYTHON_PATH || 'python3';
        this.scriptPath = path.join(__dirname, 'jarvis_standalone.py');
        this.available = false;
        this._checkAvailability();
    }

    async _checkAvailability() {
        try {
            const result = await this._runPython('{"action": "health"}');
            this.available = result.success;
            console.log('✅ JARVIS Resilient Agent available');
        } catch (error) {
            console.warn('⚠️ JARVIS Resilient Agent not available:', error.message);
            this.available = false;
        }
    }

    async _runPython(input) {
        return new Promise((resolve, reject) => {
            const python = spawn(this.pythonPath, [this.scriptPath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(`Failed to parse Python output: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                }
            });

            python.on('error', (error) => {
                reject(new Error(`Failed to start Python process: ${error.message}`));
            });

            // Send input to Python
            python.stdin.write(input);
            python.stdin.end();
        });
    }

    async processQuery(query) {
        try {
            const input = JSON.stringify({
                action: 'query',
                query: query
            });

            const result = await this._runPython(input);

            return {
                success: true,
                answer: result.answer,
                source: result.source,
                used_search: result.used_search,
                confidence: result.confidence,
                resources: result.resources || []
            };

        } catch (error) {
            console.error('❌ JARVIS Error:', error.message);
            
            // Zero-failure fallback
            return {
                success: false,
                answer: "I'm experiencing technical difficulties. The AI service is temporarily unavailable. Please try again in a moment.",
                source: 'error',
                used_search: false,
                confidence: 0,
                resources: [],
                error: error.message
            };
        }
    }

    async getStatistics() {
        try {
            const input = JSON.stringify({ action: 'stats' });
            const result = await this._runPython(input);
            return result;
        } catch (error) {
            return { available: false, error: error.message };
        }
    }

    isAvailable() {
        return this.available;
    }
}

// Singleton instance
let jarvisInstance = null;

function getJARVISInstance() {
    if (!jarvisInstance) {
        jarvisInstance = new JARVISResilientWrapper();
    }
    return jarvisInstance;
}

module.exports = { JARVISResilientWrapper, getJARVISInstance };
