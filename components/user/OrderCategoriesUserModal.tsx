import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Accordion,
  AccordionItem,
  Progress,
  Chip,
  Spinner,
  Avatar,
} from "@heroui/react";

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
            const res = await fetch(`http://localhost:3001/api/patient/${user.id}/card/${card.id}/status`);
            const { is_validated } = await res.json();
            return { ...card, is_validated };
          }));
          cardsObj[cat.id] = cardsWithStatus;
        }
        setCardsByCategory(cardsObj);
        setLoading(false);
      });
  }, [user]);

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
                <Accordion selectionMode="multiple">
                  {categories.map((cat) => {
                    const cards = cardsByCategory[cat.id] || [];
                    const validated = cards.filter((c) => c.is_validated === 1).length;
                    const percent = cards.length ? Math.round((validated / cards.length) * 100) : 0;
                    return (
                      <AccordionItem
                        key={cat.id}
                        aria-label={cat.name}
                        title={
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span className="flex items-center gap-2 font-semibold flex-shrink-0">
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
                        }
                      >
                        <div className="flex flex-col gap-2">
                          {cards.length === 0 && <span className="text-default-400">Aucune carte</span>}
                          {cards.map((card) => (
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
                      </AccordionItem>
                    );
                  })}
                </Accordion>
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