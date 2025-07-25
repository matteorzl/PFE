"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Spinner } from "@heroui/react";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.replace("/");
      return;
    }
    try {
      const user = JSON.parse(userCookie);
      if (user.role === "patient") {
        Cookies.remove("token");
        router.replace("/");
        return;
      }
      if (!token) {
        router.replace("/");
        return;
      }
    } catch {
      Cookies.remove("token");
      router.replace("/");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}