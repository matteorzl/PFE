"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs, BreadcrumbItem, Input } from "@heroui/react";
import { useRouter } from "next/navigation";

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: boolean;
  order_list: number;
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCards() {
        try {
        const response = await fetch("http://localhost:3001/api/cards");
        console.log("Réponse brute :", response); // Ajoutez ce log
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des cartes");
        }
        const data = await response.json();
        setCards(data);
        setFilteredCards(data);
        } catch (error) {
        console.error("Erreur :", error);
        } finally {
        setLoading(false);
        }
    }
    fetchCards();
  }, []);

  useEffect(() => {
    const filtered = cards.filter((card) =>
      card.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [searchValue, cards]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push("/home")}>
          Tableau de bord
        </BreadcrumbItem>
        <BreadcrumbItem>Cartes</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">Cartes</h1>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Rechercher une carte..."
          value={searchValue}
          onValueChange={setSearchValue}
          className="w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-lg p-4 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => router.push(`/home/cards/${card.id}`)}
          >
            <h4 className="font-bold text-lg mb-2">{card.name}</h4>
            <p className="text-sm text-gray-500">
              {card.is_validated ? "Validé" : "En attente"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}