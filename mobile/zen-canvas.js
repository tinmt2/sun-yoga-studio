/**
 * ====================================================================
 * SUN YOGA STUDIO — AMBIENT ZEN CANVAS & MOTION ENGINE
 * HTML5 Canvas 60fps Organic Breathing Gradient Mesh & Water Ripples
 * ====================================================================
 */

(function () {
  'use strict';

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class ZenAmbientCanvas {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.animationFrameId = null;
      this.isRunning = false;
      this.time = 0;
      this.ripples = [];

      // Mouse tracking with dampening
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.35,
        targetX: this.width * 0.5,
        targetY: this.height * 0.35
      };

      // Organic Light Orbs
      this.orbs = [
        {
          baseX: 0.25, baseY: 0.25,
          radiusRatio: 0.45,
          color: { r: 194, g: 138, b: 74, a: 0.18 }, // Warm Gold Ochre
          speedX: 0.0006, speedY: 0.0008, phase: 0
        },
        {
          baseX: 0.75, baseY: 0.35,
          radiusRatio: 0.50,
          color: { r: 52, g: 98, b: 76, a: 0.16 }, // Emerald Sage
          speedX: 0.0007, speedY: 0.0005, phase: Math.PI * 0.5
        },
        {
          baseX: 0.50, baseY: 0.80,
          radiusRatio: 0.55,
          color: { r: 102, g: 88, b: 153, a: 0.14 }, // Quartz Lavender
          speedX: 0.0005, speedY: 0.0007, phase: Math.PI
        },
        {
          baseX: 0.85, baseY: 0.85,
          radiusRatio: 0.40,
          color: { r: 232, g: 168, b: 124, a: 0.14 }, // Terracotta Peach
          speedX: 0.0008, speedY: 0.0006, phase: Math.PI * 1.5
        }
      ];

      this.init();
    }

    init() {
      // Find or create canvas
      this.canvas = document.getElementById('zen-ambient-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'zen-ambient-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.prepend(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.resize();

      // Fade canvas in gracefully
      requestAnimationFrame(() => {
        if (this.canvas) this.canvas.style.opacity = '1';
      });

      // Bind events
      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
      document.addEventListener('visibilitychange', () => this.onVisibilityChange());

      // Global click ripple trigger for interactive touches
      window.addEventListener('click', (e) => {
        // Trigger gentle ripple around interactive clicks
        if (e.target.closest('button, .filter-pill, .wellness-student-row, .tab-button, .sidebar-link')) {
          this.addRipple(e.clientX, e.clientY);
        }
      }, { passive: true });

      // Expose programmatic ripple
      window.triggerZenRipple = (x, y) => this.addRipple(x, y);

      if (prefersReducedMotion) {
        this.renderStatic();
      } else {
        this.start();
      }
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (this.canvas) {
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
      }

      if (prefersReducedMotion) {
        this.renderStatic();
      }
    }

    onPointerMove(e) {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    }

    onVisibilityChange() {
      if (document.hidden) {
        this.stop();
      } else if (!prefersReducedMotion) {
        this.start();
      }
    }

    addRipple(x, y) {
      if (x === undefined || y === undefined) {
        x = this.width * 0.5;
        y = this.height * 0.5;
      }
      this.ripples.push({
        x,
        y,
        radius: 8,
        maxRadius: Math.min(this.width, this.height) * 0.28,
        opacity: 0.38,
        speed: 3.5
      });
      if (!this.isRunning && !prefersReducedMotion) {
        this.start();
      }
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.loop();
    }

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    loop() {
      if (!this.isRunning) return;
      this.time += 1;
      this.render();
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Smooth mouse lerp
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

      ctx.clearRect(0, 0, w, h);

      // Check Dark Mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.body.classList.contains('theme-midnight-pro');

      // Zen Breathing Multiplier (8-second cycle = ~480 frames at 60fps)
      const breathingWave = Math.sin((this.time * Math.PI * 2) / 480);
      const breathScale = 1 + breathingWave * 0.08;

      ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over';

      // Draw Breathing Orbs
      this.orbs.forEach((orb) => {
        const xOffset = Math.sin(this.time * orb.speedX + orb.phase) * (w * 0.12);
        const yOffset = Math.cos(this.time * orb.speedY + orb.phase) * (h * 0.12);

        // Biased subtly towards mouse
        const mouseBiasX = (this.mouse.x - w * 0.5) * 0.08;
        const mouseBiasY = (this.mouse.y - h * 0.5) * 0.08;

        const cx = orb.baseX * w + xOffset + mouseBiasX;
        const cy = orb.baseY * h + yOffset + mouseBiasY;
        const radius = Math.min(w, h) * orb.radiusRatio * breathScale;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const alpha = isDark ? orb.color.a * 0.8 : orb.color.a;

        grad.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Interactive Zen Water Ripples
      if (this.ripples.length > 0) {
        ctx.globalCompositeOperation = 'source-over';
        for (let i = this.ripples.length - 1; i >= 0; i--) {
          const r = this.ripples[i];
          r.radius += r.speed;
          r.opacity *= 0.94;

          if (r.opacity <= 0.01 || r.radius >= r.maxRadius) {
            this.ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(212, 168, 102, ${r.opacity * 0.6})`
            : `rgba(194, 138, 74, ${r.opacity})`;
          ctx.lineWidth = Math.max(1, 2.5 * (r.opacity / 0.38));
          ctx.stroke();
        }
      }
    }

    renderStatic() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      this.orbs.forEach((orb) => {
        const cx = orb.baseX * w;
        const cy = orb.baseY * h;
        const radius = Math.min(w, h) * orb.radiusRatio;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${orb.color.a * 0.7})`);
        grad.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ZenAmbientCanvas());
  } else {
    new ZenAmbientCanvas();
  }
})();
