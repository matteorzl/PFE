 import {
    Modal, 
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";
import { useState } from "react";
  
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (userId: string) => Promise<void>;
  user: {
    firstname: string;
    lastname: string;
    id: string;
  } | null;
}
  
export const DeleteModal = ({ isOpen, onClose, onDelete, user }: DeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
  const handleDelete = async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      setIsDeleting(true);
      await onDelete(user.id);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen && user !== null} 
      onClose={onClose}
      isDismissable={!isDeleting}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirmer la suppression
            </ModalHeader>
            <ModalBody>
              {user && (
                <p>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <span className="font-bold">
                    {user.firstname} {user.lastname}
                  </span>{" "}
                  ?
                </p>
              )}
              <p className="text-sm text-gray-500">
                Cette action est irréversible.
              </p>
              {error && (
                <p className="text-sm text-danger mt-2">
                  {error}
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
                isDisabled={isDeleting}
              >
                Annuler
              </Button>
              <Button 
                color="danger" 
                onPress={handleDelete}
                isLoading={isDeleting}
                isDisabled={!user}
              >
                Supprimer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};