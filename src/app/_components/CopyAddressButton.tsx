"use client";

import { useState } from "react";

interface CopyAddressButtonProps {
  address: string;
}

export default function CopyAddressButton({
  address,
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar endereço:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
      title={copied ? "Copiado!" : "Copiar endereço"}
      aria-label={copied ? "Endereço copiado" : "Copiar endereço"}
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}