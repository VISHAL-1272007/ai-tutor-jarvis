// Simple test without loading the full server
const { spawn } = require('child_process');
const path = require('path');

async function testSearchDirectly() {
    try {
        console.log('🧪 Testing JARVISLiveSearch Python script directly...');

        const pythonScript = path.join(__dirname, 'jarvis-live-search.py');

        // Test news search
        console.log('🔍 Testing news search...');
        const newsProcess = spawn('python', [pythonScript, 'news', 'AI technology 2024', '2']);

        let newsOutput = '';
        newsProcess.stdout.on('data', (data) => {
            newsOutput += data.toString();
        });

        await new Promise((resolve, reject) => {
            newsProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ News search completed');
                    const lines = newsOutput.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    if (lastLine.startsWith('{')) {
                        const result = JSON.parse(lastLine);
                        console.log('News results:', result.total_results || 0);
                    }
                    resolve();
                } else {
                    reject(new Error('News search failed'));
                }
            });
        });

        // Test web search
        console.log('🌐 Testing web search...');
        const webProcess = spawn('python', [pythonScript, 'web', 'Python programming', '2']);

        let webOutput = '';
        webProcess.stdout.on('data', (data) => {
            webOutput += data.toString();
        });

        await new Promise((resolve, reject) => {
            webProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Web search completed');
                    const lines = webOutput.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    if (lastLine.startsWith('{')) {
                        const result = JSON.parse(lastLine);
                        console.log('Web results:', result.total_results || 0);
                    }
                    resolve();
                } else {
                    reject(new Error('Web search failed'));
                }
            });
        });

        console.log('✅ All search functions working!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSearchDirectly();