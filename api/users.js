const express = require('express');
const cors = require('cors');
const { createUser } = require('../db/db.query');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
    const user = req.body;
    console.log("Données reçues :", user); // Vérifiez les données ici
  
    try {
      const result = await createUser(user);
      res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
    }
  });

app.listen(3001, () => {
  console.log("API d'enregistrement en cours d'exécution sur le port 3001");
});