import PersistentAudio from '../components/PersistentAudio';

export default function AppShellExample({ children }) {
  return (
    <>
      {/* Keep this mounted ABOVE route/page content */}
      <PersistentAudio
        src="/media/audio/track-13.mp3"
        volume={0.35}
        fadeMs={2400}
        buttonLabel="Begin Experience"
      />

      {/* Route/page transitions happen BELOW this */}
      {children}
    </>
  );
}
