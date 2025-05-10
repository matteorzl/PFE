"use client";

import Paper from "@mui/material/Paper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colonnes du tableau
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstname", headerName: "Prénom", width: 150 },
    { field: "lastname", headerName: "Nom", width: 150 },
    { field: "mail", headerName: "Email", width: 200 },
    { field: "role", headerName: "Rôle", width: 100 },
    { field: "country", headerName: "Pays", width: 150 },
    { field: "city", headerName: "Ville", width: 150 },
  ];

  // Récupérer les utilisateurs depuis l'API
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:3001/api/users");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}