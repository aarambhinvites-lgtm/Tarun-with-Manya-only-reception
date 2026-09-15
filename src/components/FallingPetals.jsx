import React, { useMemo } from 'react';
import styles from './FallingPetals.module.css';

const PETAL_IMAGE = 'https://res.cloudinary.com/dmmrt4kut/image/upload/t_seal/f_auto/q_auto/0c9fc7e6-14c3-4c12-b847-c47f445356ac.png';

const FallingPetals = () => {
  const petals = useMemo(() => {
    // 6 subtle petals strictly positioned in side gutters (3 left, 3 right)
    // Long staggered cycles so only 1-2 petals per side are active at any time
    // Leaving central story text 100% clear
    const configs = [
      // Left gutter petals (drift gently inward +X)
      { side: 'left', offset: '1.8%', delay: '0s', duration: '24s', size: 15, opacity: 0.40, anim: 'Left1' },
      { side: 'left', offset: '3.8%', delay: '8s', duration: '27s', size: 13, opacity: 0.36, anim: 'Left2' },
      { side: 'left', offset: '2.2%', delay: '16s', duration: '23s', size: 16, opacity: 0.44, anim: 'Left3' },

      // Right gutter petals (drift gently inward -X)
      { side: 'right', offset: '1.8%', delay: '4s', duration: '25s', size: 14, opacity: 0.38, anim: 'Right1' },
      { side: 'right', offset: '3.8%', delay: '12s', duration: '28s', size: 16, opacity: 0.42, anim: 'Right2' },
      { side: 'right', offset: '2.2%', delay: '19s', duration: '24s', size: 13, opacity: 0.36, anim: 'Right3' },
    ];

    return configs.map((c, i) => ({
      id: i,
      ...c,
    }));
  }, []);

  return (
    <div className={styles.petalsContainer} aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className={`${styles.petal} ${styles[`drift${petal.anim}`]}`}
          style={{
            [petal.side]: petal.offset,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            opacity: petal.opacity,
            backgroundImage: `url("${PETAL_IMAGE}")`,
          }}
        />
      ))}
    </div>
  );
};

export default FallingPetals;
