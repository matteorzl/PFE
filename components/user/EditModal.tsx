import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState, useEffect } from "react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: { id: string; firstname: string; lastname: string; mail: string }) => Promise<void>;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    mail: string;
  } | null;
}

export const EditModal = ({ isOpen, onClose, onEdit, user }: EditModalProps) => {
  const [form, setForm] = useState({ firstname: "", lastname: "", mail: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname,
        lastname: user.lastname,
        mail: user.mail,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    if (!user?.id) return;
    setIsEditing(true);
    setError(null);
    try {
      await onEdit({ id: user.id, ...form });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen && user !== null}
      onClose={onClose}
      isDismissable={!isEditing}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Modifier l'utilisateur
            </ModalHeader>
            <ModalBody>
              <Input
                label="Prénom"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                isRequired
                className="mb-2"
              />
              <Input
                label="Nom"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                isRequired
                className="mb-2"
              />
              <Input
                label="Email"
                name="mail"
                value={form.mail}
                onChange={handleChange}
                isRequired
                className="mb-2"
                type="mail"
              />
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
                isDisabled={isEditing}
              >
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={handleEdit}
                isLoading={isEditing}
                isDisabled={!form.firstname || !form.lastname || !form.mail}
              >
                Enregistrer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};