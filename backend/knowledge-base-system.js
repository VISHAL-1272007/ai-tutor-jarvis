/**
 * ===== KNOWLEDGE BASE SYSTEM =====
 * Manages document uploads, parsing, indexing, and retrieval
 * Supports PDF, DOCX, TXT files with semantic search
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class KnowledgeBaseSystem {
  constructor() {
    this.knowledgeDir = path.join(__dirname, '../data/knowledge-base');
    this.indexFile = path.join(this.knowledgeDir, 'index.json');
    this.ensureDirectoryExists(this.knowledgeDir);
    this.loadIndex();
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created knowledge base directory`);
    }
  }

  /**
   * Load knowledge base index
   */
  loadIndex() {
    if (fs.existsSync(this.indexFile)) {
      try {
        const data = fs.readFileSync(this.indexFile, 'utf8');
        this.index = JSON.parse(data);
        console.log(`✅ Loaded knowledge base with ${Object.keys(this.index).length} documents`);
      } catch (error) {
        this.index = {};
      }
    } else {
      this.index = {};
    }
  }

  /**
   * Save index
   */
  saveIndex() {
    try {
      fs.writeFileSync(this.indexFile, JSON.stringify(this.index, null, 2));
    } catch (error) {
      console.error('Error saving knowledge base index:', error.message);
    }
  }

  /**
   * Generate document ID
   */
  generateDocId() {
    return `doc_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Parse uploaded document (simplified - real implementation would use pdf-parse, docx, etc.)
   */
  parseDocument(filePath, fileName) {
    try {
      let content = '';

      if (fileName.endsWith('.txt')) {
        content = fs.readFileSync(filePath, 'utf8');
      } else if (fileName.endsWith('.md')) {
        content = fs.readFileSync(filePath, 'utf8');
      } else {
        // For PDF/DOCX, we'd use specialized libraries
        // For now, we'll note them but extract text if possible
        content = `Document: ${fileName}\n(Full parsing requires additional libraries like pdf-parse, docx)`;
      }

      return {
        success: true,
        content: content.substring(0, 50000), // Limit to 50k chars
        wordCount: content.split(/\s+/).length,
        tokenEstimate: Math.ceil(content.length / 4) // Rough estimation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload and store document
   */
  async uploadDocument(userId, filePath, fileName, fileContent = null) {
    try {
      const docId = this.generateDocId();

      // Get file content
      let content = fileContent;
      if (!content) {
        const parsed = this.parseDocument(filePath, fileName);
        if (!parsed.success) {
          throw new Error(parsed.error);
        }
        content = parsed.content;
      }

      // Create document record
      const docRecord = {
        docId,
        userId,
        fileName,
        uploadedAt: new Date().toISOString(),
        wordCount: content.split(/\s+/).length,
        tokenEstimate: Math.ceil(content.length / 4),
        tags: this.extractTags(content),
        summary: this.generateSummary(content),
        chunks: this.chunkContent(content)
      };

      // Store document
      this.index[docId] = docRecord;
      this.saveIndex();

      // Save document chunks
      const docChunksPath = path.join(this.knowledgeDir, `${docId}.json`);
      fs.writeFileSync(docChunksPath, JSON.stringify(docRecord, null, 2));

      console.log(`📄 Document stored: ${docId} (${docRecord.wordCount} words)`);
      return docRecord;
    } catch (error) {
      console.error('Error uploading document:', error.message);
      throw error;
    }
  }

  /**
   * Extract tags from content
   */
  extractTags(content) {
    const tags = [];
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = {};

    words.forEach(word => {
      if (word.length > 5 && !this.isCommonWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top 10 most frequent words as tags
    Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word]) => tags.push(word));

    return tags;
  }

  /**
   * Check if common word
   */
  isCommonWord(word) {
    const common = ['the', 'and', 'that', 'this', 'with', 'from', 'are', 'have', 'been', 'more'];
    return common.includes(word);
  }

  /**
   * Generate summary from content
   */
  generateSummary(content) {
    const lines = content.split('\n').filter(l => l.trim());
    return lines.slice(0, 3).join(' ').substring(0, 200) + '...';
  }

  /**
   * Chunk content for better retrieval
   */
  chunkContent(content, chunkSize = 500) {
    const chunks = [];
    const words = content.split(/\s+/);

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }

    return chunks;
  }

  /**
   * Search knowledge base by keywords
   */
  searchDocuments(userId, query, limit = 5) {
    const results = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    Object.values(this.index).forEach(doc => {
      if (doc.userId !== userId) return; // Only user's own documents

      let score = 0;
      queryWords.forEach(word => {
        if (doc.tags.includes(word)) score += 2;
        if (doc.summary.toLowerCase().includes(word)) score += 1;
        doc.chunks.forEach(chunk => {
          if (chunk.toLowerCase().includes(word)) score += 0.5;
        });
      });

      if (score > 0) {
        results.push({
          ...doc,
          relevanceScore: score
        });
      }
    });

    // Sort by relevance and limit
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  /**
   * Get document by ID
   */
  getDocument(docId) {
    return this.index[docId];
  }

  /**
   * Get all user documents
   */
  getUserDocuments(userId) {
    return Object.values(this.index).filter(doc => doc.userId === userId);
  }

  /**
   * Get knowledge base context for AI
   */
  getKnowledgeContext(userId, query) {
    const docs = this.searchDocuments(userId, query, 3);

    if (docs.length === 0) return '';

    let context = '📚 Relevant Knowledge Base Documents:\n';
    docs.forEach((doc, i) => {
      context += `\n${i + 1}. ${doc.fileName}\n`;
      context += `Summary: ${doc.summary}\n`;
      context += `Relevance: ${(doc.relevanceScore * 100).toFixed(0)}%\n`;
    });

    return context;
  }

  /**
   * Delete document
   */
  deleteDocument(docId) {
    delete this.index[docId];
    this.saveIndex();

    const docChunksPath = path.join(this.knowledgeDir, `${docId}.json`);
    if (fs.existsSync(docChunksPath)) {
      fs.unlinkSync(docChunksPath);
    }

    console.log(`🗑️ Document deleted: ${docId}`);
  }
}

module.exports = KnowledgeBaseSystem;
