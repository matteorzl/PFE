const express = require('express');
const multer = require('multer');
const upload = multer(); // stockage en mémoire
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { 
  /*user*/
  createUser,
  loginUser,
  getUsersNumber,
  getAllUsers,
  updateUser,
  deleteUser, 
  /*category*/
  getAllCategories,
  getCardsByCategory,
  updateCategory,
  getCategoryById,
  /*Therapist*/
  getTherapistIdByUserId,
} = require('../db/db.query');

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

const SECRET = 'votre_secret_ultra_complexe'; // Mets ça dans un .env en prod !

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

////////////
/* USERS */
//////////

// Enregistrement d'un utilisateur
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

// Connexion d'un utilisateur
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    // Génère le token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // tu peux ajouter d'autres infos
      SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: "Connexion réussie", user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Récupérer le nombre d'utilisateurs
app.get('/api/users/number', async (req, res) => {
  try {
    const count = await getUsersNumber();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du nombre d'utilisateurs." });
  }
});

// Modifier un utilisateur
app.patch('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { firstname, lastname, mail } = req.body;
  try {
    await updateUser(userId, firstname, lastname, mail);
    res.status(200).json({ message: "Utilisateur modifié avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la modification de l'utilisateur :", err);
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await deleteUser(userId);
    res.status(200).json({ 
      message: "Utilisateur supprimé avec succès",
      user: deletedUser 
    });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur :", err);
    if (err.message === 'Utilisateur non trouvé') {
      res.status(404).json({ error: "Utilisateur non trouvé." });
    } else {
      res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
  }
});

// Récupérer tous les utilisateurs
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

/////////////
/* SERIES */
///////////

// Récupérer toutes les catégories
app.get('/api/categories', async (req, res) => {
  try {
    let categories = await getAllCategories();
    categories = categories.map(cat => ({
      ...cat,
      image: cat.image
        ? `data:image/jpeg;base64,${cat.image.toString('base64')}`
        : null,
    }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des catégories." });
  }
});

// Récupérer les cartes d'une catégorie
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

// Récupérer une catégorie par son id
app.put('/api/categories/:categoryId', upload.single('image'), async (req, res) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;
  const image = req.file ? req.file.buffer : null; // blob

  try {
    await updateCategory(categoryId, name, description, image);
    res.status(200).json({ message: "Catégorie modifiée avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la modification de la catégorie :", err);
    res.status(500).json({ error: "Erreur lors de la modification de la catégorie." });
  }
});


// Récupérer une catégorie par son id pour l'édition
app.get('/api/categories/edit/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await getCategoryById(categoryId);
    res.status(200).json(category);
  } catch (err) {
    console.error("Erreur lors de la récupération de la série :", err);
    res.status(500).json({ error: "Erreur lors de la récupération de la série." });
  }
});

// Récupérer un medecin par son userid
app.get('/api/therapist-id/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const therapist = await getTherapistIdByUserId(userId);
    if (!therapist) return res.status(404).json({ error: "Therapist not found" });
    res.json({ therapistId: therapist.id });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du therapist" });
  }
});