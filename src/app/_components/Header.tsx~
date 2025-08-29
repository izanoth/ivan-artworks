import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faTerminal, faRss, faEnvelope, faBook,faUserSecret } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

type HeaderProps = {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
};

export default function Header({ selected, setSelected }: HeaderProps) {
  const router = useRouter();
  type Routes = '/' | '/music' | '/prog' | '/blog' | '/contact' | '/guestbook' | '/whoami';

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
      case '/whoami':
        router.push('/whoami');
        break;
      case '/guestbook':
        router.push('/guestbook');
        break;
      case '/blog':
        router.push('/blog');
        break;
      case '/contact':
        router.push('/contact');
        break;
      default:
        router.push('/404');
        break;
    }
  };

  return (
	<header className="text-gray-600">
	  {/* Navbar secundária */}
	  <nav className="w-full">
	    <div className="container mx-auto flex justify-end items-center px-4 gap-6">
	      <Link href="/guestbook" className="transition-colors duration-200 text-gray-600 hover:text-gray-900">
	        <FontAwesomeIcon icon={faBook} size="2x" />
	      </Link>			    
	      <Link href="/whoami" className="transition-colors duration-200 text-gray-600 hover:text-gray-900">
			  <Image src="/images/whoami-icon" width={64} height={64} />
	      </Link>	
	      <Link href="/contact" className="transition-colors duration-200 text-gray-600 hover:text-gray-900">
	        <FontAwesomeIcon icon={faEnvelope} size="2x" />			      
	      </Link>
	    </div>
	  </nav>
	
	  {/* Container com logo e donation */}
	  <div className="container mx-auto flex justify-between items-center p-4">
	    <div className="flex flex-col items-center">
	      <img src="/images/zemag.png" style={{ height: '70px', width: 'auto' }} alt="Zanoth logo" />
	      <p className="font-bold text-[12px]">Independent Digital Artworks</p>
	    </div>
	
	    <div className="flex flex-col items-center">
	      <p className="text-sm tracking-[.20em] font-bold">Gift with</p>
	      <Link href="/donation" passHref legacyBehavior>
	        <img src="/near.svg" alt="NEAR" width="80" height="auto" className="cursor-pointer" />
	      </Link>
	    </div>
	  </div>    
	
	  {/* Navbar principal */}
	  <nav className="container mx-auto flex justify-between items-center p-4 md:text-xl text-sm">
	    <div className="flex items-center gap-8">
	      <Link href="/music" className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 hover:text-sky-600 ${selected === '/music' ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]' : 'text-gray-800 font-medium'}`}>
	        <FontAwesomeIcon icon={faMusic} />
	        Music
	      </Link>
	
	      <Link href="/prog" className={`relative flex items-center gap-2 pb-1 transition-colors duration-200 hover:text-sky-600 ${selected === '/prog' ? 'text-sky-600 font-bold after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-sky-600 after:content-[""]' : 'text-gray-800 font-medium'}`}>
	        <FontAwesomeIcon icon={faTerminal} />
	        Programming
	      </Link>
	    </div>   
	
	    <Link href="/blog" className="relative flex items-center gap-2 pb-1 transition-colors duration-200 text-gray-600 hover:text-sky-900">
	      <FontAwesomeIcon icon={faRss} />
	      Blog
	    </Link>
	  </nav>
	</header>
  );
}
