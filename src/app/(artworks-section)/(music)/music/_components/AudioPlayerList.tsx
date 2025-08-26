interface Track {
  title: string;
  src?: string;
  isPrimary?: boolean;
}

interface AudioPlayerListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelect: (track: Track) => void;
}
export default function AudioPlayerList({
  tracks,
  currentTrack,
  isPlaying,
  onSelect,
}: AudioPlayerListProps) {
  return (
    <ul className="list-none p-0">
      {tracks.map((track, index) => {
        const isActive = track.src === currentTrack?.src;

        return (
          <li
            key={index}
            className={`flex flex-col py-2 px-4 ${index === (tracks.length - 1) ? '' : 'border-b'} border-gray-200 ${
              track.src ? 'track' : 'text-gray-400'
            }`}
          >
            <div className="w-full flex justify-between">
              <span>{track.title}</span>
              <button
                disabled={!track.src}
                onClick={() => onSelect(track)}
                className={track.src ? 'hover:text-blue-700' : 'text-gray-400'}
              >
                {isActive && isPlaying ? (
                  <i className="bi bi-stop-circle"></i>
                ) : (
                  <i className="bi bi-play-circle"></i>
                )}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

