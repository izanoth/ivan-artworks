const KEY = "near-nft-studio:operations";

export function getLogs() {
	try {
		if (typeof window === "undefined") return [];
		return JSON.parse(localStorage.getItem(KEY) || "[]");
	} catch {
		return [];
	}
}

export function logOperation(entry) {
	const record = {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		...entry,
	};

	try {
		if (typeof window !== "undefined") {
			const logs = [record, ...getLogs()].slice(0, 500);
			localStorage.setItem(KEY, JSON.stringify(logs));
		}
	} catch (e) {
		// ignore storage errors on server
	}

	return record;
}

export function clearLogs() {
	try {
		if (typeof window !== "undefined") {
			localStorage.removeItem(KEY);
		}
	} catch {}
}

export function exportLogs() {
	if (typeof window === "undefined") return;
	const blob = new Blob([JSON.stringify(getLogs(), null, 2)], {
		type: "application/json",
	});

	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `near-nft-logs-${Date.now()}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
