/**
 * ====================================================================
 * SUN YOGA STUDIO — AMBIENT ZEN CANVAS & MOTION ENGINE
 * HTML5 Canvas Organic Breathing Gradient Mesh & Water Ripples
 * Automatically pauses when tab is hidden or custom Studio Wallpaper is active
 * ====================================================================
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class ZenAmbientCanvas {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.animationFrameId = null;
      this.isRunning = false;
      this.isExternallyPaused = false;
      this.time = 0;
      this.ripples = [];

      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.35,
        targetX: this.width * 0.5,
        targetY: this.height * 0.35
      };

      // Organic Warm Wellness Light Orbs (Sun Ochre, Biophilic Sage, Golden Sand, Terracotta Peach)
      this.orbs = [
        {
          baseX: 0.22, baseY: 0.20,
          radiusRatio: 0.48,
          color: { r: 212, g: 129, b: 96, a: 0.22 },
          speedX: 0.0006, speedY: 0.0008, phase: 0
        },
        {
          baseX: 0.78, baseY: 0.30,
          radiusRatio: 0.52,
          color: { r: 120, g: 158, b: 128, a: 0.20 },
          speedX: 0.0007, speedY: 0.0005, phase: Math.PI * 0.5
        },
        {
          baseX: 0.45, baseY: 0.82,
          radiusRatio: 0.56,
          color: { r: 214, g: 168, b: 108, a: 0.20 },
          speedX: 0.0005, speedY: 0.0007, phase: Math.PI
        },
        {
          baseX: 0.86, baseY: 0.84,
          radiusRatio: 0.44,
          color: { r: 232, g: 168, b: 124, a: 0.18 },
          speedX: 0.0008, speedY: 0.0006, phase: Math.PI * 1.5
        }
      ];

      this.init();
    }

    init() {
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
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.prepend(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.isExternallyPaused = document.body.classList.contains('has-custom-bg');
      this.resize();

      requestAnimationFrame(() => {
        if (this.canvas && !this.isExternallyPaused) {
          this.canvas.style.opacity = '1';
        }
      });

      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
      document.addEventListener('visibilitychange', () => this.onVisibilityChange());

      window.addEventListener('click', (e) => {
        if (this.isExternallyPaused) return;
        if (e.target.closest('button, .filter-pill, .wellness-student-row, .tab-button, .sidebar-link')) {
          this.addRipple(e.clientX, e.clientY);
        }
      }, { passive: true });

      window.triggerZenRipple = (x, y) => this.addRipple(x, y);
      window.setZenCanvasPaused = (paused) => this.setPaused(paused);

      if (this.isExternallyPaused) {
        this.stop();
      } else if (prefersReducedMotion) {
        this.renderStatic();
      } else {
        this.start();
      }
    }

    setPaused(paused) {
      this.isExternallyPaused = !!paused;
      if (this.isExternallyPaused) {
        this.stop();
        this.ripples.length = 0;
        if (this.canvas) this.canvas.style.opacity = '0';
      } else {
        if (this.canvas) this.canvas.style.opacity = '1';
        if (prefersReducedMotion) {
          this.renderStatic();
        } else if (!document.hidden) {
          this.start();
        }
      }
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (this.canvas) {
        this.canvas.width = Math.round(this.width * this.dpr);
        this.canvas.height = Math.round(this.height * this.dpr);
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      }

      if (prefersReducedMotion && !this.isExternallyPaused) {
        this.renderStatic();
      }
    }

    onPointerMove(e) {
      if (this.isExternallyPaused) return;
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    }

    onVisibilityChange() {
      if (document.hidden || this.isExternallyPaused) {
        this.stop();
      } else if (!prefersReducedMotion) {
        this.start();
      }
    }

    addRipple(x, y) {
      if (this.isExternallyPaused || prefersReducedMotion) return;
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
      if (!this.isRunning && !document.hidden) {
        this.start();
      }
    }

    start() {
      if (this.isRunning || this.isExternallyPaused) return;
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
      if (!this.isRunning || this.isExternallyPaused) {
        this.isRunning = false;
        this.animationFrameId = null;
        return;
      }
      this.time += 1;
      this.render();
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

      ctx.clearRect(0, 0, w, h);

      const breathingWave = Math.sin((this.time * Math.PI * 2) / 480);
      const breathScale = 1 + breathingWave * 0.08;

      ctx.globalCompositeOperation = 'source-over';

      const mouseBiasX = (this.mouse.x - w * 0.5) * 0.08;
      const mouseBiasY = (this.mouse.y - h * 0.5) * 0.08;
      const baseMinDim = Math.min(w, h) * breathScale;

      for (let i = 0; i < this.orbs.length; i++) {
        const orb = this.orbs[i];
        const cx = orb.baseX * w + Math.sin(this.time * orb.speedX + orb.phase) * (w * 0.12) + mouseBiasX;
        const cy = orb.baseY * h + Math.cos(this.time * orb.speedY + orb.phase) * (h * 0.12) + mouseBiasY;
        const radius = baseMinDim * orb.radiusRatio;
        const { r, g, b, a } = orb.color;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.45})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (this.ripples.length > 0) {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
          const rp = this.ripples[i];
          rp.radius += rp.speed;
          rp.opacity *= 0.94;

          if (rp.opacity <= 0.01 || rp.radius >= rp.maxRadius) {
            this.ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(194, 138, 74, ${rp.opacity})`;
          ctx.lineWidth = Math.max(1, 2.5 * (rp.opacity / 0.38));
          ctx.stroke();
        }
      }
    }

    renderStatic() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      const minDim = Math.min(w, h);
      for (let i = 0; i < this.orbs.length; i++) {
        const orb = this.orbs[i];
        const cx = orb.baseX * w;
        const cy = orb.baseY * h;
        const radius = minDim * orb.radiusRatio;
        const { r, g, b, a } = orb.color;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.7})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ZenAmbientCanvas());
  } else {
    new ZenAmbientCanvas();
  }
})();
