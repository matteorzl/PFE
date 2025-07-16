import React, { useEffect, useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@heroui/react";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  mail: string;
  country: string;
  city: string;
  role: string;
  is_validated: number | null;
  is_accepted: number | null;
}

interface TherapistInfoModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export const TherapistInfoModal: React.FC<TherapistInfoModalProps> = ({ open, onClose, user }) => {
  const [therapist, setTherapist] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      fetch(`http://localhost:3001/api/therapist-id/${user.id}`)
        .then(res => res.json())
        .then(data => setTherapist(data.therapist || data))
        .catch(() => setTherapist(null))
        .finally(() => setLoading(false));
    } else {
      setTherapist(null);
    }
  }, [open, user]);

  return (
    <Modal isOpen={open && !!user} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Informations du thérapeute {user?.firstname} {user?.lastname}</ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Spinner />
            </div>
          ) : therapist && user ? (
            <div className="space-y-1">
              <div><span className="font-semibold">Nom :</span> {user.lastname}</div>
              <div><span className="font-semibold">Prénom :</span> {user.firstname}</div>
              <div><span className="font-semibold">Email :</span> {user.mail}</div>
              <div><span className="font-semibold">Pays :</span> {user.country}</div>
              <div><span className="font-semibold">Ville :</span> {user.city}</div>
              <div><span className="font-semibold">ID Therapist :</span> {therapist.id}</div>
              <div><span className="font-semibold">Numéro professionnel :</span> {therapist.professional_number}</div>
              <div><span className="font-semibold">Type d'identification :</span> {therapist.indentification_type}</div>
            </div>
          ) : (
            <div className="text-red-500">Impossible de charger les informations du thérapeute.</div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} color="primary">Fermer</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
