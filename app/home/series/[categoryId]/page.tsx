"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardFooter } from "@heroui/react";

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: boolean;
}

export default function CategoryCardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const categoryId = params.categoryId;

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch(`http://localhost:3001/api/categories/${categoryId}/cards`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cartes");
        }
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, [categoryId]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Cartes</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.id} className="hover:scale-105 transition-transform">
            <CardBody>
              <h4 className="font-bold text-large">{card.name}</h4>
            </CardBody>
            <CardFooter>
              <p className="text-small text-default-500">
                {card.is_validated ? "Validé" : "En attente"}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}