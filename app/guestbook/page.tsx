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
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await fetch('/api/guest');
                if (res.ok) {
                    const data: Guest[] = await res.json();
                    console.log('response: ' + JSON.stringify(data));
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

            if (response.ok) {
                const newGuest = await response.json();
                setGuests((prevGuests) => [...prevGuests, newGuest]);
                setSuccessMessage('Signed successfully, thank you!');
                setErrorMessage('');
                router.refresh();
            } else {
                throw new Error('Failed to submit data');
            }
            console.log(response);
        } catch (error) {
            setErrorMessage('Error submitting data. Please, try again');
            setSuccessMessage('');
            console.error('Error:', error);
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-center m-4 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-none w-full md:w-[300px] p-4">
                {successMessage && (
                    <div className="mb-4 p-2 bg-green-200 text-green-800 border border-green-300 rounded">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 p-2 bg-red-200 text-red-800 border border-red-300 rounded">
                        {errorMessage}
                    </div>
                )}
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
            </div>
            <div className="flex-none w-full md:w-[300px] mt-0 p-4">
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
