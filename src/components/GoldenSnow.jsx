import React from 'react';
import styles from './GoldenSnow.module.css';

const FLAKES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  left: `${((i * 17 + 7) % 100)}%`,
  animationDelay: `${((i * 3) % 10)}s`,
  animationDuration: `${10 + ((i * 5) % 10)}s`,
  opacity: 0.4 + ((i * 13) % 60) / 100,
  size: `${2 + ((i * 7) % 4)}px`
}));

const GoldenSnow = () => {
  const flakes = FLAKES;

  return (
    <div className={styles.snowContainer}>
      {flakes.map(flake => (
        <div 
          key={flake.id} 
          className={styles.flake}
          style={{
            left: flake.left,
            animationDelay: flake.animationDelay,
            animationDuration: flake.animationDuration,
            opacity: flake.opacity,
            width: flake.size,
            height: flake.size
          }}
        />
      ))}
    </div>
  );
};

export default GoldenSnow;

