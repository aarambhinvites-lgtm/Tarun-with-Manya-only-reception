import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import { RSVP_GOOGLE_SCRIPT_URL } from '../config';
import { createScrollReveal } from '../utils/scrollReveal';
import styles from './RSVP.module.css';

const RSVP = () => {
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    guests: 1,
    events: [],
    notAttending: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    const card = containerRef.current.querySelector(`.${styles.rsvpCard}`);
    const introElements = [
      containerRef.current.querySelector(`.${styles.decorativeIcon}`),
      containerRef.current.querySelector(`.${styles.title}`),
      containerRef.current.querySelector(`.${styles.subtitle}`)
    ].filter(Boolean);
    const formElements = containerRef.current.querySelectorAll(`.${styles.inputGroup}, .${styles.submitBtn}`);

    if (card) gsap.set(card, { opacity: 0, y: 45 });
    if (introElements.length > 0) gsap.set(introElements, { opacity: 0, y: 22 });
    if (formElements.length > 0) gsap.set(formElements, { opacity: 0, y: 20 });

    const cleanup = createScrollReveal(card || containerRef.current, () => {
      if (card) {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power2.out",
        });
      }

      if (introElements.length > 0) {
        gsap.to(introElements, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: "power2.out",
        });
      }

      if (formElements.length > 0) {
        gsap.to(formElements, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power2.out",
        });
      }
    });

    return () => cleanup();
  }, [isSuccess]);

  const handleGuestChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(10, prev.guests + delta))
    }));
  };

  const handleEventToggle = (eventId) => {
    setFormData(prev => {
      const isSelected = prev.events.includes(eventId);
      const updatedEvents = isSelected
        ? prev.events.filter(id => id !== eventId)
        : [...prev.events, eventId];
      return {
        ...prev,
        events: updatedEvents,
        notAttending: false
      };
    });
  };

  const handleNotAttendingToggle = () => {
    setFormData(prev => {
      const willNotAttend = !prev.notAttending;
      return {
        ...prev,
        notAttending: willNotAttend,
        events: willNotAttend ? [] : prev.events
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent duplicate submission
    if (isSubmitting) return;

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!formData.notAttending && formData.events.length === 0) {
      setError('Please select at least one event or let us know if you cannot attend.');
      return;
    }

    if (!RSVP_GOOGLE_SCRIPT_URL) {
      setError('RSVP service endpoint is not configured. Please set RSVP_GOOGLE_SCRIPT_URL in src/config.js or your .env file.');
      return;
    }

    // Map selected event IDs to display titles
    const selectedEventTitles = formData.notAttending
      ? ['I will not be attending']
      : formData.events.map(id => {
          const match = weddingData.events.find(ev => ev.id === id);
          return match ? match.title : id;
        });

    const payload = {
      fullName: trimmedName,
      numberOfGuests: formData.notAttending ? 0 : Number(formData.guests),
      eventsAttending: selectedEventTitles,
      notAttending: formData.notAttending
    };

    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(RSVP_GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await res.json();
      if (data && data.status === 'success') {
        setIsSuccess(true);
        setError('');
      } else {
        setError(data?.message || 'Unable to submit RSVP. Please try again.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Submission timed out. Please check your internet connection and try again.');
      } else {
        console.error('RSVP submission error:', err);
        setError('Unable to submit your RSVP right now. Please check your internet connection and try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`section-padding ${styles.rsvpSection}`} ref={containerRef}>
      <div className="container">
        <div className={styles.rsvpCard}>
          
          {isSuccess ? (
            <div className={styles.successState}>
              <h2 className={`cursive-text ${styles.successTitle}`}>Thank You</h2>
              <p className={styles.successText}>
                {formData.notAttending
                  ? "Thank you for letting us know. Your RSVP has been received and you will be dearly missed!"
                  : "Thank you, your RSVP has been received. We can't wait to celebrate with you!"}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.intro}>
                <img 
                  src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685152/ChatGPT_Image_Sep_6_2026_12_09_53_PM.webp" 
                  alt="Decorative icon" 
                  className={styles.decorativeIcon}
                />
                <h2 className={`cursive-text ${styles.title}`}>RSVP</h2>
                <p className={styles.subtitle}>
                  Your presence would mean the world to us.<br/>
                  Kindly let us know if you'll be joining our celebration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Jane & John Doe"
                  />
                </div>

                {!formData.notAttending && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Number of Guests</label>
                    <div className={styles.guestCounter}>
                      <button type="button" onClick={() => handleGuestChange(-1)} className={styles.counterBtn}>-</button>
                      <span className={styles.counterValue}>{formData.guests}</span>
                      <button type="button" onClick={() => handleGuestChange(1)} className={styles.counterBtn}>+</button>
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Events Attending</label>
                  <div className={styles.eventsList}>
                    {weddingData.events.map(event => (
                      <label key={event.id} className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          className={styles.checkbox}
                          checked={formData.events.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                        />
                        <span className={styles.customCheckbox}></span>
                        <span className={styles.eventName}>{event.title}</span>
                      </label>
                    ))}

                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox}
                        checked={formData.notAttending}
                        onChange={handleNotAttendingToggle}
                      />
                      <span className={styles.customCheckbox}></span>
                      <span className={styles.eventName}>I will not be attending</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'SENDING...' : 'SEND RSVP'}
                </button>

              </form>
            </>
          )}

        </div>
      </div>
    </section>
  );
};

export default RSVP;

