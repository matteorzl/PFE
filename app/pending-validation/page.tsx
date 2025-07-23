"use client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";

export default function PendingValidationPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
        <div className="flex flex-col space-between justify-center bg-gray-50 min-h-screen relative">
            <div className="absolute top-8 flex flex-col items-center w-full">
                <Logo size={120} />
                <h1 className="text-2xl font-bold text-center">SoundSwipes</h1>
            </div>
            <div className="w-full max-w-lg mx-auto mb-4">
                <img src="clock.svg" alt="En attente de validation" className="w-32 h-32 mx-auto mb-4" />
                <h1 className="text-2xl text-center font-bold mt-6 text-blue-700">Compte en attente de validation ⌛</h1>
            </div>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm mx-auto">
                <div className="text-center mt-4">
                    <p className="text-lg mb-4">
                        Votre compte thérapeute a bien été <b>créé</b>.<br />
                        Il est en attente de <b>validation</b> par un <span className="text-blue-600">administrateur</span>.
                    </p>
                    <p className="text-gray-500 mb-6">
                        Vous recevrez un email dès que votre compte sera validé.<br />
                        Merci de votre patience.
                    </p>
                    <Button className="mb-4" color="primary" onPress={() => router.push("/")}>
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}