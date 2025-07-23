"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";
import { Logo } from "@/components/icons";
import Carousel from "@/components/Carousel";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const credentials = {
      email: formData.email as string,
      password: formData.password as string,
    };

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Après la connexion réussie
      if (response.ok) {
        const data = await response.json();
        let userToStore = { ...data.user };

        if (userToStore.role === "therapist") {
          const therapistRes = await fetch(`http://localhost:3001/api/therapist-id/${userToStore.id}`);
          if (therapistRes.ok) {
            const therapistId = await therapistRes.json();
            userToStore.therapistId = therapistId.therapist.id;
          }
        }

        // Enregistre toutes les données du user dans un seul cookie (objet JSON)
        Cookies.set("user", JSON.stringify(userToStore), { expires: 7 });
        Cookies.set("token", data.token, { expires: 7 });
        router.push("/home");
      } else {
        const errorData = await response.json();
        if (
          errorData.error &&
          errorData.error.toLowerCase().includes("attente de validation")
        ) {
          router.push("/pending-validation");
          return;
        }
        setError(errorData.error || "Erreur lors de la connexion.");
        return;
      }
    } catch (err) {
      console.error("Erreur lors de la requête :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Partie supérieure - Formulaire */}
      <div className="flex flex-col space-between justify-center bg-gray-50 min-h-screen relative">
        {/* Logo en haut */}
        <div className="absolute top-8 flex flex-col items-center w-full">
          <Logo size={120} />
          <h1 className="text-2xl font-bold text-center">SoundSwipes</h1>
        </div>

        {/* Formulaire avec fond blanc */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4">
            Content de vous revoir 😊
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Connectez-vous à votre compte pour continuer.
          </p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              name="email"
              placeholder="Adresse mail"
              className="w-full"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Mot de passe"
              className="w-full"
              required
            />
            <Button
              type="submit"
              className="w-full"
              color="primary"
              radius="full"
            >
              Se connecter
            </Button>
          </form>
          {error && (
            <div className="text-center mt-4 text-red-500">{error}</div>
          )}
          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-sm underline text-blue-600">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="text-center mt-6 text-gray-500">
            Vous n'avez pas de compte ?{" "}
            <Link href="/register" className="text-blue-600 underline">
              S'inscrire
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 flex flex-col items-center w-full">
          <Carousel />
        </div>
      </div>
    </div>
  );
}
