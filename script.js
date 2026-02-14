document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const letterPreview = document.getElementById('letter-preview');
    const letterOverlay = document.getElementById('letter-overlay');
    const closeBtn = document.getElementById('close-btn');
    const audio = document.getElementById('bg-music');

    // --- State ---
    let isEnvelopeOpen = false;
    let audioPlayed = false;

    // --- Interaction 1: Click Envelope to Open ---
    envelopeWrapper.addEventListener('click', () => {
        if (!isEnvelopeOpen) {
            // First Click: Open Envelope
            openEnvelope();
        } else {
            // Second Click (or click on exposed letter): Show Full Screen
            showFullScreenLetter();
        }
    });

    // Explicitly clicking the preview letter also triggers full screen
    letterPreview.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't bubble to envelope loop if sticky
        if (isEnvelopeOpen) showFullScreenLetter();
    });

    // Close Button logic (Optional)
    closeBtn.addEventListener('click', () => {
        letterOverlay.classList.remove('visible');
    });

    function openEnvelope() {
        isEnvelopeOpen = true;
        envelopeWrapper.classList.add('open');
        playAudio();
    }

    function showFullScreenLetter() {
        letterOverlay.classList.add('visible');
    }

    function playAudio() {
        if (!audioPlayed && audio) {
            audio.play().catch(e => console.log("Audio play failed (interaction needed):", e));
            audioPlayed = true;
        }
    }

    // --- Living Background (Hearts) ---
    const canvas = document.getElementById('heart-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    const mouse = { x: -9999, y: -9999 }; // Init off screen

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    resize();

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 20; // Start below
            this.size = Math.random() * 12 + 8; // Bit larger
            this.speedY = Math.random() * 1.5 + 0.5;
            this.color = `rgba(255, ${120 + Math.random() * 60}, ${150 + Math.random() * 60}, ${Math.random() * 0.4 + 0.3})`;
            this.vx = 0;
            this.vy = 0;
        }

        update() {
            // Natural rise
            this.y -= this.speedY;

            // Mouse Interaction (Repulsion)
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 150;

            if (dist < radius) {
                const angle = Math.atan2(dy, dx);
                const force = (radius - dist) / radius;
                const push = 6; // Strength

                this.vx += Math.cos(angle) * force * push;
                this.vy += Math.sin(angle) * force * push;
            }

            // Apply physics
            this.x += this.vx;
            this.y += this.vy;

            // Friction
            this.vx *= 0.95;
            this.vy *= 0.95;

            // Reset
            if (this.y < -50) this.init();
        }

        draw() {
            /* Draw Heart Shape */
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const x = this.x;
            const y = this.y;
            const size = this.size;

            // Heart formula approx
            ctx.moveTo(x, y + size * 0.3);
            ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
            ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y + size * 0.3);

            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.floor(width / 15); // Density
        for (let i = 0; i < count; i++) {
            let p = new Particle();
            p.y = Math.random() * height; // Distribute initially
            particles.push(p);
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();

});
