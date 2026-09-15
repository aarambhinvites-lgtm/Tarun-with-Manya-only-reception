import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { createScrollReveal } from '../utils/scrollReveal';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';

import styles from './Proposal.module.css';

const proposalImages = [
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415397/5.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415398/10.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415398/6.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415398/7.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/2.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/WhatsApp_Image_2026-09-02_at_3.01.26_PM.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/8.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/9.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/3.jpg",
  "https://res.cloudinary.com/kvup9rzt/image/upload/v1788415399/4.jpg"
];

const Proposal = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    const sectionEl = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === videoEl) {
            if (entry.isIntersecting) {
              videoEl?.play().catch(() => {});
            } else {
              videoEl?.pause();
            }
          } else if (entry.target === sectionEl) {
            if (entry.isIntersecting) {
              swiperRef.current?.autoplay?.start?.();
            } else {
              swiperRef.current?.autoplay?.stop?.();
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    if (videoEl) {
      observer.observe(videoEl);
    }
    if (sectionEl) {
      observer.observe(sectionEl);
    }

    // ScrollTrigger text and container animations
    if (!sectionRef.current) return () => observer.disconnect();

    const introElements = [
      sectionRef.current.querySelector(`.${styles.decorativeBorderTop}`),
      sectionRef.current.querySelector(`.${styles.eyebrow}`),
      sectionRef.current.querySelector(`.${styles.title}`)
    ].filter(Boolean);

    if (introElements.length > 0) {
      gsap.set(introElements, { opacity: 0, y: 25 });
    }

    const videoBox = sectionRef.current.querySelector(`.${styles.videoContainer}`);
    if (videoBox) {
      gsap.set(videoBox, { opacity: 0, y: 35 });
    }

    const galleryBox = sectionRef.current.querySelector(`.${styles.galleryContainer}`);
    if (galleryBox) {
      gsap.set(galleryBox, { opacity: 0, y: 35 });
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

    const cleanupVideo = createScrollReveal(videoBox, () => {
      gsap.to(videoBox, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    });

    const cleanupGallery = createScrollReveal(galleryBox, () => {
      gsap.to(galleryBox, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    });

    return () => {
      observer.disconnect();
      cleanupIntro();
      cleanupVideo();
      cleanupGallery();
    };
  }, []);

  return (
    <section className={styles.proposalSection} ref={sectionRef}>
      <div className={styles.intro}>
        <img 
          src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/Screenshot_2026-09-06_120922.webp" 
          alt="Decorative border" 
          className={styles.decorativeBorderTop} 
        />
        <span className={styles.eyebrow}>THE PROPOSAL</span>
        <h2 className={`cursive-text ${styles.title}`}>A Perfect Moment</h2>
      </div>

      <div className={styles.videoContainer}>
        <video 
          ref={videoRef}
          className={styles.proposalVideo}
          src="https://res.cloudinary.com/kvup9rzt/video/upload/v1788189257/download.mp4"
          poster="https://res.cloudinary.com/kvup9rzt/video/upload/so_0/v1788189257/download.jpg"
          muted 
          loop 
          playsInline
          preload="auto"
        />
      </div>
      
      <div className={styles.galleryContainer}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: `.${styles.customPagination}`,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: -20,
            depth: 150,
            modifier: 1.5,
            slideShadows: true,
          }}
          modules={[EffectCoverflow, Autoplay, Pagination]}
          className={styles.swiperContainer}
        >
          {proposalImages.map((src, i) => (
            <SwiperSlide key={i} className={styles.swiperSlide}>
              <img src={src} alt={`Proposal moment ${i + 1}`} loading="lazy" />
            </SwiperSlide>
          ))}
          <div className={styles.customPagination}></div>
        </Swiper>
      </div>
    </section>
  );
};

export default Proposal;

