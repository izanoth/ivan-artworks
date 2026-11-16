'use client';

import React, { useState } from "react";
import Link from "next/link";
import { normalizeTokenMedia } from "../NftMediaCarousel";
import nearController, { yoctoToNear } from "@/near-studio/controllers/nearController";
import SessionModal from "../SessionModal";
import CheckoutModal from "../CheckoutModal";
import styles from "./NftDetail.module.css";

const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || "nft.testnet";
const BUY_GAS = "300000000000000";

function formatDate(value) {
	try {
		return new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return String(value);
	}
}

function getMediaType(url) {
	if (!url || typeof url !== "string") return "image";
	const lower = url.toLowerCase().split('?')[0];
	if (
		lower.endsWith(".mp4") ||
		lower.endsWith(".webm") ||
		lower.endsWith(".mov") ||
		lower.endsWith(".ogv") ||
		lower.endsWith(".m4v")
	) {
		return "video";
	}
	if (
		lower.endsWith(".mp3") ||
		lower.endsWith(".ogg") ||
		lower.endsWith(".wav") ||
		lower.endsWith(".m4a") ||
		lower.endsWith(".aac")
	) {
		return "audio";
	}
	return "image";
}

export default function NftDetail({ initialToken }) {
	const [token, setToken] = useState(initialToken);
	const [selected, setSelected] = useState(null);
	const [accountId, setAccountId] = useState("");
	const [privateKey, setPrivateKey] = useState("");
	const [seedPhrase, setSeedPhrase] = useState("");
	const [authMethod, setAuthMethod] = useState("privateKey");
	const [sessionInfo, setSessionInfo] = useState(() => nearController.getSessionInfo());
	const [authenticating, setAuthenticating] = useState(false);
	const [buying, setBuying] = useState(false);
	const [message, setMessage] = useState("");
	const [tx, setTx] = useState(null);
	const [transactionResult, setTransactionResult] = useState(null);

	if (!token) {
		return (
			<main className={[styles["container"], styles["marketplace-body"]].join(" ")}>
				<div className={[styles["marketplace-container"], styles["marketplace-state"]].join(" ")}>
					<strong>NFT não encontrado</strong>
					<p>O ativo solicitado não existe ou foi removido.</p>
					<Link href="/marketplace" className={styles["nft-buy-button"]} style={{ display: 'inline-block', textDecoration: 'none', marginTop: '16px', width: 'auto', padding: '10px 24px' }}>
						Voltar ao Marketplace
					</Link>
				</div>
			</main>
		);
	}

	const mediaItems = normalizeTokenMedia(token);

	const openCheckout = () => {
		setSelected(token);
		setMessage("");
		setTx(null);
		setPrivateKey("");
		setSeedPhrase("");
		setAuthMethod("privateKey");
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
				seedPhrase,
				authMethod,
			});
			setSessionInfo(info);
			setPrivateKey("");
			setSeedPhrase("");
			setAuthMethod("privateKey");
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
			setMessage("CONTRACT_ID não está configurado.");
			return;
		}
		setBuying(true);
		setMessage("Assinando e enviando a transação de compra...");
		try {
			const yocto = String(selected.priceYocto || "0");
			const value = BigInt(yocto);
			const integer = value / 10n ** 24n;
			const fraction = (value % 10n ** 24n).toString().padStart(24, "0").replace(/0+$/, "");
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

			const api_url = process.env.API_URL || "http://localhost:3000";
			await fetch(`${api_url}/api/marketplace/${selected.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					buyTxHash: result.transactionHash,
					status: "sold",
					visible: false,
					ownerId: sessionInfo.accountId,
				}),
			});

			setToken((prev) => ({
				...prev,
				status: "sold",
				ownerId: sessionInfo.accountId,
				buyTxHash: result.transactionHash,
			}));

			setMessage("Transação enviada com sucesso!");
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
		setSeedPhrase("");
		setAuthMethod("privateKey");
		setAccountId("");
		setMessage("");
		setTx(null);
	};

	const endSession = () => {
		nearController.closeSession();
		setSessionInfo(null);
		setPrivateKey("");
		setSeedPhrase("");
		setAuthMethod("privateKey");
		setMessage("Sessão encerrada.");
	};

	return (
		<main className={[styles["container"], styles["marketplace-body"]].join(" ")}>
			<div className={styles["marketplace-container"]}>
				<div className={styles["nft-detail-grid"]}>
					{/* Left: Illustrations Grid */}
					<div className={styles["nft-detail-media-card"]}>
						<div className={styles["nft-illustrations-header"]}>
							<h3>Mídias / Ilustrações ({mediaItems.length})</h3>
						</div>
						{mediaItems.length > 0 ? (
							<div className={styles["nft-illustrations-grid"]}>
								{mediaItems.map((item, idx) => {
									const type = getMediaType(item);
									return (
										<div className={styles["nft-illustration-item"]} key={idx}>
											{type === "video" ? (
												<video src={item} muted playsInline loop controls preload="metadata" />
											) : type === "audio" ? (
												<div style={{ padding: "10px", textAlign: "center", width: "100%" }}>
													<span style={{ fontSize: "0.75rem", color: "#7dd3fc" }}>🎵 Áudio #{idx + 1}</span>
													<audio src={item} controls style={{ width: "100%", marginTop: "8px" }} />
												</div>
											) : (
												<img src={item} alt={`${token.title || 'NFT'} - Mídia ${idx + 1}`} loading="lazy" />
											)}
										</div>
									);
								})}
							</div>
						) : (
							<div className={styles["nft-illustrations-empty"]}>
								<span>Sem mídias disponíveis</span>
							</div>
						)}
					</div>

					{/* Right: Info & Table */}
					<div className={styles["nft-detail-info"]}>
						<div className={styles["nft-card-topline"]}>
							<span>Token #{token.tokenId}</span>
							<span>{formatDate(token.createdAt)}</span>
						</div>

						<h1 className={styles["nft-detail-title"]}>{token.title || "NFT sem título"}</h1>

						<p className={styles["nft-description"]}>
							{token.description || "Sem descrição disponível."}
						</p>

						{token.memo && (
							<div className={styles["nft-memo-box"]}>
								<div className={styles["nft-memo-header"]}>
									<span className={styles["eyebrow"]} style={{ margin: 0 }}>História da Criação / Memo</span>
								</div>
								<p className={styles["nft-memo-content"]}>{token.memo}</p>
							</div>
						)}

						<div className={styles["nft-price"]}>
							<span>Preço Atual</span>
							<strong>{yoctoToNear(token.priceYocto)} Ⓝ</strong>
						</div>

						{/* Information formatted in a Table */}
						<table className={styles["nft-detail-table"]}>
							<tbody>
								<tr>
									<th>Token ID</th>
									<td>#{token.tokenId}</td>
								</tr>
								<tr>
									<th>Coleção</th>
									<td>{token.collection?.name || "Individual"}</td>
								</tr>
								<tr>
									<th>Exemplares</th>
									<td>{token.copies || "1"}</td>
								</tr>
								<tr>
									<th>Proprietário</th>
									<td>{token.ownerId || "—"}</td>
								</tr>
								<tr>
									<th>Rede / Contrato</th>
									<td>{token.network} ({token.contractId})</td>
								</tr>
								<tr>
									<th>Status</th>
									<td>{token.status === "for_sale" ? "Disponível para Venda" : "Vendido / Indisponível"}</td>
								</tr>
								{token.buyTxHash && (
									<tr>
										<th>Hash da Compra</th>
										<td><code className={styles["nft-transaction-hash"]}>{token.buyTxHash}</code></td>
									</tr>
								)}
							</tbody>
						</table>

						{token.status === "for_sale" ? (
							<button
								className={styles["nft-buy-button"]}
								type="button"
								onClick={openCheckout}
							>
								Comprar NFT Agora
							</button>
						) : (
							<div className={styles["marketplace-state"]} style={{ padding: "16px", minHeight: "auto", marginTop: "16px" }}>
								<strong>NFT Indisponível / Vendido</strong>
								<span>Este item não está mais listado para venda.</span>
							</div>
						)}

						<div style={{ marginBottom: "24px" }}>
							<Link href="/marketplace" style={{ color: "#7dd3fc", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600" }}>
								← Voltar ao Marketplace
							</Link>
						</div>
					</div>
				</div>
			</div>

			{selected && !sessionInfo && (
				<SessionModal
					selected={selected}
					accountId={accountId}
					setAccountId={setAccountId}
					privateKey={privateKey}
					setPrivateKey={setPrivateKey}
					seedPhrase={seedPhrase}
					setSeedPhrase={setSeedPhrase}
					authMethod={authMethod}
					setAuthMethod={setAuthMethod}
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
					coverImage={mediaItems[0]}
					onClose={close}
					onEndSession={endSession}
					onPurchase={purchase}
					gas={BUY_GAS}
				/>
			)}
		</main>
	);
}
