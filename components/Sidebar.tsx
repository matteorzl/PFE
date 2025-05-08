import { Link } from "@heroui/link";
import { Logo } from "./icons";

export const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-blue-600 text-white p-4">
      <div className="flex items-center gap-2 mb-8">
        <Logo size={40} />
        <span className="text-xl font-bold">SoundSwipes</span>
      </div>
      
      <div className="flex flex-col space-y-2 w-full">
        <Link href="/home/dashboard" className="w-full text-white">
          <div className="flex items-center gap-2 p-3 hover:bg-blue-700 rounded-lg cursor-pointer w-full">
            <svg className="w-5 h-5"/>
            <span>Tableau de bord</span>
          </div>
        </Link>
        
        <Link href="/home/series" className="w-full text-white">
          <div className="flex items-center gap-2 p-3 hover:bg-blue-700 rounded-lg cursor-pointer w-full">
            <svg className="w-5 h-5"/>
            <span>Séries</span>
          </div>
        </Link>

        <Link href="/home/users" className="w-full text-white">
          <div className="flex items-center gap-2 p-3 hover:bg-blue-700 rounded-lg cursor-pointer w-full">
            <svg className="w-5 h-5"/>
            <span>Utilisateurs</span>
          </div>
        </Link>
      </div>
    </div>
  );
};