"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "@heroui/react";
import { Logo } from "@/components/icons";

export default function RegisterPage() {
  const [action, setAction] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const user = {
      firstname: formData.firstname as string,
      lastname: formData.lastname as string,
      email: formData.email as string,
      password: formData.password as string,
      country: formData.country as string || "",
      city: formData.city as string || "",
      role : 'therapist',
      professional_number: formData.professional_number as string,
      indentification_type: formData.indentification_type as string,
    };

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setAction("Utilisateur enregistré avec succès !");
        router.push("/");
      } else {
        const error = await response.json();
        setAction(`Erreur : ${error.error}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      setAction("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col space-between justify-center bg-gray-50 min-h-screen relative">
      <div className="absolute top-8 flex flex-col items-center w-full">
          <Logo size={120} />
          <h1 className="text-2xl font-bold text-center">SoundSwipes</h1>
      </div>
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 mx-auto">
          <h1 className="text-2xl font-bold text-center">Inscription</h1>
          <Form
            className="mt-6 w-full max-w-s flex flex-col gap-4"
            validationBehavior="native"
            onSubmit={handleRegister}
          >
            <Input
              isRequired
              label="Prénom"
              name="firstname"
              placeholder="Entrez votre prénom"
              type="text"
            />
            <Input
              isRequired
              label="Nom"
              name="lastname"
              placeholder="Entrez votre nom"
              type="text"
            />
            <Input
              isRequired
              label="Adresse mail"
              name="email"
              placeholder="Entrez votre adresse mail"
              type="email"
            />
            <Input
              isRequired
              label="Mot de passe"
              name="password"
              placeholder="Entrez votre mot de passe"
              type="password"
            />
            <Input
              label="Pays"
              name="country"
              placeholder="Entrez votre pays (optionnel)"
              type="text"
            />
            <Input
              label="Ville"
              name="city"
              placeholder="Entrez votre ville (optionnel)"
              type="text"
            />
            <Input
              isRequired
              label="Numéro professionnel"
              name="professional_number"
              placeholder="Entrez votre numéro professionnel"
              type="text"
            />
            <div>
              <label className="block font-medium mb-2">Type d’identification</label>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="indentification_type"
                    value="ADELI"
                    required
                  /> ADELI
                </label>
                <label>
                  <input
                    type="radio"
                    name="indentification_type"
                    value="RPPS"
                    required
                  /> RPPS
                </label>
              </div>
            </div>
            <Button className="w-full" color="primary" type="submit">
                Créer son compte
            </Button>
            {action && (
              <div className="text-small text-default-500">
                Action: <code>{action}</code>
              </div>
            )}
          </Form>
          <div className="text-center mt-6">
            <a href="/" className="text-sm underline text-blue-600">
                Vous avez déjà un compte ?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}