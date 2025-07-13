import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: { id: number; name: string; description: string; image?: File | string }) => Promise<void>;
  category: {
    id: number;
    name: string;
    description: string;
    image?: string;
    is_free?: number;
    difficulty?: string;
  } | null;
}

export const EditModal = ({ isOpen, onClose, onEdit, category }: EditCategoryModalProps) => {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [difficulty, setDifficulty] = useState("FACILE");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description,
        image: category.image || "",
      });
      setFile(null);
      setIsFree(category.is_free === 1); // <-- Ajoute ceci
      setDifficulty(category.difficulty || "FACILE");
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setForm({ ...form, image: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleEdit = async () => {
    if (!category?.id) return;
    setIsEditing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (file) {
        formData.append("image", file);
      }
      formData.append("is_free", isFree ? "1" : "0");
      formData.append("difficulty", difficulty);
      const res = await fetch(`http://localhost:3001/api/categories/${category.id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      await onEdit({
        id: category.id,
        name: form.name,
        description: form.description,
        image: file || form.image,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Modal isOpen={isOpen && category !== null} onClose={onClose} isDismissable={!isEditing}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Modifier la catégorie</ModalHeader>
            <ModalBody>
              <Input
                label="Nom"
                name="name"
                value={form.name}
                onChange={handleChange}
                isRequired
                className="mb-2"
              />
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                isRequired
                className="mb-2"
              />
              <div>
                <label className="block mb-1 font-medium">Image (fichier)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {(form.image || category?.image) && (
                  <img
                    src={file ? form.image : category?.image}
                    alt="Aperçu"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Type de série</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isFree"
                      checked={isFree}
                      onChange={() => setIsFree(true)}
                    />
                    Gratuit
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isFree"
                      checked={!isFree}
                      onChange={() => setIsFree(false)}
                    />
                    Premium
                  </label>
                </div>
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Difficulté</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === "FACILE"}
                      onChange={() => setDifficulty("FACILE")}
                    />
                    Facile
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === "MOYEN"}
                      onChange={() => setDifficulty("MOYEN")}
                    />
                    Moyen
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === "DIFFICILE"}
                      onChange={() => setDifficulty("DIFFICILE")}
                    />
                    Difficile
                  </label>
                </div>
              </div>
              {error && <p className="text-sm text-danger mt-2">{error}</p>}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} isDisabled={isEditing}>
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={handleEdit}
                isLoading={isEditing}
                isDisabled={!form.name || !form.description}
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