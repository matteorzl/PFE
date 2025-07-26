"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import Cookies from "js-cookie";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, TimeScale);

export default function DashboardPage() {
  const [userNumber, setUserNumber] = useState<number | null>(null);
  const [userEvolution, setUserEvolution] = useState<{ date: string; count: number }[]>([]);
  const [completedSeries, setCompletedSeries] = useState<number | null>(null);
  const [totalExercises, setTotalExercises] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const userCookie = Cookies.get('user');
    const parsedUser = userCookie ? JSON.parse(userCookie) : null;
    setCurrentUser(parsedUser);

    async function fetchData() {
      try {
        // Préparer les paramètres pour les stats en fonction du rôle
        let statsUrl = "http://localhost:3001/api/dashboard/stats";
        if (parsedUser?.role === 'therapist' && parsedUser?.therapist?.id) {
          statsUrl += `?role=therapist&therapistId=${parsedUser.therapist.id}`;
        }

        const statsPromise = fetch(statsUrl);
        
        // Pour les admins uniquement, récupérer les données globales
        const promises = [statsPromise];
        
        if (parsedUser?.role === 'admin') {
          promises.push(
            fetch("http://localhost:3001/api/total/users/number"),
            fetch("http://localhost:3001/api/evolution/users")
          );
        }

        const responses = await Promise.all(promises);
        const statsData = await responses[0].json();
        
        setCompletedSeries(statsData.completedSeries ?? null);
        setTotalExercises(statsData.totalExercises ?? null);
        
        // Si admin, récupérer les autres données
        if (parsedUser?.role === 'admin' && responses.length > 1) {
          const numberData = await responses[1].json();
          const evolutionData = await responses[2].json();
          
          setUserNumber(numberData.count);
          setUserEvolution(Array.isArray(evolutionData) ? evolutionData : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const isTherapist = currentUser?.role === 'therapist';
  const isAdmin = currentUser?.role === 'admin';

  // Traitement pour le graphique (seulement pour admin)
  const evolutionByDate: Record<string, number> = {};
  userEvolution.forEach((d) => {
    if (!d || !d.date) return;
    const dateObj = new Date(d.date);
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    evolutionByDate[dateKey] = (evolutionByDate[dateKey] || 0) + Number(d.count || 0);
  });
  const chartLabels = Object.keys(evolutionByDate).sort();
  const chartValues = chartLabels.map((date) => evolutionByDate[date]);

  return (
    <div className="gap-4 p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isTherapist ? "Tableau de bord de vos patients" : "Tableau de bord"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Carte utilisateurs (admin uniquement) */}
        {isAdmin && (
          <Card className="w-full">
            <CardHeader className="pb-0 pt-2 px-4">
              <h4 className="font-bold text-large">Total Utilisateurs</h4>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-blue-600">
                {userNumber ?? "..."}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Carte séries complétées */}
        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">
              Séries complétées à 100%
              {isTherapist && <span className="text-sm text-gray-500 block">par vos patients</span>}
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">
              {completedSeries !== null ? completedSeries : "..."}
            </p>
          </CardBody>
        </Card>

        {/* Carte exercices complétés */}
        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">
              Exercices Complétés
              {isTherapist && <span className="text-sm text-gray-500 block">par vos patients</span>}
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">
              {totalExercises !== null ? totalExercises : "..."}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Graphique évolution (admin uniquement) */}
      {isAdmin && chartLabels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="w-full">
            <CardHeader className="pb-0 pt-2 px-4">
              <h4 className="font-bold text-large">Évolution des utilisateurs</h4>
            </CardHeader>
            <CardBody>
              <Line
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      label: "Utilisateurs",
                      data: chartValues,
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(37,99,235,0.2)",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: "Date" },
                      ticks: {
                        callback: function (val, idx) {
                          const date = chartLabels[idx];
                          return date ? date.split("-").reverse().slice(0, 2).join("/") : "";
                        },
                        font: { size: 12 },
                      },
                    },
                    y: {
                      title: { display: true, text: "Nb utilisateurs" },
                      beginAtZero: true,
                      ticks: { stepSize: 1, font: { size: 12 } },
                    },
                  },
                }}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}