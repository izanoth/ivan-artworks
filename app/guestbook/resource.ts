// resource.ts

interface Guest {
    id: string;
    name: string;
    email: string;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

async function fetchGuestsData(): Promise<Guest[]> {
    const res = await fetch('/api/guest');
    if (!res.ok) {
        throw new Error('Failed to fetch guests');
    }

    const data: any[] = await res.json(); // Recebe os dados como um array genérico

    return data.map(guest => ({
        ...guest,
        createdAt: new Date(guest.createdAt),
        updatedAt: new Date(guest.updatedAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Ordena os dados
}

export function fetchGuestsResource() {
    return fetchGuestsData();
}
