
"use client"; // Marcar o componente como Client Component

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGuestsResource } from './resource';

interface Guest {
    id: string;
    name: string;
    email: string;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

function GuestForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

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
                //setGuests((prevGuests) => [...prevGuests, newGuest]);
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
        <div className="flex-none w-full md:w-[300px] p-4">
            <div>
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
            </div>
            <div>
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
                        placeholder="Comentário"
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
        </div>
    );
}


function GuestsList() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGuests = async () => {
            try {
                const guestsData = await fetchGuestsResource();
                setGuests(guestsData);
                setLoading(false);
            } catch (error) {
                setError('Failed to load guests');
                setLoading(false);
            }
        };

        loadGuests();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="blinking-text block text-xs pb-4">LOADING</p>
            <span className="loader"></span>
        </div>
    );
    if (error) return <div>{error}</div>;

    return (
        <div className="flex-none w-full md:w-[300px] mt-0 p-4 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Guest List</h2>
            <ul className="space-y-4">
                {guests.length > 0 ? (
                    guests.map((guest) => (
                        <li key={guest.id} className="border-b pb-4">
                            <div className="text-lg font-semibold text-blue-600">
                                {guest.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {guest.email}
                            </div>
                            <p className="text-gray-700 mt-2">{guest.comment}</p>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(guest.createdAt).toLocaleDateString()}
                            </div>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-600">No guests available.</p>
                )}
            </ul>
        </div>
    );
}

export default function Guestbook() {
    return (
        <div className="flex flex-col md:flex-row justify-center m-4 space-y-4 md:space-y-0 md:space-x-4">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <p className="blinking-text block text-xs pb-4">LOADING</p>
                    <span className="loader"></span>
                </div>
            }>
                <GuestForm />
                <GuestsList />
            </Suspense>
        </div>
    );
}



