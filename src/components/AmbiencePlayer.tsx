import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { Volume2, VolumeX } from 'lucide-react';

// Ambience audio sources - using longer duration soundtracks
const ambienceSources = {
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  fire: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  waves: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  whitenoise: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
};

interface AmbiencePlayerProps {
  isActive?: boolean;
}

export const AmbiencePlayer: React.FC<AmbiencePlayerProps> = ({ isActive = true }) => {
  const { backgroundAmbience, ambienceVolume, customMusicUrl, setBackgroundAmbience, setAmbienceVolume } = useSettingsStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const playAudio = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;

    if (backgroundAmbience !== 'none' && isActive) {
      const source = backgroundAmbience === 'custom' 
        ? customMusicUrl 
        : ambienceSources[backgroundAmbience as keyof typeof ambienceSources];
      if (source && audio.src !== source) {
        audio.src = source;
        audio.volume = ambienceVolume;
        audio.load();
        playAudio();
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }

    return () => {
      audio.pause();
    };
  }, [backgroundAmbience, isActive]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambienceVolume;
    }
  }, [ambienceVolume]);

  if (backgroundAmbience === 'none' || !isActive) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      zIndex: 1000,
      padding: '15px 20px',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <button
        onClick={() => isPlaying ? audioRef.current?.pause() : playAudio()}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {isPlaying ? (
          <Volume2 size={20} color="white" />
        ) : (
          <VolumeX size={20} color="rgba(255, 255, 255, 0.5)" />
        )}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'capitalize' }}>
          {backgroundAmbience} {!isPlaying && '(Click to play)'}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={ambienceVolume * 100}
          onChange={(e) => setAmbienceVolume(parseInt(e.target.value) / 100)}
          style={{
            width: '100px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>
      <button
        onClick={() => setBackgroundAmbience('none')}
        style={{
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '20px',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Stop
      </button>
    </div>
  );
};
