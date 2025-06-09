'use client';

import { useEffect, useState } from 'react';
import $ from 'jquery';
import Link from 'next/link';
import Image from 'next/image';
import { PixPopup } from '@/layout/PixPopup';

export default function PopupClient() {
  const [visible, setVisible] = useState(false);
  const [showPixPopup, setShowPixPopup] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (visible) {
      $('#custom-popup').fadeIn(1000);
    }
  }, [visible]);

  const handleClose = () => {
    $('#custom-popup').fadeOut(300, () => setVisible(false));
  };

  if (!visible) return null;

  return (
  <div
    id="custom-popup"
    style={{ display: 'none' }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white relative p-4 rounded shadow-lg w-[95%] max-w-lg max-h-[90vh] overflow-auto">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
      >
        <i className="fa fa-times text-xl"></i>
      </button>

      <div className="card mt-4 bg-sky-100">
        <div className="p-4 flex flex-col items-center justify-center">
          <div className="text-center text-sm sm:text-base">
            <h2 className="text-lg font-semibold mb-2">Prezado(a) visitante,</h2>
            <p className="mb-2">
              Este projeto é realizado de forma independente, sem qualquer financiamento ou apoio externo.
            </p>
            <p className="mb-2">
              Algumas expressões refletem a minha forma pessoal de trabalho e inspiração no momento da criação.
            </p>
            <p className="mb-2">
              Tudo o que integra esse site foi desenvolvido particularmente com <i>know-how</i> em programação.
            </p>
            <p>Caso queira apoiar, sua contribuição será muito bem-vinda e valorizada.</p>
            <p>Muito obrigado pela atenção.</p>
          </div>

          <div className="flex flex-col justify-center items-center text-center mt-4 w-full">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <a className="p-1">
                <button 
                  onClick={() => setShowPixPopup(true)} 
                  className="bg-blue-900 text-white hover:bg-blue-800 font-bold py-2 px-4 rounded flex flex-col items-center w-36 sm:w-40"
                >
                  <p className="text-xs sm:text-sm tracking-[.20em]">Quero fazer um</p>
                  <img                    
                    className="cursor-pointer max-h-[30px] h-auto"
                    src="/images/pix.png"
                    alt="Pix Logo"
                  />
                </button>
              </a>
              {showPixPopup && <PixPopup onClose={() => setShowPixPopup(false)} />}

              <Link href="/donation" passHref legacyBehavior>
                <a className="p-1">
                  <button className="bg-black text-white hover:bg-gray-400 font-bold py-2 px-4 rounded flex flex-col items-center w-36 sm:w-40">
                    <p className="text-xs sm:text-sm tracking-[.20em]">Usar carteira Ⓝ</p>
                    <img
                      src="/near.svg"
                      alt="NEAR"
                      className="invert cursor-pointer max-h-[30px] h-auto"
                    />
                  </button>
                </a>
              </Link>
            </div>

            <div className="text-sm mt-4">Outras opções:</div>

            <div className="flex flex-wrap justify-center items-center gap-4 mt-2">
              <Link
                href="https://www.buymeacoffee.com/ivanzanothw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.buymeacoffee.com/button-api/?text=&emoji=&slug=ivanzanothw&button_colour=555&font_colour=ddd&font_family=Cookie&outline_colour=aaa&coffee_colour=fff"
                  alt="Buy Me a Coffee"
                  className="inline-block max-h-[30px] h-auto"
                />
              </Link>

              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/images/wisetag.png"
                  className="invert h-auto w-auto"
                  width={70}
                  height={14}
                  alt="WiseTag"
                />
                <Image
                  src="/images/ivanc2874-wisetag.png"
                  className="w-auto h-auto"
                  width={70}
                  height={70}
                  alt="WiseTag 2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
