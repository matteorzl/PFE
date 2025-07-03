import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Accordion, AccordionItem, Progress, Chip, Spinner } from "@heroui/react";

export function OrderCategoriesUserModal({ isOpen, onClose, user }) {
  const [categories, setCategories] = useState([]);
  const [cardsByCategory, setCardsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  // Récupère les séries de l'utilisateur (ordre personnalisé si besoin)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/user/${user.id}/categories`)
      .then(res => res.json())
      .then(async (cats) => {
        setCategories(cats);
        const cardsObj = {};
        for (const cat of cats) {
          const cards = await fetch(`http://localhost:3001/api/categories/${cat.id}/cards`).then(r => r.json());
          // Pour chaque carte, récupère le statut de validation pour ce patient
          const cardsWithStatus = await Promise.all(cards.map(async card => {
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
      <ModalHeader>Ordre des séries de {user?.firstname} {user?.lastname}</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner />
          </div>
        ) : (
          <Accordion selectionMode="multiple">
            {categories.map((cat) => {
              const cards = cardsByCategory[cat.id] || [];
              const validated = cards.filter(c => c.is_validated === 1).length;
              const percent = cards.length ? Math.round((validated / cards.length) * 100) : 0;
              return (
                <AccordionItem
                  key={cat.id}
                  aria-label={cat.name}
                  title={
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{cat.name}</span>
                      <Progress
                        value={percent}
                        color={percent === 100 ? "success" : "primary"}
                        className="w-32"
                        showValueLabel
                        valueLabel={`${percent}%`}
                      />
                    </div>
                  }
                >
                  <div className="flex flex-col gap-2">
                    {cards.length === 0 && <span className="text-default-400">Aucune carte</span>}
                    {cards.map(card => (
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
    </Modal>
  );
}