'use client';

import { useRef, useState, useEffect } from 'react';
import Image from "next/image";
import AudioPlayerList from './AudioPlayerList';
import AudioBarFix from './AudioBarFix';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-bootstrap';
import staticAlbuns from '@MyAlbuns';

interface Track {
  title: string;
  src?: string;
  isPrimary?: boolean;
  software?: string[];
}

interface Album {
  id?: string;
  title: string;
  year: number;
  genre: string;
  composer: string;
  coverImage: string;
  tracks: Track[];
}

export default function AudioPlayerController() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [albuns, setAlbuns] = useState<Album[]>(staticAlbuns);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/albums')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setAlbuns(data);
                }
            })
            .catch(err => console.error("Error fetching albums:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = (selectedIndex: number) => {
        setActiveIndex(selectedIndex);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTrack(null);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const handleTrackSelect = (track: Track) => {
        const audio = audioRef.current;
        if (!track.src || !audio) return;

        if (track.src === currentTrack?.src) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play();
                setIsPlaying(true);
            }
        } else {
            audio.src = track.src;
            audio.play();
            setCurrentTrack(track);
            setIsPlaying(true);
            setCurrentTime(0);
            setDuration(0);
        }
    };

    const handleSeek = (value: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value;
        }
    };

    if (loading && (!albuns || albuns.length === 0)) {
        return <div className="text-center p-8 text-gray-500">Carregando player de áudio...</div>;
    }

    return (
        <>
        <div className="w-full mb-4">
                <ul className="flex items-center justify-center space-x-4 p-4 overflow-x-auto">
                  {albuns.map((album, index) => (
                    <li
                      key={album.id || index}
                      className={`cursor-pointer p-2 flex-shrink-0`}
                      onClick={() => {
                        handleSelect(index);
                      }}
                    >
                      <Image
                        src={`/${album.coverImage.startsWith('/') ? album.coverImage.slice(1) : album.coverImage}`}
                        alt={album.title}
                        width={80}
                        height={80}
                        className={`w-[80px] h-[80px] object-cover rounded-lg shadow-md ${!(activeIndex === index) ? 'opacity-40' : 'opacity-100'}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            <audio ref={audioRef} />
            <AudioBarFix
                track={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={() => handleTrackSelect(currentTrack!)}
                onSeek={handleSeek}
            />
            <Carousel interval={null} controls={false} indicators={false} activeIndex={activeIndex} onSelect={handleSelect}>
            {albuns.map((album, albumIndex) => (
                <Carousel.Item key={album.id || albumIndex}>
                  <div className="flex flex-col md:flex-row lg:space-x-4 lg:px-4 lg:mb-0">
                    <div className="flex-1 md:p-6 lg:mb-0 mb-4 bg-white border text-dark w-full md:w-[400px] rounded text-left">
                      <AudioPlayerList
                          tracks={album.tracks}
                          currentTrack={currentTrack}
                          isPlaying={isPlaying}
                          onSelect={handleTrackSelect}
                      />
                    </div>
                    <div className="flex flex-col mt-0 mb-4 items-center md:items-start">
                      <img
                          src={`/${album.coverImage.startsWith('/') ? album.coverImage.slice(1) : album.coverImage}`}
                          alt={album.title}
                          className="album-cover w-full max-w-[300px] md:max-w-none h-auto rounded-lg shadow-md mt-0"
                      />
                      <div className="text-xs text-gray-600 mt-2">
                          <ul>
                          <li><strong>Álbum:</strong> {album.title}</li>
                          <li><strong>Ano:</strong> {album.year}</li>
                          <li><strong>Gênero:</strong> {album.genre}</li>
                          <li><strong>Compositor:</strong> {album.composer}</li>
                          </ul>
                      </div>
                      <div className="flex justify-center mt-2 w-full">
		                    <a href="/support">
		                    	 <FontAwesomeIcon icon={ faDownload } size="3x" />
		                    </a>
		                </div>
                    </div>                    
                  </div>
                </Carousel.Item>
            ))}
            </Carousel>
        </>
    )
}
