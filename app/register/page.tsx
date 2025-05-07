"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "@heroui/react";

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold">Inscription</h1>
        <Form
          className="mt-6 w-full max-w-xs flex flex-col gap-4"
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
          <div className="flex gap-2">
            <Button color="primary" type="submit">
              S'inscrire
            </Button>
            <Button type="reset" variant="flat">
              Réinitialiser
            </Button>
          </div>
          {action && (
            <div className="text-small text-default-500">
              Action: <code>{action}</code>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}