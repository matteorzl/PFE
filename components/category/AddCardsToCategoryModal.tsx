import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox, Input, Spinner, Avatar } from "@heroui/react";

interface Card {
  id: number;
  name: string;
  draw_animation?: string | null;
}

interface AddCardsToCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | number;
  onCardsAdded: () => void;
}

export function AddCardsToCategoryModal({ isOpen, onClose, categoryId, onCardsAdded }: AddCardsToCategoryModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`http://localhost:3001/api/categories/${categoryId}/available-cards`)
        .then(res => res.json())
        .then(data => setCards(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    } else {
      setCards([]);
      setSelected([]);
      setSearch("");
      setLoading(false);
    }
  }, [isOpen, categoryId]);

  const handleAdd = async () => {
    await fetch(`http://localhost:3001/api/categories/${categoryId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardIds: selected }),
    });
    onCardsAdded();
    onClose();
  };

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Ajouter des cartes à la série</ModalHeader>
            <ModalBody>
              <Input
                placeholder="Rechercher une carte..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-4"
              />
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner />
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="text-default-400">Aucune carte disponible à ajouter.</div>
              ) : (
                filteredCards.map(card => (
                  <Checkbox
                    key={card.id}
                    checked={selected.includes(card.id)}
                    onChange={() => setSelected(sel =>
                      sel.includes(card.id)
                        ? sel.filter(id => id !== card.id)
                        : [...sel, card.id]
                    )}
                    className=""
                  >
                    <span className="flex flex-row items-center gap-2">
                      <Avatar
                        src={card.draw_animation || undefined}
                        alt={card.name}
                        className="w-8 h-8 object-cover border border-default-300"
                      />
                      {card.name}
                    </span>
                  </Checkbox>
                ))
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>Annuler</Button>
              <Button color="primary" onPress={handleAdd} disabled={selected.length === 0}>Ajouter</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}