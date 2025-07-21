import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState } from "react";

export const CreateModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    country: "",
    city: "",
    role: "patient",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création.");
        setLoading(false);
        return;
      }
      if (onCreated) onCreated();
      onClose();
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        country: "",
        city: "",
        role: "patient",
      });
    } catch (err) {
      setError("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={!loading}>
      <ModalContent>
        <ModalHeader>Ajouter un utilisateur</ModalHeader>
        <ModalBody>
          <form id="create-user-form" className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
            <Input
              label="Prénom"
              isRequired
              value={form.firstname}
              onChange={e => handleChange("firstname", e.target.value)}
              name="firstname"
              placeholder="Prénom"
              autoComplete="off"
            />
            <Input
              label="Nom"
              isRequired
              value={form.lastname}
              onChange={e => handleChange("lastname", e.target.value)}
              name="lastname"
              placeholder="Nom"
              autoComplete="off"
            />
            <Input
              label="Email"
              isRequired
              type="email"
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              name="email"
              placeholder="Adresse mail"
              autoComplete="off"
            />
            <Input
              label="Mot de passe"
              isRequired
              type="password"
              value={form.password}
              onChange={e => handleChange("password", e.target.value)}
              name="password"
              placeholder="Mot de passe"
              autoComplete="new-password"
            />
            <Input
              label="Pays"
              value={form.country}
              onChange={e => handleChange("country", e.target.value)}
              name="country"
              placeholder="Pays"
              autoComplete="off"
            />
            <Input
              label="Ville"
              value={form.city}
              onChange={e => handleChange("city", e.target.value)}
              name="city"
              placeholder="Ville"
              autoComplete="off"
            />
            <div>
              <label className="font-semibold mb-2 block">Rôle</label>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={form.role === "patient"}
                    onChange={e => handleChange("role", e.target.value)}
                  /> Patient
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="therapist"
                    checked={form.role === "therapist"}
                    onChange={e => handleChange("role", e.target.value)}
                  /> Thérapeute
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={form.role === "admin"}
                    onChange={e => handleChange("role", e.target.value)}
                  /> Admin
                </label>
              </div>
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Annuler
          </Button>
          <Button color="primary" type="submit" form="create-user-form" isLoading={loading}>
            Ajouter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};