"use client";

import { useState } from "react";
import albuns from '@MyAlbuns';
import AudioPlayerController from './_components/AudioPlayerController';

export default function Music() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <div className="container max-w-[800px] mx-auto p-4">
      <section> 
        <AudioPlayerController />
      </section>
    </div >
  )
}

