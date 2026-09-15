import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Globe } from 'lucide-react';
import { weddingData } from '../data/weddingData';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './Footer.module.css';

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const thankYouElements = [
      footerRef.current.querySelector(`.${styles.eyebrow}`),
      footerRef.current.querySelector(`.${styles.message}`),
      footerRef.current.querySelector(`.${styles.monogram}`),
      footerRef.current.querySelector(`.${styles.signature}`)
    ].filter(Boolean);

    const branding = footerRef.current.querySelector(`.${styles.branding}`);

    if (thankYouElements.length > 0) {
      gsap.set(thankYouElements, { opacity: 0, y: 22 });
    }
    if (branding) {
      gsap.set(branding, { opacity: 0, y: 25 });
    }

    const cleanupThankYou = createScrollReveal(thankYouElements[0], () => {
      gsap.to(thankYouElements, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: "power2.out",
      });
    });

    const cleanupBranding = createScrollReveal(branding, () => {
      gsap.to(branding, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
      });
    });

    return () => {
      cleanupThankYou();
      cleanupBranding();
    };
  }, []);

  return (
    <footer className={`section-padding ${styles.footer}`} ref={footerRef}>
      <div className="container">
        
        <div className={styles.thankYouBlock}>
          <span className={styles.eyebrow}>THANK YOU</span>
          <p className={styles.message}>
            Thank you for being a part of our story.<br/>
            We cannot wait to celebrate this beautiful beginning with you.
          </p>
          <img 
            src={weddingData.assets.monogram} 
            alt="Monogram" 
            className={styles.monogram} 
          />
          <p className={styles.signature}>With love,<br/><span className={`cursive-text ${styles.names}`}>Bedi & Dadarya<br/>Family</span></p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.branding}>
          <p className={styles.madeWith}>MADE WITH ♥ BY</p>
          <img 
            src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788197316/Aarmabh_Invites_Logo.png" 
            alt="Aarambh Invites" 
            className={styles.brandLogo} 
          />
          <div className={styles.socialRow}>
            <a href="https://aarambhinvites.com/" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
              <Globe size={18} strokeWidth={1.5} />
              <span>Website</span>
            </a>
            <a href="https://www.instagram.com/aarambhinvites?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

