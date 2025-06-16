import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: { id: number; name: string } | null;
  onDelete: (id: number) => Promise<void>;
}

export const DeleteModal = ({ isOpen, onClose, card, onDelete }: DeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!card) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete(card.id);
      onClose();
    } catch (err) {
      setError("Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen && !!card} onClose={onClose} isDismissable={!loading}>
      <ModalContent>
        <ModalHeader>Supprimer la carte</ModalHeader>
        <ModalBody>
          <p>Voulez-vous vraiment supprimer la carte <b>{card?.name}</b> ?</p>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Annuler
          </Button>
          <Button color="danger" onPress={handleDelete} isLoading={loading}>
            Supprimer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};