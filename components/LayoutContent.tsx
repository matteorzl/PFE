"use client";

import { ReactNode } from "react";
import { Link } from "@heroui/link";
import { Navbar } from "@/components/navbar";
import { useNavbar } from "@/context/NavbarContext";
import clsx from "clsx";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const { showNavbar } = useNavbar();
  return (
    <div className="relative flex flex-col h-screen">
      {showNavbar && <Navbar />}
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        {showNavbar && (
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://heroui.com?utm_source=next-app-template"
            title="heroui.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">HeroUI</p>
          </Link>
        )}
      </footer>
    </div>
  );
};

export default LayoutContent;
