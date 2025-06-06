"use client";

import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <div className="bg-white text-gray-600">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="flex flex-col justify-center items-center">
                    <img src="/images/zntmag.png" style={{ height: '70px', width: 'auto' }} />
                    {/*  <p className="text-white text-left text-xl font-bold">Zanoth</p> */}
                    <p
                        style={{ fontSize: '12px' }}
                        className="font-bold"
                    >
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
            </div >
        </div >
    )
}

export default Header;
