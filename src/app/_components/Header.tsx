"use client";

import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <div className="bg-dark text-white">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div>
                    <p className="text-white text-left text-xl font-bold">Zanoth</p>
                    <p
                        style={{ fontSize: '12px' }}
                        className="text-white text-left font-bold"
                    >
                        Independent Artworks
                    </p>
                </div>

                <div className="flex items-center flex-row">
                    <div className="flex flex-col pl-4">
                        <p className="text-sm tracking-[.20em]">Gift with</p>
                        <div>
                            <Link href="/donation" passHref legacyBehavior>
                                <img
                                    src="/near.svg"
                                    alt="NEAR"
                                    width="80"
                                    height="auto"
                                    className="invert cursor-pointer d-inline-block align-text-top"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default Header;