import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors
  } from "@dnd-kit/core";
import {
    arrayMove, SortableContext, useSortable, verticalListSortingStrategy
  } from "@dnd-kit/sortable";
  import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, Button, ModalBody, Avatar, ModalFooter} from "@heroui/react";
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

export function OrderCategoriesModal({ isOpen, onClose, categories, onOrderChange, onAddCategory }: {
    isOpen: boolean;
    onClose: () => void;
    categories: any[];
    onOrderChange: (newOrder: any[]) => void;
    onAddCategory: () => void;
  }) {
    const [localCategories, setLocalCategories] = useState<any[]>(categories);
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
  
    useEffect(() => {
      setLocalCategories(categories);
    }, [categories]);
  
    function handleDragEnd(event: any) {
      const { active, over } = event;
      if (active.id !== over.id) {
        const oldIndex = localCategories.findIndex(cat => cat.id === active.id);
        const newIndex = localCategories.findIndex(cat => cat.id === over.id);
        const newCategories = arrayMove(localCategories, oldIndex, newIndex);
        setLocalCategories(newCategories);
        onOrderChange(newCategories);
      }
    }
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                Ordre des séries
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-end mb-2">
                  <Button color="primary" onPress={onAddCategory}>Ajouter une série</Button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localCategories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localCategories.map((cat, index) => (
                      <SortableCategoryItem key={cat.id} cat={cat} index={index} />
                    ))}
                  </SortableContext>
                </DndContext>
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

function SortableCategoryItem({ cat, index }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "#f3f4f6" : undefined,
        borderRadius: 8,
        marginBottom: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}
      {...attributes}
      {...listeners}
      className="border border-default-200 flex items-center gap-3 px-4 py-2 bg-white"
    >
      <span className="cursor-grab text-default-400 select-none">{index + 1}</span>
      <Avatar
        src={cat.image}
        alt={cat.name}
        className="w-8 h-8 object-cover border border-default-300"
      />
      <span className="font-semibold flex-1">{cat.name}</span>
      <StarsDifficulty difficulty={cat.difficulty} />
    </div>
  );
}