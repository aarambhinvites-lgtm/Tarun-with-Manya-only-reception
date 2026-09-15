import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { createScrollReveal } from '../utils/scrollReveal';
import './Events.css';

// ==============================
// RECEPTION
// ==============================
const reception = {
  title: "Reception",
  subheading: "To love, laughter and forever",
  date: "11 December 2026",
  day: "Friday",
  time: "08:00 PM",
  dressCode: "Indian Formal / Formal",
  venue: "Ambrosia Paradise",
  address: "Ludhiana - Malerkotla Road",
  locationButtonText: "EXPLORE VENUE",
  backgroundImage: "https://res.cloudinary.com/kvup9rzt/image/upload/v1788887785/ChatGPT_Image_Sep_8_2026_10_42_03_PM.webp",
  locationUrl: "https://maps.google.com?q=Ambrosia%20Paradise%20%7C%20Wedding%20Resort%20%7C%20All%20Weather%20Lawn,%20Ludhiana%20-%20Malerkotla%20Rd,%20VPO,%20Kaind,%20Punjab%20141116,%20India&ftid=0x391079b319cbf909:0x6fc9faee72016073&entry=gps&shh=CAE&lucs=,100834231,121816459,94297699,94231188,94280568,47071704,94218641,94282134,100813469,94286869,100820247,100822499&g_st=ic"
};

const EventCard = ({ config, className, cardRef }) => {
  const titleParts = config.title.split('&').map(t => t.trim());
  const titleTop = titleParts[0];
  const titleBottom = titleParts.length > 1 ? titleParts[1] : '';

  return (
    <div className={`event-card ${className}`} ref={cardRef}>
      <div className="event-card-wrapper">
        <img 
          src={config.backgroundImage} 
          width="848" 
          height="1854" 
          className="event-bg-media" 
          alt={config.title}
        />
        
        <div className="event-center-overlay">
          <h2 className="cursive-text event-title-text">
            <span style={{ display: 'block' }}>{titleTop}</span>
            {titleBottom && (
              <>
                <span className="event-ampersand" style={{ display: 'block' }}>&</span> 
                <span style={{ display: 'block' }}>{titleBottom}</span>
              </>
            )}
          </h2>
          
          {config.subheading && (
            <p className="event-subheading-text">
              {typeof config.subheading === 'string' && /<\/?br\s*\/?>/i.test(config.subheading)
                ? config.subheading.split(/<\/?br\s*\/?>/i).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))
                : config.subheading}
            </p>
          )}
          
          <p className="event-date-text">
            {config.day},<br/>{config.date}
          </p>
          
          {config.time && <p className="event-time-text">{config.time}</p>}
          
          {config.dressCode && (
            <div className="event-dresscode-block">
              <p className="event-dresscode-label">Dress Code:</p>
              <p className="event-dresscode-text">{config.dressCode}</p>
            </div>
          )}
          
          <div className="event-venue-block">
            <p className="event-venue-title">VENUE</p>
            {config.venue && <p className="event-venue-main">{config.venue}</p>}
            {config.address && <p className="event-venue-sub">{config.address}</p>}
          </div>

          <a href={config.locationUrl} target="_blank" rel="noopener noreferrer" className="event-loc-btn">
            {config.locationButtonText || "EXPLORE VENUE"}
          </a>
        </div>
      </div>
    </div>
  );
};

const Events = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Section Title Entrance
    const titleEl = containerRef.current.querySelector('.events-title');
    if (titleEl) {
      gsap.set(titleEl, { opacity: 0, y: 30 });
    }

    const cleanupTitle = createScrollReveal(titleEl, () => {
      gsap.to(titleEl, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power2.out",
      });
    });

    // 2. Event Card + Inner Text Elements
    const cleanups = [];
    cardsRef.current.forEach((card) => {
      if (!card) return;

      const textElements = card.querySelectorAll(
        '.event-title-text, .event-subheading-text, .event-date-text, .event-time-text, .event-dresscode-block, .event-venue-block, .event-loc-btn'
      );

      gsap.set(card, { opacity: 0, y: 45 });
      if (textElements.length > 0) {
        gsap.set(textElements, { opacity: 0, y: 20 });
      }

      const cleanupCard = createScrollReveal(card, () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power2.out",
        });

        if (textElements.length > 0) {
          gsap.to(textElements, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power2.out",
          });
        }
      });

      cleanups.push(cleanupCard);
    });

    return () => {
      cleanupTitle();
      cleanups.forEach(c => c());
    };
  }, []);

  return (
    <section className="events-section section-padding" ref={containerRef}>
      <div className="container">
        <div className="events-intro">
          <h2 className="cursive-text events-title">The Celebration</h2>
        </div>

        <div className="events-list">
          <EventCard 
            config={reception} 
            className="event--reception" 
            cardRef={el => cardsRef.current[0] = el} 
          />
        </div>
      </div>
    </section>
  );
};

export default Events;
