import Image from "next/image";
import Link from 'next/link';

export default function Aboutme() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-gray-200 p-8">
        <p><i className="fa-brands fa-telegram"></i> <a href="https://t.me/izanoth">https://t.me/izanoth</a></p>
        <p><a href="mailto:ivanzanoth@gmai.com">ivanzanoth@gmail.com</a></p>
      </div>
    </div>
  );
}







