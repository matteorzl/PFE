import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

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

interface ValidateModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onValidate: () => void;
  onRefuse: () => void;
  therapist?: any;
  loading?: boolean;
}

export const ValidateModal: React.FC<ValidateModalProps> = ({
  open,
  onClose,
  user,
  onValidate,
  onRefuse,
  loading,
}) => {
  const [entity, setEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      if (user.role === "therapist") {
        fetch(`http://localhost:3001/api/therapist-id/${user.id}`)
          .then((res) => res.json())
          .then((data) => setEntity(data.therapist || data))
          .catch(() => setEntity(null))
          .finally(() => setIsLoading(false));
      } else if (user.role === "patient") {
        fetch(`http://localhost:3001/api/patient/${user.id}`)
          .then((res) => res.json())
          .then((data) => setEntity(data))
          .catch(() => setEntity(null))
          .finally(() => setIsLoading(false));
      } else {
        setEntity(null);
        setIsLoading(false);
      }
    }
  }, [user]);

  return (
    <Modal isOpen={open} onClose={onClose} isDismissable={!loading && !isLoading}>
      <ModalContent>
        <ModalHeader>
          Validation{" "}
          {user?.role === "therapist"
            ? "du thérapeute"
            : user?.role === "patient"
            ? "du patient"
            : ""}
        </ModalHeader>
        <ModalBody>
          {loading || isLoading ? (
            <div className="mb-4">Chargement...</div>
          ) : entity && user ? (
            <div className="mb-4 space-y-1">
              <div>
                <span className="font-semibold">Nom :</span> {user.lastname}
              </div>
              <div>
                <span className="font-semibold">Prénom :</span> {user.firstname}
              </div>
              <div>
                <span className="font-semibold">Email :</span> {user.mail}
              </div>
              <div>
                <span className="font-semibold">Pays :</span> {user.country}
              </div>
              <div>
                <span className="font-semibold">Ville :</span> {user.city}
              </div>
              {user.role === "therapist" && entity && (
                <>
                  <div>
                    <span className="font-semibold">ID Orthophoniste :</span> {entity.id}
                  </div>
                  <div>
                    <span className="font-semibold">Numéro professionnel :</span> {entity.professional_number}
                  </div>
                  <div>
                    <span className="font-semibold">Type d'identification :</span> {entity.indentification_type}
                  </div>
                </>
              )}
              {user.role === "patient" && entity && (
                <>
                  <div>
                    <span className="font-semibold">Nom du parent :</span> {entity.parent_lastname}
                  </div>
                  <div>
                    <span className="font-semibold">Prénom du parent :</span> {entity.parent_name}
                  </div>
                  <div>
                    <span className="font-semibold">Téléphone :</span> {entity.phone}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mb-4 text-danger">Impossible de charger les informations.</div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            className="text-white"
            onPress={onValidate}
            isDisabled={loading || isLoading || !entity}
          >
            Valider
          </Button>
          <Button
            color="danger"
            className="text-white"
            onPress={onRefuse}
            isDisabled={loading || isLoading || !entity}
          >
            Refuser
          </Button>
          <Button color="primary" variant="light" onPress={onClose}>
            Fermer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};