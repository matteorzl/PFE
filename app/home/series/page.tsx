"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardFooter, Image, Breadcrumbs, BreadcrumbItem } from "@heroui/react";

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  created_by: number;
}

export default function SeriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:3001/api/categories");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des catégories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

const handleCardClick = (categoryId: number, categoryName: string) => {
    const encodedName = encodeURIComponent(categoryName);
    router.push(`/home/series/${categoryId}?name=${encodedName}`);
};

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push('/home')}>Home</BreadcrumbItem>
        <BreadcrumbItem>Séries</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">Séries</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            isPressable
            className="hover:scale-105 transition-transform cursor-pointer"
            onPress={() => handleCardClick(category.id, category.name)}
          >
            <CardBody className="p-0">
              <Image
                src={`/images/${category.image}`}
                alt={category.name}
                className="w-full h-[200px] object-cover"
                radius="none"
              />
            </CardBody>
            <CardFooter className="flex flex-col items-start">
              <h4 className="font-bold text-large">{category.name}</h4>
              <p className="text-small text-default-500">{category.description}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}