import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { createScrollReveal } from '../utils/scrollReveal';
import './Events.css';

// ==============================
// CARNIVAL OF LOVE
// ==============================
const haldiSangeet = {
  title: "Carnival of Love",
  subheading: (
    <>
      Phoolon Ki<br />Haldi aur Sangeet
    </>
  ),
  date: "10 December 2026",
  day: "Thursday",
  time: "12:30 PM",
  dressCode: "Festive Indian • Bright & Colourful",
  venue: "Regenta Central Klassik, Ludhiana",
  address: "",
  locationButtonText: "EXPLORE VENUE",
  backgroundImage: "https://res.cloudinary.com/kvup9rzt/image/upload/v1789021472/ChatGPT_Image_Sep_10_2026_11_50_44_AM.webp",
  locationUrl: "https://www.google.com/maps/place/Regenta+Central+Klassik/@30.892329,75.847686,17z/data=!3m1!4b1!4m9!3m8!1s0x391a83ac9b5502e1:0xaafaff64d33c6778!5m2!4m1!1i2!8m2!3d30.892329!4d75.847686!16s%2Fg%2F1tcztb95?hl=en-us&entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D"
};

// ==============================
// ANAND KARAJ
// ==============================
const anandKaraj = {
  title: "Anand Karaj",
  subheading: "One light, two forms",
  date: "11 December 2026",
  day: "Friday",
  time: "10:00 AM",
  dressCode: "Traditional Indian • Pastels encouraged",
  venue: "Gurdwara Sri Guru Singh Sabha",
  address: "Sarabha Nagar, Ludhiana",
  locationButtonText: "EXPLORE VENUE",
  backgroundImage: "https://res.cloudinary.com/kvup9rzt/image/upload/v1788860630/ChatGPT_Image_Sep_8_2026_01_27_02_PM.webp",
  locationUrl: "https://maps.google.com?q=D-Block,%20Block%20D,%20Sarabha%20Nagar,%20Ludhiana,%20Punjab%20141001&ftid=0x391a83cd9cc9d721:0xcb058d24622ed52&entry=gps&shh=CAE&lucs=,100834231,121816459,94297699,94231188,94280568,47071704,94218641,94282134,100813469,94286869,100820247,100822499&g_st=ic"
};

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

    // 2. Each Event Card + Inner Text Elements
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
          <h2 className="cursive-text events-title">The Celebrations</h2>
        </div>

        <div className="events-list">
          <EventCard 
            config={haldiSangeet} 
            className="event--haldi-sangeet" 
            cardRef={el => cardsRef.current[0] = el} 
          />
          <EventCard 
            config={anandKaraj} 
            className="event--anand-karaj" 
            cardRef={el => cardsRef.current[1] = el} 
          />
          <EventCard 
            config={reception} 
            className="event--reception" 
            cardRef={el => cardsRef.current[2] = el} 
          />
        </div>
      </div>
    </section>
  );
};

export default Events;
