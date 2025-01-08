

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

type MenuProps = {
    selected: string | null;
    setSelected: Dispatch<SetStateAction<string|null>>;
};

export default function Menu({ selected, setSelected }: MenuProps) {
    const router = useRouter();
    type Routes = '/' | '/music' | '/prog' | '/gallery';

    const Route = (route: Routes) => {
        switch (route) {
            case '/':
                router.push('/');
                break;
            case '/music':
                router.push('/music');
                break;
            case '/prog':
                router.push('/prog');
                break;
            default:
                router.push('/404');
                break;
        }
    };
    return (
        <div className="bg-gray-600">
            <nav className="container flex text-sm">
                {/* <Link
                    href="/"
                    onClick={() => handleClick('/')}
                    className={`hover:text-dark-300 bg-gray-400 p-3 transition-colors duration-200 ${selected === '/' ? 'bg-sky-100 font-bold' : ''}`}
                >
                    Home
                </Link> */}
                <Link
                    href="/music"
                    onClick={() => setSelected('/music')}
                    className={`hover:text-dark-300 bg-gray-400 p-3 transition-colors duration-200 ${selected === '/music' ? 'bg-sky-100 font-bold' : ''}`}
                >
                    Music
                </Link>
                <Link
                    href="/prog"
                    onClick={() => setSelected('/prog')}
                    className={`hover:text-dark-300 bg-gray-400 p-3 transition-colors duration-200 ${selected === '/prog' ? 'bg-sky-100 font-bold' : ''}`}
                >
                    Programming
                </Link>
            </nav>
        </div>
    );
}
