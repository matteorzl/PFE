"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Spinner, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: boolean;
  order_list: number;
}

function SortableCard({ card }: { card: CardItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-lg p-4 hover:scale-105 transition-transform cursor-move"
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h4 className="font-bold text-lg mb-2">{card.name}</h4>
          <span className="text-sm text-gray-500">Position: {card.order_list}</span>
        </div>
        <div className="mt-4 pt-2 border-t">
          <p className={`text-sm ${card.is_validated ? 'text-green-600' : 'text-yellow-600'}`}>
            {card.is_validated ? "Validé" : "En attente"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CategoryCardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const params = useParams();
  const categoryName = searchParams.get('name');
  const categoryId = params.categoryId;
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    setCards((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      return newItems.map((item, index) => ({
        ...item,
        order_list: index + 1
      }));
    });
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg"/>
      </div>
    );
  }

  return (
    <div className="gap-4 p-4">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem onClick={() => router.push('/home')}>Tableau de bord</BreadcrumbItem>
        <BreadcrumbItem onClick={() => router.push('/home/series')}>Séries</BreadcrumbItem>
        <BreadcrumbItem>{categoryName}</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className="text-2xl font-bold mb-4">Cartes</h1>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map(card => card.id)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}