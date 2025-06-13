import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Header: React.FC = () => {

    return (
        <header>
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="flex flex-col justify-center items-center">
                    <img src="/images/zemag.png" style={{ height: '70px', width: 'auto' }} />
                    <h1 className="title tracking-wide text-lg font-black">Public Feed</h1>
                </div>
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

