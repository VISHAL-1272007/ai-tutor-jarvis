/**
 * ===== JARVIS FULL POWER ENDPOINTS =====
 * Add this to your backend/index.js at the end before startServer()
 */

// ⭐ FULL POWER ENDPOINTS

// 1. Multi-AI Consensus
app.post('/full-power/consensus', async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🌐 JARVIS Full Power: Multi-AI Consensus for "${question.substring(0, 50)}..."`);
    const result = await jarvisFullPower.multiAIConsensus(question, context);
    
    res.json({
      success: true,
      data: {
        bestAnswer: result.bestAnswer,
        consensus: result.allResponses,
        bestAI: result.bestAI,
        scores: result.scores,
        reasoning: result.reasoning,
      },
    });
  } catch (error) {
    console.error('❌ Consensus error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Real-time Search
app.post('/full-power/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    console.log(`🔍 JARVIS: Real-time search for "${query}"...`);
    const results = await jarvisFullPower.realtimeSearch(query);
    
    res.json({
      success: true,
      data: {
        results,
        query,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Image Generation
app.post('/full-power/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    console.log(`🎨 JARVIS: Generating image...`);
    const result = await jarvisFullPower.generateImage(prompt, process.env.STABILITY_API_KEY);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Audio Generation (Text-to-Speech)
app.post('/full-power/generate-audio', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    console.log(`🔊 JARVIS: Generating audio...`);
    const audioBuffer = await jarvisFullPower.generateAudio(text, process.env.ELEVENLABS_API_KEY);
    
    if (audioBuffer) {
      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } else {
      res.status(500).json({ success: false, error: 'Audio generation failed' });
    }
  } catch (error) {
    console.error('❌ Audio generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Speech-to-Text (Transcription)
app.post('/full-power/transcribe', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL required' });
    }

    console.log(`🎤 JARVIS: Transcribing audio...`);
    const transcript = await jarvisFullPower.transcribeAudio(audioUrl, process.env.DEEPGRAM_API_KEY);
    
    res.json({
      success: true,
      data: {
        transcript,
        audioUrl,
      },
    });
  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Groq Only (Fastest)
app.post('/full-power/fast-groq', async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`⚡ JARVIS Groq: Fastest response...`);
    const answer = await jarvisFullPower.queryGroq(question, context);
    
    res.json({
      success: true,
      data: {
        answer,
        model: 'Groq (Mixtral 8x7B)',
        speed: 'FASTEST',
      },
    });
  } catch (error) {
    console.error('❌ Groq error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. OpenRouter Claude (Smarter)
app.post('/full-power/smart-claude', async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🧠 JARVIS Claude: Smart response...`);
    const answer = await jarvisFullPower.queryOpenRouter(question, context, 'claude');
    
    res.json({
      success: true,
      data: {
        answer,
        model: 'Claude 3 Opus',
        intelligence: 'MAXIMUM',
      },
    });
  } catch (error) {
    console.error('❌ Claude error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ====== WOLFRAM ALPHA ENDPOINTS ======

// 8. WolframAlpha Query (Math, Physics, Chemistry, Data)
app.post('/full-power/wolfram', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🧮 JARVIS: WolframAlpha Query - "${question.substring(0, 50)}..."`);
    const result = await jarvisFullPower.queryWolfram(question);
    
    res.json({
      success: result.success,
      data: result,
      source: 'WolframAlpha',
    });
  } catch (error) {
    console.error('❌ WolframAlpha error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Math Problem Solver
app.post('/full-power/solve-math', async (req, res) => {
  try {
    const { problem } = req.body;
    
    if (!problem) {
      return res.status(400).json({ error: 'Problem required' });
    }

    console.log(`📐 JARVIS: Math Problem - "${problem.substring(0, 50)}..."`);
    const result = await jarvisFullPower.solveMath(problem);
    
    res.json({
      success: true,
      data: result,
      category: 'mathematics',
    });
  } catch (error) {
    console.error('❌ Math solver error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Physics Problem Solver
app.post('/full-power/solve-physics', async (req, res) => {
  try {
    const { problem } = req.body;
    
    if (!problem) {
      return res.status(400).json({ error: 'Problem required' });
    }

    console.log(`⚡ JARVIS: Physics Problem - "${problem.substring(0, 50)}..."`);
    const result = await jarvisFullPower.solvePhysics(problem);
    
    res.json({
      success: true,
      data: result,
      category: 'physics',
    });
  } catch (error) {
    console.error('❌ Physics solver error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Chemistry Problem Solver
app.post('/full-power/solve-chemistry', async (req, res) => {
  try {
    const { problem } = req.body;
    
    if (!problem) {
      return res.status(400).json({ error: 'Problem required' });
    }

    console.log(`🧪 JARVIS: Chemistry Problem - "${problem.substring(0, 50)}..."`);
    const result = await jarvisFullPower.solveChemistry(problem);
    
    res.json({
      success: true,
      data: result,
      category: 'chemistry',
    });
  } catch (error) {
    console.error('❌ Chemistry solver error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Unit Conversion
app.post('/full-power/convert', async (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'From and To required' });
    }

    console.log(`🔄 JARVIS: Convert ${from} to ${to}`);
    const result = await jarvisFullPower.convert(from, to);
    
    res.json({
      success: result.success,
      data: result,
      conversion: `${from} = ${result.answer}`,
    });
  } catch (error) {
    console.error('❌ Conversion error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. Hybrid Query (WolframAlpha + AI Explanation)
app.post('/full-power/hybrid-query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`🚀 JARVIS: Hybrid Query - "${question.substring(0, 50)}..."`);
    const result = await jarvisFullPower.hybridQuery(question);
    
    res.json({
      success: true,
      data: result,
      sources: ['WolframAlpha', 'Gemini', 'Groq'],
    });
  } catch (error) {
    console.error('❌ Hybrid query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 14. Factual Query
app.post('/full-power/query-fact', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    console.log(`📚 JARVIS: Factual Query - "${question.substring(0, 50)}..."`);
    const result = await jarvisFullPower.queryFact(question);
    
    res.json({
      success: result.success,
      data: result,
      accuracy: 'High',
    });
  } catch (error) {
    console.error('❌ Factual query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log(`✅ JARVIS Full Power endpoints loaded!`);

