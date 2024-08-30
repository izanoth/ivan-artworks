"use client";

import PostPreview from '@/blog/components/PostPreview';
import React, { useEffect, useState } from 'react';
import RootLayout from '@rootLayout';
import Header from '@/blog/layout/Header';

interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        email: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}


export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    //const router = useRouter();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                if (res.ok) {
                    const data: Post[] = await res.json();
                    const sortedPosts = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setPosts(sortedPosts);
                }
            } catch (error) {
                console.error('Error fetching guests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="blinking-text block text-xs pb-4">LOADING</p>
                <span className="loader"></span>
            </div>
        );
    }
    
    return (
        <RootLayout header={Header}>
        <section>
            <main className="container">
                {posts.map((post) => (
                    <div key={post.id} className="post">
                        <PostPreview post={post} />
                    </div>
                ))}
            </main>
        </section>
        </RootLayout>
    );
};
