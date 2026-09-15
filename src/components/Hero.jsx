import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import styles from './Hero.module.css';

const Hero = () => {
  const [hasStarted, setHasStarted] = useState(false);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const initialsRef = useRef(null);
  const buttonWrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const eyebrowRef = useRef(null);
  const brideRef = useRef(null);
  const ampersandRef = useRef(null);
  const groomRef = useRef(null);
  const scrollCueRef = useRef(null);

  // Initial load animation & video state setup
  useEffect(() => {
    // 1. Ensure video is paused on first frame and strictly muted
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // 2. Set initial GSAP states
    gsap.set(initialsRef.current, {
      filter: 'blur(10px)',
      opacity: 0,
      scale: 0.96
    });
    gsap.set(buttonRef.current, {
      opacity: 0,
      y: 12
    });

    // 3. Elegant entrance: monogram blur -> sharp, fade in, followed by TAP TO BEGIN
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(initialsRef.current, {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1,
      duration: 1.6,
      ease: 'power2.out',
      clearProps: 'scale,filter'
    })
    .to(buttonRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power2.out'
    }, "-=0.6");

    return () => {
      tl.kill();
    };
  }, []);

  // Pause hero video when scrolled out of view to free hardware video decoder during scrolling
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!hasStarted) return;
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Scroll lock while in initial hero state
  useEffect(() => {
    if (!hasStarted) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [hasStarted]);

  const handleStart = () => {
    if (hasStarted) return;

    // 1. Immediately unlock normal website scrolling
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    // Notify scroll & music systems to resume
    window.dispatchEvent(new CustomEvent('start-wedding-scroll'));

    // 2. Play hero video continuously in loop
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.loop = true;
      videoRef.current.play().catch((err) => {
        console.log("Video playback note:", err);
      });
    }

    // 3. Start background wedding music via existing music system on same user interaction
    window.dispatchEvent(new CustomEvent('start-wedding-music'));

    // 4. Capture starting bounding box of the large monogram
    gsap.killTweensOf(initialsRef.current);
    gsap.set(initialsRef.current, { opacity: 1, filter: 'none', scale: 1, x: 0, y: 0 });
    const firstRect = initialsRef.current.getBoundingClientRect();

    // 5. Fade out TAP TO BEGIN button at its exact viewport coordinates
    if (buttonWrapperRef.current && buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      buttonWrapperRef.current.style.position = 'fixed';
      buttonWrapperRef.current.style.top = `${btnRect.top}px`;
      buttonWrapperRef.current.style.left = `${btnRect.left}px`;
      buttonWrapperRef.current.style.width = `${btnRect.width}px`;
      buttonWrapperRef.current.style.height = `${btnRect.height}px`;
      buttonWrapperRef.current.style.margin = '0';
      buttonWrapperRef.current.style.transform = 'none';
      buttonWrapperRef.current.style.zIndex = '30';
      buttonWrapperRef.current.style.pointerEvents = 'none';

      gsap.to(buttonRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          if (buttonWrapperRef.current) {
            buttonWrapperRef.current.style.display = 'none';
          }
        }
      });
    }

    // 6. Synchronously update state to 'hasStarted'
    flushSync(() => {
      setHasStarted(true);
    });

    // 7. Capture target bounding box of small monogram above "We are getting married"
    const lastRect = initialsRef.current.getBoundingClientRect();

    // 8. Calculate FLIP inversion
    const firstCenterX = firstRect.left + firstRect.width / 2;
    const firstCenterY = firstRect.top + firstRect.height / 2;
    const lastCenterX = lastRect.left + lastRect.width / 2;
    const lastCenterY = lastRect.top + lastRect.height / 2;

    const deltaX = firstCenterX - lastCenterX;
    const deltaY = firstCenterY - lastCenterY;
    const scaleRatio = firstRect.width / (lastRect.width || 1);

    // Invert instantly so monogram visually starts at exact pre-tap position with 0 flicker
    gsap.set(initialsRef.current, {
      x: deltaX,
      y: deltaY,
      scale: scaleRatio,
      transformOrigin: 'center center'
    });

    // Ensure wedding text and scroll indicator start hidden before timeline reveal
    gsap.set([eyebrowRef.current, groomRef.current, ampersandRef.current, brideRef.current], {
      opacity: 0,
      y: 20
    });
    gsap.set(scrollCueRef.current, {
      opacity: 0,
      y: 12
    });

    // 9. Play smooth FLIP animation: slowed down, royal, cinematic glide
    const tl = gsap.timeline();

    // Monogram smoothly moves up and scales down right above "We are getting married"
    tl.to(initialsRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 2.4,
      ease: 'power2.out',
      clearProps: 'transform'
    })
    // "We are getting married" fades and glides in underneath the small monogram
    .to(eyebrowRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, "-=1.3")
    // "Tarun"
    .to(groomRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, "-=1.1")
    // "&"
    .to(ampersandRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power2.out'
    }, "-=1.1")
    // "Manya"
    .to(brideRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, "-=1.1")
    // Scroll indicator fades in at the bottom
    .to(scrollCueRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: 'power2.out'
    }, "-=0.8");
  };

  return (
    <section className={styles.heroSection}>
      {/* Hero Video Background */}
      <div ref={videoContainerRef} className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          defaultMuted
          autoPlay={false}
          loop
          preload="auto"
          poster={weddingData.assets.heroPoster}
        >
          <source src={weddingData.assets.heroVideo} type="video/mp4" />
        </video>
        <div className={styles.videoOverlay}></div>
      </div>

      {/* Main Content Area */}
      <div className={`${styles.content} ${hasStarted ? styles.active : ''}`}>
        <div className={styles.centerStage}>
          {/* Monogram: Large initially, smoothly scales down & moves up above text */}
          <div className={styles.monogramWrapper}>
            <img
              ref={initialsRef}
              src={weddingData.assets.monogram}
              alt="Wedding Monogram"
              className={`${styles.initials} ${hasStarted ? styles.initialsSmall : styles.initialsLarge}`}
            />
          </div>

          {/* TAP TO BEGIN Button (Shown initially, fades out on tap) */}
          <div ref={buttonWrapperRef} className={styles.buttonWrapper}>
            <button
              ref={buttonRef}
              className={styles.startButton}
              onClick={handleStart}
              type="button"
            >
              TAP TO BEGIN
            </button>
          </div>

          {/* Wedding Text (Revealed right below small monogram) */}
          <div
            className={`${styles.weddingTextContainer} ${
              !hasStarted ? styles.hiddenText : styles.visibleText
            }`}
          >
            <p ref={eyebrowRef} className={styles.weddingEyebrow}>
              We are getting married
            </p>
            <div className={styles.namesWrapper}>
              <span ref={groomRef} className={`cursive-text ${styles.nameBlock}`}>
                {weddingData.couple.groom}
              </span>
              <span ref={ampersandRef} className={styles.ampersand}>
                &
              </span>
              <span ref={brideRef} className={`cursive-text ${styles.nameBlock}`}>
                {weddingData.couple.bride}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
          <div className={styles.scrollLine}></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
