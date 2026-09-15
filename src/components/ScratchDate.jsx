import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './ScratchDate.module.css';

const CinematicParticles = ({ isActive, originRef, onDone }) => {
  const canvasRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive || isCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let originX = canvas.width / 2;
    let originY = canvas.height / 2;
    let heartWidth = 300;

    if (originRef && originRef.current) {
      const rect = originRef.current.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
      heartWidth = rect.width;
    }

    const particles = [];
    const particleCount = 110;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (heartWidth * 0.4); 

      const spawnX = originX + Math.cos(angle) * r;
      const spawnY = originY + Math.sin(angle) * r;

      const dx = spawnX - originX;
      const dy = spawnY - originY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const speed = Math.random() * 4 + 2;
      
      let vx = (dx / dist) * speed;
      let vy = (dy / dist) * speed;
      
      vy -= Math.random() * 2;
      vx += (Math.random() - 0.5) * 1.5;
      vy += (Math.random() - 0.5) * 1.5;

      const size = Math.random() * 2.0 + 0.5;
      
      let type = 'dust';
      const rand = Math.random();
      if (rand > 0.85) type = 'star';
      else if (rand > 0.5) type = 'glitter';

      particles.push({
        x: spawnX, y: spawnY, vx, vy, size, type,
        opacity: Math.random() * 0.7 + 0.3,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }

    let animationId;
    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;
      const time = Date.now() - startTime;
      
      particles.forEach(p => {
        if (p.life <= 0) return;
        aliveCount++;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vy -= 0.02;
        p.vx += Math.sin(time * p.wobbleSpeed + p.wobblePhase) * 0.015;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        let alpha = 1;
        if (p.life > 0.9) {
          alpha = (1.0 - p.life) * 10;
        } else {
          alpha = Math.pow(p.life / 0.9, 1.2);
        }
        const currentOpacity = Math.max(0, p.opacity * alpha);
        
        if (p.type === 'dust') {
          ctx.fillStyle = `rgba(255, 248, 231, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'glitter') {
          ctx.fillStyle = `rgba(232, 211, 162, ${currentOpacity})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(212, 175, 55, ${currentOpacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.beginPath();
          const spikes = 4;
          const outerRadius = p.size * 2.5;
          const innerRadius = p.size * 0.5;
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const a = (j * Math.PI) / spikes;
            ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsCompleted(true);
        if (onDone) onDone();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive, originRef, isCompleted, onDone]);

  if (!isActive || isCompleted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

// Scratch Sparkle System - object pool, single rAF loop, zero GC pressure
const PALETTE = [
  [255, 255, 255],
  [255, 230, 140],
  [212, 175, 55],
  [255, 248, 200],
  [255, 215, 100],
];

const useScratchSparkles = () => {
  const canvasRef = useRef(null);
  const poolRef = useRef([]);
  const activeRef = useRef([]);
  const rafRef = useRef(null);
  const isRunningRef = useRef(false);
  const ctxRef = useRef(null);

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      const c = document.createElement('canvas');
      c.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998';
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      document.body.appendChild(c);
      canvasRef.current = c;
      ctxRef.current = c.getContext('2d');
      window.addEventListener('resize', handleResize, { passive: true });
    }
    return canvasRef.current;
  }, [handleResize]);

  const acquire = () => poolRef.current.length > 0 ? poolRef.current.pop() : {};

  const startLoop = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive = activeRef.current;
      let i = alive.length;
      while (i--) {
        const p = alive[i];
        p.vx *= 0.91;
        p.vy *= 0.91;
        p.vy -= 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;
        if (p.life <= 0) {
          alive.splice(i, 1);
          poolRef.current.push(p);
          continue;
        }
        const alpha = Math.pow(p.life, 1.4);
        const [r, g, b] = p.color;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.isstar) {
          ctx.shadowBlur = 9;
          ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          const outer = p.size * 2.8;
          const inner = p.size * 0.45;
          for (let j = 0; j < 8; j++) {
            const rad = j % 2 === 0 ? outer : inner;
            const ang = (j * Math.PI) / 4;
            ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.shadowBlur = 5;
          ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        isRunningRef.current = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const emit = useCallback((screenX, screenY) => {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = acquire();
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.2;
      p.isstar = Math.random() > 0.5;
      p.x = screenX + (Math.random() - 0.5) * 18;
      p.y = screenY + (Math.random() - 0.5) * 18;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - Math.random() * 2.5;
      p.size = p.isstar ? Math.random() * 2.2 + 1.2 : Math.random() * 2.8 + 1;
      p.life = 1.0;
      p.decay = Math.random() * 0.038 + 0.022;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 0.14;
      p.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      activeRef.current.push(p);
    }
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      getCanvas();
      startLoop();
    }
  }, [getCanvas, startLoop]);

  const destroy = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    window.removeEventListener('resize', handleResize);
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
      ctxRef.current = null;
    }
    activeRef.current = [];
    isRunningRef.current = false;
  }, [handleResize]);

  return { emit, destroy };
};

const ScratchCard = ({ day, month, year, onScratchComplete }) => {
  const canvasRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { emit: emitSparkle, destroy: destroySparkles } = useScratchSparkles();
  
  useEffect(() => {
    if (isCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let dpr = window.devicePixelRatio || 1;
    const brushSize = 40;
    let lastCheckTime = 0;

    const updateSize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const w = canvas.width;
      const h = canvas.height;
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#EAD1A3');
      gradient.addColorStop(0.5, '#C6A152');
      gradient.addColorStop(1, '#A98131');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for(let i=0; i<400; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.5*dpr, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(100, 70, 20, 0.08)';
      for(let i=0; i<400; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.5*dpr, 0, Math.PI*2);
        ctx.fill();
      }
      const centerX = w / 2;
      const centerY = h / 2 - (5 * dpr);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#6E4E1D';
      ctx.font = `italic 400 ${32 * dpr}px "Times New Roman", Times, serif`;
      ctx.fillText('Scratch', centerX, centerY - (12 * dpr));
      ctx.font = `400 ${12 * dpr}px "Times New Roman", Times, serif`;
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${4 * dpr}px`;
      ctx.fillText('TO REVEAL', centerX + (2 * dpr), centerY + (22 * dpr));
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
      ctx.beginPath();
      ctx.moveTo(centerX - (15 * dpr), centerY + (40 * dpr));
      ctx.lineTo(centerX + (15 * dpr), centerY + (40 * dpr));
      ctx.strokeStyle = '#6E4E1D';
      ctx.lineWidth = 0.5 * dpr;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY + (40 * dpr), 1.5 * dpr, 0, Math.PI*2);
      ctx.fillStyle = '#6E4E1D';
      ctx.fill();
    };
    
    updateSize();

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top, screenX: clientX, screenY: clientY };
    };

    const scratch = (e) => {
      if (!isDrawing || isCompleted) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x * dpr, pos.y * dpr, brushSize * dpr, 0, Math.PI * 2);
      ctx.fill();
      emitSparkle(pos.screenX, pos.screenY);
      const now = Date.now();
      if (now - lastCheckTime > 200) {
        lastCheckTime = now;
        checkScratched();
      }
    };

    const checkScratched = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      let totalSamples = 0;
      // Stride sampling every 16th pixel for ~16x faster calculation with equal precision
      for (let i = 3; i < pixels.length; i += 64) {
        totalSamples++;
        if (pixels[i] === 0) transparent++;
      }
      const percent = (transparent / (totalSamples || 1)) * 100;
      if (percent > 18 && !isCompleted) {
        setIsCompleted(true);
        isDrawing = false;
        canvas.style.pointerEvents = 'none';
        canvas.style.touchAction = 'auto';
        gsap.to(canvas, { opacity: 0, duration: 0.5, onComplete: () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.display = 'none';
        }});
        onScratchComplete();
      }
    };

    const handleStart = (e) => {
      if (isCompleted) return;
      if (e.cancelable) e.preventDefault();
      isDrawing = true;
      scratch(e);
    };
    const handleEnd = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleStart, {passive: false});
    canvas.addEventListener('touchmove', scratch, {passive: false});
    canvas.addEventListener('touchend', handleEnd);
    
    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      if (!isCompleted) updateSize();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', scratch);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', scratch);
      canvas.removeEventListener('touchend', handleEnd);
      window.removeEventListener('resize', handleResize);
      destroySparkles();
    };
  }, [isCompleted, onScratchComplete, emitSparkle, destroySparkles]);

  return (
    <div className={styles.scratchWrapper}>
      <div className={styles.revealContent}>
        <span className={styles.dateDay}>{day}</span>
        <span className={styles.dateMonth}>{month}</span>
        <span className={styles.dateYear}>{year}</span>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.scratchCanvas}
        style={isCompleted ? { pointerEvents: 'none', touchAction: 'auto' } : undefined}
      ></canvas>
    </div>
  );
};

const ScratchDate = () => {
  const [completedCount, setCompletedCount] = useState(0);
  const containerRef = useRef(null);
  const scratchRowRef = useRef(null);

  const handleScratchComplete = () => {
    setCompletedCount(prev => prev + 1);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const introElements = [
      containerRef.current.querySelector(`.${styles.decorativeIcon}`),
      containerRef.current.querySelector(`.${styles.eyebrow}`),
      containerRef.current.querySelector(`.${styles.title}`)
    ].filter(Boolean);

    if (introElements.length > 0) {
      gsap.set(introElements, { opacity: 0, y: 25 });
    }

    if (scratchRowRef.current) {
      gsap.set(scratchRowRef.current, { opacity: 0, y: 35 });
    }

    const cleanupIntro = createScrollReveal(introElements[0], () => {
      gsap.to(introElements, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: "power2.out",
      });
    });

    const cleanupRow = createScrollReveal(scratchRowRef.current, () => {
      gsap.to(scratchRowRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    });

    return () => {
      cleanupIntro();
      cleanupRow();
    };
  }, []);

  useEffect(() => {
    if (completedCount === 1) {
      const tl = gsap.timeline();
      const heart = containerRef.current.querySelector(`.${styles.scratchWrapper}`);
      const dateSpans = containerRef.current.querySelectorAll(`.${styles.revealContent} span`);
      tl.to(heart, { scale: 1.025, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" })
        .fromTo(dateSpans,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" },
          "-=0.2"
        )
        .to(dateSpans, {
          color: "#D4AF37",
          textShadow: "0px 0px 12px rgba(212, 175, 55, 0.7)",
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          stagger: 0.15,
          ease: "power1.inOut"
        }, "-=0.2");
    }
  }, [completedCount]);

  const dateObj = new Date(weddingData.weddingDate);
  const day = dateObj.getDate().toString();
  const month = dateObj.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = dateObj.getFullYear().toString();

  return (
    <section className={`section-padding ${styles.scratchSection}`} ref={containerRef}>
      <CinematicParticles isActive={completedCount === 1} originRef={scratchRowRef} />
      <div className="container" style={{position: 'relative', zIndex: 10}}>
        <div className={styles.intro}>
          <img
            src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/ChatGPT_Image_Sep_6_2026_12_09_42_PM.webp"
            alt="Decorative icon"
            className={styles.decorativeIcon}
          />
          <span className={styles.eyebrow}>A LITTLE SECRET AWAITS...</span>
          <h2 className={`cursive-text ${styles.title}`}>Scratch to reveal our special date</h2>
        </div>
        <div className={styles.scratchRow} ref={scratchRowRef} style={{ position: 'relative' }}>
          <ScratchCard day={day} month={month} year={year} onScratchComplete={handleScratchComplete} />
        </div>
        <div className={`${styles.successMessage} ${completedCount === 1 ? styles.visible : ''}`}>
          <p>Now the date is yours to remember.</p>
          <div className={styles.scrollDownIndicator}>&#8595;</div>
        </div>
      </div>
    </section>
  );
};

export default ScratchDate;

