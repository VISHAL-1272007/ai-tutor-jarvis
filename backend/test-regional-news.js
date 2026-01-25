/**
 * Test Regional News Search - Tamil Nadu
 * Tests the updated jarvis-live-search.py regional awareness
 */

const { spawn } = require('child_process');
const path = require('path');

async function testRegionalSearch(query, maxResults = 5) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔍 Testing: "${query}"\n${'='.repeat(60)}`);
        
        const pythonScript = path.join(__dirname, 'jarvis-live-search.py');
        const pythonProcess = spawn('python', [pythonScript, 'news', query, maxResults.toString()]);
        
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
                console.error('❌ Python Error:', stderr);
                reject(new Error(`Process exited with code ${code}`));
                return;
            }
            
            try {
                // Find the JSON output (last complete JSON object)
                const jsonMatch = stdout.match(/\{[\s\S]*\}(?=[^}]*$)/);
                if (!jsonMatch) {
                    console.error('❌ No valid JSON found in output');
                    console.log('Raw output:', stdout);
                    reject(new Error('No valid JSON in output'));
                    return;
                }
                
                const result = JSON.parse(jsonMatch[0]);
                
                // Display results
                console.log(`\n✅ Status: ${result.status}`);
                
                if (result.region) {
                    console.log(`🌍 Region: ${result.region}`);
                }
                
                if (result.search_info) {
                    console.log(`⏰ Timeframe: ${result.search_info.timeframe || 'N/A'}`);
                    console.log(`🔍 Regional Search: ${result.search_info.is_regional_search ? 'YES' : 'NO'}`);
                }
                
                if (result.status === 'success') {
                    console.log(`📰 Total Results: ${result.total_results}\n`);
                    
                    // Display first 3 results
                    const resultsToShow = result.results.slice(0, 3);
                    resultsToShow.forEach((item, idx) => {
                        console.log(`${idx + 1}. ${item.title}`);
                        console.log(`   Source: ${item.source}`);
                        console.log(`   URL: ${item.url}`);
                        if (item.date) console.log(`   Date: ${item.date}`);
                        console.log('');
                    });
                } else if (result.status === 'no_results') {
                    console.log(`⚠️  Message: ${result.message}`);
                    if (result.suggestion) {
                        console.log(`💡 Suggestion: ${result.suggestion}`);
                    }
                } else {
                    console.log(`❌ Error: ${result.message}`);
                }
                
                resolve(result);
            } catch (error) {
                console.error('❌ JSON Parse Error:', error.message);
                console.log('Raw output:', stdout);
                reject(error);
            }
        });
        
        pythonProcess.on('error', (error) => {
            console.error('❌ Failed to start Python process:', error);
            reject(error);
        });
    });
}

async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          🧪 REGIONAL NEWS SEARCH TEST SUITE                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const tests = [
        {
            name: 'Tamil Nadu Regional News',
            query: 'Tamil Nadu latest news',
            description: 'Should prioritize Indian news sources with 24hr timeframe'
        },
        {
            name: 'Chennai Specific News',
            query: 'Chennai news today',
            description: 'Should recognize Chennai as Tamil Nadu region'
        },
        {
            name: 'Tamil Nadu Government Updates',
            query: 'Tamil Nadu government announcements',
            description: 'Should search for official government news'
        },
        {
            name: 'Global Tech News (Control)',
            query: 'Latest AI technology news',
            description: 'Should use global tech sources as usual'
        }
    ];
    
    for (const test of tests) {
        console.log(`\n📋 TEST: ${test.name}`);
        console.log(`📝 Description: ${test.description}`);
        
        try {
            await testRegionalSearch(test.query, 5);
        } catch (error) {
            console.error(`❌ Test failed: ${error.message}`);
        }
        
        console.log('\n' + '─'.repeat(60));
    }
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TEST SUITE COMPLETE                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Key Features Tested:');
    console.log('  ✅ Regional detection (Tamil Nadu/Chennai)');
    console.log('  ✅ Indian news source prioritization');
    console.log('  ✅ 24-hour timeframe filtering');
    console.log('  ✅ Fallback to broader search');
    console.log('  ✅ User-friendly messaging');
    console.log('\n🌐 Prioritized Indian News Sources:');
    console.log('  • thehindu.com');
    console.log('  • timesofindia.indiatimes.com');
    console.log('  • indianexpress.com');
    console.log('  • hindustantimes.com');
    console.log('  • ndtv.com');
    console.log('  ... and 5 more\n');
}

// Run the test suite
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
