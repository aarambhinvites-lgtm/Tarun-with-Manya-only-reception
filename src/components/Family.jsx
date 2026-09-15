import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './Family.module.css';

const Family = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Intro entrance
    const introElements = [
      containerRef.current.querySelector(`.${styles.decorativeIcon}`),
      containerRef.current.querySelector(`.${styles.title}`),
      containerRef.current.querySelector(`.${styles.ornament}`)
    ].filter(Boolean);

    if (introElements.length > 0) {
      gsap.set(introElements, { opacity: 0, y: 25 });
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

    // 2. Family blocks and member lists
    const familyBlocks = containerRef.current.querySelectorAll(`.${styles.familyBlock}`);
    const cleanups = [];

    if (familyBlocks && familyBlocks.length > 0) {
      gsap.set(familyBlocks, { opacity: 0, y: 40 });

      familyBlocks.forEach((block) => {
        const members = block.querySelectorAll(`.${styles.sideTitle}, .${styles.memberGroup}`);
        if (members.length > 0) {
          gsap.set(members, { opacity: 0, y: 18 });
        }

        const cleanupBlock = createScrollReveal(block, () => {
          gsap.to(block, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power2.out",
          });

          if (members.length > 0) {
            gsap.to(members, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.08,
              ease: "power2.out",
            });
          }
        });

        cleanups.push(cleanupBlock);
      });
    }

    return () => {
      cleanupIntro();
      cleanups.forEach(c => c());
    };
  }, []);

  return (
    <section className={`section-padding ${styles.familySection}`} ref={containerRef}>
      <div className="container">
        
        <div className={styles.intro}>
          <img 
            src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/ChatGPT_Image_Sep_6_2026_12_09_50_PM.webp" 
            alt="Decorative icon" 
            className={styles.decorativeIcon}
          />
          <h2 className={`cursive-text ${styles.title}`}>With Their Families</h2>
          <div className={styles.ornament}></div>
        </div>

        <div className={styles.familiesContainer}>
          
          {/* Groom's Family */}
          <div className={styles.familyBlock}>
            <h3 className={styles.sideTitle}>{weddingData.couple.groom}'s Family</h3>
            
            <div className={styles.memberGroup}>
              <p className={styles.relation}>Parents</p>
              <p className={styles.names}>{weddingData.families.groom.parents.join(' & ')}</p>
            </div>
            
            {weddingData.families.groom.siblings.map((sib, idx) => (
              <div key={idx} className={styles.memberGroup}>
                <p className={styles.relation}>{sib.relation}</p>
                {sib.names
                  ? sib.names.map((n, i) => <p key={i} className={styles.names}>{n}</p>)
                  : <p className={styles.names}>{sib.name}</p>
                }
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>

          {/* Bride's Family */}
          <div className={styles.familyBlock}>
            <h3 className={styles.sideTitle}>{weddingData.couple.bride}'s Family</h3>
            
            <div className={styles.memberGroup}>
              <p className={styles.relation}>Parents</p>
              <p className={styles.names}>{weddingData.families.bride.parents.join(' & ')}</p>
            </div>
            
            {weddingData.families.bride.siblings.map((sib, idx) => (
              <div key={idx} className={styles.memberGroup}>
                <p className={styles.relation}>{sib.relation}</p>
                <p className={styles.names}>{sib.name}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Family;

