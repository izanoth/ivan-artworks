"use client";
import React, { useState } from "react";
import { Header } from "./LayoutComponents";
import Footer, { FooterItemType } from "@/app/_components/Footer";
import "@/globals.css";

export default function ClientLayout({ 
  children,
  footerItems,
  footerText
}: { 
  children: React.ReactNode;
  footerItems?: FooterItemType[];
  footerText?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Header />
      {children}
      <Footer setSelected={setSelected} items={footerItems} text={footerText} />
    </>
  );
}
