const express = require('express');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { 
  /*user*/
  createUser,
  loginUser,
  getUsersNumber,
  getUsersEvolution,
  getAllUsers,
  updateUser,
  deleteUser, 
  /*category*/
  getAllCategories,
  getCardsByCategory,
  updateCategory,
  getCategoryById,
  createCategory,
  deleteCategory,
  /*card*/
  getAllCards,
  getCardImage,
  getCardAnimation,
  getCardSound,
  createCard,
  validateCard,
  updateCard,
  deleteCard,
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

// Récupérer l'évolution des utilisateurs
app.get('/api/users/evolution', async (req, res) => {
  try {
    const data = await getUsersEvolution();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'évolution des utilisateurs." });
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
  const role = req.body.selectedUser?.role;

  try {
    const deletedUser = await deleteUser(userId, role);
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
    let cards = await getCardsByCategory(categoryId);
    cards = cards.map(card => ({
      ...card,
      draw_animation: card.draw_animation && Buffer.isBuffer(card.draw_animation)
        ? `data:image/png;base64,${card.draw_animation.toString('base64')}`
        : card.draw_animation && card.draw_animation.data
          ? `data:image/png;base64,${Buffer.from(card.draw_animation.data).toString('base64')}`
          : null,
      real_animation: card.real_animation && Buffer.isBuffer(card.real_animation)
        ? `data:image/png;base64,${card.real_animation.toString('base64')}`
        : card.real_animation && card.real_animation.data
          ? `data:image/png;base64,${Buffer.from(card.real_animation.data).toString('base64')}`
          : null,
      sound_file: card.sound_file && Buffer.isBuffer(card.sound_file)
        ? `data:audio/mpeg;base64,${card.sound_file.toString('base64')}`
        : card.sound_file && card.sound_file.data
          ? `data:audio/mpeg;base64,${Buffer.from(card.sound_file.data).toString('base64')}`
          : null,
    }));
    res.status(200).json(cards);
  } catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des cartes." });
  }
});

// Créer une nouvelle catégorie
app.post('/api/categories', upload.single('image'), async (req, res) => {
  const { name, description, therapistId, is_free } = req.body;
  const safeTherapistId = therapistId ? therapistId : null;
  const image = req.file ? req.file.buffer : null;

  try {
    await createCategory(name, description, safeTherapistId, image, is_free);
    res.status(201).json({ message: "Catégorie créée avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la création de la catégorie :", err);
    res.status(500).json({ error: "Erreur lors de la création de la catégorie." });
  }
});

// Récupérer une catégorie par son id
app.patch('/api/categories/:categoryId', upload.single('image'), async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, is_free } = req.body;
  const image = req.file ? req.file.buffer : null;

  try {
    await updateCategory(categoryId, name, description, image, is_free);
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

// Supprimer une catégorie
app.delete('/api/category/:id', async (req, res) => {
  const categoryId = req.params.id;

  try {
    const deletedCategory = await deleteCategory(categoryId);
    res.status(200).json({
      message: "Catégorie supprimée avec succès",
      category: deletedCategory
    });
  } catch (err) {
    console.error("Erreur lors de la suppression de la catégorie :", err);
    if (err.message === 'Catégorie non trouvée') {
      res.status(404).json({ error: "Catégorie non trouvée." });
    } else {
      res.status(500).json({ error: "Erreur lors de la suppression de la catégorie." });
    }
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

/////////////
/* CARDS */
///////////

// Récupérer toutes les cartes
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await getAllCards();
    res.status(200).json(cards);
  } catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des cartes." });
  }
});

// Pour l'image
app.get('/api/cards/:id/image', async (req, res) => {
  try {
    const image = await getCardImage(req.params.id);
    if (!image) return res.sendStatus(404);
    res.set('Content-Type', 'image/png');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(image);
  } catch (err) {
    console.error("Erreur :", err);
    res.sendStatus(500);
  }
});

// Pour l'animation GIF
app.get('/api/cards/:id/animation', async (req, res) => {
  try {
    const animation = await getCardAnimation(req.params.id);
    if (!animation) return res.sendStatus(404);
    res.set('Content-Type', 'image/gif');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(animation);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'animation :", err);
    res.sendStatus(500);
  }
});

// Pour le son
app.get('/api/cards/:id/sound', async (req, res) => {
  try {
    const sound = await getCardSound(req.params.id);
    if (!sound) return res.sendStatus(404);
    res.set('Content-Type', 'audio/mpeg');
    res.send(sound);
  } catch (err) {
    console.error("Erreur :", err);
    res.sendStatus(500);
  }
});

// Créer une nouvelle carte
app.post('/api/cards', upload.fields([
  { name: 'image', maxCount: 1 },           // PNG/JPG
  { name: 'draw_animation', maxCount: 1 },  // GIF
  { name: 'sound_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name } = req.body;
    const draw_animation = req.files['image']?.[0]?.buffer || null; // PNG/JPG
    const real_animation = req.files['draw_animation']?.[0]?.buffer || null; // GIF
    const sound_file = req.files['sound_file']?.[0]?.buffer || null;

    if (!name || !draw_animation || !real_animation || !sound_file) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    await createCard(name, draw_animation, real_animation, sound_file);
    res.status(201).json({ message: "Carte créée avec succès." });
  } catch (err) {
    console.error("Erreur lors de la création de la carte :", err);
    res.status(500).json({ error: "Erreur lors de la création de la carte." });
  }
});

// Mettre à jour le statut de validation d'une carte
app.patch('/api/cards/:id/validate', async (req, res) => {
  const cardId = Number(req.params.id); // <-- force en nombre
  const is_validated = Number(req.body.is_validated); // <-- force en nombre
  try {
    await validateCard(cardId, undefined, undefined, undefined, undefined, undefined, is_validated);
    res.status(200).json({ message: "Statut de validation mis à jour." });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
  }
});

// Modifier une carte
app.put('/api/cards/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'draw_animation', maxCount: 1 },
  { name: 'sound_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name } = req.body;
    const cardId = req.params.id;

    // Récupère les fichiers si présents
    const draw_animation = req.files['image']?.[0]?.buffer;
    const real_animation = req.files['draw_animation']?.[0]?.buffer;
    const sound_file = req.files['sound_file']?.[0]?.buffer;

    await updateCard(
      cardId,
      name,
      draw_animation,
      real_animation,
      sound_file
    );
    res.status(200).json({ message: "Carte modifiée avec succès." });
  } catch (err) {
    console.error("Erreur lors de la modification de la carte :", err);
    res.status(500).json({ error: "Erreur lors de la modification de la carte." });
  }
});

// Supprimer une carte
app.delete('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  try {
    await deleteCard(cardId);
    res.status(200).json({ message: "Carte supprimée avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression de la carte :", err);
    if (err.message === 'Carte non trouvée') {
      res.status(404).json({ error: "Carte non trouvée." });
    } else {
      res.status(500).json({ error: "Erreur lors de la suppression de la carte." });
    }
  }
});