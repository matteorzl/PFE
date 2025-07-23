"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input, Button, Spinner } from "@heroui/react";
import { Logo } from "@/components/icons";

export default function TherapistEditPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    professional_number: "",
    indentification_type: "",
    country: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token manquant ou invalide.");
      setLoading(false);
      return;
    }
    // Récupère les infos user et therapist via le token
    fetch("http://localhost:3001/api/therapist/edit-by-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        const userData = data.user || {};
        const therapistData = data.therapist || {};
        setUserId(userData.id);
        setForm({
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          email: userData.mail || "",
          professional_number: therapistData.professional_number || "",
          indentification_type: therapistData.indentification_type || "",
          country: userData.country || "",
          city: userData.city || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des informations.");
        setLoading(false);
      });
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    // PATCH users
    await fetch(`http://localhost:3001/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: form.firstname,
        lastname: form.lastname,
        mail: form.email,
        country: form.country,
        city: form.city,
      }),
    });
    // PATCH therapist
    await fetch(`http://localhost:3001/api/therapist/${userId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_number: form.professional_number,
        indentification_type: form.indentification_type,
      }),
    });
    router.push("/"); // ou affiche un message de succès
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg"/>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <Logo size={80} />
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="absolute top-8 flex flex-col items-center w-full">
        <Logo size={120} />
        <h1 className="text-2xl font-bold text-center">SoundSwipes</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 flex flex-col gap-4 bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Modifier vos informations</h1>
        <Input label="Prénom" name="firstname" value={form.firstname} onChange={handleChange} required />
        <Input label="Nom" name="lastname" value={form.lastname} onChange={handleChange} required />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} required type="email" />
        <Input label="Numéro professionnel" name="professional_number" value={form.professional_number} onChange={handleChange} required />
        <div>
          <label className="block font-medium mb-2">Type d’identification</label>
          <select name="indentification_type" value={form.indentification_type} onChange={handleChange} required className="w-full border rounded px-2 py-2">
            <option value="">Sélectionner</option>
            <option value="ADELI">ADELI</option>
            <option value="RPPS">RPPS</option>
          </select>
        </div>
        <Input label="Pays" name="country" value={form.country} onChange={handleChange} />
        <Input label="Ville" name="city" value={form.city} onChange={handleChange} />
        <Button color="primary" type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}