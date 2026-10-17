import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faTerminal, faRss, faEnvelope, faBook, faQuestionCircle, faHandHoldingHeart, faStore } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import CopyAddressButton from '@/layout/CopyAddressButton';

export type HeaderPageItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  type: string;
};

type HeaderProps = {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  onOpenPopup: () => void;
  pages?: HeaderPageItem[];
};

const iconMap: { [key: string]: any } = {
  '/music': faMusic,
  '/prog': faTerminal,
  '/blog': faRss,
  '/contact': faEnvelope,
  '/guestbook': faBook,
  '/whoami': faQuestionCircle,
  '/marketplace': faStore,
};

export default function Header({ selected, setSelected, onOpenPopup, pages = [] }: HeaderProps) {
  const router = useRouter();

  const mainNavPages = pages.filter(page => page.type === 'main' && page.isActive);
  const secondaryNavPages = pages.filter(page => page.type === 'secondary' && page.isActive);

  const Route = (route: string) => {
    router.push(route);
  };

  return (
    <header className="text-gray-600">
      {/* Navbar secundária */}
      <nav className="w-full bg-black">
        <div className="container mx-auto flex justify-end items-center px-4 py-2 gap-6">
          {secondaryNavPages.map((page) => (
            <Link
              key={page.id}
              href={page.slug}
              onClick={() => setSelected(page.slug)}
              className={`transition-colors duration-200 text-gray-700 hover:text-gray-900
                ${selected === page.slug ? 'text-black' : ''}
              `}
            >
              {iconMap[page.slug] && <FontAwesomeIcon icon={iconMap[page.slug]} className="invert" />}
              {!iconMap[page.slug] && page.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Container com logo e donation */}
      <div className="container mx-auto flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">

        {/* Logo */}
        <div className="flex flex-col items-center sm:items-start">
          <img
            src="/images/zemag.png"
            className="h-[70px] w-auto"
            alt="Zanoth logo"
          />
          <p className="font-bold text-[12px]">
            Independent Digital Artworks
          </p>
        </div>

        {/* Donation */}
        <div className="flex min-w-0 flex-col items-center gap-1 text-sm sm:items-end">

          <div className="flex items-center gap-1 text-gray-600">
            <img
                src="/near.svg"
                alt="NEAR"
                className="ml-0.5 h-[10px] w-auto"
              />
       
            <span className="flex items-center">
              Ⓝ </span>
              <span className="text-[10px] bold">NETWORK</span>
          </div>

        {/* Blockchain address */}
          <div className="relative w-[160px]">
            <code
              className="block w-full truncate rounded border border-gray-300 bg-gray-50 py-1 pl-2 pr-8 text-right text-[11px] text-gray-600"
              id="blockchainAddressText"
              title="Endereço para contribuições voluntárias"
            >
              9e5b01d8c9811fc8d6a30f2a4be1479584a345128a826150c36c9a663e9a311f
            </code>

            <CopyAddressButton address="9e5b01d8c9811fc8d6a30f2a4be1479584a345128a826150c36c9a663e9a311f"/>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="container mx-auto flex justify-between items-center p-4 md:text-xl text-sm">
        <div className="flex items-center gap-8">
          {mainNavPages.map((page) => (
            <Link
              key={page.id}
              href={page.slug}
              onClick={() => setSelected(page.slug)}
              className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 hover:text-sky-600 ${selected === page.slug ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]' : 'text-gray-800 font-medium'}`}
            >
              {iconMap[page.slug] && <FontAwesomeIcon icon={iconMap[page.slug]} />}
              {!iconMap[page.slug] && page.name}
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="relative flex items-center gap-2 pb-1 transition-colors duration-200 text-gray-600 hover:text-sky-600"
        >
          <FontAwesomeIcon icon={faRss} />
          Blog
        </Link>
      </nav>
    </header>
  );
}
