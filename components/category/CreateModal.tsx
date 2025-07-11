import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Button, RadioGroup, Radio } from "@heroui/react";
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
  const [isFree, setIsFree] = useState("1");

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
    formData.append("is_free", isFree);

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
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{file ? file.name : "Choisir une image"}</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="Aperçu"
                className="mt-2 max-h-32 rounded"
              />
            )}
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Type de série</label>
            <RadioGroup
              orientation="horizontal"
              value={isFree}
              onValueChange={setIsFree}
              className="gap-4"
            >
              <Radio value="1">Gratuit</Radio>
              <Radio value="0">Premium</Radio>
            </RadioGroup>
          </div>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Annuler
          </Button>
          <Button
            color="primary"
            onPress={() => handleSubmit()}
            isLoading={loading}
            isDisabled={!name || !description}
          >
            Créer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};