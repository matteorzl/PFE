import { Link, Button } from "@heroui/react";
import { useNavbar } from "@/context/NavbarContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./icons";

export const Sidebar = () => {
  const { setShowNavbar } = useNavbar();
  const router = useRouter();
  const [user, setUser] = useState<{ firstname?: string; lastname?: string;  role?: string } | null>(undefined);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setShowNavbar(false);
    router.push("/");
  };

  const realUser = user?.user ?? user;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 
      bg-[#171BF3]/90
      backdrop-blur-lg border-r border-white/10
      text-white p-4 z-50 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-8 ml-4">
          <Logo size={40}/>
          <span className="text-xl font-bold">SoundSwipes</span>
        </div>
        <div className="flex flex-col space-y-2 w-full">
          <Link href="/home" className="w-full text-white">
            <div className="flex items-center gap-2 p-3 rounded-lg cursor-pointer w-full transition
              hover:bg-[#D3D4FF]/80 hover:text-[#171BF3]">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
              <span>Tableau de bord</span>
            </div>
          </Link>
          <Link href="/home/series" className="w-full text-white">
            <div className="flex items-center gap-2 p-3 rounded-lg cursor-pointer w-full transition
              hover:bg-[#D3D4FF]/80 hover:text-[#171BF3]">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
              </svg>
              <span>Séries</span>
            </div>
          </Link>
          <Link href="/home/cards" className="w-full text-white">
            <div className="flex items-center gap-2 p-3 rounded-lg cursor-pointer w-full transition
              hover:bg-[#D3D4FF]/80 hover:text-[#171BF3]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span>Cartes</span>
            </div>
          </Link>
          <Link href="/home/users" className="w-full text-white">
            <div className="flex items-center gap-2 p-3 rounded-lg cursor-pointer w-full transition
              hover:bg-[#D3D4FF]/80 hover:text-[#171BF3]">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Utilisateurs</span>
            </div>
          </Link>
        </div>
      </div>
      <div>
        <div className="flex justify-center rounded-lg w-full p-3
            bg-[#FFFFFF]/70 text-[#171BF3] mb-4">
          {user === undefined ? (
            <span className="text-xs font-bold animate-pulse">...</span>
          ) : (
            <span className="text-xs capitalize text-center">
              {(realUser.firstname || realUser.lastname)
                ? `${realUser.firstname ?? ""} ${realUser.lastname ?? ""} - ${realUser.role ?? ""}`.trim() 
                : ""}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-white"
        >
          <div className="flex items-center gap-2 p-3 rounded-lg cursor-pointer w-full transition
            hover:bg-[#D3D4FF]/80 hover:text-[#171BF3]">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span>Se déconnecter</span>
          </div>
        </button>
      </div>
    </div>
  );
};