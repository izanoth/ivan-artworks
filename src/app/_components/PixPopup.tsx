'use client';

import { useState, useEffect } from 'react';

export function PixPopup({ onClose }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [copied, setCopied] = useState(false);

  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval); // limpeza
  }, [loading]);

  const handleCopy = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
  };

  // Chama a API para gerar o QR Code assim que o componente for montado
 useEffect(() => {
  const fetchQrCode = async () => {
    try {
      const response = await fetch('/api/asaas/generate-qrcode', { method: 'POST' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('DATA: ', data);

      if (data.success) {
        setQrCode(data.encodedImage);
        setPayload(data.payload);
      } else {
        alert('Erro ao gerar QR Code');
      }

    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      alert('Erro na requisição');
    } finally {
      setLoading(false);
    }
  };

  fetchQrCode();
}, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        {loading ? (
          <div className="text-center font-bold">Gerando QR Code{dots}</div>
        ) : !qrCode ? (
          <div className="text-center font-bold text-red-600">Erro ao gerar QR Code</div>
        ) : (
          <div className="text-center">
            <h2 className="font-bold text-lg">Muito obrigado!</h2>
            <div className="font-bold text-lg mb-4">Escaneie ou copie o código</div>
            <button
              onClick={handleCopy}
              className="flex items-center text-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-clipboard'}`}></i>
              {copied ? 'Copiado!' : 'Copiar código'}
            </button>
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code PIX"
              className="mx-auto mb-4"
            />
            <p className="text-sm text-gray-600">
              Use seu app de banco para escanear o código
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

