"use client";

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel } from 'react-bootstrap';
import albuns from '../myalbuns.js';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="w-full mb-4">
        <ul className="flex items-center justify-center space-x-4 p-4">
          <li>
            <i className="fa-solid fa-wine-bottle text-4xl"></i>
          </li>
          {albuns.map((album, index) => (
            <li
              key={index}
              className={`cursor-pointer p-2`}
              onClick={() => {
                handleSelect(index);
              }}
            >
              <Image
                src={`/${album.coverImage}`}
                alt={album.title}
                width={80}
                height={80}
                className={`w-full h-auto rounded-lg shadow-md ${!(activeIndex === index) ? 'opacity-40' : 'opacity-100'}`}
              />
            </li>
          ))}
          <li>
            <i className="fa-solid fa-wine-glass text-4xl"></i>
          </li>
        </ul>
      </div>
      <section className="text-center">
        <Carousel interval={null} controls={false} indicators={false} activeIndex={activeIndex} onSelect={handleSelect}>
          {albuns.map((album, albumIndex) => (
            <Carousel.Item key={albumIndex}>
              <div className="flex flex-col md:flex-row lg:space-x-4 lg:px-4 mb-4 lg:mb-0">
                <div className="flex-1 md:p-6 lg:mb-0 w-full">
                  <div className="flex items-center justify-center">
                    <i className="bi bi-music-note-beamed text-primary text-2xl"></i>
                  </div>
                  <ul id="track-list" className="list-none p-0">
                    {album.tracks.map((track, trackIndex) => (
                      <li
                        key={trackIndex}
                        data-src={track.src}
                        className={`flex items-center justify-between py-2 px-4 border-b border-gray-200 ${track.src ? 'track' : ''}`}
                      >
                        <span className={`${track.src ? '' : 'text-gray-400'}`}>
                          {track.title}
                        </span>
                        <button
                          className={`bg-transparent border-none ${track.src ? 'play-button hover:text-blue-700' : 'text-gray-400'}`}
                        >
                          <i className={`bi bi-play-circle text-xl ${track.src ? '' : 'text-gray-400'}`}></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center justify-center mb-4">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="album-cover w-full h-auto rounded-lg shadow-md"
                  />
                  <div className="text-xs text-gray-600">
                    <ul>
                      <li><strong>Álbum:</strong> {album.title}</li>
                      <li><strong>Artista:</strong> {album.artist}</li>
                      <li><strong>Ano:</strong> {album.year}</li>
                      <li><strong>Gênero:</strong> {album.genre}</li>
                      <li><strong>Compositor:</strong> {album.composer}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        <div className="flex items-center justify-center mx-auto md:w-[600px] w-full">
          <div className="container mx-auto">
            <audio id="audio-player" controls className="w-full">
              Seu navegador não suporta a tag de áudio.
            </audio>
          </div>
        </div>
      </section>
    </div >
  )
}