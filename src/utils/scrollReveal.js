/**
 * Ultra-performant native scroll reveal utility using IntersectionObserver.
 * Runs on the browser compositor thread with 0 scroll listeners, 0 forced reflows,
 * and 0 viewport jumping.
 */
export const createScrollReveal = (targets, callback, options = {}) => {
  if (!targets) return () => {};

  const elements = Array.isArray(targets) 
    ? targets.filter(Boolean) 
    : [targets].filter(Boolean);

  if (elements.length === 0) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -10% 0px', // Triggers when element enters bottom 10% of viewport
      threshold: 0.05,
      ...options,
    }
  );

  elements.forEach((el) => {
    if (el && el instanceof Element) {
      observer.observe(el);
    }
  });

  return () => observer.disconnect();
};
