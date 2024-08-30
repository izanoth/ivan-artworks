import Link from 'next/link';

const Header: React.FC = () => {
    return (
        (
            <nav className="bg-dark text-white">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <div>
                        <p className="text-white text-left text-xl font-bold">Zanoth </p>
                        <p style={{ fontSize: '12px' }} className="text-white text-left font-bold">Independent Artworks</p>
                    </div>
                    <div>
                        <Link href="/guestbook">
                            <i className="bi bi-book pr-4" style={{ fontSize: '36px', color: 'white' }}></i>
                        </Link>
                        <Link href="/blog">
                            <i className="fa-solid fa-rss" style={{ fontSize: '26px', color: 'white' }}></i>
                        </Link>
                    </div>
                </div>
            </nav>)
)}

export default Header;