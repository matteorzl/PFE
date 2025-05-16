"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Button } from "@heroui/react";

export default function CreateSeriesPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (file) {
      formData.append("image", file);
    }

    try {
      const res = await fetch("http://localhost:3001/api/categories", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      router.push("/home/series");
    } catch (err) {
      alert("Erreur lors de la création de la série");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Créer une série</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
        <Input
          label="Nom"
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          isRequired
        />
        <Textarea
          label="Description"
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          isRequired
        />
        <div>
          <label className="block mb-1 font-medium">Image (fichier)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {file && (
            <img
              src={URL.createObjectURL(file)}
              alt="Aperçu"
              className="mt-2 max-h-32 rounded"
            />
          )}
        </div>
        <Button color="primary" type="submit" isLoading={loading}>
          Créer
        </Button>
        <Button type="button" variant="flat" onPress={() => router.back()}>
          Annuler
        </Button>
      </form>
    </div>
  );
}