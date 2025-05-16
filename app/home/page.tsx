"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userNumber, setUserNumber] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserNumber() {
      try {
        const response = await fetch("http://localhost:3001/api/users/number");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du nombre d'utilisateurs");
        }
        const data = await response.json();
        console.log("Nombre d'utilisateurs :", data.count);
        setUserNumber(data.count);
      } catch (error) {
        console.error("Erreur :", error);
        setUserNumber(null);
      }
    }
    fetchUserNumber();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cartes statistiques */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Utilisateurs</h3>
          <p className="text-3xl font-bold">
            {userNumber !== null ? userNumber : "Chargement..."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Séries Actives</h3>
          <p className="text-3xl font-bold">56</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Exercices Complétés</h3>
          <p className="text-3xl font-bold">8,769</p>
        </div>
      </div>
    </div>
  );
}