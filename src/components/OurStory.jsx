import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import FallingPetals from './FallingPetals';
import styles from './OurStory.module.css';

const OurStory = () => {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Header entrance animation (floral ornament, eyebrow, title)
    const headerElements = [
      containerRef.current.querySelector(`.${styles.floralTop}`),
      containerRef.current.querySelector(`.${styles.eyebrow}`),
      containerRef.current.querySelector(`.${styles.title}`)
    ].filter(Boolean);

    // Set initial GSAP states
    if (headerElements.length > 0) {
      gsap.set(headerElements, { opacity: 0, y: 25 });
    }
    elementsRef.current.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 30 });
    });

    // Reveal header elements on entrance
    const cleanupHeader = createScrollReveal(headerElements[0], () => {
      gsap.to(headerElements, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out",
      });
    });

    // Reveal chapter text and cinematic lines on entrance
    const cleanupElements = createScrollReveal(elementsRef.current, (el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: el.dataset.delay ? parseFloat(el.dataset.delay) : 0,
        ease: "power2.out",
      });
    });

    return () => {
      cleanupHeader();
      cleanupElements();
    };
  }, []);

  return (
    <section className={`section-padding ${styles.ourStory}`} ref={containerRef}>
      <FallingPetals />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div className={styles.floralContainer}>
          <img 
            src="https://res.cloudinary.com/kvup9rzt/image/upload/v1787740439/copy_of_0507217b-0927-4e8d-9062-cf4ce19f1741.png" 
            alt="Floral Ornament" 
            className={styles.floralTop}
          />
        </div>

        <div className={styles.header}>
          <span className={styles.eyebrow}>THE BEGINNING</span>
          <h2 className={`cursive-text ${styles.title}`}>Our Story</h2>
        </div>
        
        <div className={styles.storyContent}>
          {weddingData.storyChapters.map((chapter, idx) => (
            <div key={idx} className={styles.chapter}>
              {!chapter.isCinematic ? (
                <>
                  {chapter.heading && (
                    <h3 className={`cursive-text ${styles.chapterHeading}`} ref={addToRefs}>
                      {chapter.heading}
                    </h3>
                  )}
                  {chapter.text.map((paragraph, pIdx) => (
                    <p key={pIdx} className={styles.paragraph} ref={addToRefs}>
                      {paragraph}
                    </p>
                  ))}
                </>
              ) : (
                <div className={styles.cinematicMoment}>
                  <p className={styles.cinematicLine1} ref={addToRefs} data-delay="0">{chapter.lines[0]}</p>
                  <p className={styles.cinematicLine2} ref={addToRefs} data-delay="0.3">{chapter.lines[1]}</p>
                  <p className={styles.cinematicLine3} ref={addToRefs} data-delay="0.8">{chapter.lines[2]}</p>
                  <p className={`cursive-text ${styles.cinematicYes}`} ref={addToRefs} data-delay="0.3">{chapter.lines[3]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default OurStory;

