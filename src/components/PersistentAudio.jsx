import { useEffect, useRef, useState } from 'react';

const START_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

export default function PersistentAudio({
  src = '/media/audio/track-13.mp3',
  volume = 0.35,
  fadeMs = 2200,
  buttonLabel = 'Begin Experience',
}) {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    const startAudio = async () => {
      try {
        setBlocked(false);
        await audio.play();
        setStarted(true);
        fadeIn(audio, volume, fadeMs, fadeRef);
        removeStartListeners(startAudio);
      } catch (error) {
        setBlocked(true);
      }
    };

    addStartListeners(startAudio);

    return () => {
      removeStartListeners(startAudio);
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    };
  }, [fadeMs, volume]);

  async function handleButtonStart() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setStarted(true);
      setBlocked(false);
      fadeIn(audio, volume, fadeMs, fadeRef);
    } catch (error) {
      setBlocked(true);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} playsInline preload="auto" />

      {(!started || blocked) && (
        <button
          type="button"
          onClick={handleButtonStart}
          className="fixed bottom-5 right-5 z-[9999] rounded-full border border-white/20 bg-black/60 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-black/75"
          aria-label="Start ambient background music"
        >
          {buttonLabel}
        </button>
      )}
    </>
  );
}

function fadeIn(audio, targetVolume, fadeMs, fadeRef) {
  const startedAt = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - startedAt) / fadeMs);
    audio.volume = targetVolume * easeOutCubic(progress);

    if (progress < 1) {
      fadeRef.current = requestAnimationFrame(step);
    }
  }

  if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
  fadeRef.current = requestAnimationFrame(step);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function addStartListeners(listener) {
  START_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, listener, { passive: true, once: true });
  });
}

function removeStartListeners(listener) {
  START_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, listener);
  });
}
