import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import styles from './Messages.module.css';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGju6dBZfVPYYwLy4vNNHKfiVhtPt-MsKC--VkGCXJriMfRgt4uBA8Oze0UK5PjL_Z/exec';
const MAX_MESSAGE_LENGTH = 200;

const Messages = () => {
  const sectionRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0); // index into messages (0 = newest)
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Touch / drag state for carousel
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  // ── Fetch Shared Messages from Google Sheets ──────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.status === 'success' && Array.isArray(data.data)) {
          setMessages((prev) => {
            if (
              prev.length === data.data.length &&
              prev.length > 0 &&
              prev[0]?.id === data.data[0]?.id &&
              prev[prev.length - 1]?.id === data.data[data.data.length - 1]?.id
            ) {
              return prev;
            }
            return data.data;
          });
          setActiveIndex((prev) => (data.data.length === 0 ? 0 : Math.min(prev, data.data.length - 1)));
        }
      } catch (err) {
        console.error('Error fetching guest messages from Google Sheets:', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 20000); // Poll every 20s for cross-device updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Submit Message to Google Sheets ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const trimmedName = newName.trim();
    const trimmedMessage = newMessage.trim();
    if (!trimmedName || !trimmedMessage || isSubmitting) return;
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) return;

    setIsSubmitting(true);

    const newEntry = {
      id: Date.now(),
      name: trimmedName,
      text: trimmedMessage.slice(0, MAX_MESSAGE_LENGTH),
      timestamp: Date.now(),
    };

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          name: trimmedName,
          message: trimmedMessage.slice(0, MAX_MESSAGE_LENGTH),
        }),
      });

      const data = await res.json();
      if (data && data.status !== 'success') {
        throw new Error(data.message || 'Failed to save to Google Sheets');
      }

      // SUCCESS:
      setIsAnimating(true);
      setMessages((prev) => [newEntry, ...prev]);
      setActiveIndex(0); // Focus newest
      setNewName('');
      setNewMessage('');
      setSubmitError('');

      setTimeout(() => setIsAnimating(false), 600);
    } catch (err) {
      console.error('Error posting message to Google Sheets:', err);
      setSubmitError('Unable to send message right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (messages.length === 0) return;
    const clamped = Math.max(0, Math.min(messages.length - 1, idx));
    setActiveIndex(clamped);
  }, [messages.length]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  // ── Touch handlers for Carousel Stage ─────────────────────────────────────────
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging.current = true;
    }
  };

  const onTouchEnd = (e) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
    touchStartX.current = null;
    isDragging.current = false;
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const hasMessages = messages.length > 0;

  // Compute per-card position class
  const getCardRole = (idx) => {
    const diff = idx - activeIndex;
    if (diff === 0) return 'main';
    if (diff === 1) return 'next';
    if (diff === -1) return 'prev';
    if (diff > 1) return 'far-next';
    return 'far-prev';
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const introElements = [
        sectionRef.current.querySelector(`.${styles.decorativeIcon}`),
        sectionRef.current.querySelector(`.${styles.eyebrow}`),
        sectionRef.current.querySelector(`.${styles.title}`)
      ].filter(Boolean);

      if (introElements.length > 0) {
        gsap.fromTo(introElements,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: introElements[0],
              start: "top 85%",
              once: true,
            }
          }
        );
      }

      const form = sectionRef.current.querySelector(`.${styles.messageForm}`);
      if (form) {
        gsap.fromTo(form,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: form,
              start: "top 85%",
              once: true,
            }
          }
        );
      }

      const stage = sectionRef.current.querySelector(`.${styles.carouselWrapper}, .${styles.emptyState}`);
      if (stage) {
        gsap.fromTo(stage,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stage,
              start: "top 85%",
              once: true,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [hasMessages]);

  return (
    <section className={`section-padding ${styles.messagesSection}`} ref={sectionRef}>
      <div className="container">

        {/* ── Header ── */}
        <div className={styles.intro}>
          <img
            src="https://res.cloudinary.com/kvup9rzt/image/upload/v1788685151/ChatGPT_Image_Sep_6_2026_12_09_55_PM.webp"
            alt="Decorative icon"
            className={styles.decorativeIcon}
          />
          <span className={styles.eyebrow}>YOUR WISHES</span>
          <h2 className={`cursive-text ${styles.title}`}>Leave a Little Love</h2>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.messageForm}>
          <input
            type="text"
            placeholder="Your Name"
            className={styles.input}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={60}
            disabled={isSubmitting}
          />
          <div className={styles.textareaWrapper}>
            <textarea
              placeholder="Your Message"
              className={styles.textarea}
              value={newMessage}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  setNewMessage(e.target.value);
                }
              }}
              rows={3}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={isSubmitting}
            />
            <div className={styles.charCounter}>
              {newMessage.length} / {MAX_MESSAGE_LENGTH}
            </div>
          </div>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!newName.trim() || !newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH || isSubmitting}
          >
            {isSubmitting ? 'SENDING...' : 'Leave Message'}
          </button>
          {submitError && <p className={styles.submitError}>{submitError}</p>}
        </form>

        {/* ── Carousel or Empty State ── */}
        {hasMessages ? (
          <div className={styles.carouselWrapper}>

            {/* Card stage */}
            <div
              className={styles.cardStage}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {messages.map((msg, idx) => {
                const role = getCardRole(idx);
                // Only render cards that are within 2 positions of active
                const diff = idx - activeIndex;
                if (diff < -1 || diff > 2) return null;

                return (
                  <div
                    key={msg.id || idx}
                    className={`
                      ${styles.card}
                      ${styles[`card--${role}`]}
                      ${isAnimating && idx === 0 ? styles.cardEntrance : ''}
                    `}
                    aria-hidden={role !== 'main'}
                    onClick={() => role !== 'main' && goTo(idx)}
                  >
                    <p className={styles.messageText}>{msg.text}</p>
                    <p className={`cursive-text ${styles.messageName}`}>{msg.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Swipe hint */}
            <p className={styles.swipeCue}>← Swipe to explore →</p>

            {/* Counter + nav */}
            <div className={styles.controls}>
              <button
                className={styles.navBtn}
                onClick={goPrev}
                disabled={activeIndex === 0}
                aria-label="Previous message"
              >
                ‹
              </button>

              <span className={styles.counter}>
                {String(activeIndex + 1).padStart(2, '0')}
                {' / '}
                {String(messages.length).padStart(2, '0')}
              </span>

              <button
                className={styles.navBtn}
                onClick={goNext}
                disabled={activeIndex === messages.length - 1}
                aria-label="Next message"
              >
                ›
              </button>
            </div>

          </div>
        ) : (
          /* ── Empty State ── */
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✉</div>
            <p className={styles.emptyText}>
              Be the first to leave a wish for Tarun &amp; Manya
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Messages;
