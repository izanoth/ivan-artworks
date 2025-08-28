'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PixPopup } from '@/layout/PixPopup';

export default function SupportPage() {
  const [showPixPopup, setShowPixPopup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 sm:p-12 bg-gray-50">

      {/* Mensagem principal */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl text-gray-800 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Apoie o projeto</h1>
        <p className="mb-3">
          Estou desenvolvendo um sistema de assinaturas e downloads dinâmicos, onde o acesso aos conteúdos é liberado após contribuições.  
		  </p>
		  <p className="mb-3">
          <strong>Por questões de direitos autorais, o player foi desativado na sessão Música</strong>.  
          Mantenho o cuidado de preservar e compartilhar o conteúdo de maneira responsável, dentro dos limites do que considero justo e viável.
        </p>
		  <p className="mb-3">  
          Sou apenas alguém trabalhando individualmente, <strong>colocando diariamente um pouco no monte — bloco por bloco</strong> — para que o projeto cresça de forma constante, com o objetivo de torná-lo consistente e sustentável.  
          A música é um hobby, mas o trabalho como um todo abrange também outras áreas. Cada contribuição me ajuda a manter esse processo vivo e em evolução.
        </p>
        <p className="mb-3">
          Após realizar sua contribuição, peço que entre em contato comigo pela <Link href="/contact" className="text-blue-600 underline">página de contato</Link> para receber o material de forma adequada.
        </p>
        <p className="text-sm text-gray-600 mt-4">
          ⚠️ <em>Nota:</em> este é um projeto independente, em constante desenvolvimento. O acesso e a forma de entrega dos conteúdos podem sofrer ajustes ao longo do tempo.
        </p>
      </div>

      {/* Botões de ação principais */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        {/* Pix */}
        <button
          onClick={() => setShowPixPopup(true)}
          className="bg-blue-900 text-white hover:bg-blue-800 font-bold py-2 px-4 rounded flex flex-col items-center w-36 sm:w-40"
        >
          <p className="text-xs sm:text-sm tracking-[.20em] mb-1">Quero fazer um</p>
          <Image src="/images/pix.png" alt="Pix Logo" width={30} height={30} />
        </button>
        {showPixPopup && <PixPopup onClose={() => setShowPixPopup(false)} />}

        {/* NEAR */}
        <Link href="/donation" passHref legacyBehavior>
          <button className="bg-black text-white hover:bg-gray-400 font-bold py-2 px-4 rounded flex flex-col items-center w-36 sm:w-40">
            <p className="text-xs sm:text-sm tracking-[.20em] mb-1">Usar carteira Ⓝ</p>
            <Image src="/near.svg" alt="NEAR" width={30} height={30} className="invert" />
          </button>
        </Link>
      </div>

      {/* Outras opções */}
      <div className="text-sm sm:text-base mb-2">Outras opções:</div>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {/* Buy Me a Coffee */}
        <Link href="https://www.buymeacoffee.com/ivanzanothw" target="_blank" rel="noopener noreferrer">
          <Image
            src="https://img.buymeacoffee.com/button-api/?text=&emoji=&slug=ivanzanothw&button_colour=555&font_colour=ddd&font_family=Cookie&outline_colour=aaa&coffee_colour=fff"
            alt="Buy Me a Coffee"
            width={120}
            height={30}
            className="h-auto w-auto"
          />
        </Link>

        {/* WiseTag */}
        <div className="flex flex-col items-center gap-2">
          <Image src="/images/wisetag.png" alt="WiseTag" width={70} height={14} className="invert" />
          <Image src="/images/ivanc2874-wisetag.png" alt="WiseTag 2" width={70} height={70} />
        </div>
      </div>
    </div>
  );
}
