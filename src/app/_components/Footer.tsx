import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

type FooterProps = {
    setSelected: Dispatch<SetStateAction<string|null>>;
}

export default function Footer({ setSelected }: FooterProps) {
    return (
        <footer className="py-4">
            <div className="container mx-auto flex flex-col items-center justify-items-center">
                <div className="text-left ml-0">
                    <p className="text-gray-600 text-sm mb-0">Zanoth &copy; Independent Artworks 2023-25. All Rights Reserved.</p>
                </div>
                <div className="text-center text-lg-end my-auto mt-2">
                    <ul className="list-none mb-0 flex justify-center lg:justify-end">
                        <li className="mr-4">                                                     
                            <a href="https://github.com/izanoth" className="text-gray-700 hover:text-gray-900">
                                <i className="bi bi-github text-3xl"></i>
                            </a>
                        </li>
                        <li>
                            <a rel="me" href="https://mas.to/@izanoth" className="text-gray-700 hover:text-gray-900">
                                <i className="bi bi-mastodon text-3xl"></i>
                            </a>
                        </li>                        
                    </ul>
                </div>
            </div>
        </footer>
    )
}
