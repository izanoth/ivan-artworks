'use client';

import React, { useEffect, useState } from "react";
import { listMarketplaceNfts } from "./services/marketplace";
import nearController, { yoctoToNear } from "@/near-studio/controllers/nearController";
import SessionModal from "./SessionModal";
import CheckoutModal from "./CheckoutModal";
import "./MarketplaceBody.css";

const API_URL = process.env.API_URL ||"http://localhost:3000";
const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || "nft.testnet";
const BUY_GAS = "300000000000000";
const SOURCE_URL = process.env.NEXT_PUBLIC_NEAR_NETWORK || "#";

function formatDate(value) {
	try {
		return new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "short",
		}).format(new Date(value));
	} catch {
		return value;
	}
}

function normalizeTokenImages(token) {
	if (!token) return [];

	const images = [];
	const candidates = [];

	if (Array.isArray(token.illustrations)) {
		candidates.push(...token.illustrations);
	}

	if (typeof token.illustrationUrl === "string" && token.illustrationUrl.trim()) {
		candidates.push(token.illustrationUrl);
	}

	if (typeof token.media === "string" && token.media.trim()) {
		candidates.push(token.media);
	}

	for (const candidate of candidates) {
		if (typeof candidate !== "string") continue;
		const value = candidate.trim();
		if (!value || images.includes(value)) continue;
		images.push(value);
	}

	return images;
}

function NftMediaCarousel({ images, title }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const normalized = images.filter(Boolean);

	if (!normalized.length) {
		return (
			<div className="nft-media-placeholder">
				<span>NFT</span>
			</div>
		);
	}

	const currentImage = normalized[activeIndex] || normalized[0];
	const canNavigate = normalized.length > 1;

	const previousImage = () => {
		setActiveIndex((current) =>
			(current - 1 + normalized.length) % normalized.length,
		);
	};

	const nextImage = () => {
		setActiveIndex((current) => (current + 1) % normalized.length);
	};

	return (
		<>
			<img
				key={currentImage}
				className="nft-media-image"
				src={currentImage}
				alt={title || "NFT"}
				loading="lazy"
			/>

			{canNavigate && (
				<div className="nft-media-controls" aria-label={`Galeria do NFT ${title}`}>
					<button
						type="button"
						className="nft-media-arrow nft-media-arrow-prev"
						onClick={(event) => {
							event.stopPropagation();
							previousImage();
						}}
						aria-label="Ver imagem anterior"
					>
						‹
					</button>

					<button
						type="button"
						className="nft-media-arrow nft-media-arrow-next"
						onClick={(event) => {
							event.stopPropagation();
							nextImage();
						}}
						aria-label="Ver próxima imagem"
					>
						›
					</button>
				</div>
			)}
		</>
	);
}

export default function MarketplaceBody() {
	const [tokens, setTokens] = useState([]);
	const [loading, setLoading] = useState(true);
	const [catalogError, setCatalogError] = useState("");

	const [selected, setSelected] = useState(null);

	const [accountId, setAccountId] = useState("");
	const [privateKey, setPrivateKey] = useState("");

	const [sessionInfo, setSessionInfo] = useState(() => nearController.getSessionInfo());

	const [authenticating, setAuthenticating] = useState(false);
	const [buying, setBuying] = useState(false);

	const [message, setMessage] = useState("");
	const [tx, setTx] = useState(null);
	const [transactionResult, setTransactionResult] = useState(null);

	useEffect(() => {
		let active = true;

		setLoading(true);
		setCatalogError("");

		listMarketplaceNfts(NETWORK)
			.then((data) => {
				if (active) {
					const parsed = typeof data === "string" ? JSON.parse(data) : data;
					setTokens(Array.isArray(parsed) ? parsed : []);
				}
			})
			.catch((error) => {
				if (active) {
					setCatalogError(
						error.message || "Não foi possível carregar o marketplace.",
					);
				}
			})
			.finally(() => {
				if (active) {
					setLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, []);

	const openCheckout = (token) => {
		setSelected(token);
		setMessage("");
		setTx(null);
		setPrivateKey("");
		setSessionInfo(nearController.getSessionInfo());
	};

	const authenticate = async (event) => {
		event.preventDefault();

		if (!selected) return;

		setAuthenticating(true);
		setMessage("");

		try {
			const info = await nearController.openSession({
				network: selected.network,
				accountId,
				privateKey,
			});

			setSessionInfo(info);
			setPrivateKey("");
			setMessage("");
		} catch (error) {
			setMessage(error.message || "Não foi possível abrir a sessão.");
		} finally {
			setAuthenticating(false);
		}
	};

	const purchase = async () => {
		if (!selected || !sessionInfo) return;

		if (!NFT_CONTRACT_ID) {
			setMessage("NEXT_PUBLIC_NFT_CONTRACT_ID não está configurado.");
			return;
		}

		setBuying(true);
		setMessage(
			"Assinando e enviando a transação de compra diretamente ao contrato NFT…",
		);

		try {
			const yocto = String(selected.priceYocto || "0");
			const value = BigInt(yocto);
			const integer = value / 10n ** 24n;
			const fraction = (value % 10n ** 24n)
				.toString()
				.padStart(24, "0")
				.replace(/0+$/, "");
			const depositNear = fraction ? `${integer}.${fraction}` : integer.toString();

			const result = await nearController.purchase({
				contractId: NFT_CONTRACT_ID,
				tokenId: selected.tokenId,
				marketplaceId: selected.id,
				depositNear,
				gas: BUY_GAS,
				accountId: sessionInfo.accountId,
			});

			setTransactionResult(result);
			setTx(result.transactionHash);

			await fetch(`${API_URL}/api/marketplace/${selected.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					buyTxHash: result.transactionHash,
					status: "sold",
					visible: false,
					ownerId: sessionInfo.accountId,
				}),
			});

			setMessage(
				"Transação enviada. Verifique o resultado on-chain antes de considerar a compra concluída.",
			);
		} catch (error) {
			setMessage(error.message || "A transação falhou.");
		} finally {
			setBuying(false);
		}
	};

	const close = () => {
		nearController.closeSession();

		setSessionInfo(null);
		setSelected(null);
		setPrivateKey("");
		setAccountId("");
		setMessage("");
		setTx(null);
	};

	const endSession = () => {
		nearController.closeSession();
		setSessionInfo(null);
		setPrivateKey("");
		setMessage("Sessão encerrada.");
	};

	return (
		<main className="container marketplace-body">
			<section className="marketplace-container">
				<div className="marketplace-intro">
					<div className="marketplace-heading">
						<span className="eyebrow">NEAR NFT Marketplace</span>

						<h1>NFTs disponíveis</h1>

						<p>
							Explore os ativos publicados na rede <strong>{NETWORK}</strong> e
							compre diretamente através da sua conta NEAR.
						</p>
					</div>

					<aside className="security-note" role="note">
						<div className="security-note-icon" aria-hidden="true">
							◆
						</div>

						<div>
							<strong>Compra assinada localmente</strong>

							<span>
								A sessão é efêmera. A chave privada permanece somente em memória
								durante a sessão e não é enviada ao backend.
								O trabalho é open-source e pode ser consultado livremente
							</span>

							{SOURCE_URL !== "#" && (
								<a href={SOURCE_URL} target="_blank" rel="noreferrer">
									Código-fonte aberto →
								</a>
							)}
						</div>
					</aside>
				</div>

				{loading && (
					<div className="marketplace-state">
						<span className="loading-spinner" />
						<span>Carregando NFTs…</span>
					</div>
				)}

				{catalogError && (
					<div className="marketplace-state marketplace-state-error">
						<strong>Não foi possível carregar o catálogo.</strong>
						<span>{catalogError}</span>
					</div>
				)}

				{!loading && !catalogError && tokens.length === 0 && (
					<div className="marketplace-state">
						<strong>Nenhum NFT disponível</strong>
						<span>Não existem ativos disponíveis nesta rede no momento.</span>
					</div>
				)}

				{!loading && !catalogError && tokens.length > 0 && (
					<section className="nft-grid" aria-label="NFTs disponíveis">
						{tokens.map((token) => (
							<article className="nft-card" key={token.id}>
								<div className="nft-media">
									<NftMediaCarousel
										images={normalizeTokenImages(token)}
										title={token.title || `NFT ${token.tokenId}`}
									/>
									<span className="nft-network">{token.network}</span>
								</div>

								<div className="nft-card-content">
									<div className="nft-card-topline">
										<span>Token #{token.tokenId}</span>
										<span>{formatDate(token.createdAt)}</span>
									</div>

									<h2>{token.title || "NFT sem título"}</h2>

									<p className="nft-description">
										{token.description || "Sem descrição disponível."}
										{/*token.collection ?? "Coleção: "+token.collection*/}
									</p>

									<div className="nft-price">
										<span>Preço</span>
										<strong>{yoctoToNear(token.priceYocto)} Ⓝ</strong>
									</div>

									<dl className="nft-meta">
										<div>
											<dt>Owner</dt>
											<dd title={token.ownerId}>{token.ownerId || "—"}</dd>
										</div>

										<div>
											<dt>Contrato</dt>
											<dd title={token.contractId}>{token.contractId}</dd>
										</div>
									</dl>

									<button
										className="nft-buy-button"
										type="button"
										onClick={() => openCheckout(token)}
									>
										Comprar NFT
									</button>
								</div>
							</article>
						))}
					</section>
				)}
			</section>

			{selected && !sessionInfo && (
				<SessionModal
					selected={selected}
					accountId={accountId}
					setAccountId={setAccountId}
					privateKey={privateKey}
					setPrivateKey={setPrivateKey}
					message={message}
					authenticating={authenticating}
					onSubmit={authenticate}
					onClose={close}
				/>
			)}

			{selected && sessionInfo && (
				<CheckoutModal
					selected={selected}
					sessionInfo={sessionInfo}
					buying={buying}
					message={message}
					transactionResult={transactionResult}
					coverImage={normalizeTokenImages(selected)[0]}
					onClose={close}
					onEndSession={endSession}
					onPurchase={purchase}
					gas={BUY_GAS}
				/>
			)}
		</main>
	);
}
