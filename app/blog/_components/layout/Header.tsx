import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <nav className="">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="title">Public Feed</h1>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <i className="fa-solid fa-house"></i>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
