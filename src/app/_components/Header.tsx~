import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faTerminal, faRss } from '@fortawesome/free-solid-svg-icons';

type HeaderProps = {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
};

export default function Header({ selected, setSelected }: HeaderProps) {
  const router = useRouter();
  type Routes = '/' | '/music' | '/prog' | '/blog';

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
      case '/blog':
        router.push('/blog');
        break;
      default:
        router.push('/404');
        break;
    }
  };

  return (
    <header className="bg-white text-gray-600">
      <div className="container mx-auto flex flex-col">
        {/* Topo com logo e donation */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col justify-center items-center">
            <img
              src="/images/zemag.png"
              style={{ height: '70px', width: 'auto' }}
              alt="Zanoth logo"
            />
            <p style={{ fontSize: '12px' }} className="font-bold">
              Independent Digital Artworks
            </p>
          </div>

          <div className="flex flex-col justify-center items-center">
            <p className="text-sm tracking-[.20em] font-bold">Gift with</p>
            <div>
              <Link href="/donation" passHref legacyBehavior>
                <img
                  src="/near.svg"
                  alt="NEAR"
                  width="80"
                  height="auto"
                  className="cursor-pointer d-inline-block align-text-top"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Menu principal */}
        <nav className="container flex items-center justify-between p-4 md:text-xl text-sm bg-white">
          {/* Links principais à esquerda */}
          <div className="flex items-center gap-8">
            <Link
              href="/music"
              onClick={() => setSelected('/music')}
              className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 hover:text-sky-600 ${
                selected === '/music'
                  ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]'
                  : 'text-gray-800 font-medium'
              }`}
            >
              <FontAwesomeIcon icon={faMusic} />
              Music
            </Link>

            <Link
              href="/prog"
              onClick={() => setSelected('/prog')}
              className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 hover:text-sky-600 ${
                selected === '/prog'
                  ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]'
                  : 'text-gray-800 font-medium'
              }`}
            >
              <FontAwesomeIcon icon={faTerminal} />
              Programming
            </Link>
          </div>

          {/* Blog à direita, isolado */}
          <Link
            href="/blog"
            onClick={() => setSelected('/blog')}
            className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 ${
              selected === '/blog'
                ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]'
                : 'text-gray-800 font-medium hover:text-sky-600'
            }`}
          >
            <FontAwesomeIcon icon={faRss} />
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
