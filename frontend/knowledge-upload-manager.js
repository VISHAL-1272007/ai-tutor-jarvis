/**
 * ===== KNOWLEDGE UPLOAD MANAGER =====
 * Frontend component to upload and manage documents
 */

class KnowledgeUploadManager {
  constructor(userId) {
    this.userId = userId;
    this.documents = [];
    this.loadDocuments();
  }

  /**
   * Load user documents
   */
  async loadDocuments() {
    try {
      const response = await fetch(`/api/knowledge/documents?userId=${this.userId}`);
      const data = await response.json();
      this.documents = data.documents || [];
      console.log(`📄 Loaded ${this.documents.length} documents`);
      return this.documents;
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  /**
   * Upload document
   */
  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', this.userId);

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        this.documents.push(data.document);
        console.log(`✅ Document uploaded: ${data.document.fileName}`);
        return data.document;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(query, limit = 5) {
    try {
      const response = await fetch(`/api/knowledge/search?userId=${this.userId}&query=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(docId) {
    try {
      const response = await fetch(`/api/knowledge/document/${docId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        this.documents = this.documents.filter(d => d.docId !== docId);
        console.log(`🗑️ Document deleted`);
      }
      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Render upload UI
   */
  renderUploadUI() {
    return `
      <div class="knowledge-upload-panel">
        <h3>📚 Knowledge Base</h3>
        
        <div class="upload-section">
          <h4>Upload Document</h4>
          <div class="upload-area" id="uploadArea" ondrop="knowledgeManager.handleDrop(event)" ondragover="event.preventDefault()">
            <p>📎 Drag files here or click to select</p>
            <input type="file" id="fileInput" multiple accept=".txt,.pdf,.docx,.md,.json"
              onchange="knowledgeManager.handleFileSelect(event)" style="display:none">
            <button onclick="document.getElementById('fileInput').click()">Choose Files</button>
          </div>
          <small>Supported: TXT, PDF, DOCX, MD, JSON (max 50MB)</small>
        </div>

        <div class="documents-section">
          <h4>📖 Your Documents (${this.documents.length})</h4>
          <div class="documents-list" id="documentsList">
            ${this.renderDocumentsList()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render documents list
   */
  renderDocumentsList() {
    if (this.documents.length === 0) {
      return '<p>No documents uploaded yet</p>';
    }

    return this.documents.map(doc => `
      <div class="document-item">
        <div class="doc-info">
          <p><strong>${doc.fileName}</strong></p>
          <small>${doc.wordCount} words • ${new Date(doc.uploadedAt).toLocaleDateString()}</small>
        </div>
        <div class="doc-actions">
          <button onclick="knowledgeManager.deleteDocument('${doc.docId}')" class="delete-btn">Delete</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Handle file selection
   */
  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => this.uploadDocument(file).catch(err => alert(err.message)));
  }

  /**
   * Handle drag and drop
   */
  handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => this.uploadDocument(file).catch(err => alert(err.message)));
  }

  /**
   * Get knowledge context for AI
   */
  async getKnowledgeContext(query) {
    try {
      const response = await fetch(`/api/knowledge/context?userId=${this.userId}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.context;
    } catch (error) {
      console.error('Error getting knowledge context:', error);
      return '';
    }
  }
}

// Will be initialized with userId
let knowledgeManager;
