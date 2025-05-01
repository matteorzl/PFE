"use client";

import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";
import { Logo } from "@/components/icons";
import Carousel from "@/components/Carousel";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Partie gauche - Formulaire */}
      <div className="flex flex-col justify-center w-1/2 bg-gray-50 p-8">
        {/* Logo en haut */}
        <div className="absolute top-8 left-1/4 transform -translate-x-1/4">
          <Logo size={150} />
          <h1 className="text-2xl font-bold text-center mb-4">Soundwipes</h1>
        </div>
        
        {/* Formulaire avec fond blanc */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4">Content de vous revoir 😊</h1>
          <p className="text-center text-gray-500 mb-6">
            Connectez-vous à votre compte pour continuer.
          </p>
          <form className="space-y-4">
            <Input
              type="email"
              placeholder="Adresse mail"
              className="w-full"
              required
            />
            <Input
              type="password"
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
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-600">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="text-center mt-6 text-gray-500">
            Vous n'avez pas de compte ?{" "}
            <Link href="/register" className="text-blue-600">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>

      {/* Partie droite - Carousel */}
      <div className="w-1/2">
        <Carousel />
      </div>
    </div>
  );
}