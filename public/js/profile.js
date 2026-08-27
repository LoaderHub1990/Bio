const canvas = document.getElementById('fx-canvas');
const effect = canvas.dataset.effect;

if (effect && effect !== 'none') {
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function makeParticles(count, factory) {
        particles = Array.from({ length: count }, factory);
    }

    if (effect === 'particles') {
        makeParticles(60, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.6 + 0.2,
        }));
    } else if (effect === 'snow') {
        makeParticles(80, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 0.3,
            dy: Math.random() * 1 + 0.5,
            alpha: Math.random() * 0.7 + 0.3,
        }));
    } else if (effect === 'stars') {
        makeParticles(100, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';

        particles.forEach((p) => {
            if (effect === 'stars') {
                p.twinkle += p.speed;
                ctx.globalAlpha = (Math.sin(p.twinkle) + 1) / 2 * 0.8 + 0.1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                return;
            }

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.y > canvas.height) { p.y = -5; p.x = Math.random() * canvas.width; }
            if (p.y < 0) p.y = canvas.height;
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}
