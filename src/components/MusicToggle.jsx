import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { weddingData } from '../data/weddingData';
import styles from './MusicToggle.module.css';

const MusicToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(weddingData.assets.music);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Listen for custom event from Hero component to start music
    const handleStartMusic = () => {
      if (audio && audio.paused) {
        audio.play().catch(err => console.log("Audio play failed:", err));
      }
    };

    window.addEventListener('start-wedding-music', handleStartMusic);

    return () => {
      window.removeEventListener('start-wedding-music', handleStartMusic);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(err => console.log("Audio play failed:", err));
    } else {
      audio.pause();
    }
  };

  return (
    <button
      type="button"
      className={styles.musicToggle}
      onClick={toggleMusic}
      aria-label={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </button>
  );
};

export default MusicToggle;

