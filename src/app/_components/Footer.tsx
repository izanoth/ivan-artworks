import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

type FooterProps = {
    setSelected: Dispatch<SetStateAction<string|null>>;
}

export default function Footer({ setSelected }: FooterProps) {
    return (
        <footer className="py-4">
            <div className="container mx-auto flex flex-wrap justify-between items-center">
                <div className="text-left ml-0">
                    <ul className="list-none mb-2 ml-0 p-0">
                        <li className="inline mr-2">
                            <Link href="/whoami" onClick={() => setSelected(null)} className="text-gray-700 hover:text-gray-900">Who Am I</Link>
                        </li>
                        <li className="inline mx-2 text-gray-500">⋅</li>
                        <li className="inline mr-2">
                            <Link href="/blog" onClick={() => setSelected(null)} className="text-gray-700 hover:text-gray-900">Blog</Link>
                        </li>
                        <li className="inline mx-2 text-gray-500">⋅</li>
                        <li className="inline mr-2">
                            <Link href="/guestbook" onClick={() => setSelected(null)} className="text-gray-700 hover:text-gray-900">Livro de Visitas</Link>
                        </li>
                        <li className="inline mx-2 text-gray-500">⋅</li>
                        <li className="inline">
                            <Link href="/contact" onClick={() => setSelected(null)} className="text-gray-700 hover:text-gray-900">Contato</Link>
                        </li>
                    </ul>
                    <p className="text-gray-600 text-sm mb-0">Zanoth &copy; Independent Artworks 2023-25. All Rights Reserved.</p>
                </div>
                <div className="text-center text-lg-end my-auto">
                    <ul className="list-none mb-0 flex justify-center lg:justify-end">
                        <li className="mr-4">
                            {/* <a href="https://instagram.com/_zanoth_" className="text-gray-700 hover:text-gray-900">
                                <i className="bi bi-instagram text-3xl pr-4"></i>
                            </a> */}
                            <a href="https://github.com/izanoth" className="text-gray-700 hover:text-gray-900">
                                <i className="bi bi-github text-3xl"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
