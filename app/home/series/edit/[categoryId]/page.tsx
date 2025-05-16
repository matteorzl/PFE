"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Button } from "@heroui/react";



export default function EditCategoryPage({ params }: { params: { categoryId: string } }) {
  const router = useRouter();
  const categoryId = params.categoryId;
  const [category, setCategory] = useState({ name: "", description: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`http://localhost:3001/api/categories/edit/${categoryId}`);
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        const data = await res.json();
        console.log("Category data:", data);
        setCategory(data);
      } catch (e) {
        alert("Erreur lors du chargement de la catégorie");
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", category.name);
    formData.append("description", category.description);
    if (file) {
      formData.append("image", file); // le backend doit gérer "image" comme fichier
    }

    try {
      const res = await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      router.push("/home/series");
    } catch (e) {
      alert("Erreur lors de la modification de la catégorie");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Modifier la catégorie</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
        <Input
          label="Nom"
          name="name"
          value={category.name}
          onChange={handleChange}
          isRequired
        />
        <Textarea
          label="Description"
          name="description"
          value={category.description}
          onChange={handleChange}
          isRequired
        />
        <div>
          <label className="block mb-1 font-medium">Image (fichier)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {category.image && (
            <img src={category.image} alt="Aperçu" className="mt-2 max-h-32 rounded" />
          )}
        </div>
        <Button color="primary" type="submit">Enregistrer</Button>
        <Button type="button" variant="flat" onClick={() => router.back()}>Annuler</Button>
      </form>
    </div>
  );
}