import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Button } from "@heroui/react";
import Cookies from "js-cookie";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback pour rafraîchir la liste après création
}

export const CreateModal = ({ isOpen, onClose, onCreated }: CreateModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    // Récupérer l'ID du thérapeute depuis les cookies
    const therapistCookie = Cookies.get("user");
    const therapist = therapistCookie ? JSON.parse(therapistCookie) : null;
    const therapistId = therapist?.therapistId;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (therapistId) {
      formData.append("therapistId", therapistId);
    }
    if (file) {
      formData.append("image", file);
    }

    try {
      const res = await fetch("http://localhost:3001/api/categories", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      if (onCreated) onCreated();
      onClose();
      // Réinitialise le formulaire
      setName("");
      setDescription("");
      setFile(null);
    } catch (err) {
      setError("Erreur lors de la création de la série");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={!loading}>
      <ModalContent>
        <ModalHeader>Créer une série</ModalHeader>
        <ModalBody>
          <Input
            label="Nom"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            isRequired
          />
          <Textarea
            label="Description"
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            isRequired
          />
          <div>
            <label className="block mb-1 font-medium">Image (fichier)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="Aperçu"
                className="mt-2 max-h-32 rounded"
              />
            )}
          </div>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={() => handleSubmit()}
            isLoading={loading}
            isDisabled={!name || !description}
          >
            Créer
          </Button>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Annuler
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};