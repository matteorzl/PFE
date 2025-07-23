"use client";
import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { Logo } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setSent(true);
    } catch {
      setError("Erreur lors de l'envoi du mail.");
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
            <form className="w-full max-w-s flex flex-col gap-4" onSubmit={handleSubmit}>
                <h1 className="text-xl text-center font-bold mb-2">Mot de passe oublié ?</h1>
                <Input
                label="Adresse mail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                />
                <Button color="primary" type="submit">Envoyer</Button>
                {sent && <div className="text-green-600">Un email a été envoyé si l'adresse existe.</div>}
                {error && <div className="text-red-600">{error}</div>}
            </form>
            {error && (
                <div className="text-center mt-4 text-red-500">{error}</div>
            )}
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