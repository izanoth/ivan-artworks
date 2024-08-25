"use client";

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel } from 'react-bootstrap';

/* const albums: Record<number, { title: string; text: string; img: string }[]> = {
  1: [{ title: "Winds", text: "2023", img: "images/nobrakes_cover.png" }],
  2: [{ title: "No Brakes", text: "2022", img: "images/windscover.png" }],
}; */


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
          <li
            className={`cursor-pointer p-2`}
            onClick={() => handleSelect(0)}
          >
            <Image
              src="/images/windscover.png"
              alt="Winds"
              width={80}
              height={80}
              className={`w-full h-auto rounded-lg shadow-md ${activeIndex === 1 ? 'opacity-40' : 'opacity-100'}`} />
          </li>
          <li
            className={`cursor-pointer p-2`}
            onClick={() => handleSelect(1)}
          >
            <Image
              src="/images/nobrakes_cover.png"
              alt="No Brakes"
              width={80}
              height={80}
              className={`w-full h-auto rounded-lg shadow-md ${activeIndex === 0 ? 'opacity-40' : 'opacity-100'}`}
            />
          </li>
          <li>
            <i className="fa-solid fa-wine-glass text-4xl"></i>
          </li>
        </ul>
      </div>
      <div className="bg-light text-center container mx-auto">
        <div className="container mx-auto">
          <audio id="audio-player" controls className="w-full">
            Seu navegador não suporta a tag de áudio.
          </audio>
        </div>
      </div>
      <section className="bg-light text-center">
        <div className="container mx-auto">
          <Carousel interval={null} activeIndex={activeIndex} onSelect={handleSelect}>
            <Carousel.Item>
              <div className="container w-full">
                <div className="flex flex-col lg:flex-row lg:space-x-4 px-4 mb-4 lg:mb-0">
                  <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-4 lg:mb-0">
                    <div className="flex items-center justify-center mb-4">
                      <i className="bi bi-music-note-beamed text-primary text-2xl"></i>
                    </div>
                    <ul id="track-list" className="list-none p-0">
                      <li data-src="media/A Winter Day.mp3" className="track flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        A Winter Day
                        <button className="bg-transparent border-none text-primary hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Bella Vista
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Fuse Breeze
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Into the Forest
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        El Niño
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        La Niña
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Storm
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        When All Becomes Powda
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li data-src="media/Winds.mp3" className="track flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Winds
                        <button className="play-button bg-transparent border-none text-primary hover:text-blue-700">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="flex-1 px-4">
                    <img
                      src="images/windscover.png"
                      id="album-cover"
                      alt="Winds"
                      className="w-full h-auto rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
              {/* <Carousel.Caption>
                <h3>Winds</h3>
                <p>Realised in 2022</p>
              </Carousel.Caption> */}
            </Carousel.Item>
            <Carousel.Item>
              <div className="container w-full">
                <div className="flex flex-col lg:flex-row lg:space-x-4 px-4 mb-4 lg:mb-0">
                  <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-4 lg:mb-0">
                    <div className="flex items-center justify-center mb-4">
                      <i className="bi bi-music-note-beamed text-primary text-2xl"></i>
                    </div>
                    <ul id="track-list" className="list-none p-0">
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Intro
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Highway&apos;s Love
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Roads
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li data-src="media/Synthesis.mp3" className="track flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Synthesis
                        <button className="bg-transparent border-none text-primary hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li data-src="media/Beyond the Sky.mp3" className="track flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Beyond the Sky
                        <button className="bg-transparent border-none text-primary hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Vertigo
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Roads II
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Presto
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                        Caco Finale
                        <button className="bg-transparent border-none text-blue-200 hover:text-blue-700 play-button">
                          <i className="bi bi-play-circle text-xl"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="flex-1 px-4">
                    <img
                      src="images/nobrakes_cover.png"
                      id="album-cover"
                      alt="Winds"
                      className="w-full h-auto rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
              {/* <Carousel.Caption>
                <h3>No Brakes</h3>
                <p>Realised in 2022</p>
              </Carousel.Caption> */}
            </Carousel.Item>
          </Carousel>
        </div>
      </section>
    </div>
  )
}