'use client';


import React, { useEffect, useMemo, useRef, useState } from "react";
import MarketplaceBody from "./marketplace/MarketplaceBody";
import { clearLogs, exportLogs, getLogs } from "./services/logger";
import { call, getContractId, getNetwork, methods, view } from "@/near-studio/services/near";
import {
	closeSession,
	getSessionInfo,
	getSupportedNetworks,
	openSession,
} from "./services/session";
import { utils } from "near-api-js";
import { yoctoToNear } from "@/near-studio/services/near";
import SessionModal from "./components/SessionModal";
import './styles.css';

const CONTRACT_ID = getContractId() || "(não configurado)";
const NETWORK = getNetwork();
const API_URL = "";

function Card({ title, children }) {
	return (
		<section className="card">
			<h2>{title}</h2>
			{children}
		</section>
	);
}

const HISTORICAL_STATUS = new Set([
	"sold",
	"transferred",
	"burned",
	"cancelled",
	"canceled",
	"expired",
	"withdrawn",
]);

function normalizeStatus(status) {
	return String(status || "").trim().toLowerCase();
}

function isActiveOwnedToken(token, ownerId) {
	if (!token || !ownerId) return false;
	if (token.ownerId !== ownerId) return false;
	const status = normalizeStatus(token.status);
	return !HISTORICAL_STATUS.has(status);
}

export default function StudioApp() {
	const [account, setAccount] = useState(null);
	const [sessionInfo, setSessionInfo] = useState(null);
	const [logs, setLogs] = useState([]);
	const [showSession, setShowSession] = useState(false);
	const [sessionForm, setSessionForm] = useState({
		network: NETWORK,
		accountId: "",
		privateKey: "",
	});
	const [loading, setLoading] = useState(false);
	const loadingCount = useRef(0);
	const beginLoading = () => { loadingCount.current += 1; setLoading(true); };
	const endLoading = () => { loadingCount.current = Math.max(0, loadingCount.current - 1); setLoading(loadingCount.current > 0); };
	const [collections, setCollections] = useState([]);
	const [collectionForm, setCollectionForm] = useState({ id: null, name: "", description: "", maxCopies: "" });
	const [selectedCollectionId, setSelectedCollectionId] = useState("");
	const [message, setMessage] = useState("");
	const [metadata, setMetadata] = useState(null);
	const [tokens, setTokens] = useState([]);
	const [token, setToken] = useState(null);
	const [royalties, setRoyalties] = useState([]);
	const [tokenId, setTokenId] = useState("");
	const [receiverId, setReceiverId] = useState("");
	const [page, setPage] = useState("studio");
	const [dbTokens, setDbTokens] = useState([]);
	const [remintTokenRecord, setRemintTokenRecord] = useState(null);
	const [remintForm, setRemintForm] = useState(false);
	const [contractStats, setContractStats] = useState({
		totalSupply: 0,
		ownerSupply: 0,
		ownerTokens: 0,
	});

	const [mint, setMint] = useState({
		token_id: "",
		owner_id: "",
		collectionId: null,
		title: "",
		description: "",
		media: "",
		illustrationUrl: "",
		mintTxHash: "",
		buyTxHash: "",
		priceNear: "",
		royalties: {},
		copies: 1,
		visible: true,
		status: "for_sale",
	});
	const [network, setNetwork] = useState(
		process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet"
	);

	const handleOpenSession = async (e) => {
		e.preventDefault();
		beginLoading();
		try {
			const info = await openSession(sessionForm);
			setSessionInfo(info);
			setAccount(info.accountId);
			setSessionForm((current) => ({ ...current, privateKey: "" }));
			setShowSession(false);
			setMessage(
				`Sessão aberta para ${info.accountId}. Chave ${info.keyType}.`,
			);
		} catch (error) {
			setMessage(error.message);
		} finally {
			endLoading();
		}
	};

	const handleCloseSession = () => {
		closeSession();
		setSessionInfo(null);
		setAccount(null);
		setMessage("Sessão encerrada.");
	};

	const refreshMetadata = async () => {
		beginLoading();
		try {
			setMessage("Consultando metadados...");
			setMetadata(await view("nft_metadata"));
			setMessage("Metadados atualizados.");
		} catch (e) {
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const refreshTokens = async () => {
		if (!account) return setMessage("Conecte uma carteira primeiro.");
		beginLoading();
		try {
			const nextTokens = await view("nft_tokens_for_owner", {
				account_id: account,
				from_index: "0",
				limit: 100,
			});
			setTokens(nextTokens);
			setContractStats((current) => ({
				...current,
				ownerTokens: Array.isArray(nextTokens) ? nextTokens.length : 0,
			}));
			setMessage("NFTs atualizados.");
		} catch (e) {
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const loadContractDbTokens = async () => {
		const ownerId = sessionInfo?.accountId || account;
		const contractId = CONTRACT_ID && CONTRACT_ID !== "(não configurado)" ? CONTRACT_ID : null;

		if (!contractId && !ownerId) {
			setDbTokens([]);
			return;
		}

		try {
			beginLoading();
			const qs = new URLSearchParams({ network: sessionInfo?.network || NETWORK });
			if (contractId) qs.set("contractId", contractId);
			else if (ownerId) qs.set("ownerId", ownerId);
			const response = await fetch(`${API_URL}/api/tokens?${qs.toString()}`, {
				cache: "no-store",
				headers: { "Cache-Control": "no-cache" },
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error || "Não foi possível carregar os NFTs do banco.");
			console.log("loadContractDbTokens", data);
			setDbTokens(Array.isArray(data) ? data : []);
		} catch (e) {
			setMessage(e.message + '. (loadContractDbTokens) Here!' || "Não foi possível carregar os NFTs do banco.");
		} finally {
			endLoading();
		}
	};

	const loadContractStats = async () => {
		const ownerId = sessionInfo?.accountId || account;
		beginLoading();
		if (ownerId) {
			try {
				const [totalSupply, ownerSupply] = await Promise.all([
					view("nft_total_supply"),
					ownerId ? view("nft_supply_for_owner", { account_id: ownerId }) : 0,
				]);

				setContractStats({
					totalSupply: Number(totalSupply?.value ?? 0),
					ownerSupply: Number(ownerSupply?.value ?? ownerSupply ?? 0),
					ownerTokens: Array.isArray(tokens) ? tokens.length : 0,
				});
			} catch (e) {
				setMessage(e.message + '. (loadContractStats) Here!' || "Não foi possível carregar as estatísticas.");
			} finally { endLoading(); }
		}
		endLoading();
	};

	const lookupToken = async () => {
		if (!tokenId) return;
		beginLoading();
		try {
			setToken(await view("nft_token", { token_id: tokenId }));
			setMessage(`NFT ${tokenId} consultado.`);
		} catch (e) {
			setToken(null);
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const updateDbVisibility = async (tokenRecord, nextVisible) => {
		const id = tokenRecord?.id;
		if (!id) return;

		beginLoading();
		try {
			const response = await fetch(`${API_URL}/api/marketplace/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ visible: nextVisible }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error || "Não foi possível atualizar a visibilidade.");
			}
			setDbTokens((current) =>
				current.map((item) =>
					item.id === id ? { ...item, visible: Boolean(nextVisible) } : item,
				),
			);
			setMessage(`Visibilidade atualizada para ${nextVisible ? "visível" : "oculta"}.`);
		} catch (e) {
			setMessage(e.message);
		} finally {
			endLoading();
		}
	};

	const loadCollections = async () => {
		try {
			beginLoading();
			const response = await fetch(`${API_URL}/api/collections?network=${encodeURIComponent(sessionInfo?.network || NETWORK)}`, { cache: "no-store" });
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error || "Não foi possível carregar as coleções.");
			setCollections(Array.isArray(data) ? data : []);
		} catch (error) { setMessage(error.message + ' (loadCollections) Here!'); }
		finally { endLoading(); }
	};

	const saveCollection = async (event) => {
		event.preventDefault();
		try {
			beginLoading();
			const editing = Boolean(collectionForm.id);
			const response = await fetch(editing ? `${API_URL}/api/collections/${collectionForm.id}` : `${API_URL}/api/collections`, {
				method: editing ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: collectionForm.name.trim(),
					description: collectionForm.description.trim(),
					network: network,
					maxCopies: Number(collectionForm.maxCopies) || 1,
					contractId: CONTRACT_ID
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error || "Não foi possível salvar a coleção.");
			setCollectionForm({ id: null, name: "", description: "", maxCopies: "" });
			setMessage(editing ? "Coleção atualizada." : "Coleção criada.");
			await loadCollections();
		} catch (error) { setMessage(error.message); }
		finally { endLoading(); }
	};

	const deleteCollection = async (id) => {
		if (!window.confirm("Excluir esta coleção? NFTs associados podem impedir a exclusão.")) return;
		try {
			beginLoading();
			const response = await fetch(`${API_URL}/api/collections/${id}`, { method: "DELETE" });
			const data = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(data?.error || "Não foi possível excluir a coleção.");
			setMessage("Coleção excluída.");
			await loadCollections();
		} catch (error) { setMessage(error.message); }
		finally { endLoading(); }
	};

	const updateRoyalty = (index, field, value) => {
		setRoyalties((current) => {
			const updated = current.map((item, i) =>
				i === index
					? { ...item, [field]: value }
					: item
			);

			setMint((currentMint) => ({
				...currentMint,
				royalties: updated,
			}));
			return updated;
		});
	};

	const addRoyalty = () => {
		setRoyalties((current) => {
			const updated = [
				...current,
				{
					accountId: "",
					basisPoints: "",
				},
			];

			setMint((currentMint) => ({
				...currentMint,
				royalties: updated,
			}));
			return updated;
		});
	};

	const mintToken = async (eventOrRecord = null, remintRecord = null) => {
		const isFormEvent =
			typeof eventOrRecord?.preventDefault === "function";

		if (isFormEvent) {
			eventOrRecord.preventDefault();
		}

		const tokenRecord = isFormEvent
			? remintRecord
			: eventOrRecord;

		beginLoading();
		setMessage("Minting…");

		try {
			const tokenIdToMint = String(mint.token_id || "").trim();
			const owner = String(mint.owner_id || account || "").trim();

			if (!owner) {
				throw new Error("Informe o proprietário ou conecte uma carteira.");
			}

			if (!tokenIdToMint) {
				throw new Error("Informe o novo Token ID.");
			}

			if (!String(mint.priceNear || "").trim()) {
				throw new Error("Informe o preço do NFT em NEAR.");
			}

			const priceYocto = utils.format.parseNearAmount(
				String(mint.priceNear).trim()
			);

			if (priceYocto == null || BigInt(priceYocto) <= 0n) {
				throw new Error("Informe um preço válido, maior que zero.");
			}

			const royaltyMap = Object.fromEntries(
				royalties
					.filter((r) => r.accountId && Number(r.basisPoints) > 0)
					.map((r) => [
						r.accountId,
						Math.round(Number(r.basisPoints) * 100),
					]),
			);

			const token_metadata = tokenRecord
				? (
					typeof tokenRecord.metadataJson === "string"
						? JSON.parse(tokenRecord.metadataJson)
						: tokenRecord.metadataJson
				)
				: {
					title: mint.title || null,
					description: mint.description || null,
					media: mint.media || null,
					copies: Number(mint.copies) || 1,
				};
			if (!token_metadata || typeof token_metadata !== "object") {
				throw new Error("Os metadados do NFT original são inválidos.");
			}

			const perpetual_royalties = tokenRecord
				? (
					typeof tokenRecord.perpetual_royalties === "string"
						? JSON.parse(tokenRecord.perpetual_royalties)
						: tokenRecord.perpetual_royalties
				) : royaltyMap;

			const mintResult = await call("nft_mint", {
				token_id: mint.token_id,
				token_owner_id: owner,
				token_metadata,
				perpetual_royalties,
			}, "0.007", "300000000000000");

			await call(
				"nft_list",
				{
					token_id: mint.token_id,
					price_yocto: priceYocto,
				},
				"0.000000000000000000000001",
				"100000000000000",
			);

			const mintTxHash = mintResult?.log?.transactionHash || mintResult?.result?.transaction?.hash || "";

			const dbResponse = await fetch(`${API_URL}/api/marketplace`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					network: NETWORK,
					contractId: CONTRACT_ID,
					tokenId: mint.token_id,
					priceYocto,
					title: token_metadata.title ?? null,
					description: token_metadata.description ?? null,
					media: token_metadata.media ?? null,
					copies: token_metadata.copies ?? null,
					collectionId: tokenRecord
						? tokenRecord.collectionId ?? null
						: selectedCollectionId
							? Number(selectedCollectionId)
							: null,
					visible: true,
					status: "for_sale",
					illustrationUrl: tokenRecord
						? tokenRecord.illustrationUrl ?? null
						: mint.illustrationUrl || null,
					ownerId: owner,
					royalties: perpetual_royalties ? JSON.stringify(perpetual_royalties) : JSON.stringify({}),					holders: [],
					mintTxHash: mintTxHash || null,
					metadataJson: token_metadata,
				}),
			});

			const dbResult = await dbResponse.json();

			if (!dbResponse.ok || !dbResult.ok || !dbResult.nft) {
				throw new Error(
					dbResult.error ||
					"Não foi possível registrar o NFT no banco de dados.",
				);
			}

			setMessage(
				tokenRecord
					? `Remint concluído para ${tokenIdToMint}.`
					: `Mint concluído para ${tokenIdToMint}.`
			);

			if (tokenRecord) {
				setRemintForm(false);
				setRemintTokenRecord(null);
			}

			await refreshTokens();
			await loadContractDbTokens();
		} catch (e) {
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const transfer = async () => {
		if (loading) return;
		if (!tokenId || !receiverId) return setMessage("Informe token ID e destinatário.");
		beginLoading();
		try {
			await call(
				"nft_transfer",
				{
					token_id: tokenId,
					receiver_id: receiverId,
					memo: "NEAR NFT Studio",
				},
				yoctoToNear(1n),
				"300000000000000",
			);
			setMessage("Transferência enviada.");
			await refreshTokens();
		} catch (e) {
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const burn = async () => {
		if (loading) return;
		if (!tokenId) return setMessage("Informe o token ID.");
		beginLoading();
		try {
			await call("burn", { token_id: tokenId }, "0");
			setMessage("Burn enviado.");
			setToken(null);
			await refreshTokens();
		} catch (e) {
			setMessage(e.message);
		} finally { endLoading(); }
	};

	const logRows = useMemo(() => logs.slice(0, 30), [logs]);

	useEffect(() => {
		if (page === "studio") {
			loadContractDbTokens();
			loadContractStats();
			loadCollections();
			setSessionInfo(getSessionInfo());
			setLogs(getLogs());
		}
	}, [page, account, sessionInfo?.network]);


	const ownerAccountId = sessionInfo?.accountId || account;

	return (
		<>
			<main>
				<header>
					<div>
						<h1>NEAR NFT Studio</h1>
						<p>Contract Tools / NEP-171 / NEP-177 / NEP-178 / NEP-181</p>
					</div>

					<div className="session-actions">
						{sessionInfo ? (
							<>
								<button
									onClick={() => setShowSession(true)}
									title="Abrir outra sessão"
								>
									{sessionInfo.accountId}
								</button>
								<button className="secondary" onClick={handleCloseSession}>
									Encerrar sessão
								</button>
							</>
						) : (
							<button onClick={() => setShowSession(true)}>Abrir sessão</button>
						)}
					</div>
				</header>

				<nav className="tabs">
					<button
						onClick={() => setPage("studio")}
						className={page === "studio" ? "active" : ""}
					>
						NFT Studio
					</button>
					<button
						onClick={() => setPage("marketplace")}
						className={page === "marketplace" ? "active" : ""}
					>
						Marketplace
					</button>
				</nav>

				<div className="status">
					<span>
						Rede: <strong>{sessionInfo?.network || NETWORK}</strong>
					</span>
					<span>
						Contrato configurado: <strong>{CONTRACT_ID}</strong>
					</span>
					<span>
						Implantação automática: <strong>não</strong>
					</span>
					{loading && <span role="status" aria-live="polite">Operação em andamento…</span>}{message && <span role="status" aria-live="polite">{message}</span>}
				</div>

				{page === "studio" ? (
					<div className="grid">
						<Card title="Contrato">
							<button onClick={refreshMetadata} disabled={loading}>nft_metadata</button>
							{metadata && <dl>{Object.entries(metadata).map(([key, value]) => <React.Fragment key={key}><dt>{key}</dt><dd>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</dd></React.Fragment>)}</dl>}
						</Card>

						<Card title="Índices e estatísticas">
							<div className="stats-grid">
								<div className="stat-box">
									<span>Supply total</span>
									<strong>{contractStats.totalSupply}</strong>
								</div>
								<div className="stat-box">
									<span>Tokens do proprietário</span>
									<strong>{contractStats.ownerSupply}</strong>
								</div>
								<div className="stat-box">
									<span>Tokens com registro no banco</span>
									<strong>{dbTokens.length}</strong>
								</div>
							</div>
						</Card>

						<Card title="List">
							<div className="actions" style={{ marginBottom: 12 }}>
								<button
									onClick={loadContractDbTokens}
									disabled={loading}
								>
									Atualizar lista
								</button>
							</div>

							{loading ? (
								<p>Carregando tokens do banco...</p>
							) : dbTokens.length === 0 ? (
								<p className="list-empty">Nenhum token encontrado para {ownerAccountId || "o proprietário atual"}.</p>
							) : (
								<div className="token-list">
									{dbTokens.map((tokenItem) => {
										const remint = tokenItem.collection?.tokens?.length < tokenItem.collection?.maxCopies;
										const currentOwned = isActiveOwnedToken(tokenItem, CONTRACT_ID);
										const imageUrl = tokenItem.illustrationUrl || "";
										const tokenStatus = normalizeStatus(tokenItem.status);
										const label = currentOwned ? "Atual" : "Histórico";
										return (
											<article
												key={tokenItem.id}
												className={`token-item ${currentOwned ? "current" : "historical"}`}
											>
												<div className="token-thumb">
													{imageUrl ? (
														<img src={imageUrl} alt={tokenItem.title || tokenItem.tokenId} />
													) : (
														<span>{tokenItem.title ? tokenItem.title.slice(0, 2).toUpperCase() : "NFT"}</span>
													)}
												</div>
												<div className="token-details">
													<h3>{tokenItem.title || `Token ${tokenItem.tokenId}`}</h3>
													<div className="token-meta">
														<span className={`token-tag ${currentOwned ? "current" : "historical"}`}>{label}</span>
														<span className="token-tag status">{tokenStatus || "sem-status"}</span>
													</div>
													<p className="token-subtitle">
														<strong>Token:</strong> {tokenItem.tokenId} · <strong>Owner:</strong> {tokenItem.ownerId || "não informado"}
													</p>
													<p className="token-subtitle">
														<strong>Coleção:</strong> {tokenItem.collection?.name || "Sem coleção"} · <strong>Copies:</strong> {tokenItem.copies ?? 1} · <strong>Visible:</strong> {tokenItem.visible ? "sim" : "não"}
													</p>
												</div>
												<div className="token-actions">
													<label className="inline-toggle">
														<input
															type="checkbox"
															checked={Boolean(tokenItem.visible)}
															onChange={() => updateDbVisibility(tokenItem, !tokenItem.visible)}
															disabled={loading}
														/>
														<span>Visível</span>
													</label>
													{!currentOwned && remint && (
														<button
															type="button"
															onClick={() => {
																setRemintTokenRecord(tokenItem);
																setMint((current) => ({
																	...current,
																	token_id: "",
																	owner_id: account || "",
																	title: tokenItem.title || "",
																	description: tokenItem.description || "",
																	media: tokenItem.media || "",
																	illustrationUrl: tokenItem.illustrationUrl || "",
																	priceNear: tokenItem.priceYocto
																		? utils.format.formatNearAmount(
																			String(tokenItem.priceYocto)
																		)
																		: "",
																	copies: tokenItem.copies ?? 1,
																}));
																setSelectedCollectionId(
																	tokenItem.collectionId != null
																		? String(tokenItem.collectionId)
																		: ""
																);
																setRemintForm(true);
																setMessage("");
															}}
															disabled={loading}
														>
															Mint New Copy
														</button>
													)}
												</div>
											</article>
										);
									})}
								</div>
							)}
						</Card>

						<Card title="Coleções NFT">
							<form onSubmit={saveCollection}>
								<label htmlFor="network">Rede NEAR
									<select
										id="network"
										value={network}
										onChange={(e) => setNetwork(e.target.value)}
									>
										<option value="testnet">Testnet</option>
										<option value="mainnet">Mainnet</option>
									</select>
								</label>
								<label>Cópias<input type="number" value={collectionForm.maxCopies} onChange={(e) => setCollectionForm({ ...collectionForm, maxCopies: Number(e.target.value) })} required /></label>
								<label>Nome da coleção<input value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })} required /></label>
								<label>Descrição<textarea value={collectionForm.description} onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })} rows={3} /></label>
								<div className="actions"><button type="submit" disabled={loading}>{loading ? "Salvando..." : collectionForm.id ? "Salvar alterações" : "Criar coleção"}</button><button type="button" className="secondary" disabled={loading} onClick={() => setCollectionForm({ id: null, name: "", description: "", maxCopies: "" })}>Limpar</button><button type="button" className="secondary" disabled={loading} onClick={loadCollections}>Atualizar</button></div>
							</form>
							{collections.length === 0 ?
								<p>Nenhuma coleção cadastrada.</p> :
								<div className="token-list">{collections.map((collection) =>
									<article className="token-item" key={collection.id}>
										<div className="token-details">
											<h3>{collection.name}</h3>
											<p>{collection.description || "Sem descrição"}</p>
											<small>ID: {collection.id}</small>
											<small>Cópias: {collection.maxCopies}</small>
										</div>
										<div className="token-actions">
											<button
												type="button"
												disabled={loading}
												onClick={() => setCollectionForm({
													id: collection.id,
													name: collection.name || "",
													description: collection.description || "",
													maxCopies: collection.maxCopies || 1
												})}
											>
												Editar
											</button>
											<button
												type="button"
												className="danger"
												disabled={loading}
												onClick={() => deleteCollection(collection.id)}
											>
												Excluir
											</button>
										</div>
									</article>)}
								</div>}
						</Card>

						<Card title="Mint">
							<form onSubmit={mintToken}>
								<input
									placeholder="Token ID"
									value={mint.token_id}
									onChange={(e) => setMint({ ...mint, token_id: e.target.value })}
									required
								/>
								<input
									placeholder="Owner ID"
									value={mint.owner_id}
									onChange={(e) => setMint({ ...mint, owner_id: e.target.value })}
								/>
								<input
									placeholder="Título"
									value={mint.title}
									onChange={(e) => setMint({ ...mint, title: e.target.value })}
									required
								/>
								<input
									placeholder="Descrição"
									value={mint.description}
									onChange={(e) =>
										setMint({ ...mint, description: e.target.value })
									}
									required
								/>
								<input
									placeholder="URL da mídia"
									value={mint.media}
									onChange={(e) => setMint({ ...mint, media: e.target.value })}
								/>
								<input
									placeholder="Preço em NEAR"
									value={mint.priceNear}
									onChange={(e) => setMint({ ...mint, priceNear: e.target.value })}
								/>
								<input
									placeholder="URL ilustração da mídia"
									value={mint.illustrationUrl}
									onChange={(e) => setMint({ ...mint, illustrationUrl: e.target.value })}
								/>

								<div>
									<label>Royalties</label>

									{royalties.map((royalty, index) => (
										<div
											key={index}
											style={{
												display: "flex",
												gap: "8px",
												alignItems: "center",
												marginBottom: "8px",
											}}
										>
											<input
												type="text"
												placeholder="Account ID"
												value={royalty.accountId}
												onChange={(e) =>
													updateRoyalty(index, "accountId", e.target.value)
												}
											/>

											<input
												type="number"
												min="0"
												max="100"
												step="0.01"
												placeholder="Percentual"
												value={royalty.basisPoints}
												onChange={(e) =>
													updateRoyalty(index, "basisPoints", e.target.value)
												}
											/>

											<span>%</span>
										</div>
									))}

									<button
										type="button"
										onClick={addRoyalty}
									>
										+ Concedente
									</button>
								</div>
								<label>
									<span>Coleção </span>
									<select
										value={selectedCollectionId}
										onChange={(e) => {
											const collectionId = e.target.value;
											setSelectedCollectionId(collectionId);
											setMint((current) => ({
												...current,
												collectionId: collectionId ? Number(collectionId) : null,
												copies: collectionId ? Number(collections.find((col) => String(col.id) === collectionId)?.maxCopies) : null,
											}));
										}}
									>
										<option value="">Sem coleção</option>
										{collections.map((collection) =>
											<option
												key={Number(collection.id)}
												value={collection.id}
												disabled={(collection.tokens?.length ?? 0) >= collection.maxCopies}
											>
												{console.log('mint: ', mint)}
												{console.log('collection.maxCopies: ', collection.maxCopies)}
												{collection.name}  {(collection.tokens?.length ?? 0) >= collection.maxCopies && " (Coleção cheia)"}
											</option>
										)}
									</select>
								</label>
								<div>
									<label>Cópias nesta coleção: </label>
									{(() => {
										const collection = collections.find(
											(collection) => String(collection.id) === String(selectedCollectionId)
										);

										return collection && (
											<span>
												{collection.tokens?.length ?? 0} / {collection.maxCopies}
											</span>
										);
									})()}
								</div>
								<button type="submit" disabled={loading}>{loading ? "Realizando mint..." : "Mint NFT"}</button>
							</form>
						</Card>

						<Card title="NFTs do proprietário">
							<button onClick={refreshTokens} disabled={loading}>Atualizar</button>
							<div className="token-list">{(tokens || []).map((item) => <article className="token-item" key={item.token_id}><div className="token-details"><h3>{item.metadata?.title || `Token ${item.token_id}`}</h3><p>Token ID: {item.token_id}</p><p>Proprietário: {item.owner_id}</p><details><summary>Metadados completos</summary><pre>{JSON.stringify(item.metadata, null, 2)}</pre></details></div></article>)}</div>
						</Card>

						<Card title="Consultar NFT">
							<input
								placeholder="Token ID"
								value={tokenId}
								onChange={(e) => setTokenId(e.target.value)}
							/>
							<button onClick={lookupToken} disabled={loading}>Consultar NFT</button>
							{token && <div><p><strong>Título:</strong> {token.metadata?.title || "—"}</p><p><strong>Proprietário:</strong> {token.owner_id || "—"}</p><details><summary>Metadados completos</summary><pre>{JSON.stringify(token, null, 2)}</pre></details></div>}
						</Card>

						<Card title="Transferência">
							<input
								placeholder="Token ID"
								value={tokenId}
								onChange={(e) => setTokenId(e.target.value)}
							/>
							<input
								placeholder="Receiver ID"
								value={receiverId}
								onChange={(e) => setReceiverId(e.target.value)}
							/>
							<button onClick={transfer} disabled={loading}>Transferir NFT</button>
						</Card>

						<Card title="Burn">
							<p>O contrato restringe o burn ao proprietário atual do NFT.</p>
							<button className="danger" onClick={burn} disabled={loading}>
								burn
							</button>
						</Card>

						<Card title="Methods Explorer">
							<p>{methods.length} métodos expostos/documentados no projeto.</p>
							<pre>{methods.join("\n")}</pre>
						</Card>

						<Card title="Operation Log">
							<div className="actions">
								<button onClick={() => setLogs(getLogs())} disabled={loading}>Atualizar</button>
								<button onClick={exportLogs} disabled={loading}>Exportar JSON</button>
								<button
									onClick={() => {
										clearLogs();
										setLogs([]);
									}}
								>
									Limpar
								</button>
							</div>

							<div className="logs">
								{logRows.map((log) => (
									<details key={log.id}>
										<summary>
											{log.timestamp} · {log.status} · {log.method}
										</summary>
										<pre>{JSON.stringify(log, null, 2)}</pre>
									</details>
								))}
							</div>
						</Card>
					</div>
				) : (
					<MarketplaceBody />
				)}

				<SessionModal
					isOpen={showSession}
					loading={loading}
					sessionForm={sessionForm}
					setSessionForm={setSessionForm}
					onClose={() => setShowSession(false)}
					onSubmit={handleOpenSession}
					supportedNetworks={getSupportedNetworks()}
				/>
			</main>

			{remintForm && remintTokenRecord && (
				<div
					className="modal-backdrop"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setRemintForm(false);
							setRemintTokenRecord(null);
						}
					}}
				>
					<section
						className="marketplace-modal session-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="remint-title"
					>
						<div className="modal-header">
							<span className="modal-icon">↗</span>

							<div>
								<span className="eyebrow">Remint</span>
								<h2 id="remint-title">Criar novo NFT</h2>
								<p>
									NFT original: {remintTokenRecord.tokenId}
								</p>
							</div>

							<button
								type="button"
								className="secondary close-button"
								onClick={() => {
									setRemintForm(false);
									setRemintTokenRecord(null);
								}}
								disabled={loading}
							>
								Fechar
							</button>
						</div>

						<form
							className="session-form"
							onSubmit={(event) =>
								mintToken(event, remintTokenRecord)
							}
						>
							<label>
								<span>Novo Token ID</span>
								<input
									type="text"
									value={mint.token_id}
									onChange={(event) =>
										setMint((current) => ({
											...current,
											token_id: event.target.value,
										}))
									}
									autoComplete="off"
									required
								/>
							</label>

							<label>
								<span>Owner ID</span>
								<input
									type="text"
									value={mint.owner_id}
									onChange={(event) =>
										setMint((current) => ({
											...current,
											owner_id: event.target.value,
										}))
									}
									required
								/>
							</label>

							<label>
								<span>Preço em NEAR</span>
								<input
									type="number"
									min="0"
									step="any"
									value={mint.priceNear}
									onChange={(event) =>
										setMint((current) => ({
											...current,
											priceNear: event.target.value,
										}))
									}
									autoComplete="off"
									required
								/>
							</label>

							<div className="remint-metadata">
								<h3>Metadados preservados</h3>
								<p>
									<strong>Título:</strong>{" "}
									{remintTokenRecord.title || "—"}
								</p>
								<p>
									<strong>Descrição:</strong>{" "}
									{remintTokenRecord.description || "—"}
								</p>
								<p>
									<strong>Mídia:</strong>{" "}
									{remintTokenRecord.media || "—"}
								</p>
								<p>
									<strong>Cópias:</strong>{" "}
									{remintTokenRecord.copies ?? 1}
								</p>
								<p>
									<strong>Coleção:</strong>{" "}
									{collections.find(
										(collection) =>
											String(collection.id) ===
											String(remintTokenRecord.collectionId)
									)?.name || "Sem coleção"}
								</p>
							</div>

							{message && (
								<p
									className="checkout-message checkout-message-error"
									role="alert"
								>
									{message}
								</p>
							)}

							<button
								className="primary-button"
								type="submit"
								disabled={loading}
							>
								{loading
									? "reminting..."
									: "Remint"}
							</button>
						</form>
					</section>
				</div>
			)}
		</>
	);
}
