export function fireConfetti(duration = 1800) {
    const colors = ['#FFD166', '#FF6B6B', '#7BE4D6', '#FFFFFF'];
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<any> = [];
    const count = Math.floor(Math.min(window.innerWidth / 10, 180));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height * 0.6,
            w: 6 + Math.random() * 10,
            h: 6 + Math.random() * 10,
            rotation: Math.random() * 360,
            speedY: 2 + Math.random() * 6,
            speedX: -3 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 0.5,
        });
    }

    let start = performance.now();
    function draw(now: number) {
        const t = now - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.x += p.speedX;
            p.y += p.speedY + Math.sin((t + p.x) / 200) * p.tilt;
            p.rotation += 6;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
        if (now - start < duration) requestAnimationFrame(draw);
        else finish();
    }

    function finish() {
        window.removeEventListener('resize', resize);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    requestAnimationFrame(draw);
}

export default fireConfetti;
