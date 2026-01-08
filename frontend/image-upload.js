// ===== JARVIS IMAGE UPLOAD & VISION AI =====
// Gemini-style image upload and analysis system

class ImageUploadSystem {
    constructor() {
        this.currentImage = null;
        this.currentImageData = null;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        console.log('📸 JARVIS Image Upload System initialized');
    }

    setupEventListeners() {
        // Photo upload button
        const photoUploadBtn = document.getElementById('photoUploadBtn');
        const photoInput = document.getElementById('photoInput');
        
        if (photoUploadBtn && photoInput) {
            photoUploadBtn.addEventListener('click', () => {
                photoInput.click();
            });
            
            photoInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
            });
        }

        // Camera button
        const cameraBtn = document.getElementById('cameraBtn');
        const cameraInput = document.getElementById('cameraInput');
        
        if (cameraBtn && cameraInput) {
            cameraBtn.addEventListener('click', () => {
                cameraInput.click();
            });
            
            cameraInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
            });
        }

        // Remove image button
        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removeImage();
            });
        }

        // Paste image from clipboard
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    this.handleImageSelect(file);
                    break;
                }
            }
        });

        // Drag and drop
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                inputContainer.classList.add('drag-over');
            });

            inputContainer.addEventListener('dragleave', () => {
                inputContainer.classList.remove('drag-over');
            });

            inputContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                inputContainer.classList.remove('drag-over');
                
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handleImageSelect(file);
                }
            });
        }
    }

    async handleImageSelect(file) {
        if (!file) {
            console.log('📸 No file selected');
            return;
        }
        
        console.log('📸 Image selected:', file.name, file.type, file.size);

        // Validate file type
        if (!this.allowedTypes.includes(file.type)) {
            this.showError('❌ Please upload a valid image (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            this.showError('❌ Image too large! Maximum size is 10MB');
            return;
        }

        try {
            // Show loading state
            this.showLoadingState();
            console.log('📸 Processing image...');

            // Read and compress image
            const imageData = await this.readAndCompressImage(file);
            
            console.log('📸 Image processed:', imageData.width, 'x', imageData.height);
            console.log('📸 Base64 length:', imageData.base64.length);
            
            // Store image data
            this.currentImage = file;
            this.currentImageData = imageData;

            // Display preview
            this.showImagePreview(imageData.url);

            // Show success message
            this.showSuccess(`✅ Image uploaded: ${file.name} (${this.formatFileSize(file.size)})`);

            console.log('📸 Image loaded:', file.name, imageData);
        } catch (error) {
            console.error('Image upload error:', error);
            this.showError('❌ Failed to upload image. Please try again.');
        }
    }

    async readAndCompressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Compress if image is too large
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Max dimensions for API
                    const MAX_WIDTH = 2048;
                    const MAX_HEIGHT = 2048;
                    
                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        if (width > height) {
                            height = (height / width) * MAX_WIDTH;
                            width = MAX_WIDTH;
                        } else {
                            width = (width / height) * MAX_HEIGHT;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64
                    const base64 = canvas.toDataURL('image/jpeg', 0.85);
                    
                    resolve({
                        url: e.target.result, // Original for preview
                        base64: base64.split(',')[1], // Base64 data for API
                        mimeType: 'image/jpeg',
                        width: width,
                        height: height
                    });
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showImagePreview(url) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImage = document.getElementById('imagePreview');
        
        if (previewContainer && previewImage) {
            previewImage.src = url;
            previewContainer.style.display = 'block';
            
            // Add smooth animation
            previewContainer.style.opacity = '0';
            setTimeout(() => {
                previewContainer.style.opacity = '1';
            }, 10);
        }
    }

    removeImage() {
        this.currentImage = null;
        this.currentImageData = null;
        
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
        
        // Reset file inputs
        const photoInput = document.getElementById('photoInput');
        const cameraInput = document.getElementById('cameraInput');
        if (photoInput) photoInput.value = '';
        if (cameraInput) cameraInput.value = '';
        
        this.showSuccess('🗑️ Image removed');
    }

    getCurrentImage() {
        console.log('📸 getCurrentImage called, hasData:', !!this.currentImageData);
        return this.currentImageData;
    }

    hasImage() {
        const has = this.currentImageData !== null;
        console.log('📸 hasImage:', has);
        return has;
    }

    showLoadingState() {
        const photoUploadBtn = document.getElementById('photoUploadBtn');
        if (photoUploadBtn) {
            photoUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            photoUploadBtn.disabled = true;
        }
    }

    resetLoadingState() {
        const photoUploadBtn = document.getElementById('photoUploadBtn');
        if (photoUploadBtn) {
            photoUploadBtn.innerHTML = '<i class="fas fa-image"></i>';
            photoUploadBtn.disabled = false;
        }
    }

    showError(message) {
        this.resetLoadingState();
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.resetLoadingState();
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `image-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00ff88' : '#667eea'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Add animation styles
// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .input-container.drag-over {
        background: rgba(102, 126, 234, 0.1);
        border: 2px dashed #667eea !important;
    }
    
    /* Image Preview Container */
    .image-preview-container {
        padding: 12px 16px;
        background: rgba(102, 126, 234, 0.05);
        border-top: 1px solid rgba(102, 126, 234, 0.1);
        transition: opacity 0.3s ease;
    }
    
    .image-preview-wrapper {
        position: relative;
        display: inline-block;
        max-width: 200px;
    }
    
    .image-preview-wrapper img {
        max-width: 200px;
        max-height: 150px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        object-fit: cover;
    }
    
    .remove-image-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #ff4444;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
    }
    
    .remove-image-btn:hover {
        transform: scale(1.1);
    }
    
    /* Message with Image */
    .message-image {
        margin-bottom: 12px;
    }
    
    .message-image img {
        max-width: 100%;
        max-height: 400px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .message-image img:hover {
        transform: scale(1.02);
    }
    
    /* Image Analysis Indicator */
    .analyzing-image {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        border-radius: 12px;
        margin-bottom: 12px;
    }
    
    .analyzing-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(102, 126, 234, 0.3);
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize system globally
const imageUploadSystem = new ImageUploadSystem();

// Make it available globally for script.js
window.imageUploadSystem = imageUploadSystem;

// Export for use in other scripts
export { imageUploadSystem };
