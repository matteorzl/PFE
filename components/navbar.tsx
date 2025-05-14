import { Button, Link } from "@heroui/react";
import { useNavbar } from "@/context/NavbarContext";

export const Navbar = () => {
  const { setShowNavbar } = useNavbar();

  return (
    <div className="fixed top-4 right-4">
      <Button 
        onClick={() => setShowNavbar(false)} 
        as={Link} 
        href="/"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Se déconnecter
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
        </svg>
      </Button>
    </div>
  );
};