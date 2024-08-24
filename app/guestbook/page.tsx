"use client"; // Marcar o componente como Client Component

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Guest {
    id: string;
    name: string;
    email: string;
    comment?: string;
}

export default function Guestbook() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [guests, setGuests] = useState<Guest[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await fetch('/api/guest');
                if (res.ok) {
                    const data: Guest[] = await res.json();
                    console.log('response: '+data);
                    setGuests(data);
                }                
            } catch (error) {
                console.error('Error fetching guests:', error);
            }
        };

        fetchGuests();
    }, []);

    const submitData = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, comment }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit data');
            }
            console.log(response);

            router.refresh();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="container mx-auto p-4 w-70">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Guestbook</h1>
            </div>
            <form onSubmit={submitData} className="mb-4">
                <input
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome"
                    type="text"
                    value={name}
                    className="border p-2 w-full mb-2"
                />
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    type="email"
                    value={email}
                    className="border p-2 w-full mb-2"
                />
                <textarea
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comentário (opcional)"
                    rows={4}
                    value={comment}
                    className="border p-2 w-full mb-2"
                />
                <button
                    type="submit"
                    disabled={!comment || !name || !email}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Sign
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="ml-4 text-blue-500"
                >
                    or Cancel
                </button>
            </form>
            <div>
                <h2 className="text-xl font-semibold">Guest List</h2>
                <ul>
                    {guests.length > 0 ? (
                        guests.map((guest) => (
                            <li key={guest.id} className="border-b py-2">
                                <strong>{guest.name}</strong> - {guest.email}
                                <p>{guest.comment}</p>
                            </li>
                        ))
                    ) : (
                        <p>No guests available.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}
