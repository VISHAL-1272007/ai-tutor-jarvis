#!/usr/bin/env node

/**
 * API Keys Diagnostic Tool
 * Checks if required API keys are configured in backend/.env
 */

require('dotenv').config({ path: require('path').join(__dirname, 'backend', '.env') });

console.log('\n🔍 JARVIS AI Tutor - API Keys Diagnostic\n');
console.log('━'.repeat(60));

const requiredKeys = [
    { name: 'GROQ_API_KEY', required: true, description: 'Groq AI (Primary chat API)' },
    { name: 'GEMINI_API_KEY', required: false, description: 'Google Gemini (Backup AI)' },
    { name: 'OPENROUTER_API_KEY', required: false, description: 'OpenRouter (Backup AI)' },
    { name: 'HUGGINGFACE_API_KEY', required: false, description: 'Hugging Face (Backup AI)' },
    { name: 'AIML_API_KEY', required: false, description: 'AI/ML API (Backup AI)' },
    { name: 'STABILITY_API_KEY', required: false, description: 'Stability AI (Image generation)' },
    { name: 'YOUTUBE_API_KEY', required: false, description: 'YouTube Data API (Video search)' },
    { name: 'PEXELS_API_KEY', required: false, description: 'Pexels API (Stock videos)' },
    { name: 'PIXABAY_API_KEY', required: false, description: 'Pixabay API (Stock videos)' },
    { name: 'ELEVENLABS_API_KEY', required: false, description: 'ElevenLabs (Text-to-speech)' },
    { name: 'GITHUB_API_TOKEN', required: false, description: 'GitHub API (Code integration)' },
    { name: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth (Authentication)' },
    { name: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth (Authentication)' },
];

let hasErrors = false;
let configured = 0;
let total = 0;

requiredKeys.forEach(({ name, required, description }) => {
    const value = process.env[name];
    const isSet = value && value !== `your_${name.toLowerCase()}_here` && value.length > 10;
    
    total++;
    if (isSet) configured++;
    
    const status = isSet ? '✅' : (required ? '❌' : '⚠️');
    const label = required ? '(REQUIRED)' : '(Optional)';
    
    console.log(`${status} ${name.padEnd(25)} ${label.padEnd(12)} - ${description}`);
    
    if (!isSet && required) {
        hasErrors = true;
        console.log(`   └─> Missing! Get it from the provider and add to backend/.env`);
    }
});

console.log('━'.repeat(60));
console.log(`\n📊 Summary: ${configured}/${total} API keys configured`);

if (hasErrors) {
    console.log('\n❌ ERROR: Required API keys are missing!');
    console.log('   → Add them to backend/.env file');
    console.log('   → See backend/.env.example for template\n');
    process.exit(1);
} else {
    console.log('\n✅ All required API keys are configured!');
    if (configured < total) {
        console.log(`   💡 Tip: Configure optional keys for more features\n`);
    } else {
        console.log('   🎉 All features unlocked!\n');
    }
    process.exit(0);
}
