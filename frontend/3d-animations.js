// ===== 3D PARTICLE ANIMATION SYSTEM =====
// Advanced WebGL particle effects for modern UI

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(56, 239, 125, 0.8)',
            'rgba(245, 87, 108, 0.8)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = 1 - distance / this.connectionDistance;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.particles[i].x - this.mouse.x;
                const dy = this.particles[i].y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const opacity = 1 - distance / this.mouse.radius;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(240, 147, 251, ${opacity * 0.6})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();

                    // Repel particles from mouse
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.particles[i].vx += Math.cos(angle) * force * 0.5;
                    this.particles[i].vy += Math.sin(angle) * force * 0.5;
                }
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }

            // Add slight friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawConnections();
        
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });

        this.updateParticles();

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
}

// Scroll-triggered animations
class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        // Observe all animatable elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        // Add animation classes to elements
        document.querySelectorAll('.input-card, .output-section, .file-block, .metric-card, .template-card').forEach(el => {
            el.classList.add('aos-element');
            observer.observe(el);
        });
    }
}

// 3D Tilt Effect on Cards
class TiltEffect {
    constructor(element, settings = {}) {
        this.element = element;
        this.settings = {
            maxTilt: settings.maxTilt || 15,
            perspective: settings.perspective || 1000,
            scale: settings.scale || 1.05,
            speed: settings.speed || 400,
            ...settings
        };

        this.init();
    }

    init() {
        this.element.style.transform = `perspective(${this.settings.perspective}px)`;
        this.element.style.transition = `all ${this.settings.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;

        this.element.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
        this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
    }

    onMouseEnter(e) {
        this.element.style.transition = `all ${this.settings.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    }

    onMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;
        
        const tiltX = percentY * this.settings.maxTilt;
        const tiltY = -percentX * this.settings.maxTilt;
        
        this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})
        `;
    }

    onMouseLeave(e) {
        this.element.style.transition = `all ${this.settings.speed * 1.5}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
        this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale3d(1, 1, 1)
        `;
    }
}

// Magnetic Button Effect
class MagneticButton {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.element.addEventListener('mousemove', (e) => {
            const rect = this.element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = 'translate(0, 0)';
        });
    }
}

// Typing Animation Effect
class TypeWriter {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
    }

    type() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed);
        }
    }

    start() {
        this.element.textContent = '';
        this.index = 0;
        this.type();
    }
}

// Initialize all effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing Modern UI Effects...');

    // Start particle system
    const particleSystem = new ParticleSystem();
    console.log('✨ Particle system active');

    // Initialize scroll animations
    const scrollAnimations = new ScrollAnimations();
    console.log('📜 Scroll animations ready');

    // Apply 3D tilt to cards
    setTimeout(() => {
        document.querySelectorAll('.input-card, .template-card, .metric-card').forEach(card => {
            new TiltEffect(card);
        });
        console.log('🎪 3D tilt effects applied');
    }, 500);

    // Apply magnetic effect to buttons
    setTimeout(() => {
        document.querySelectorAll('.generate-btn, .action-btn, .icon-btn').forEach(btn => {
            new MagneticButton(btn);
        });
        console.log('🧲 Magnetic button effects active');
    }, 500);

    // Add smooth page reveal
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Parallax effect on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.header, .title');
                parallaxElements.forEach(el => {
                    el.style.transform = `translateY(${scrolled * 0.3}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    console.log('🚀 All modern UI effects initialized successfully!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleSystem,
        ScrollAnimations,
        TiltEffect,
        MagneticButton,
        TypeWriter
    };
}
