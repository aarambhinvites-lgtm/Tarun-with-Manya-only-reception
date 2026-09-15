import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './Countdown.module.css';

const Countdown = () => {
  const containerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const introElements = [
      containerRef.current.querySelector(`.${styles.decorativeIcon}`),
      containerRef.current.querySelector(`.${styles.eyebrow}`),
      containerRef.current.querySelector(`.${styles.title}`)
    ].filter(Boolean);

    const frameWrapper = containerRef.current.querySelector(`.${styles.frameWrapper}`);
    const timerBoxes = containerRef.current.querySelectorAll(`.${styles.timerBox}`);

    if (introElements.length > 0) gsap.set(introElements, { opacity: 0, y: 25 });
    if (frameWrapper) gsap.set(frameWrapper, { opacity: 0, y: 35 });
    if (timerBoxes && timerBoxes.length > 0) gsap.set(timerBoxes, { opacity: 0, y: 20 });

    const cleanupIntro = createScrollReveal(introElements[0], () => {
      gsap.to(introElements, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: "power2.out",
      });
    });

    const cleanupFrame = createScrollReveal(frameWrapper, () => {
      if (frameWrapper) {
        gsap.to(frameWrapper, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
        });
      }
      if (timerBoxes && timerBoxes.length > 0) {
        gsap.to(timerBoxes, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    });

    return () => {
      cleanupIntro();
      cleanupFrame();
    };
  }, []);

  useEffect(() => {
    const targetDate = new Date(weddingData.weddingDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsCompleted(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();

    // Pause timer interval when Countdown is off-screen to prevent unnecessary idle re-renders
    let interval = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          updateCountdown();
          if (!interval) {
            interval = setInterval(updateCountdown, 1000);
          }
        } else {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <section className={`section-padding ${styles.countdownSection}`} ref={containerRef}>
      <div className="container">
        
        {isCompleted ? (
          <div className={styles.completedState}>
            <h2 className={`cursive-text ${styles.completedText}`}>
              Today, two hearts become one.
            </h2>
          </div>
        ) : (
          <>
            <div className={styles.intro}>
              <img 
                src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/ChatGPT_Image_Sep_6_2026_12_27_45_PM.webp" 
                alt="Decorative icon" 
                className={styles.decorativeIcon}
              />
              <span className={styles.eyebrow}>THE COUNTDOWN</span>
              <h2 className={`cursive-text ${styles.title}`}>Countdown to Forever</h2>
            </div>
            
            <div className={styles.frameWrapper}>
              <div className={styles.frameContainer}>
                <img 
                  src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685152/ChatGPT_Image_Sep_6_2026_12_09_45_PM.webp" 
                  alt="Decorative frame" 
                  className={styles.frameImage}
                />
                <div className={styles.timerGrid}>
                  
                  <div className={styles.timerBox}>
                    <span className={styles.number}>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className={styles.label}>Days</span>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.timerBox}>
                    <span className={styles.number}>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className={styles.label}>Hours</span>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.timerBox}>
                    <span className={styles.number}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className={styles.label}>Minutes</span>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.timerBox}>
                    <span className={styles.number}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className={styles.label}>Seconds</span>
                  </div>
                  
                </div>
              </div>
            </div>
            
          </>
        )}
      </div>
    </section>
  );
};

export default Countdown;

