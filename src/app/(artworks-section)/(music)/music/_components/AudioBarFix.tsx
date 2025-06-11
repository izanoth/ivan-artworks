interface Track {
  title: string;
  src?: string;
  isPrimary?: boolean;
}


interface AudioBarFixProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (value: number) => void;
}

export default function AudioBarFix({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}: AudioBarFixProps) {
  if (!track) return null;

  const formatTime = (time: number) =>
    `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(
      Math.floor(time % 60)
    ).padStart(2, '0')}`;

  return (
    <div className={`${isPlaying ? '' : 'hidden'} fixed bottom-0 left-1/2 transform -translate-x-1/2 w-max-[600px] bg-gray-300 border-t px-4 py-2 shadow-lg z-50`}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-mono">{track.title}</div>
        <button onClick={onPlayPause} className="ml-4">
          {isPlaying ? (
            <i className="bi bi-stop-circle"></i>
          ) : (
            <i className="bi bi-play-circle"></i>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full mx-2"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

