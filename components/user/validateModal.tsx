import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";

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

export const ValidateModal: React.FC<ValidateModalProps> = ({ open, onClose, user, onValidate, onRefuse, loading }) => {
  if (!open) return null;
  const [entity, setEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      if (user.role === "therapist") {
        fetch(`http://localhost:3001/api/therapist-id/${user.id}`)
          .then(res => res.json())
          .then(data => setEntity(data.therapist || data))
          .catch(() => setEntity(null))
          .finally(() => setIsLoading(false));
      } else if (user.role === "patient") {
        fetch(`http://localhost:3001/api/patient/${user.id}`)
          .then(res => res.json())
          .then(data => setEntity(data))
          .catch(() => setEntity(null))
          .finally(() => setIsLoading(false));
      } else {
        setEntity(null);
        setIsLoading(false);
      }
    }
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h2 className="text-xl font-bold mb-4">
          Validation {user?.role === 'therapist' ? 'du thérapeute' : user?.role === 'patient' ? 'du patient' : ''}
        </h2>
        {loading || isLoading ? (
          <div className="mb-4">Chargement...</div>
        ) : entity && user ? (
          <div className="mb-4 space-y-1">
            <div><span className="font-semibold">Nom :</span> {user.lastname}</div>
            <div><span className="font-semibold">Prénom :</span> {user.firstname}</div>
            <div><span className="font-semibold">Email :</span> {user.mail}</div>
            <div><span className="font-semibold">Pays :</span> {user.country}</div>
            <div><span className="font-semibold">Ville :</span> {user.city}</div>
            {user.role === 'therapist' && entity && (
              <>
                <div><span className="font-semibold">ID Therapist :</span> {entity.id}</div>
                <div><span className="font-semibold">Numéro professionnel :</span> {entity.professional_number}</div>
                <div><span className="font-semibold">Type d'identification :</span> {entity.indentification_type}</div>
              </>
            )}
            {user.role === 'patient' && entity && (
              <>
                <div><span className="font-semibold">Nom du parent :</span> {entity.parent_lastname}</div>
                <div><span className="font-semibold">Prénom du parent :</span> {entity.parent_name}</div>
                <div><span className="font-semibold">Téléphone :</span> {entity.phone}</div>
              </>
            )}
          </div>
        ) : (
          <div className="mb-4 text-red-500">Impossible de charger les informations.</div>
        )}
        <div className="flex gap-4 justify-end">
          <Button className="bg-green-500 text-white" onClick={onValidate} disabled={loading || isLoading || !entity}>Valider</Button>
          <Button className="bg-red-500 text-white" onClick={onRefuse} disabled={loading || isLoading || !entity}>Refuser</Button>
          <Button variant="light" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
};
