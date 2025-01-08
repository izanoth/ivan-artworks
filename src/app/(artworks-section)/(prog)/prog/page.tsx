"use client";

import React from "react";
import OmegaChess from './App';

import Link from 'next/link';

export default function render() {
    return (
        <div className="container space-y-6 p-4 text-center">

            <OmegaChess />

            <div className="card mt-4 bg-sky-100">
                <div className="p-4 flex flex-col items-center justify-center">
                    <h2 className="text-lg font-semibold">Did you like it? Help to improve this project!</h2>
                    <Link href="https://www.buymeacoffee.com/ivanzanothw" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://img.buymeacoffee.com/button-api/?text=&emoji=&slug=ivanzanothw&button_colour=555&font_colour=ddd&font_family=Cookie&outline_colour=aaa&coffee_colour=fff"
                            alt="Buy Me a Coffee"
                            className="inline-block mt-4"
                        />
                    </Link>

                    <div className="">or</div>
                    <div className="flex justify-center items-center text-center">
                        <Link href="/donation" passHref legacyBehavior>
                            <button className="bg-black outside-square text-white hover:bg-gray-400 font-bold py-2 px-4 rounded">
                                <p className="text-sm tracking-[.20em]">using Ⓝ</p>
                                <img
                                    src="/near.svg"
                                    alt="NEAR"
                                    width="80"
                                    height="auto"
                                    className="invert cursor-pointer d-inline-block align-text-top"
                                />
                            </button>
                        </Link>
                    </div>
                    <p className="pt-4">
                        Fork from <a href="https://github.com/izanoth/omega-chess"><i className="bi bi-github text-2/3xl"></i></a>
                    </p>
                </div>
            </div>

            <div className="text-sm text-gray-500 mt-4">
                <p>
                    The Omega Chess was originally created by Daniel MacDonald, and its mechanics are protected by patent.
                    This implementation is a tribute to the original idea, for educational or general purposes.
                </p>
            </div>
        </div>
    );
}