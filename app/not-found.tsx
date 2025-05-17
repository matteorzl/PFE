"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/home");
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg text-gray-500">Redirection...</span>
    </div>
  );
}