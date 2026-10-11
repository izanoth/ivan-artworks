import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
	globalThis.Buffer = Buffer;
}

import { connect, KeyPair, keyStores } from "near-api-js";
import { logOperation } from "./logger";

const NETWORKS = {
	testnet: {
		rpcUrl: "https://rpc.testnet.near.org",
		networkId: "testnet",
		nodeUrl: "https://rpc.testnet.near.org",
	},
	mainnet: {
		rpcUrl: "https://rpc.mainnet.near.org",
		networkId: "mainnet",
		nodeUrl: "https://rpc.mainnet.near.org",
	},
};

let session = null;

const NEAR_SESSION_COOKIE = "near-auth";

async function persistNearSessionCookie(payload) {
	if (typeof document === "undefined") return;

	const response = await fetch("/api/near/session", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const result = await response.json().catch(() => ({}));
		throw new Error(result?.error || "Não foi possível registrar a sessão NEAR.");
	}
}

function clearNearSessionCookie() {
	if (typeof document === "undefined") return;

	fetch("/api/near/session", { method: "DELETE" }).catch(() => undefined);
}

function networkConfig(network) {
	const config = NETWORKS[network];
	if (!config) throw new Error(`Rede NEAR não suportada: ${network}`);
	return config;
}

export function getSupportedNetworks() {
	return Object.keys(NETWORKS);
}

export function getSession() {
	return session;
}

export function getSessionInfo() {
	if (!session) return null;
	return {
		accountId: session.accountId,
		network: session.network,
		publicKey: session.publicKey,
		keyType: session.keyType,
		accessKey: session.accessKey,
		account: session.account,
		near: session.near,
		openedAt: session.openedAt,
	};
}

export async function openSession({ network, accountId, privateKey }) {
	const started = performance.now();
	const normalizedAccountId = String(accountId || "").trim();
	const normalizedPrivateKey = String(privateKey || "").trim();

	if (!normalizedAccountId) throw new Error("Informe o Account ID.");
	if (!normalizedPrivateKey)
		throw new Error("Informe a chave privada para assinar as operações.");
	networkConfig(network);

	let keyPair;
	try {
		keyPair = KeyPair.fromString(normalizedPrivateKey);
	} catch {
		throw new Error(
			"Chave privada inválida. Esperado formato de chave NEAR, por exemplo ed25519:...",
		);
	}

	const publicKey = keyPair.getPublicKey().toString();

	try {
		const response = await fetch(NETWORKS[network].rpcUrl, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "near-nft-studio-session",
				method: "query",
				params: {
					request_type: "view_access_key",
					finality: "final",
					account_id: normalizedAccountId,
					public_key: publicKey,
				},
			}),
		});

		const json = await response.json();

		if (json.error) {
			const message = json.error.message || JSON.stringify(json.error);
			throw new Error(
				`A chave não foi validada para ${normalizedAccountId}: ${message}`,
			);
		}

		if (!json.result) {
			throw new Error(
				`A chave ${publicKey} não foi encontrada na conta ${normalizedAccountId}.`,
			);
		}

		const keyStore = new keyStores.InMemoryKeyStore();
		await keyStore.setKey(network, normalizedAccountId, keyPair);

		const near = await connect({
			networkId: network,
			nodeUrl: NETWORKS[network].nodeUrl,
			keyStore,
		});

		const account = await near.account(normalizedAccountId);

		session = {
			network,
			accountId: normalizedAccountId,
			publicKey,
			keyType: json.result.permission?.FunctionCall
				? "functionCall"
				: "fullAccess",
			accessKey: json.result,
			account,
			near,
			openedAt: new Date().toISOString(),
		};

		logOperation({
			operation: "open_session",
			method: "view_access_key",
			type: "session",
			network,
			accountId: normalizedAccountId,
			publicKey,
			keyType: session.keyType,
			status: "success",
			durationMs: Math.round(performance.now() - started),
		});

		await persistNearSessionCookie({
			accountId: normalizedAccountId,
			network,
			publicKey,
			keyType: session.keyType,
		});

		return getSessionInfo();
	} catch (error) {
		logOperation({
			operation: "open_session",
			method: "view_access_key",
			type: "session",
			network,
			accountId: normalizedAccountId,
			publicKey,
			status: "error",
			durationMs: Math.round(performance.now() - started),
			error: String(error.message || error),
		});
		throw error;
	} finally {
		normalizedPrivateKey;
	}
}

export function closeSession() {
	if (!session) return;
	const previous = session;
	session = null;
	clearNearSessionCookie();

	logOperation({
		operation: "close_session",
		method: "local_session",
		type: "session",
		network: previous.network,
		accountId: previous.accountId,
		publicKey: previous.publicKey,
		status: "success",
	});
}
