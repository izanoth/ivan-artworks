"use client";

import { useState } from "react";
import albuns from '@MyAlbuns';
import PopupClient from '@/app/_components/PopUp';
import AudioPlayerController from './_components/AudioPlayerController';

export default function Music() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <div className="container max-w-[800px] mx-auto p-4">
      <section> 
        <PopupClient />
        <AudioPlayerController />
        <div className="flex items-center">
        		<a href="/music/support">
        			<i className="fa-solid fa-download text-lg"></i>
        		</a>
        	</div>
      </section>
    </div >
  )
}

