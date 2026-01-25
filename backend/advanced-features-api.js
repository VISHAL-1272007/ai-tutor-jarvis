/**
 * ===== API ENDPOINTS FOR USER PROFILES, KNOWLEDGE BASE & EXPERT MODE =====
 * Integrates all three systems with the Express backend
 */

const express = require('express');
const multer = require('multer');
const path = require('path');

module.exports = function setupAdvancedFeatures(app, userProfileSystem, knowledgeBaseSystem, expertModeSystem) {
  // ===== CONFIGURE FILE UPLOAD =====
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!require('fs').existsSync(uploadsDir)) {
        require('fs').mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowed = ['.txt', '.pdf', '.docx', '.md', '.json'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${ext} not supported`));
      }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  });

  // ===== USER PROFILE ENDPOINTS =====

  /**
   * GET /api/user/profile - Get or create user profile
   */
  app.get('/api/user/profile', (req, res) => {
    try {
      const userId = req.query.userId || req.session?.userId;
      const profile = userProfileSystem.getOrCreateUser(userId);

      // Store in session
      if (req.session) {
        req.session.userId = profile.userId;
      }

      res.json({
        success: true,
        profile,
        summary: userProfileSystem.getUserSummary(profile.userId)
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/user/expertise - Add expertise area
   */
  app.post('/api/user/expertise', (req, res) => {
    try {
      const { userId, area, level = 'intermediate' } = req.body;

      if (!area) {
        return res.status(400).json({ success: false, error: 'Expertise area required' });
      }

      const profile = userProfileSystem.addExpertiseArea(userId, area, level);
      res.json({
        success: true,
        message: `Added expertise: ${area}`,
        profile
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/user/preferences - Update user preferences
   */
  app.post('/api/user/preferences', (req, res) => {
    try {
      const { userId, preferences } = req.body;
      const profile = userProfileSystem.updatePreferences(userId, preferences);
      res.json({
        success: true,
        message: 'Preferences updated',
        profile
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/user/context - Get user context for AI
   */
  app.get('/api/user/context', (req, res) => {
    try {
      const userId = req.query.userId;
      const summary = userProfileSystem.getUserSummary(userId);
      const context = userProfileSystem.getExpertiseContext(userId);

      res.json({
        success: true,
        summary,
        context
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== KNOWLEDGE BASE ENDPOINTS =====

  /**
   * POST /api/knowledge/upload - Upload document
   */
  app.post('/api/knowledge/upload', upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const docRecord = await knowledgeBaseSystem.uploadDocument(
        userId,
        req.file.path,
        req.file.originalname
      );

      // Record in user profile
      userProfileSystem.recordDocumentUpload(userId, req.file.originalname, docRecord.tokenEstimate);

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        document: docRecord
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/knowledge/search - Search knowledge base
   */
  app.get('/api/knowledge/search', (req, res) => {
    try {
      const { userId, query, limit = 5 } = req.query;

      if (!userId || !query) {
        return res.status(400).json({ success: false, error: 'User ID and query required' });
      }

      const results = knowledgeBaseSystem.searchDocuments(userId, query, parseInt(limit));
      res.json({
        success: true,
        query,
        resultsCount: results.length,
        results
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/knowledge/documents - Get all user documents
   */
  app.get('/api/knowledge/documents', (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const documents = knowledgeBaseSystem.getUserDocuments(userId);
      res.json({
        success: true,
        documentCount: documents.length,
        documents
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * DELETE /api/knowledge/document/:docId - Delete document
   */
  app.delete('/api/knowledge/document/:docId', (req, res) => {
    try {
      const { docId } = req.params;
      knowledgeBaseSystem.deleteDocument(docId);
      res.json({
        success: true,
        message: 'Document deleted'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/knowledge/context - Get knowledge context for AI
   */
  app.get('/api/knowledge/context', (req, res) => {
    try {
      const { userId, query } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const context = knowledgeBaseSystem.getKnowledgeContext(userId, query || '');
      res.json({
        success: true,
        context
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ===== EXPERT MODE ENDPOINTS =====

  /**
   * POST /api/expert/session/start - Start expert learning session
   */
  app.post('/api/expert/session/start', (req, res) => {
    try {
      const { userId, expertise, level = 'intermediate' } = req.body;

      if (!userId || !expertise) {
        return res.status(400).json({ success: false, error: 'User ID and expertise required' });
      }

      const session = expertModeSystem.startSession(userId, expertise, level);
      res.json({
        success: true,
        message: 'Expert session started',
        session
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/expert/session/:sessionId/question - Get next question
   */
  app.get('/api/expert/session/:sessionId/question', (req, res) => {
    try {
      const { sessionId } = req.params;
      const question = expertModeSystem.getNextQuestion(sessionId);

      res.json({
        success: true,
        question,
        sessionId
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/expert/session/:sessionId/answer - Submit expert answer
   */
  app.post('/api/expert/session/:sessionId/answer', (req, res) => {
    try {
      const { sessionId } = req.params;
      const { answer, aiAnalysis } = req.body;

      if (!answer) {
        return res.status(400).json({ success: false, error: 'Answer required' });
      }

      const result = expertModeSystem.recordAnswer(sessionId, answer, aiAnalysis);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/expert/session/:sessionId/feedback - Provide feedback
   */
  app.post('/api/expert/session/:sessionId/feedback', (req, res) => {
    try {
      const { sessionId } = req.params;
      const { feedback, rating = 5 } = req.body;

      const result = expertModeSystem.provideFeedback(sessionId, feedback, rating);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/expert/session/:sessionId/end - End session
   */
  app.post('/api/expert/session/:sessionId/end', (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = expertModeSystem.endSession(sessionId);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/expert/session/:sessionId/summary - Get session summary
   */
  app.get('/api/expert/session/:sessionId/summary', (req, res) => {
    try {
      const { sessionId } = req.params;
      const summary = expertModeSystem.getSessionSummary(sessionId);

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/expert/context - Get expert learning context for AI
   */
  app.get('/api/expert/context', (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const context = expertModeSystem.getExpertContext(userId);
      res.json({
        success: true,
        context
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log('✅ Advanced features (User Profiles, Knowledge Base, Expert Mode) loaded!');
};
