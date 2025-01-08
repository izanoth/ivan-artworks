import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useContext } from 'react';

import { NearContext } from '../context';
import NearLogo from '/public/near.svg';

export const Navigation = () => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Loading...');

  useEffect(() => {
    if (!wallet) return;

    if (signedAccountId) {
      setAction(() => wallet.signOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => wallet.signIn);
      setLabel('Login');
    }
  }, [signedAccountId, wallet]);

  return (
    <nav className="navbar navbar-expand mt-4">
      <div className="container">
        <Link href="/" passHref legacyBehavior>
          <Image priority src={NearLogo} alt="NEAR" width="auto" height="40" className="d-inline-block align-text-top" />
        </Link>
        <div className='navbar-nav pt-1 flex items-center justify-between'>
          <button className="btn btn-secondary" onClick={action} > {label} </button>
          <Link href="/">
            <i className="pl-4 fa-solid fa-house cursor-pointer"></i>
          </Link>
        </div>
      </div>
    </nav>
  );
};