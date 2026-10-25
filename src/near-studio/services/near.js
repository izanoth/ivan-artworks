import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
	globalThis.Buffer = Buffer;
}

import { transactions, utils } from "near-api-js";
import { logOperation } from "./logger";
import { getSession } from "./session";

const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
const CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || "nft.testnet";

const RPC = {
	testnet: "https://rpc.testnet.near.org",
	mainnet: "https://rpc.mainnet.near.org",
};

function requireSession() {
	const session = getSession();
	if (!session)
		throw new Error("Abra uma sessão antes de executar esta operação.");
	return session;
}

function encodeArgs(args) {
	return btoa(unescape(encodeURIComponent(JSON.stringify(args))));
}

export async function nftMint({
	account,
	contractId,
	tokenId,
	tokenOwnerId,
	tokenMetadata,
}) {
	if (!account) {
		throw new Error("NEAR account is not connected");
	}

	if (!contractId) {
		throw new Error("Contract ID is required");
	}

	if (!tokenId) {
		throw new Error("Token ID is required");
	}

	if (!tokenOwnerId) {
		throw new Error("Token owner ID is required");
	}

	const result = await account.functionCall({
		contractId,
		methodName: "nft_mint",

		args: {
			token_id: tokenId,
			token_owner_id: tokenOwnerId,
			token_metadata: tokenMetadata,
			perpetual_royalties: tokenMetadata?.perpetual_royalties || [],
		},

		attachedDeposit: utils.format.parseNearAmount("0.007"),
		gas: "300000000000000",
	});

	return result;
}

async function rpc(method, params, context = {}) {
	const started = performance.now();
	const activeNetwork = getSession()?.network || NETWORK;
	const rpcUrl = RPC[activeNetwork];

	try {
		const response = await fetch(rpcUrl, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "nft-studio",
				method,
				params,
			}),
		});

		const json = await response.json();

		if (json.error) {
			throw new Error(json.error.message || JSON.stringify(json.error));
		}

		logOperation({
			operation: method,
			method,
			type: "view",
			network: activeNetwork,
			contractId: CONTRACT_ID,
			accountId: context.accountId,
			status: "success",
			durationMs: Math.round(performance.now() - started),
			result: json.result,
		});

		return json.result;
	} catch (error) {
		logOperation({
			operation: method,
			method,
			type: "view",
			network: activeNetwork,
			contractId: CONTRACT_ID,
			accountId: context.accountId,
			status: "error",
			durationMs: Math.round(performance.now() - started),
			error: String(error.message || error),
		});
		throw error;
	}
}

export async function view(methodName, args = {}) {
	const result = await rpc(
		"query",
		{
			request_type: "call_function",
			finality: "final",
			account_id: CONTRACT_ID,
			method_name: methodName,
			args_base64: encodeArgs(args),
		},
		{ accountId: getSession()?.accountId },
	);

	const bytes = new Uint8Array(result.result);
	return JSON.parse(new TextDecoder().decode(bytes));
}

function getOutcomeHash(result) {
	return (
		result?.transaction?.hash ||
		result?.transaction_outcome?.id ||
		result?.transaction?.outcome?.id ||
		null
	);
}

export async function call(
	methodName,
	args,
	depositNear = "0.006",
	gas = "100000000000000",
) {
	const session = requireSession();
	if (!CONTRACT_ID)
		throw new Error("CONTRACT_ID não está configurado.");

	const started = performance.now();

	try {
		const result = await session.account.signAndSendTransaction({
			receiverId: CONTRACT_ID,
			actions: [
				transactions.functionCall(
					methodName,
					args,
					BigInt(gas).toString(),
					BigInt(
						utils.format.parseNearAmount(depositNear) || "0.006",
					).toString(),
				),
			],
		});

		const record = logOperation({
			operation: methodName,
			method: methodName,
			type: "transaction",
			network: session.network,
			contractId: CONTRACT_ID,
			accountId: session.accountId,
			parameters: args,
			depositNear,
			gas,
			status: "success",
			durationMs: Math.round(performance.now() - started),
			transactionHash: getOutcomeHash(result),
			result,
		});

		return { result, log: record };
	} catch (error) {
		logOperation({
			operation: methodName,
			method: methodName,
			type: "transaction",
			network: session.network,
			contractId: CONTRACT_ID,
			accountId: session.accountId,
			parameters: args,
			depositNear,
			gas,
			status: "error",
			durationMs: Math.round(performance.now() - started),
			error: String(error.message || error),
		});
		throw error;
	}
}

export function getNetwork() {
	return NETWORK;
}

export function getContractId() {
	return CONTRACT_ID;
}

export function yoctoToNear(yocto) {
	if (yocto === null || typeof yocto === "undefined") return "0";
	const s = typeof yocto === "bigint" ? yocto.toString() : String(yocto);
	try {
		return utils.format.formatNearAmount(s);
	} catch (e) {
		return utils.format.formatNearAmount("0");
	}
}

export function nearToYocto(near) {
	if (near === null || typeof near === "undefined") return "0";
	return utils.format.parseNearAmount(String(near)) || "0";
}

export const methods = [
	"contract_source_metadata",
	"nft_is_approved",
	"nft_metadata",
	"nft_supply_for_owner",
	"nft_token",
	"nft_tokens",
	"nft_tokens_for_owner",
	"nft_total_supply",
	"nft_approve",
	"nft_revoke",
	"nft_revoke_all",
	"nft_transfer",
	"nft_transfer_call",
	"storage_balance_bounds",
	"storage_balance_of",
	"storage_deposit",
	"storage_unregister",
	"storage_withdraw",
	"own_get_owner",
	"own_get_proposed_owner",
	"own_accept_owner",
	"own_propose_owner",
	"own_renounce_owner",
	"nft_mint",
	"burn",
];
