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

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, TimeScale);

export default function DashboardPage() {
  const [userNumber, setUserNumber] = useState<number | null>(null);
  const [userEvolution, setUserEvolution] = useState<{ date: string; count: number }[]>([]);
  const [completedSeries, setCompletedSeries] = useState<number | null>(null);
  const [totalExercises, setTotalExercises] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          numberResponse,
          evolutionResponse,
          statsResponse
        ] = await Promise.all([
          fetch("http://localhost:3001/api/total/users/number"),
          fetch("http://localhost:3001/api/evolution/users"),
          fetch("http://localhost:3001/api/dashboard/stats")
        ]);

        const numberData = await numberResponse.json();
        const evolutionData = await evolutionResponse.json();
        const statsData = await statsResponse.json();

        setUserNumber(numberData.count);
        setUserEvolution(Array.isArray(evolutionData) ? evolutionData : []);
        setCompletedSeries(statsData.completedSeries ?? null);
        setTotalExercises(statsData.totalExercises ?? null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUserEvolution([]);
        setCompletedSeries(null);
        setTotalExercises(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">Séries complétées à 100%</h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">
              {completedSeries !== null ? completedSeries : "..."}
            </p>
          </CardBody>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">Exercices Complétés</h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">
              {totalExercises !== null ? totalExercises : "..."}
            </p>
          </CardBody>
        </Card>
      </div>

      {chartLabels.length > 0 && (
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