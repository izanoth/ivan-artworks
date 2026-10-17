import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

export type FooterItemType = {
    id: string;
    text: string;
    link: string | null;
    iconClass: string | null;
    order: number;
    isActive: boolean;
};

type FooterProps = {
    setSelected?: Dispatch<SetStateAction<string|null>>;
    items?: FooterItemType[];
    text?: string | null;
}

export default function Footer({ setSelected, items = [], text }: FooterProps) {

    return (
        <footer className="py-4">
            <div className="container mx-auto flex flex-col items-center justify-items-center">
                <div className="text-left ml-0">
                    <p className="text-gray-600 text-sm mb-0">{text || 'Zanoth \u00A9 Independent Artworks 2023-25. All Rights Reserved.'}</p>
                </div>
                <div className="text-center text-lg-end my-auto mt-2">
                    <ul className="list-none mb-0 flex justify-center lg:justify-end">
                        {items.map((item) => (
                            <li key={item.id} className="mr-4">                                                     
                                <Link href={item.link || '#'} className="text-gray-700 hover:text-gray-900">
                                    {item.iconClass && <i className={`${item.iconClass} text-3xl`}></i>}
                                    {!item.iconClass && item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    )
}
