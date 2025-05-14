const express = require('express');
const cors = require('cors');
const { createUser,loginUser,getUsersNumber,getAllUsers,getAllCategories,getCardsByCategory } = require('../db/db.query');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.listen(3001, () => {
  console.log("API d'enregistrement en cours d'exécution sur le port 3001");
});

////////////
/* USERS */
//////////

app.post('/api/register', async (req, res) => {
  const user = req.body;

  try {
    const result = await createUser(user);
    res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    res.status(200).json({ message: "Connexion réussie", user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/users/number', async (req, res) => {
  try {
    const count = await getUsersNumber();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du nombre d'utilisateurs." });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

/////////////
/* SERIES */
///////////

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Erreur lors de la récupération des catégories :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des catégories." });
  }
});

app.get('/api/categories/:categoryId/cards', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const cards = await getCardsByCategory(categoryId);
    res.status(200).json(cards);
  } catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des cartes." });
  }
});