'use client';

import React, { useEffect, useState } from "react";
import { listMarketplaceNfts } from "./services/marketplace";
import nearController from "@/near-studio/controllers/nearController";
import "./MarketplaceBody.css";
import { yoctoToNear } from "@/near-studio/controllers/nearController";

const API_URL = "";
const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || "nft.testnet";
const BUY_GAS = "300000000000000";
const SOURCE_URL = "#";

function formatDate(value) {
	try {
		return new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "short",
		}).format(new Date(value));
	} catch {
		return value;
	}
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
		<main className="marketplace-body">
			<section className="marketplace-container">
				<header className="marketplace-intro">
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
							</span>

							{SOURCE_URL !== "#" && (
								<a href={SOURCE_URL} target="_blank" rel="noreferrer">
									Código-fonte aberto →
								</a>
							)}
						</div>
					</aside>
				</header>

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
									{token.illustrationUrl || token.media ? (
										<img
											src={token.illustrationUrl || token.media}
											alt={token.title || `NFT ${token.tokenId}`}
											loading="lazy"
										/>
									) : (
										<div className="nft-media-placeholder">
											<span>NFT</span>
										</div>
									)}

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
				<div
					className="modal-backdrop"
					role="presentation"
				>
					<section
						className="marketplace-modal session-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="session-title"
					>
						<button
							className="modal-close"
							type="button"
							onClick={close}
							aria-label="Fechar"
						>
							×
						</button>

						<div className="modal-header">
							<span className="modal-icon">↗</span>

							<div>
								<span className="eyebrow">Etapa 1 de 2</span>

								<h2 id="session-title">Abrir sessão</h2>
							</div>
						</div>

						<p className="modal-lead">
							Para continuar a compra de{" "}
							<strong>{selected.title || `NFT #${selected.tokenId}`}</strong>,
							abra uma sessão temporária com sua conta NEAR.
						</p>

						<div className="session-summary">
							<div>
								<span>NFT</span>
								<strong>{selected.title || `#${selected.tokenId}`}</strong>
							</div>

							<div>
								<span>Valor</span>
								<strong>{yoctoToNear(selected.priceYocto)} NEAR</strong>
							</div>
						</div>

						<form className="session-form" onSubmit={authenticate}>
							<div className="checkout-warning">
								<strong>Sessão somente em memória</strong>

								<p>
									A chave privada é usada apenas para criar o assinador local da
									sessão. Ela não é persistida nem enviada ao backend.
								</p>
							</div>

							<label>
								<span>Account ID</span>

								<input
									value={accountId}
									onChange={(event) => setAccountId(event.target.value)}
									placeholder="alice.testnet"
									autoComplete="off"
									required
								/>
							</label>

							<label>
								<span>Private Key</span>

								<input
									type="password"
									value={privateKey}
									onChange={(event) => setPrivateKey(event.target.value)}
									placeholder="ed25519:…"
									autoComplete="off"
									spellCheck="false"
									required
								/>
							</label>

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
								disabled={authenticating}
							>
								{authenticating
									? "Validando sessão…"
									: "Abrir sessão e continuar"}
							</button>
						</form>

						<p className="modal-security">
							Use somente uma chave apropriada para este ambiente. Nunca informe
							uma chave de uma conta com fundos relevantes em um site
							experimental.
						</p>
					</section>
				</div>
			)}

			{selected && sessionInfo && (
				<div
					className="modal-backdrop"
					role="presentation"
				>
					<section
						className="marketplace-modal checkout-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="checkout-title"
					>
						<button
							className="modal-close"
							type="button"
							onClick={close}
							aria-label="Fechar"
						>
							×
						</button>

						<div className="modal-header">
							<span className="modal-icon">✓</span>

							<div>
								<span className="eyebrow">Etapa 2 de 2</span>

								<h2 id="checkout-title">Confirmar compra</h2>
							</div>
						</div>

						<div className="checkout-product">
							<div className="checkout-product-media">
								{selected.media ? (
									<img src={selected.media} alt="" />
								) : (
									<span>NFT</span>
								)}
							</div>

							<div>
								<span className="checkout-product-label">NFT</span>

								<strong>{selected.title || `NFT #${selected.tokenId}`}</strong>

								<span>#{selected.tokenId}</span>
							</div>

							<div className="checkout-product-price">
								<span>Total</span>

								<strong>{yoctoToNear(selected.priceYocto)}</strong>

								<small>NEAR</small>
							</div>
						</div>

						<div className="checkout-session">
							<span className="session-status-dot" />

							<div>
								<span>Sessão ativa</span>
								<strong>{sessionInfo.accountId}</strong>
							</div>

							<button type="button" onClick={endSession}>
								Trocar conta
							</button>
						</div>

						<dl className="checkout-details">
							<div>
								<dt>Token</dt>
								<dd>{selected.tokenId}</dd>
							</div>

							<div>
								<dt>Vendedor</dt>
								<dd>{selected.ownerId}</dd>
							</div>

							<div>
								<dt>Contrato NFT</dt>
								<dd>{selected.contractId}</dd>
							</div>

							<div>
								<dt>Rede</dt>
								<dd>{selected.network}</dd>
							</div>

							<div>
								<dt>Método</dt>
								<dd>nft_buy</dd>
							</div>

							<div>
								<dt>Receiver</dt>
								<dd>{sessionInfo.accountId}</dd>
							</div>

							<div>
								<dt>Gas máximo</dt>
								<dd>{BUY_GAS}</dd>
							</div>
							<div>
								{selected.royalties && Object.entries(selected.royalties).length > 0 && (
									<>
										<dt>Royalties</dt>
										{Object.entries(JSON.parse(selected.royalties)).map(([accountId, amount], i) => (
											<dd key={i}>
												<span>{accountId}</span>
												<span style={{marginRight: "1rem"}}> {amount/100}%</span>
											</dd>
										))}
									</>)
								}
							</div>

							<div className="checkout-total">
								<dt>Valor da compra</dt>
								<dd>{yoctoToNear(selected.priceYocto)} NEAR</dd>
							</div>
						</dl>

						<p className="checkout-consent">
							Confira cuidadosamente o receiver, método, token, vendedor e valor
							antes de autorizar a assinatura.
						</p>

						<button
							className="primary-button checkout-submit"
							type="button"
							onClick={purchase}
							disabled={buying}
						>
							{buying
								? "Enviando transação…"
								: `Assinar compra · ${yoctoToNear(selected.priceYocto)} NEAR`}
						</button>

						<button
							className="secondary-button"
							type="button"
							onClick={endSession}
							disabled={buying}
						>
							Encerrar sessão
						</button>

						{message && (
							<p className="checkout-message" role="status">
								{message}
							</p>
						)}

						{transactionResult && (
							<details className="tx-result">
								<summary>Ver resposta da transação</summary>

								<pre>{JSON.stringify(transactionResult, null, 2)}</pre>
							</details>
						)}

						<p className="modal-security">
							A assinatura é realizada localmente e enviada diretamente ao RPC
							da rede NEAR.
						</p>
					</section>
				</div>
			)}
		</main>
	);
}
