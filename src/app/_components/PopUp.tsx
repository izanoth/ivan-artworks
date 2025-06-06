'use client';

import { useEffect, useState } from 'react';
import $ from 'jquery';
import Link from 'next/link';
import Image from 'next/image';

export default function PopupClient() {
  const [visible, setVisible] = useState(false);

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
      <div className="bg-white relative p-2 rounded shadow-lg max-w-sm w-full">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
        >
          <i className="fa fa-times text-xl"></i>
        </button>

        <div className="card mt-4 bg-sky-100">
          <div className="p-4 flex flex-col items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">
                  Prezado(a) visitante,
                </h2>
                <p className="mb-2">
                 Este projeto é realizado de forma independente, sem qualquer financiamento ou apoio externo.
                </p>
                <p className="mb-2">
                  Algumas expressões refletem a minha forma pessoal de trabalho e inspiração no momento da criação.
                </p>
                <p>
                  Caso queira apoiar, sua contribuição será muito bem-vinda e valorizada.
                </p>
                <p>
                  Muito obrigado pela atenção.
                </p>
              </div>

            <div className="flex flex-row justify-center items-center text-center mt-2">
            <Link href="https://www.buymeacoffee.com/ivanzanothw" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://img.buymeacoffee.com/button-api/?text=&emoji=&slug=ivanzanothw&button_colour=555&font_colour=ddd&font_family=Cookie&outline_colour=aaa&coffee_colour=fff"
                            alt="Buy Me a Coffee"
                            className="inline-block mt-4"
                        />
              </Link>
              <Link href="/donation" passHref legacyBehavior>
                <a>
                  <button className="bg-black text-white hover:bg-gray-400 font-bold py-2 px-4 mr-4 rounded">
                    <p className="text-sm tracking-[.20em]">using Ⓝ wallet</p>
                    <img
                      src="/near.svg"
                      alt="NEAR"
                      width="80"
                      className="invert cursor-pointer d-inline-block align-text-top"
                    />
                  </button>
                </a>
              </Link>

              <div className="flex flex-col ml-4">
                <Image
                  src="/images/wisetag.png"
                  width={80}
                  height={400}
                  alt="WiseTag"
                />
                <Image
                  src="/images/ivanc2874-wisetag.png"
                  width={100}
                  height={100}
                  alt="WiseTag 2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
