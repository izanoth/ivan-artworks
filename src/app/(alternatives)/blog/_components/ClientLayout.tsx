"use client";
import React, { useState } from "react";
import { Header } from "./LayoutComponents";
import Footer from "@/app/_components/Footer";
import "@/globals.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Header />
      {children}
      <Footer setSelected={setSelected} />
    </>
  );
}
