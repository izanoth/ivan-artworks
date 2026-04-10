import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons'; // Keep faMusic as a fallback

interface Track {
  title: string;
  src?: string;
  isPrimary?: boolean;
  software?: string[]; // Added software property
}

interface AudioPlayerListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelect: (track: Track) => void;
}

// Map software names to local icon paths
const softwareIconMap: { [key: string]: string } = {
  MuseScore: "/icons/musescore.svg",
  Audacity: "/icons/audacity.svg",
  LMMS: "/icons/lmms.svg",
  // Add other software and their local icon paths here
};

const softIconBgColor: { [key: string]: string } = {
  MuseScore: "bg-cyan-100",
  Audacity: "bg-fuchsia-100",
  LMMS: "bg-green-100",
  // Add other software and their local icon paths here
};

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
            <div className="w-full flex justify-between items-center">
	            <div className="flex items-center gap-3">
					  <span>{track.title}</span>					
					  {track.software && track.software.map((softwareName, sIndex) => (
					    softwareIconMap[softwareName] ? (
					      <img
					        key={sIndex}
					        src={softwareIconMap[softwareName]}
					        alt={softwareName}
					        title={softwareName}
					        className={`inline-flex items-center justify-center rounded-full ${softIconBgColor[softwareName]} px-1 py-1 h-7 w-7`}
					      />
					    ) : (
					      <span
					        key={sIndex}
					        title={softwareName}
					        className="flex items-center justify-center rounded-full bg-gray-400 text-gray-500 text-xs h-5 w-5"
					      >
					        <FontAwesomeIcon icon={faMusic} />
					      </span>
					    )
					  ))}
					</div>
              <div className="flex items-center space-x-2">            
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}


