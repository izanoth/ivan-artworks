import Image from "next/image";
import Link from 'next/link';
import { Oswald } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'], weight: '700' });


export default function Home() {
  return (
      <section className="bg-light text-center py-16">
        <div className="container mx-auto">
          <div className="flex flex-wrap">
            <div className="lg:w-1/2 w-full px-4 mb-8 lg:mb-0">
              <div className="bg-white rounded-lg shadow-md p-6 mx-auto">
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
                  <li data-src="media/Winds.mp3" className="track flex items-center justify-between py-2 px-4 border-b border-gray-200">
                    Winds
                    <button className="play-button bg-transparent border-none text-primary hover:text-blue-700">
                      <i className="bi bi-play-circle text-xl"></i>
                    </button>
                  </li>
                </ul>
                <audio id="audio-player" controls className="w-full mt-4">
                  Seu navegador não suporta a tag de áudio.
                </audio>
                {/* <div className="flex justify-center mt-4">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-download text-primary text-xl"></i>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="lg:w-1/2 w-full px-4">
              <img src="images/windscover.png" id="album-cover" alt="Winds" className="w-full h-auto rounded-lg shadow-md" />
            </div>
          </div>
        </div>
      </section>
  );
}







