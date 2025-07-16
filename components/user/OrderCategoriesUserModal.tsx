import { useEffect, useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
  Progress, Chip, Spinner, Avatar
} from "@heroui/react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const StarsDifficulty = ({ difficulty }: { difficulty: string | number }) => {
  let yellow = 1;
  if (difficulty === "MOYEN" || difficulty === 2) yellow = 2;
  if (difficulty === "DIFFICILE" || difficulty === 3) yellow = 3;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill={i <= yellow ? "#FFD700" : "#fff"}
          stroke="#FFC04C"
        >
          <polygon
            points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
};

function SortableCategoryItem({ cat, index, percent, cards, expanded, onToggle }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "#f3f4f6" : undefined,
        borderRadius: 8,
        marginBottom: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}
      {...attributes}
      {...listeners}
      className="border border-default-200"
    >
      <div
        className="flex items-center justify-between gap-3 w-full px-4 py-2 cursor-pointer"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2 font-semibold flex-shrink-0">
          <span className="cursor-grab text-default-400 select-none">{index + 1}</span>
          <Avatar
            src={cat.image}
            alt={cat.name}
            className="w-8 h-8 object-cover border border-default-300"
          />
          {cat.name}
          <StarsDifficulty difficulty={cat.difficulty} />
        </span>
        <div className="flex items-center gap-2 w-40">
          <Progress
            value={percent}
            color={percent === 100 ? "success" : "primary"}
            className="w-full"
            aria-label={`Progression de validation pour la série ${cat.name}`}
          />
          <span className="text-xs text-default-500 min-w-[2.5em] text-right">{percent}%</span>
        </div>
      </div>
      {expanded && (
        <div className="flex flex-col gap-2 px-6 pb-3">
          {cards.length === 0 && <span className="text-default-400">Aucune carte</span>}
          {cards.map((card: any) => (
            <div key={card.id} className="flex items-center gap-3">
              <span>{card.name}</span>
              {card.is_validated === 1 ? (
                <Chip color="success" size="sm">Validée</Chip>
              ) : (
                <Chip color="warning" size="sm">À faire</Chip>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type User = {
  id: string;
  firstname: string;
  lastname: string;
};

type OrderCategoriesUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};

export function OrderCategoriesUserModal({ isOpen, onClose, user }: OrderCategoriesUserModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [cardsByCategory, setCardsByCategory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/user/${user.id}/categories`)
      .then(res => res.json())
      .then(async (cats) => {
        if (!Array.isArray(cats)) {
          setCategories([]);
          setLoading(false);
          return;
        }
        setCategories(cats);
        const cardsObj: Record<string, any[]> = {};
        for (const cat of cats) {
          const cards = await fetch(`http://localhost:3001/api/categories/${cat.id}/cards`).then(r => r.json());
          const cardsWithStatus = await Promise.all(cards.map(async (card: any) => {
            const res = await fetch(`http://localhost:3001/api/patient/${user.id}/category/${cat.id}/card/${card.id}/status`);
            const { is_validated } = await res.json();
            return { ...card, is_validated };
          }));
          cardsObj[cat.id] = cardsWithStatus;
        }
        setCardsByCategory(cardsObj);
        setLoading(false);
      });
  }, [user]);

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex(cat => cat.id === active.id);
      const newIndex = categories.findIndex(cat => cat.id === over.id);
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
  
      fetch(`http://localhost:3001/api/user/${user?.id}/categories/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: newCategories.map(cat => cat.id) })
      });
    }
  }

  function toggleExpand(catId: string) {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  return (
    <Modal isOpen={isOpen && !!user} onClose={onClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              Ordre des séries de {user?.firstname} {user?.lastname}
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center text-default-400">Aucune série trouvée pour cet utilisateur.</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((cat, index) => {
                      const cards = cardsByCategory[cat.id] || [];
                      const validated = cards.filter((c) => c.is_validated === 1).length;
                      const percent = cards.length ? Math.round((validated / cards.length) * 100) : 0;
                      return (
                        <SortableCategoryItem
                          key={cat.id}
                          cat={cat}
                          index={index}
                          percent={percent}
                          cards={cards}
                          expanded={!!expanded[cat.id]}
                          onToggle={() => toggleExpand(cat.id)}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color="primary">Fermer</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}