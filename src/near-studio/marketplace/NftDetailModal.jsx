'use client';

import React, { useState } from "react";
import { normalizeTokenMedia } from "./NftMediaCarousel";
import { yoctoToNear } from "@/near-studio/controllers/nearController";
import CheckoutModal from "./CheckoutModal";
import SessionModal from "./SessionModal";
import nearController from "@/near-studio/controllers/nearController";
import styles from "./CheckoutModal.module.css";
import detailStyles from "./nft/NftDetail.module.css";

const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || "nft.testnet";
const BUY_GAS = "300000000000000";

function formatDate(value) {
	try {
		return new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return String(value || "");
	}
}

function getMediaType(url) {
	if (!url || typeof url !== "string") return "image";
	const lower = url.toLowerCase().split('?')[0];
	if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) return "video";
	if (lower.endsWith(".mp3") || lower.endsWith(".ogg") || lower.endsWith(".wav")) return "audio";
	return "image";
}

export default function NftDetailModal({ token, onClose, onPurchased }) {
	const [selectedCheckout, setSelectedCheckout] = useState(null);
	const [sessionInfo, setSessionInfo] = useState(() => nearController.getSessionInfo());
	const [accountId, setAccountId] = useState("");
	const [privateKey, setPrivateKey] = useState("");
	const [seedPhrase, setSeedPhrase] = useState("");
	const [authMethod, setAuthMethod] = useState("privateKey");
	const [authenticating, setAuthenticating] = useState(false);
	const [buying, setBuying] = useState(false);
	const [message, setMessage] = useState("");
	const [transactionResult, setTransactionResult] = useState(null);
	const [currentToken, setCurrentToken] = useState(token);

	if (!currentToken) return null;

	const mediaItems = normalizeTokenMedia(currentToken);
	const displayPrice = yoctoToNear(currentToken.priceYocto || "0");

	const openCheckout = () => {
		setSelectedCheckout(currentToken);
		setMessage("");
		setTransactionResult(null);
		setPrivateKey("");
		setSeedPhrase("");
		setAuthMethod("privateKey");
		setSessionInfo(nearController.getSessionInfo());
	};

	const authenticate = async (event) => {
		event.preventDefault();
		if (!selectedCheckout) return;
		setAuthenticating(true);
		setMessage("");
		try {
			const info = await nearController.openSession({
				network: selectedCheckout.network,
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
		if (!selectedCheckout || !sessionInfo) return;
		if (!NFT_CONTRACT_ID) {
			setMessage("CONTRACT_ID não está configurado.");
			return;
		}
		setBuying(true);
		setMessage("Assinando e enviando a transação de compra...");
		try {
			const yocto = String(selectedCheckout.priceYocto || "0");
			const value = BigInt(yocto);
			const integer = value / 10n ** 24n;
			const fraction = (value % 10n ** 24n).toString().padStart(24, "0").replace(/0+$/, "");
			const depositNear = fraction ? `${integer}.${fraction}` : integer.toString();

			const result = await nearController.purchase({
				contractId: NFT_CONTRACT_ID,
				tokenId: selectedCheckout.tokenId,
				marketplaceId: selectedCheckout.id,
				depositNear,
				gas: BUY_GAS,
				accountId: sessionInfo.accountId,
			});

			setTransactionResult(result);

			const api_url = process.env.API_URL || "http://localhost:3000";
			await fetch(`${api_url}/api/marketplace/${selectedCheckout.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					buyTxHash: result.transactionHash,
					status: "sold",
					visible: false,
					ownerId: sessionInfo.accountId,
				}),
			});

			setCurrentToken((prev) => ({
				...prev,
				status: "sold",
				ownerId: sessionInfo.accountId,
				buyTxHash: result.transactionHash,
			}));

			setMessage("Transação enviada com sucesso!");
			if (onPurchased) onPurchased();
		} catch (error) {
			setMessage(error.message || "A transação falhou.");
		} finally {
			setBuying(false);
		}
	};

	const closeCheckoutModal = () => {
		nearController.closeSession();
		setSessionInfo(null);
		setSelectedCheckout(null);
		setMessage("");
	};

	return (
		<div className={styles.backdrop} role="presentation">
			<section
				className={`${styles.marketplaceModal} ${detailStyles.nftDetailModalContainer || ""}`}
				style={{
					maxWidth: "920px",
					width: "92%",
					maxHeight: "90vh",
					overflowY: "auto",
					padding: "28px",
					backgroundColor: "#020617",
					border: "1px solid rgba(125, 211, 252, 0.28)",
					borderRadius: "16px",
					color: "#f8fafc",
					boxSizing: "border-box",
				}}
				role="dialog"
				aria-modal="true"
				aria-labelledby="nft-detail-title"
			>
				<button
					className={styles.modalClose}
					type="button"
					onClick={onClose}
					aria-label="Fechar"
				>
					×
				</button>

				{/* Cabeçalho */}
				<div className={styles.modalHeader} style={{ borderBottom: "1px solid rgba(125, 211, 252, 0.15)", paddingBottom: "16px" }}>
					<span className={styles.modalIcon} style={{ color: "#7dd3fc" }}>◆</span>
					<div style={{ minWidth: 0, flex: 1 }}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
							<span className={styles.eyebrow}>Token #{currentToken.tokenId}</span>
							{currentToken.collection?.name && (
								<span
									style={{
										fontSize: "0.75rem",
										padding: "2px 8px",
										borderRadius: "999px",
										background: "rgba(3, 105, 161, 0.3)",
										border: "1px solid rgba(125, 211, 252, 0.4)",
										color: "#7dd3fc",
										fontWeight: 600,
									}}
								>
									{currentToken.collection.name}
								</span>
							)}
							{currentToken.visible === false && (
								<span
									style={{
										fontSize: "0.75rem",
										padding: "2px 8px",
										borderRadius: "999px",
										background: "rgba(245, 158, 11, 0.15)",
										border: "1px solid rgba(245, 158, 11, 0.4)",
										color: "#fcd34d",
									}}
								>
									Oculto na vitrine
								</span>
							)}
						</div>
						<h2 id="nft-detail-title" style={{ margin: 0, wordBreak: "break-word" }}>
							{currentToken.title || "NFT sem título"}
						</h2>
					</div>
				</div>

				{/* Grid Principal: Mídias + Metadados */}
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "20px" }}>
					{/* Coluna Esquerda: Galeria de Mídia + Ilustrações */}
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						<div>
							<h4 style={{ color: "#7dd3fc", margin: "0 0 12px 0", fontSize: "0.9rem" }}>
								Mídias / Ilustrações ({mediaItems.length})
							</h4>
							{mediaItems.length > 0 ? (
								<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
									{mediaItems.map((item, idx) => {
										const type = getMediaType(item);
										const isMainMedia = item === currentToken.media;
										return (
											<div
												key={idx}
												style={{
													background: "rgba(15, 23, 42, 0.9)",
													border: isMainMedia
														? "1px solid rgba(125, 211, 252, 0.45)"
														: "1px solid rgba(148, 163, 184, 0.2)",
													borderRadius: "12px",
													overflow: "hidden",
													padding: "10px",
													textAlign: "center",
												}}
											>
												{isMainMedia && (
													<div style={{ textAlign: "left", marginBottom: "6px" }}>
														<span style={{ fontSize: "0.72rem", color: "#7dd3fc", fontWeight: 600 }}>
															Mídia Principal (NEP-177)
														</span>
													</div>
												)}
												{type === "video" ? (
													<video src={item} controls style={{ width: "100%", maxHeight: "220px", borderRadius: "8px" }} />
												) : type === "audio" ? (
													<audio src={item} controls style={{ width: "100%", marginTop: "4px" }} />
												) : (
													<img src={item} alt={currentToken.title || "Mídia do NFT"} style={{ width: "100%", maxHeight: "240px", objectFit: "contain", borderRadius: "8px" }} />
												)}
											</div>
										);
									})}
								</div>
							) : (
								<div style={{ padding: "20px", background: "rgba(15, 23, 42, 0.6)", border: "1px dashed rgba(148, 163, 184, 0.3)", borderRadius: "10px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
									Sem mídias ou ilustrações cadastradas.
								</div>
							)}
						</div>

						{/* Bloco de Royalties e Holders (Arrays/JSON do Schema) */}
						{(currentToken.holders?.length > 0 || currentToken.royalties !== '{}') && (
							<div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(125, 211, 252, 0.2)", borderRadius: "12px", padding: "14px", fontSize: "0.82rem" }}>
								{currentToken.holders?.length > 0 && (
									<div style={{ marginBottom: currentToken.royalties ? "12px" : 0 }}>
										<span style={{ display: "block", color: "#7dd3fc", fontWeight: 600, marginBottom: "6px" }}>
											Detentores / Holders ({currentToken.holders.length})
										</span>
										<div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
											{currentToken.holders.map((holder, idx) => (
												<span
													key={idx}
													style={{
														background: "rgba(2, 6, 23, 0.8)",
														border: "1px solid rgba(148, 163, 184, 0.3)",
														padding: "3px 8px",
														borderRadius: "6px",
														color: "#e2e8f0",
														fontFamily: "monospace",
														fontSize: "0.78rem",
														wordBreak: "break-all",
													}}
												>
													{holder}
												</span>
											))}
										</div>
									</div>
								)}
								{currentToken.royalties !== "{}" && (
									<div>
										<span style={{ display: "block", color: "#7dd3fc", fontWeight: 600, marginBottom: "12px" }}>
											Royalties
										</span>

										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "6px",
												padding: "8px",
												background: "rgba(2, 6, 23, 0.8)",
												borderRadius: "6px",
												color: "#cbd5e1",
												fontSize: "0.78rem",
											}}
										>
											{(() => {
												try {
													const parsedRoyalties = JSON.parse(currentToken.royalties);

													return Object.entries(parsedRoyalties).map(([address, value]) => {
														const percentage = Number(value) / 100;

														return (
															<div
																key={address}
																style={{
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	gap: "12px",
																}}
															>
																<span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
																	{address}
																</span>
																<span style={{ color: "#38bdf8", fontWeight: 600, whiteSpace: "nowrap" }}>
																	{percentage}%
																</span>
															</div>
														);
													});
												} catch {
													return <span>{currentToken.royalties}</span>;
												}
											})()}
										</div>
									</div>
								)}

							</div>
						)}
						{currentToken.memo && (
							<div style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(15, 23, 42, 0.9)", borderLeft: "3px solid #0369a1", borderRadius: "6px", fontSize: "0.83rem", color: "#94a3b8" }}>
								<strong style={{ color: "#e2e8f0" }}>Memo:</strong> {currentToken.memo}
							</div>
						)}
					</div>

					{/* Coluna Direita: Descrição, Preço, Tabela Técnica e Ação */}
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						<div>
							<p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.55", margin: 0 }}>
								{currentToken.description || "Sem descrição disponível."}
							</p>
						</div>

						{/* Card de Preço */}
						<div
							className={styles.checkoutProductPrice}
							style={{
								background: "rgba(3, 105, 161, 0.16)",
								border: "1px solid rgba(125, 211, 252, 0.3)",
								borderRadius: "12px",
								padding: "16px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "12px",
							}}
						>
							<div>
								<span style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8" }}>
									Preço Atual
								</span>
								{/*currentToken.priceYocto && (
									<small style={{ display: "block", fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
										{currentToken.priceYocto} yoctoNEAR
									</small>
								)*/}
							</div>

							<div style={{ textAlign: "right" }}>
								<strong style={{ display: "block", fontSize: "1.35rem", color: "#f8fafc", lineHeight: 1.2 }}>
									{displayPrice} Ⓝ
								</strong>
							</div>
						</div>

						{/* Tabela de Especificações do Schema */}
						<div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "12px", padding: "4px 14px" }}>
							<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", color: "#e2e8f0" }}>
								<tbody>
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>ID Interno / Token</td>
										<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}>
											#{currentToken.id} · {currentToken.tokenId}
										</td>
									</tr>
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Proprietário (ownerId)</td>
										<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", wordBreak: "break-all" }} title={currentToken.ownerId}>
											{currentToken.ownerId || "—"}
										</td>
									</tr>
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Coleção</td>
										<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
											{currentToken.collection ? `${currentToken.collection.name} (ID #${currentToken.collectionId})` : "Individual"}
										</td>
									</tr>
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Cópias</td>
										<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
											{currentToken.copies ?? 1}
										</td>
									</tr>
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Rede & Contrato</td>
										<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
											<span style={{ textTransform: "uppercase", color: "#7dd3fc", fontWeight: 600 }}>{currentToken.network}</span>
											{currentToken.contractId && (
												<span style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
													{currentToken.contractId}
												</span>
											)}
										</td>
									</tr>
									{currentToken.mintTxHash && (
										<tr>
											<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Tx de Mint</td>
											<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", fontSize: "0.76rem", color: "#7dd3fc", wordBreak: "break-all" }}>
												{currentToken.mintTxHash}
											</td>
										</tr>
									)}
									{currentToken.buyTxHash && (
										<tr>
											<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Tx de Compra</td>
											<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", fontSize: "0.76rem", color: "#4ade80", wordBreak: "break-all" }}>
												{currentToken.buyTxHash}
											</td>
										</tr>
									)}
									{currentToken.createdAt && (
										<tr>
											<td style={{ padding: "9px 0", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Criado em</td>
											<td style={{ padding: "9px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.8rem" }}>
												{new Date(currentToken.createdAt).toLocaleString("pt-BR")}
											</td>
										</tr>
									)}
									<tr>
										<td style={{ padding: "9px 0", color: "#94a3b8" }}>Status</td>
										<td style={{ padding: "9px 0", textAlign: "right" }}>
											<span style={{ color: currentToken.status === "for_sale" ? "#4ade80" : "#f87171", fontWeight: 600 }}>
												{currentToken.status === "for_sale" ? "Disponível para Venda" : currentToken.status || "Indisponível"}
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						{/* Seções Expansíveis para JSONs longos do Schema */}
						{(currentToken.metadataJson || currentToken.saleHistory) && (
							<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
								{currentToken.saleHistory && (
									<details style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", padding: "10px 12px" }}>
										<summary style={{ cursor: "pointer", fontSize: "0.83rem", fontWeight: 600, color: "#7dd3fc" }}>
											Histórico de Vendas (saleHistory)
										</summary>
										<pre style={{ margin: "8px 0 0 0", padding: "8px", background: "rgba(2, 6, 23, 0.85)", borderRadius: "6px", fontSize: "0.75rem", color: "#cbd5e1", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
											{currentToken.saleHistory}
										</pre>
									</details>
								)}

								{currentToken.metadataJson && (
									<details style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", padding: "10px 12px" }}>
										<summary style={{ textAlign: 'left', cursor: "pointer", fontSize: "0.83rem", fontWeight: 600, color: "#7dd3fc" }}>
											Metadados Brutos
										</summary>
										<pre style={{ textAlign: 'left', background: "rgba(2, 6, 23, 0.85)", borderRadius: "6px", fontSize: "0.75rem", color: "#cbd5e1", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", padding: '24px'  }} className="whitespace-pre-wrap break-all font-mono text-sm">
											{(() => {
												try {
													const parsed =
														typeof currentToken.metadataJson === "string"
															? JSON.parse(currentToken.metadataJson)
															: currentToken.metadataJson;

													return JSON.stringify(parsed, null, 2);
												} catch {
													return currentToken.metadataJson;
												}
											})()}
										</pre>
									</details>
								)}
							</div>
						)}

						{/* Botão de Compra / Aviso de Indisponibilidade */}
						{currentToken.status === "for_sale" ? (
							<button
								className={styles.primaryButton}
								
								type="button"
								onClick={openCheckout}
								style={{
									marginTop: "auto",
									width: "100%",
									background: "#0369a1",
									border: "1px solid #0284c7",
									color: "#f8fafc",
									padding: "13px 18px",
									borderRadius: "10px",
									fontWeight: 600,
									fontSize: "0.95rem",
									cursor: "pointer",									
								}}
							>
								Comprar NFT · {displayPrice} Ⓝ
							</button>
						) : (
							<div
								style={{
									marginTop: "auto",
									padding: "12px",
									background: "rgba(248, 113, 113, 0.12)",
									border: "1px solid rgba(248, 113, 113, 0.3)",
									borderRadius: "10px",
									textAlign: "center",
									color: "#fca5a5",
									fontSize: "0.9rem",
									fontWeight: 500,
								}}
							>
								NFT Indisponível ({currentToken.status || "Vendido"})
							</div>
						)}
					</div>
				</div>
			</section>

			{selectedCheckout && !sessionInfo && (
				<SessionModal
					selected={selectedCheckout}
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
					onClose={closeCheckoutModal}
				/>
			)}

			{selectedCheckout && sessionInfo && (
				<CheckoutModal
					selected={selectedCheckout}
					sessionInfo={sessionInfo}
					buying={buying}
					message={message}
					transactionResult={transactionResult}
					coverImage={mediaItems[0]}
					onClose={closeCheckoutModal}
					onEndSession={() => { nearController.closeSession(); setSessionInfo(null); }}
					onPurchase={purchase}
					gas={BUY_GAS}
				/>
			)}
		</div>

	);
}
