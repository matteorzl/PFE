import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
} from "@heroui/react";
import { useState, useEffect } from "react";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: {
    id: number;
    name: string;
    image?: File | string;
    animation?: File | string;
    sound?: File | string;
  }) => Promise<void>;
  card: {
    id: number;
    name: string;
    draw_animation?: string;
    real_animation?: string;
    sound_file?: string;
  } | null;
}

export const EditModal = ({ isOpen, onClose, onEdit, card }: EditCardModalProps) => {
  const [form, setForm] = useState({ name: ""});
  const [image, setImage] = useState<File | null>(null);
  const [animation, setAnimation] = useState<File | null>(null);
  const [sound, setSound] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setForm({
        name: card.name,
      });
      setImage(null);
      setAnimation(null);
      setSound(null);
    }
  }, [card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAnimation(e.target.files[0]);
  };

  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSound(e.target.files[0]);
  };

  const handleEdit = async () => {
    if (!card?.id) return;
    setIsEditing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (image) formData.append("image", image);
      if (animation) formData.append("draw_animation", animation);
      if (sound) formData.append("sound_file", sound);

      const res = await fetch(`http://localhost:3001/api/cards/${card.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      await onEdit({
        id: card.id,
        name: form.name,
        image: image || card.draw_animation,
        animation: animation || card.real_animation,
        sound: sound || card.sound_file,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Modal isOpen={isOpen && card !== null} onClose={onClose} isDismissable={!isEditing}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Modifier la carte</ModalHeader>
            <ModalBody>
              <Input
                label="Nom de la carte"
                name="name"
                value={form.name}
                onChange={handleChange}
                isRequired
                className="mb-2"
              />
              <div>
                <label className="block mb-1 font-medium">Image (PNG, JPG...)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageChange}
                  className="block w-full"
                />
                {card?.draw_animation && !image && (
                  <img
                    src={`data:image/png;base64,${card.draw_animation}`}
                    alt="Aperçu"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Aperçu"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Animation (GIF)</label>
                <input
                  type="file"
                  accept="image/gif"
                  onChange={handleAnimationChange}
                  className="block w-full"
                />
                {card?.real_animation && !animation && (
                  <img
                    src={`data:image/gif;base64,${card.real_animation}`}
                    alt="Aperçu GIF"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
                {animation && (
                  <img
                    src={URL.createObjectURL(animation)}
                    alt="Aperçu GIF"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Son (MP3, WAV...)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleSoundChange}
                  className="block w-full"
                />
                {/* Pas d'aperçu audio ici, mais tu peux ajouter un lecteur si besoin */}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} isDisabled={isEditing}>
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={handleEdit}
                isLoading={isEditing}
                isDisabled={!form.name}
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