import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Header: React.FC = () => {

    return (
        <header>
            <div className="container mx-auto flex items-center justify-between p-4">
                <h1 className="title text-lg">Public Feed</h1>
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <i className="fa-solid fa-house cursor-pointer"></i>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export { Header };

