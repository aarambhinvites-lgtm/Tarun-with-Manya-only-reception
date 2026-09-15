import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './Invitation.module.css';

const Invitation = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const innerItems = [
      cardRef.current.querySelector(`.${styles.ornamentTop}`),
      cardRef.current.querySelector(`.${styles.togetherText}`),
      cardRef.current.querySelector(`.${styles.cordialInvite}`),
      cardRef.current.querySelector(`.${styles.inviteText}`),
      cardRef.current.querySelector(`.${styles.groomSection}`),
      cardRef.current.querySelector(`.${styles.ampersand}`),
      cardRef.current.querySelector(`.${styles.brideSection}`)
    ].filter(Boolean);

    // Initial hidden states
    gsap.set(cardRef.current, { y: 50, opacity: 0 });
    if (innerItems.length > 0) {
      gsap.set(innerItems, { opacity: 0, y: 22 });
    }

    const cleanup = createScrollReveal(cardRef.current, () => {
      // 1. Smooth card entrance
      gsap.to(cardRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
      });

      // 2. Staggered inner invitation text unveil
      if (innerItems.length > 0) {
        gsap.to(innerItems, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: "power2.out",
        });
      }
    });

    return () => cleanup();
  }, []);

  return (
    <section className={`section-padding ${styles.invitationSection}`}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div 
          className={styles.card} 
          ref={cardRef}
        >
          <div className={styles.innerBorder}>
            
            <img 
              src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/ChatGPT_Image_Sep_6_2026_12_09_07_PM.webp" 
              alt="Top Decorative Border" 
              className={styles.ornamentTop} 
            />

            <p className={styles.togetherText}>Together With Our Families</p>

            <h2 className={`cursive-text ${styles.cordialInvite}`}>We Joyfully Invite You</h2>
            
            <p className={styles.inviteText}>
              to celebrate the wedding of
            </p>

            <div className={styles.groomSection}>
              <h3 className={`cursive-text ${styles.name}`}>{weddingData.couple.groom}</h3>
              <p className={styles.relation}>son of</p>
              <p className={styles.parents}>
                {weddingData.families.groom.parents.join(' & ')}
              </p>
            </div>

            <p className={`cursive-text ${styles.ampersand}`}>&</p>

            <div className={styles.brideSection}>
              <h3 className={`cursive-text ${styles.name}`}>{weddingData.couple.bride}</h3>
              <p className={styles.relation}>daughter of</p>
              <p className={styles.parents}>
                {weddingData.families.bride.parents.join(' & ')}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Invitation;

