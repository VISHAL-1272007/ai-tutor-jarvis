// JARVIS App Icon Generator
// Run: node generate-icons.js
// Requires: npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function drawIcon(ctx, size, maskable = false) {
    const cx = size / 2;
    const cy = size / 2;
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0, '#667eea');
    bgGrad.addColorStop(0.5, '#764ba2');
    bgGrad.addColorStop(1, '#f093fb');
    
    if (maskable) {
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, size, size);
    } else {
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.47, 0, Math.PI * 2);
        ctx.fillStyle = bgGrad;
        ctx.fill();
    }
    
    const scale = size / 512;
    
    if (!maskable) {
        // Outer rings
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.lineWidth = 4 * scale;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.27, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
    }
    
    // Core circle
    ctx.beginPath();
    ctx.arc(cx, cy, maskable ? size * 0.23 : size * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = (maskable ? 8 : 6) * scale;
    ctx.stroke();
    
    // Inner glows
    ctx.beginPath();
    ctx.arc(cx, cy, maskable ? size * 0.16 : size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx, cy, maskable ? size * 0.10 : size * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx, cy, maskable ? size * 0.05 : size * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    // J letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${(maskable ? 100 : 80) * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('J', cx, cy + (5 * scale));
    
    if (!maskable) {
        // Decorative lines
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.lineWidth = 3 * scale;
        
        [[cx, size * 0.15, cx, size * 0.23],
         [cx, size * 0.77, cx, size * 0.85],
         [size * 0.15, cy, size * 0.23, cy],
         [size * 0.77, cy, size * 0.85, cy]].forEach(([x1, y1, x2, y2]) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }
}

console.log('🎨 Generating JARVIS App Icons...\n');

sizes.forEach(size => {
    // Regular icon
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawIcon(ctx, size, false);
    
    const regularPath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(regularPath, canvas.toBuffer('image/png'));
    console.log(`✅ Created: icon-${size}.png`);
    
    // Maskable icons (192 and 512 only)
    if (size === 192 || size === 512) {
        const maskCanvas = createCanvas(size, size);
        const maskCtx = maskCanvas.getContext('2d');
        drawIcon(maskCtx, size, true);
        
        const maskablePath = path.join(iconsDir, `icon-${size}-maskable.png`);
        fs.writeFileSync(maskablePath, maskCanvas.toBuffer('image/png'));
        console.log(`✅ Created: icon-${size}-maskable.png`);
    }
});

console.log('\n🎉 All icons generated successfully!');
console.log(`📁 Icons saved to: ${iconsDir}`);
