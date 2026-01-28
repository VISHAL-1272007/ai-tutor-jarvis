#!/usr/bin/env node

/**
 * JARVIS Full-Stack Health Check
 * Verifies all 5 critical fixes are properly applied
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: []
};

function checkFile(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(searchString)) {
      checks.passed.push(`✅ ${description}`);
      return true;
    } else {
      checks.failed.push(`❌ ${description} - Pattern not found`);
      return false;
    }
  } catch (error) {
    checks.failed.push(`❌ ${description} - File not found: ${filePath}`);
    return false;
  }
}

console.log('🔍 JARVIS Full-Stack Debug Verification\n');
console.log('=' .repeat(60));

// Check 1: Backend URL Detection
console.log('\n1️⃣  ENDPOINT VERIFICATION');
console.log('-'.repeat(60));
checkFile(
  'ai-tutor/frontend/jarvis-chat.jsx',
  'const getBackendURL = () =>',
  'Dynamic backend URL detection in jarvis-chat.jsx'
);
checkFile(
  'ai-tutor/frontend/jarvis-chat.jsx',
  "return 'https://jarvis-python-ml-service.onrender.com/api/jarvis/ask'",
  'Production backend URL configured'
);

// Check 2: CORS Configuration
console.log('\n2️⃣  CORS HANDLING');
console.log('-'.repeat(60));
checkFile(
  'ai-tutor/python-backend/app.py',
  'CORS(app, resources={',
  'Comprehensive CORS configuration'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  '"origins": [',
  'CORS origins whitelist configured'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  '"supports_credentials": True',
  'CORS credentials support enabled'
);

// Check 3: Error Handling
console.log('\n3️⃣  AGENTIC LOGIC DEBUG');
console.log('-'.repeat(60));
checkFile(
  'ai-tutor/python-backend/app.py',
  'try:\n        intent = classify_intent(user_query)',
  'Try-except around classify_intent'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  'try:\n            research = conduct_research',
  'Try-except around conduct_research'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  'try:\n        conflicts = detect_conflicts',
  'Try-except around detect_conflicts'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  'try:\n        final_response = generate_final_response',
  'Try-except around generate_final_response'
);

// Check 4: API Key Health
console.log('\n4️⃣  API KEY HEALTH CHECK');
console.log('-'.repeat(60));
checkFile(
  'ai-tutor/python-backend/app.py',
  'if not GROQ_API_KEY:',
  'GROQ_API_KEY validation at endpoint'
);
checkFile(
  'ai-tutor/python-backend/app.py',
  'return jsonify({"success": False, "error": "Groq API key not configured"}), 503',
  'Returns 503 if API key missing'
);

// Check 5: Loading State
console.log('\n5️⃣  UI LOADING STATE');
console.log('-'.repeat(60));
checkFile(
  'ai-tutor/frontend/Layout.jsx',
  'const [isLoading, setIsLoading] = useState(false)',
  'Loading state in FloatingInputBar'
);
checkFile(
  'ai-tutor/frontend/Layout.jsx',
  "isLoading ? '⟳ Thinking...' : 'Send'",
  'Loading indicator on Send button'
);
checkFile(
  'ai-tutor/frontend/jarvis-chat.jsx',
  'if (!query.trim() || isLoading) return',
  'Double-submit prevention'
);
checkFile(
  'ai-tutor/frontend/jarvis-chat.jsx',
  'console.log(\'📤 Sending query to:\', BACKEND_URL)',
  'Debug logging for API calls'
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Passed: ${checks.passed.length}`);
checks.passed.forEach(check => console.log(`   ${check}`));

if (checks.failed.length > 0) {
  console.log(`\n❌ Failed: ${checks.failed.length}`);
  checks.failed.forEach(check => console.log(`   ${check}`));
  process.exit(1);
} else {
  console.log('\n🎉 All 5 critical fixes verified successfully!');
  console.log('\nNext Steps:');
  console.log('1. Deploy frontend to Firebase: firebase deploy');
  console.log('2. Test backend health: curl https://jarvis-python-ml-service.onrender.com/health');
  console.log('3. Send test query at: https://vishai-f6197.web.app');
  console.log('4. Check browser console (F12) for 📤 and ✅ logs');
  process.exit(0);
}
