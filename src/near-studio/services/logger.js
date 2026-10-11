const KEY = "near-nft-studio:operations";

export function getLogs() {
	try {
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

	const logs = [record, ...getLogs()].slice(0, 500);
	localStorage.setItem(KEY, JSON.stringify(logs));
	return record;
}

export function clearLogs() {
	localStorage.removeItem(KEY);
}

export function exportLogs() {
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
