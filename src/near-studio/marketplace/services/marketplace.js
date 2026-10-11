export async function listMarketplaceNfts(network) {
	const response = await fetch(
		`/api/marketplace?network=${encodeURIComponent(network)}`,
	);
	const json = await response.json().catch(() => null);
	if (!response.ok)
		throw new Error(json?.error || "Não foi possível carregar o marketplace.");
	return json;
}
