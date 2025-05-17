import { Button, Link } from "@heroui/react";
import { Logo } from "./icons";

export const Navbar = () => {

  return (
    <div className="fixed top-4 right-4">
      <div className="flex items-center gap-2 mb-8">
        <Logo size={40}/>
        <span className="text-xl font-bold">SoundSwipes</span>
      </div>
    </div>
  );
};