"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Spinner, Breadcrumbs, BreadcrumbItem, Button } from "@heroui/react";
import { AddCardsToCategoryModal } from "@/components/category/AddCardsToCategoryModal";
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
import Cookies from 'js-cookie';

interface CardItem {
  id: number;
  name: string;
  sound_file: string;
  draw_animation: string;
  real_animation: string;
  is_validated: boolean;
  order_list: number;
}

export const PlusIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height={24} width={24} {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [currentUserTherapistId, setCurrentUserTherapistId] = useState<number | null>(null);
  const [categoryCreator, setCategoryCreator] = useState<number | null>(null);
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

  const fetchCards = async () => {
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
  };

  useEffect(() => {
    fetchCards();
  }, [categoryId]);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const parsedUser = JSON.parse(userCookie);
      setIsCurrentUserAdmin(parsedUser?.role === 'admin');
      
      if (parsedUser?.role === 'therapist' && parsedUser?.therapist?.id) {
        setCurrentUserTherapistId(parsedUser.therapist.id);
      }
    }
    
    const fetchCategoryCreator = async () => {
      const response = await fetch(`http://localhost:3001/api/categories/edit/${categoryId}`);
      if (response.ok) {
        const category = await response.json();
        setCategoryCreator(category.created_by);
      }
    };
    
    fetchCategoryCreator();
  }, [categoryId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        setOrderChanged(true);

        return newItems.map((item, index) => ({
          ...item,
          order_list: index + 1
        }));
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}/cards/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: cards.map(card => ({ id: card.id, order_list: card.order_list })) }),
      });
      if (!response.ok) throw new Error("Erreur lors de la sauvegarde de l'ordre");
      setOrderChanged(false);
    } catch (error) {
      alert("Erreur lors de la sauvegarde de l'ordre");
    }
  };

  const canEditOrDeleteCards = () => {
    if (isCurrentUserAdmin) return true;
    return currentUserTherapistId === categoryCreator;
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Cartes</h1>
        <div className="flex gap-2">
          {canEditOrDeleteCards() && (
            <Button color="primary" endContent={<PlusIcon />} onPress={() => setAddModalOpen(true)}>
              Ajouter des cartes
            </Button>
          )}
          {orderChanged && (
            <Button color="success" className="text-white" onPress={handleSaveOrder}>
              Enregistrer l'ordre
            </Button>
          )}
        </div>
      </div>
      <AddCardsToCategoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        categoryId={Array.isArray(categoryId) ? categoryId[0] : (categoryId ?? "")}
        onCardsAdded={fetchCards}
      />
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