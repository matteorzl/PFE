import { useState } from "react";
import { Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, Button, Input, Switch } from "@heroui/react";

export default function CreateModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [animation, setAnimation] = useState<File | null>(null);
  const [sound, setSound] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAnimation(e.target.files[0]);
  };

  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSound(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("is_free", isFree ? "1" : "0");
      if (image) formData.append("image", image); // image classique
      if (animation) formData.append("draw_animation", animation); // animation GIF
      if (sound) formData.append("sound_file", sound);

      const res = await fetch("http://localhost:3001/api/cards", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création de la carte.");
      } else {
        setName("");
        setIsFree(true);
        setImage(null);
        setAnimation(null);
        setSound(null);
        onCreated && onCreated();
        onClose();
      }
    } catch (err) {
      setError("Erreur lors de la création de la carte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Créer une carte</ModalHeader>
          <ModalBody>
            <Input
              label="Nom de la carte"
              value={name}
              onValueChange={setName}
              required
            />
            <div>
              <label className="block mb-1 font-medium">Image (PNG, JPG...)</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageChange}
                className="block w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Animation (GIF)</label>
              <input
                type="file"
                accept="image/gif"
                onChange={handleAnimationChange}
                className="block w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Son (MP3, WAV...)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleSoundChange}
                className="block w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isFree} onChange={e => setIsFree(e.target.checked)}>
                Carte gratuite
              </Switch>
              <span className="text-sm text-gray-500">{isFree ? "Gratuite" : "Premium"}</span>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              Créer
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}