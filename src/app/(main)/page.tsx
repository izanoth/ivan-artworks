"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/music');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="blinking-text block text-xs pb-4">LOADING</p>
      <span className="loader"></span>
    </div>
  );
}


