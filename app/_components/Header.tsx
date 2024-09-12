"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {

    const router = useRouter();
    type Routes = '/' | '/guestbook' | '/contact' | '/blog';

    const Route = (route: Routes) => {
        switch (route) {
            case '/blog':
                router.push('/blog');
                break;
            default:
                router.push('/404'); // ou qualquer outra página de fallback
                break;
        }
    };
    return (
        <nav className="bg-dark text-white">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div>
                    <p className="text-white text-left text-xl font-bold">Zanoth </p>
                    <p style={{ fontSize: '12px' }} className="text-white text-left font-bold">Independent Artworks</p>
                </div>
                {/*             <div className="flex flex-row justify-between items-center">
                    <Link href="/guestbook" className="pr-6">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] mb-0">Guestbook</p>
                            <i className="bi bi-book text-4xl text-white"></i>
                        </div>
                    </Link> */}
                <Link href="https://www.buymeacoffee.com/ivanzanothw">
                    <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ivanzanothw&button_colour=555&font_colour=ddd&font_family=Cookie&outline_colour=aaa&coffee_colour=fff" />
                </Link>
                {/*  </div> */}
                {/*  <i onClick={() => Route('/blog')} className="fa-solid fa-rss cursor-pointer" style={{ fontSize: '26px', color: 'white' }}></i> */}
            </div>
        </nav>
    )
}

export default Header;