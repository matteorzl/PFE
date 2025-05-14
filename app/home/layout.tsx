"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/Sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 flex-1 p-8 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}