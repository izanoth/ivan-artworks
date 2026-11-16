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

function Card({ title, children, style }) {
	return (
		<section className="card" style={style}>
		<h1 style={{ fontSize: "22px", fontWeight: "500", paddingBottom: "20px"}}>{title}</h1>
			{children}
		</section>
	);
}

const mintFieldStyle = {
	width: "100%",
	boxSizing: "border-box",
	padding: "10px 12px",
	borderRadius: "10px",
	background: "#0f172a",
	border: "1px solid rgba(125, 211, 252, 0.35)",
	color: "#e2e8f0",
	fontSize: "0.95rem",
	lineHeight: 1.4,
	marginBottom: "12px",
	outline: "none",
	boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

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

function normalizeIllustrations(value) {
	if (Array.isArray(value)) {
		return value
			.map((item) => String(item).trim())
			.filter(Boolean);
	}

	if (typeof value === "string") {
		return value
			.split(/[\n,]/)
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [];
}

function getPrimaryIllustration(value) {
	const normalized = normalizeIllustrations(value);
	return normalized[0] || "";
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
	const [collectionForm, setCollectionForm] = useState({
		id: null,
		name: "",
		title: "",
		description: "",
		media: "",
		mediaHash: "",
		copies: "",
		maxCopies: "",
		extra: "",
		reference: "",
		referenceHash: "",
	});
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
		mediaHash: "",
		copies: 1,
		extra: "",
		reference: "",
		referenceHash: "",
		illustrations: [],
		mintTxHash: "",
		buyTxHash: "",
		priceNear: "",
		royalties: {},
		visible: true,
		status: "for_sale",
	});
	const [nftListForm, setNftListForm] = useState({
		token_id: "",
		priceNear: "",
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
					title: collectionForm.title.trim() || null,
					description: collectionForm.description.trim() || null,
					media: collectionForm.media.trim() || null,
					mediaHash: collectionForm.mediaHash.trim() || null,
					copies: collectionForm.copies !== "" ? Number(collectionForm.copies) : null,
					maxCopies: Number(collectionForm.maxCopies) || 1,
					extra: collectionForm.extra.trim() || null,
					reference: collectionForm.reference.trim() || null,
					referenceHash: collectionForm.referenceHash.trim() || null,
					network: network,
					contractId: CONTRACT_ID
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.error || "Não foi possível salvar a coleção.");
			setCollectionForm({
				id: null,
				name: "",
				title: "",
				description: "",
				media: "",
				mediaHash: "",
				copies: "",
				maxCopies: "",
				extra: "",
				reference: "",
				referenceHash: "",
			});
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

			const normalizedIllustrations = normalizeIllustrations(
				tokenRecord?.illustrations ?? mint.illustrations,
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
					media_hash: mint.mediaHash || null,
					copies: Number(mint.copies) || 1,
					extra: mint.extra || null,
					reference: mint.reference || null,
					reference_hash: mint.referenceHash || null,
				};
			if (!token_metadata || typeof token_metadata !== "object") {
				throw new Error("Os metadados do NFT original são inválidos.");
			}
			if (!Array.isArray(token_metadata.illustrations)) {
				token_metadata.illustrations = normalizedIllustrations;
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
					perpetual_royalties,
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
					illustrations: normalizedIllustrations,
					ownerId: owner,
					royalties: perpetual_royalties ? JSON.stringify(perpetual_royalties) : JSON.stringify({}),
					holders: [],
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

	const handleNftList = async () => {
		if (loading) return;
		if (!nftListForm.token_id || !nftListForm.priceNear) {
			return setMessage("Informe o Token ID e o preço em NEAR para listar.");
		}
		beginLoading();
		try {
			const priceYocto = utils.format.parseNearAmount(String(nftListForm.priceNear).trim());
			if (priceYocto == null || BigInt(priceYocto) <= 0n) {
				throw new Error("Preço inválido.");
			}

			let perpetual_royalties = {};
			try {
				const fetchedToken = await view("nft_token", { token_id: nftListForm.token_id });
				if (fetchedToken && fetchedToken.perpetual_royalties) {
					perpetual_royalties = fetchedToken.perpetual_royalties;
				}
			} catch (e) {
				// ignore
			}

			await call(
				"nft_list",
				{
					token_id: nftListForm.token_id,
					price_yocto: priceYocto,
					perpetual_royalties,
				},
				"0.000000000000000000000001",
				"100000000000000",
			);

			try {
				await fetch(`${API_URL}/api/marketplace`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						network: sessionInfo?.network || NETWORK,
						contractId: CONTRACT_ID,
						tokenId: nftListForm.token_id,
						priceYocto,
						visible: true,
						status: "for_sale",
						ownerId: sessionInfo?.accountId || account,
					}),
				});
			} catch (err) {
				console.error("Failed to sync marketplace DB:", err);
			}

			setMessage(`NFT ${nftListForm.token_id} listado com sucesso para venda por ${nftListForm.priceNear} Ⓝ!`);
			setNftListForm({ token_id: "", priceNear: "" });
			await refreshTokens();
			await loadContractDbTokens();
		} catch (e) {
			setMessage(e.message);
		} finally {
			endLoading();
		}
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

						<Card
							title="Coleções NFT (Padrão NEP-177)"
							style={{
								color: "#f8fafc",
								backgroundColor: "#020617",
								border: "1px solid rgba(125, 211, 252, 0.25)",
								borderRadius: "14px",
								width: "100%",
								boxSizing: "border-box",
							}}
						>
							<div
								style={{
									background: "rgba(15, 23, 42, 0.95)",
									border: "1px solid rgba(125, 211, 252, 0.3)",
									borderRadius: "12px",
									padding: "20px",
									marginBottom: "20px",
									width: "100%",
									boxSizing: "border-box",
								}}
							>
								<div style={{ marginBottom: "16px" }}>
									<span
										style={{
											display: "block",
											fontWeight: 700,
											fontSize: "0.95rem",
											color: "#7dd3fc",
											marginBottom: "4px",
										}}
									>
										{collectionForm.id ? "Editar Coleção Existente" : "Nova Coleção NEP-177"}
									</span>
									<span style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8" }}>
										Preencha os metadados padrão da coleção na rede NEAR.
									</span>
								</div>

								<form
									onSubmit={saveCollection}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "14px",
										width: "100%",
									}}
								>
									<label
										htmlFor="network"
										style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}
									>
										Rede NEAR
										<select
											id="network"
											value={network}
											onChange={(e) => setNetwork(e.target.value)}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										>
											<option value="testnet">Testnet</option>
											<option value="mainnet">Mainnet</option>
										</select>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Nome da coleção (único) *
										<input
											value={collectionForm.name}
											onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
											required
											placeholder="Ex: minha-colecao-nft"
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Título padrão (title)
										<input
											placeholder="Ex. Arch Nemesis: Mail Carrier"
											value={collectionForm.title}
											onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Descrição (description)
										<textarea
											value={collectionForm.description}
											onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
											rows={2}
											placeholder="Descreva os detalhes da coleção..."
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												resize: "vertical",
												fontFamily: "inherit",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Mídia (media URL)
										<input
											placeholder="https://..."
											value={collectionForm.media}
											onChange={(e) => setCollectionForm({ ...collectionForm, media: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Hash da Mídia (media_hash)
										<input
											placeholder="Base64 sha256"
											value={collectionForm.mediaHash}
											onChange={(e) => setCollectionForm({ ...collectionForm, mediaHash: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%" }}>
										<label style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 140px", minWidth: 0, fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
											Cópias padrão (copies)
											<input
												type="number"
												placeholder="1"
												value={collectionForm.copies}
												onChange={(e) => setCollectionForm({ ...collectionForm, copies: e.target.value })}
												style={{
													width: "100%",
													minWidth: 0,
													padding: "10px 12px",
													fontSize: "0.92rem",
													backgroundColor: "rgba(2, 6, 23, 0.8)",
													border: "1px solid rgba(148, 163, 184, 0.35)",
													borderRadius: "8px",
													color: "#f1f5f9",
													outline: "none",
													boxSizing: "border-box",
												}}
											/>
										</label>

										<label style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 140px", minWidth: 0, fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
											Máx. de cópias (maxCopies) *
											<input
												type="number"
												value={collectionForm.maxCopies}
												onChange={(e) => setCollectionForm({ ...collectionForm, maxCopies: Number(e.target.value) })}
												required
												style={{
													width: "100%",
													minWidth: 0,
													padding: "10px 12px",
													fontSize: "0.92rem",
													backgroundColor: "rgba(2, 6, 23, 0.8)",
													border: "1px solid rgba(148, 163, 184, 0.35)",
													borderRadius: "8px",
													color: "#f1f5f9",
													outline: "none",
													boxSizing: "border-box",
												}}
											/>
										</label>
									</div>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Extra (extra JSON)
										<input
											placeholder='{"attributes": []}'
											value={collectionForm.extra}
											onChange={(e) => setCollectionForm({ ...collectionForm, extra: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												fontFamily: "monospace",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Referência (reference URL)
										<input
											placeholder="https://..."
											value={collectionForm.reference}
											onChange={(e) => setCollectionForm({ ...collectionForm, reference: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<label style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
										Hash da Referência (reference_hash)
										<input
											placeholder="Base64 sha256"
											value={collectionForm.referenceHash}
											onChange={(e) => setCollectionForm({ ...collectionForm, referenceHash: e.target.value })}
											style={{
												width: "100%",
												minWidth: 0,
												padding: "10px 12px",
												fontSize: "0.92rem",
												backgroundColor: "rgba(2, 6, 23, 0.8)",
												border: "1px solid rgba(148, 163, 184, 0.35)",
												borderRadius: "8px",
												color: "#f1f5f9",
												outline: "none",
												boxSizing: "border-box",
											}}
										/>
									</label>

									<div
										style={{
											display: "flex",
											gap: "10px",
											flexWrap: "wrap",
											marginTop: "6px",
											width: "100%",
										}}
									>
										<button
											type="submit"
											disabled={loading}
											style={{
												flex: "1 1 160px",
												background: "#0369a1",
												border: "1px solid #0284c7",
												color: "#f8fafc",
												borderRadius: "8px",
												padding: "11px 16px",
												fontSize: "0.9rem",
												fontWeight: 600,
												cursor: loading ? "not-allowed" : "pointer",
												opacity: loading ? 0.65 : 1,
											}}
										>
											{loading ? "Salvando..." : collectionForm.id ? "Salvar alterações" : "Criar coleção"}
										</button>

										<button
											type="button"
											disabled={loading}
											onClick={() =>
												setCollectionForm({
													id: null,
													name: "",
													title: "",
													description: "",
													media: "",
													mediaHash: "",
													copies: "",
													maxCopies: "",
													extra: "",
													reference: "",
													referenceHash: "",
												})
											}
											style={{
												flex: "0 1 auto",
												background: "rgba(15, 23, 42, 0.9)",
												border: "1px solid rgba(125, 211, 252, 0.35)",
												color: "#e2e8f0",
												borderRadius: "8px",
												padding: "11px 16px",
												fontSize: "0.9rem",
												fontWeight: 500,
												cursor: loading ? "not-allowed" : "pointer",
												opacity: loading ? 0.65 : 1,
											}}
										>
											Limpar
										</button>

										<button
											type="button"
											disabled={loading}
											onClick={loadCollections}
											style={{
												flex: "0 1 auto",
												background: "rgba(15, 23, 42, 0.9)",
												border: "1px solid rgba(125, 211, 252, 0.35)",
												color: "#7dd3fc",
												borderRadius: "8px",
												padding: "11px 16px",
												fontSize: "0.9rem",
												fontWeight: 500,
												cursor: loading ? "not-allowed" : "pointer",
												opacity: loading ? 0.65 : 1,
											}}
										>
											Atualizar
										</button>
									</div>
								</form>
							</div>

							{collections.length === 0 ? (
								<div
									style={{
										padding: "20px",
										textAlign: "center",
										background: "rgba(15, 23, 42, 0.6)",
										border: "1px dashed rgba(148, 163, 184, 0.3)",
										borderRadius: "10px",
										color: "#94a3b8",
										fontSize: "0.9rem",
									}}
								>
									Nenhuma coleção cadastrada.
								</div>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
									{collections.map((collection) => (
										<article
											key={collection.id}
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												gap: "12px",
												flexWrap: "wrap",
												background: "rgba(15, 23, 42, 0.85)",
												border: "1px solid rgba(125, 211, 252, 0.25)",
												borderRadius: "10px",
												padding: "14px 16px",
												width: "100%",
												boxSizing: "border-box",
											}}
										>
											<div style={{ flex: "1 1 200px", minWidth: 0 }}>
												<h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 700, color: "#f8fafc", wordBreak: "break-word" }}>
													{collection.name}
												</h3>
												<p style={{ margin: "0 0 6px 0", fontSize: "0.86rem", color: "#cbd5e1", wordBreak: "break-word" }}>
													{collection.description || collection.title || "Sem descrição"}
												</p>
												<small style={{ display: "block", fontSize: "0.78rem", color: "#7dd3fc" }}>
													ID: {collection.id} · Máx Cópias: {collection.maxCopies}
												</small>
											</div>

											<div style={{ display: "flex", gap: "8px", flex: "0 0 auto", alignItems: "center" }}>
												<button
													type="button"
													disabled={loading}
													onClick={() =>
														setCollectionForm({
															id: collection.id,
															name: collection.name || "",
															title: collection.title || "",
															description: collection.description || "",
															media: collection.media || "",
															mediaHash: collection.mediaHash || "",
															copies: collection.copies ?? "",
															maxCopies: collection.maxCopies || 1,
															extra: collection.extra || "",
															reference: collection.reference || "",
															referenceHash: collection.referenceHash || "",
														})
													}
													style={{
														background: "rgba(3, 105, 161, 0.25)",
														border: "1px solid rgba(125, 211, 252, 0.45)",
														color: "#e0f2fe",
														borderRadius: "8px",
														padding: "8px 14px",
														fontSize: "0.85rem",
														fontWeight: 500,
														cursor: loading ? "not-allowed" : "pointer",
														whiteSpace: "nowrap",
													}}
												>
													Editar
												</button>

												<button
													type="button"
													disabled={loading}
													onClick={() => deleteCollection(collection.id)}
													style={{
														background: "rgba(239, 68, 68, 0.14)",
														border: "1px solid rgba(248, 113, 113, 0.45)",
														color: "#fecaca",
														borderRadius: "8px",
														padding: "8px 14px",
														fontSize: "0.85rem",
														fontWeight: 500,
														cursor: loading ? "not-allowed" : "pointer",
														whiteSpace: "nowrap",
													}}
												>
													Excluir
												</button>
											</div>
										</article>
									))}
								</div>
							)}
						</Card>

						<Card title="Mint" style={{ color: "white", backgroundColor: "#000" }}>
							<form onSubmit={mintToken}>
								<div style={{ background: "rgba(125, 211, 252, 0.08)", border: "1px solid rgba(125, 211, 252, 0.3)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
									<label style={{ display: "block", marginBottom: "4px", fontWeight: "750", color: "#7dd3fc" }}>
										Coleção NFT (Opcional - NEP-177) ★
									</label>
									<select
										value={selectedCollectionId}
										onChange={(e) => {
											const collectionId = e.target.value;
											setSelectedCollectionId(collectionId);
											const collection = collections.find((col) => String(col.id) === String(collectionId));
											if (collection) {
												setMint((current) => ({
													...current,
													collectionId: collectionId ? Number(collectionId) : null,
													title: collection.title || collection.name || "",
													description: collection.description || "",
													media: collection.media || "",
													mediaHash: collection.mediaHash || "",
													copies: collection.copies || collection.maxCopies || 1,
													extra: collection.extra || "",
													reference: collection.reference || "",
													referenceHash: collection.referenceHash || "",
													illustrations: collection.media ? [collection.media] : current.illustrations,
												}));
											} else {
												setMint((current) => ({
													...current,
													collectionId: null,
												}));
											}
										}}
										style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#fff", border: "1px solid rgba(125, 211, 252, 0.4)" }}
									>
										<option value="">Sem coleção (NFT Individual)</option>
										{collections.map((collection) =>
											<option
												key={Number(collection.id)}
												value={collection.id}
												disabled={(collection.tokens?.length ?? 0) >= collection.maxCopies}
											>
												{collection.name}  {(collection.tokens?.length ?? 0) >= collection.maxCopies && " (Coleção cheia)"}
											</option>
										)}
									</select>
									{selectedCollectionId && (
										<div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#93c5fd" }}>
											Coleção selecionada: <strong>{collections.find(c => String(c.id) === String(selectedCollectionId))?.name}</strong> (Cópias: {collections.find(c => String(c.id) === String(selectedCollectionId))?.tokens?.length ?? 0} / {collections.find(c => String(c.id) === String(selectedCollectionId))?.maxCopies})
										</div>
									)}
								</div>

								<input
									placeholder="Token ID"
									value={mint.token_id}
									onChange={(e) => setMint({ ...mint, token_id: e.target.value })}
									required
									style={mintFieldStyle}
								/>
								<input
									placeholder="Owner ID"
									value={mint.owner_id}
									onChange={(e) => setMint({ ...mint, owner_id: e.target.value })}
									style={mintFieldStyle}
								/>
								<input
									placeholder="Preço em NEAR"
									value={mint.priceNear}
									onChange={(e) => setMint({ ...mint, priceNear: e.target.value })}
									style={mintFieldStyle}
								/>
								<div style={{
									backgroundColor: "#0369a1"
								}}>
									<div
										style={{
											background: selectedCollectionId ? "rgba(125, 211, 252, 0.03)" : "rgba(255,255,255,0.02)",
											border: selectedCollectionId ? "1px solid rgba(125, 211, 252, 0.25)" : "1px dashed rgba(255,255,255,0.15)",
											borderRadius: "12px",
											padding: "16px",
											margin: "16px 0",
										}}
									>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
											<strong style={{ fontSize: "0.9rem", color: selectedCollectionId ? "#7dd3fc" : "#cbd5e1" }}>
												{selectedCollectionId ? "Metadados herdados da Coleção (Inativos)" : "Metadados do NFT (NEP-177)"}
											</strong>
											{selectedCollectionId && <span style={{ fontSize: "0.75rem", background: "rgba(125, 211, 252, 0.2)", color: "#7dd3fc", padding: "2px 8px", borderRadius: "4px" }}>Vinculado à Coleção</span>}
										</div>

										<input
											placeholder="Título"
											value={mint.title}
											onChange={(e) => setMint({ ...mint, title: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											required
											style={mintFieldStyle}
										/>
										<input
											placeholder="Descrição"
											value={mint.description}
											onChange={(e) => setMint({ ...mint, description: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											required
											style={mintFieldStyle}
										/>
										<input
											placeholder="URL da Mídia (media)"
											value={mint.media}
											onChange={(e) => setMint({ ...mint, media: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
										<input
											placeholder="Hash da Mídia (media_hash)"
											value={mint.mediaHash}
											onChange={(e) => setMint({ ...mint, mediaHash: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
										<input
											type="number"
											placeholder="Cópias (copies)"
											value={mint.copies}
											onChange={(e) => setMint({ ...mint, copies: Number(e.target.value) })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
										<input
											placeholder="Extra JSON (extra)"
											value={mint.extra}
											onChange={(e) => setMint({ ...mint, extra: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
										<input
											placeholder="Referência URL (reference)"
											value={mint.reference}
											onChange={(e) => setMint({ ...mint, reference: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
										<input
											placeholder="Hash de Referência (reference_hash)"
											value={mint.referenceHash}
											onChange={(e) => setMint({ ...mint, referenceHash: e.target.value })}
											disabled={Boolean(selectedCollectionId)}
											style={mintFieldStyle}
										/>
									</div>
								</div>

								<div
									style={{
										background: "rgba(15, 23, 42, 0.95)",
										border: "1px solid rgba(125, 211, 252, 0.32)",
										borderRadius: "12px",
										padding: "20px",
										marginTop: "16px",
										width: "100%",
										boxSizing: "border-box",
									}}
								>
									<div style={{ marginBottom: "14px" }}>
										<label
											style={{
												display: "block",
												fontWeight: 600,
												fontSize: "0.95rem",
												color: "#f8fafc",
												marginBottom: "4px",
											}}
										>
											Ilustrações / Arquivos do NFT
										</label>
										<span style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8" }}>
											Adicione caminhos locais (file paths) ou URLs completas das mídias.
										</span>
									</div>

									<div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
										{(mint.illustrations || []).map((ill, idx) => (
											<div
												key={`illustration-item-${idx}`}
												style={{
													display: "flex",
													gap: "8px",
													alignItems: "stretch",
													width: "100%",
													boxSizing: "border-box",
												}}
											>
												<input
													type="text"
													placeholder="Ex: media/nfts/boot/boot.png ou https://..."
													value={ill}
													onChange={(e) => {
														const updated = [...(mint.illustrations || [])];
														updated[idx] = e.target.value;
														setMint({ ...mint, illustrations: updated });
													}}
													style={{
														...mintFieldStyle,
														flex: "1 1 0%",
														width: "auto",
														minWidth: 0,
														padding: "10px 12px",
														fontSize: "0.9rem",
														backgroundColor: "rgba(2, 6, 23, 0.7)",
														border: "1px solid rgba(148, 163, 184, 0.35)",
														borderRadius: "8px",
														color: "#f1f5f9",
														outline: "none",
														boxSizing: "border-box",
													}}
												/>
												<button
													type="button"
													title="Remover este item"
													onClick={() => {
														const updated = (mint.illustrations || []).filter((_, i) => i !== idx);
														setMint({ ...mint, illustrations: updated });
													}}
													style={{
														flex: "0 0 auto",
														width: "auto",
														minWidth: "fit-content",
														whiteSpace: "nowrap",
														background: "rgba(239, 68, 68, 0.14)",
														border: "1px solid rgba(248, 113, 113, 0.45)",
														color: "#fecaca",
														borderRadius: "8px",
														padding: "0 12px",
														fontSize: "0.85rem",
														fontWeight: 500,
														cursor: "pointer",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													Remover
												</button>
											</div>
										))}

										<div style={{ marginTop: "4px", width: "100%" }}>
											<button
												type="button"
												className="secondary"
												onClick={() => setMint({ ...mint, illustrations: [...(mint.illustrations || []), ""] })}
												style={{
													width: "100%",
													background: "rgba(56, 189, 248, 0.1)",
													border: "1px dashed rgba(125, 211, 252, 0.5)",
													color: "#7dd3fc",
													borderRadius: "8px",
													padding: "12px 16px",
													fontSize: "0.9rem",
													fontWeight: 600,
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													gap: "6px",
													boxSizing: "border-box",
												}}
											>
												+ Adicionar Caminho / URL
											</button>
										</div>
									</div>
								</div>


								<div style={{ marginTop: "12px" }}>
									<label style={{ marginTop: "12px", display: "block", fontWeight: "650", color: "#e2e8f0" }}>Royalties</label>

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
												onChange={(e) => updateRoyalty(index, "accountId", e.target.value)}
												style={{ ...mintFieldStyle, flex: 1 }}
											/>

											<input
												type="number"
												min="0"
												max="100"
												step="0.01"
												placeholder="Percentual"
												value={royalty.basisPoints}
												onChange={(e) => updateRoyalty(index, "basisPoints", e.target.value)}
												style={{ ...mintFieldStyle, width: "120px" }}
											/>
											<span style={{ color: "#cbd5e1" }}>%</span>
										</div>
									))}

									<button
										type="button"
										onClick={addRoyalty}
										style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(125, 211, 252, 0.4)", color: "#e2e8f0", borderRadius: "8px", padding: "10px 12px", marginTop: "8px" }}
									>
										+ Concedente
									</button>
								</div>

								<button type="submit" disabled={loading} style={{ marginTop: "16px", width: "100%", borderRadius: "8px", background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "#f8fafc", border: "none", padding: "12px 16px", fontWeight: 700 }}>{loading ? "Realizando mint..." : "Mint NFT"}</button>
							</form>
						</Card>

						<Card title="Contrato" style={{ color: "white", backgroundColor: "#000" }}>
							<button onClick={refreshMetadata} disabled={loading}>nft_metadata</button>
							{metadata && <dl>{Object.entries(metadata).map(([key, value]) => <React.Fragment key={key}><dt>{key}</dt><dd>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</dd></React.Fragment>)}</dl>}
						</Card>

						<Card title="List" style={{ color: "white", backgroundColor: "#000" }}>
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
										const imageUrl = getPrimaryIllustration(tokenItem.illustrations || tokenItem.illustrationUrl || []);
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
																	illustrations: normalizeIllustrations(tokenItem.illustrations || tokenItem.illustrationUrl || []),
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

						

						<Card title="NFTs do proprietário" style={{ color: "white", backgroundColor: "#000" }}>
							<button onClick={refreshTokens} disabled={loading}>Atualizar</button>
							<div className="token-list">{(tokens || []).map((item) => <article className="token-item" key={item.token_id}><div className="token-details"><h3>{item.metadata?.title || `Token ${item.token_id}`}</h3><p>Token ID: {item.token_id}</p><p>Proprietário: {item.owner_id}</p><details><summary>Metadados completos</summary><pre>{JSON.stringify(item.metadata, null, 2)}</pre></details></div></article>)}</div>
						</Card>

						<Card title="Consultar NFT" style={{ color: "white", backgroundColor: "#000" }}>
							<input
								placeholder="Token ID"
								value={tokenId}
								onChange={(e) => setTokenId(e.target.value)}
							/>
							<button onClick={lookupToken} disabled={loading}>Consultar NFT</button>
							{token && <div><p><strong>Título:</strong> {token.metadata?.title || "—"}</p><p><strong>Proprietário:</strong> {token.owner_id || "—"}</p><details><summary>Metadados completos</summary><pre>{JSON.stringify(token, null, 2)}</pre></details></div>}
						</Card>

						<Card title="Transferência" style={{ color: "white", backgroundColor: "#000" }}>
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

						<Card title="Burn" style={{ color: "white", backgroundColor: "#000" }}>
							<p>O contrato restringe o burn ao proprietário atual do NFT.</p>
							<button className="danger" onClick={burn} disabled={loading}>
								burn
							</button>
						</Card>

						<Card title="Listar Ativo à Venda (nft_list)" style={{ color: "white", backgroundColor: "#000" }}>
							<p>Lista um ativo NFT existente para venda no marketplace (método <code>nft_list</code> com 1 yoctoNEAR de depósito).</p>
							<input
								placeholder="Token ID"
								value={nftListForm.token_id}
								onChange={(e) => setNftListForm((current) => ({ ...current, token_id: e.target.value }))}
							/>
							<input
								placeholder="Preço em NEAR (ex: 1.5)"
								type="number"
								step="0.01"
								min="0"
								value={nftListForm.priceNear}
								onChange={(e) => setNftListForm((current) => ({ ...current, priceNear: e.target.value }))}
							/>
							<button onClick={handleNftList} disabled={loading}>
								{loading ? "Listando..." : "Listar Ativo (nft_list)"}
							</button>
						</Card>

						<Card title="Methods Explorer" style={{ color: "white", backgroundColor: "#000" }}>
							<p>{methods.length} métodos expostos/documentados no projeto.</p>
							<pre>{methods.join("\n")}</pre>
						</Card>

						<Card title="Operation Log" style={{ color: "white", backgroundColor: "#000" }}>
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
