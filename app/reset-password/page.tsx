"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input, Button } from "@heroui/react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error("Erreur lors de la réinitialisation");
      setDone(true);
    } catch {
      setError("Erreur lors de la réinitialisation.");
    }
  };

  if (!token) return <div>Token manquant.</div>;

  return (
    <div className="flex flex-col min-h-screen">
        {/* Partie supérieure - Formulaire */}
        <div className="flex flex-col space-between justify-center bg-gray-50 min-h-screen relative">
        {/* Logo en haut */}
        <div className="absolute top-8 flex flex-col items-center w-full">
            <Logo size={120} />
            <h1 className="text-2xl font-bold text-center">Soundswipes</h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4">
            Content de vous revoir 😊
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Connectez-vous à votre compte pour continuer.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold mb-2">Nouveau mot de passe</h1>
            <Input
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            />
            <Button color="primary" type="submit">Réinitialiser</Button>
            {done && <div className="text-green-600">Mot de passe réinitialisé !</div>}
            {error && <div className="text-red-600">{error}</div>}
          </form>
          {error && (
            <div className="text-center mt-4 text-red-500">{error}</div>
          )}
          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-sm text-blue-600">
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
    </div>
  );
}