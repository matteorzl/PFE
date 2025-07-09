"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme
} from "victory";

export default function DashboardPage() {
  const [userNumber, setUserNumber] = useState<number | null>(null);
  const [userEvolution, setUserEvolution] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [numberResponse, evolutionResponse] = await Promise.all([
          fetch("http://localhost:3001/api/total/users/number"),
          fetch("http://localhost:3001/api/evolution/users")
        ]);

        const numberData = await numberResponse.json();
        const evolutionData = await evolutionResponse.json();

        setUserNumber(numberData.count);
        setUserEvolution(Array.isArray(evolutionData) ? evolutionData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUserEvolution([]);
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

  // Safe data transformation
  const chartData = Array.isArray(userEvolution)
    ? userEvolution
        .filter(d => d && d.date && !isNaN(new Date(d.date).getTime()))
        .map(d => ({
          x: new Date(d.date),
          y: Math.round(Number(d.count) || 0)
        }))
    : [];

  return (
    <div className="gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h4 className="font-bold text-large">Total Utilisateurs</h4>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">
              {userNumber ?? "..."}
            </p>
          </CardBody>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">Séries Actives</h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">56</p>
          </CardBody>
        </Card>
        
        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h3 className="text-lg font-semibold">Exercices Complétés</h3>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">8,769</p>
          </CardBody>
        </Card>
      </div>

      {chartData.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="w-full">
          <CardHeader className="pb-0 pt-2 px-4">
            <h4 className="font-bold text-large">Évolution des utilisateurs</h4>
          </CardHeader>
          <CardBody>
          <VictoryChart
            theme={VictoryTheme.material}
            scale={{ x: "time" }}
            height={300}
            width={350}
            padding={{ top: 50, bottom: 50, left: 50, right: 20 }}
          >
            <VictoryAxis
              tickFormat={(t) => {
                if (t instanceof Date) {
                  return t.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit"
                  });
                }
                return "";
              }}
              style={{
                tickLabels: { fontSize: 12, padding: 5 }
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => Math.round(t)}
              style={{
                tickLabels: { fontSize: 12, padding: 5 }
              }}
            />
            <VictoryLine
              style={{
                data: { 
                  stroke: "#2563eb",
                  strokeWidth: 2
                }
              }}
              data={chartData}
            />
          </VictoryChart>
          </CardBody>
        </Card>
      </div>
    )}
  </div>
  );
}