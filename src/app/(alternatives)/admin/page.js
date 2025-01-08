'use client';

import { connect, Contract, WalletConnection } from "near-api-js";
import React, { useState } from "react";

// Configuração do contrato
const config = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
  contractName: "zanoth.testnet",
};

// Função para mintar NFT
async function mintNFT({ id, price, metadata }) {
  const near = await connect(config);
  const wallet = new WalletConnection(near);

  const contract = new Contract(wallet.account(), config.contractName, {
    viewMethods: [],
    changeMethods: ["mintNFT"], // Incluindo o método de alteração
  });

  try {
    const result = await contract.mintNFT({
      id,
      price,
      metadata,
    });

    console.log("NFT criado com sucesso!", result);
  } catch (error) {
    console.error("Erro ao criar o NFT:", error);
    throw error;
  }
}

// Componente React para mintar NFT
export default function MintNFT() {
  const [id, setId] = useState("");
  const [price, setPrice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const handleMint = async () => {
    try {
      await mintNFT({
        id,
        price,
        metadata: {
          title,
          description,
          image,
        },
      });
      alert("NFT criado com sucesso!");
    } catch (error) {
      alert("Erro ao criar NFT: " + error.message);
    }
  };

  return (
    <div>
      <h1>Mintar NFT</h1>
      <input
        type="text"
        placeholder="ID do NFT"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Preço do NFT (yoctoNEAR)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Título do NFT"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Descrição do NFT"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="text"
        placeholder="URL da Imagem"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <button onClick={handleMint}>Criar NFT</button>
    </div>
  );
}
