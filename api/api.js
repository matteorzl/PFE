require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const { stripe } = require("../stripe-server");
const express = require('express');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet')
const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);
const crypto = require("crypto");
const { 
  /* Dashboard */
  getCompletedSeriesCount,
  getTotalExercisesDone,

  /*user*/
  createUser,
  loginUser,
  getUsersNumber,
  getUsersEvolution,
  getAllUsers,  
  getUserById,
  updateUser,
  deleteUser,
  isPremium,
  createUserPayment,
  getCategoriesOrderedForUser,
  /*patient*/
  getPatientByUserId,
  updatePatient,
  updatePatientTherapist,
  validatePatient,
  getCardValidationStatusForUser,
  getCardsNotInCategory,
  addCardsToCategory,
  getUserCategoryProgress,
  cardValidated,
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
  validateTherapist,
  getAllTherapists,
  getTherapistIdByUserId,
  getPatientTherapist,
  getTherapistUserInfos,

  /* Reset Password */
  getUserByEmail,
  saveResetToken,
  getUserByResetToken,
  updateUserPassword,
  clearResetToken
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

const SECRET = 'votre_secret_ultra_complexe';

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

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const completedSeries = await getCompletedSeriesCount();
    const totalExercises = await getTotalExercisesDone();
    res.json({
      completedSeries,
      totalExercises
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des stats" });
  }
});

app.post('/api/payment-sheet', async (req, res) => {
  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2025-06-30.basil' }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "eur",
      customer: customer.id
    });

    return res.status(201).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send({ error: err.message });
  }
});

app.post('/api/payment' , async(req,res) => {
  const payment = req.body 

  try{
    const result = await createUserPayment(payment)
    res.status(201).json({message : "Paiment effectué avec succès"})
  } 
  catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
  }

});


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

// Recuperation d'un utilisateur par son ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
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
app.get('/api/total/users/number', async (req, res) => {
  try {
    const count = await getUsersNumber();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du nombre d'utilisateurs." });
  }
});

// Récupérer l'évolution des utilisateurs
app.get('/api/evolution/users', async (req, res) => {
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

app.get('/api/user/:id/premium', async (req, res) => {
  const userId = req.params.id;
  try {
    const premium = await isPremium(userId);
    res.status(200).json({ premium });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification premium" });
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

// Récupérer les séries d'un utilisateur
app.get('/api/user/:userId/categories', async (req, res) => {
  const { userId } = req.params;
  try {
    let categories = await getCategoriesOrderedForUser(userId);
    categories = categories.map(cat => ({
      ...cat,
      image: cat.image
        ? `data:image/jpeg;base64,${cat.image.toString('base64')}`
        : null,
    }));
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des séries de l'utilisateur" });
  }
});

// Récupérer les informations d'un utilisateur par son email
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  try {
    // Récupère l'utilisateur
    const user = await getUserByEmail(email);
    if (!user) return res.status(200).json({ success: true }); // Ne jamais révéler si l'email existe

    // Génère un token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1h

    // Stocke le token et l'expiration
    await saveResetToken(user.id, token, expires);

    // Envoie le mail
    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${token}`;
    await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL,
              Name: process.env.MAILJET_FROM_NAME,
            },
            To: [{ Email: user.mail }],
            Subject: "Réinitialisation de votre mot de passe",
            HTMLPart: `
              <!DOCTYPE html>
              <html lang="fr">
                <head>
                  <meta charset="UTF-8" />
                  <title>Réinitialisation de mot de passe - SoundSwipes</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <style>
                    body {
                      background: #f4f6fa;
                      font-family: 'Segoe UI', Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      max-width: 420px;
                      margin: 40px auto;
                      background: #fff;
                      border-radius: 18px;
                      box-shadow: 0 2px 12px rgba(37,99,235,0.07);
                      padding: 32px 24px 24px 24px;
                      text-align: center;
                    }
                    .logo {
                      width: 80px;
                      margin-bottom: 16px;
                    }
                    .title {
                      color: #2563eb;
                      font-size: 1.5rem;
                      font-weight: bold;
                      margin-bottom: 8px;
                    }
                    .subtitle {
                      color: #22223b;
                      font-size: 1.1rem;
                      margin-bottom: 24px;
                    }
                    .btn {
                      display: inline-block;
                      background: #2563eb;
                      color: #fff !important;
                      text-decoration: none;
                      padding: 14px 32px;
                      border-radius: 999px;
                      font-weight: 600;
                      font-size: 1rem;
                      margin: 24px 0 16px 0;
                      transition: background 0.2s;
                    }
                    .btn:hover {
                      background: #1d4ed8;
                    }
                    .info {
                      color: #6b7280;
                      font-size: 0.95rem;
                      margin-top: 18px;
                    }
                    .footer {
                      color: #a0aec0;
                      font-size: 0.85rem;
                      margin-top: 32px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <!-- Remplace src par le chemin de ton logo -->
                    <div class="title">Réinitialisation du mot de passe</div>
                    <div class="subtitle">
                      Bonjour,<br>
                      Vous avez demandé à réinitialiser votre mot de passe SoundSwipes.<br>
                      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                    </div>
                    <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
                    <div class="info">
                      Ce lien est valable 1 heure.<br>
                      Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
                    </div>
                    <div class="footer">
                      &copy; 2025 SoundSwipes<br>
                      <a href="http://localhost:3000/" style="color:#2563eb;text-decoration:none;">soundswipes.fr</a>
                    </div>
                  </div>
                </body>
              </html>
            `
          }
        ]
      });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur forgot-password:", err);
    res.status(500).json({ error: "Erreur lors de la demande." });
  }
});

// Réinitialiser le mot de passe
app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Champs requis" });

  try {
    const user = await getUserByResetToken(token);
    if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
      return res.status(400).json({ error: "Lien invalide ou expiré" });
    }
    await updateUserPassword(user.id, password);
    await clearResetToken(user.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur reset-password:", err);
    res.status(500).json({ error: "Erreur lors de la réinitialisation." });
  }
});

//////////////
/* PATIENT */
////////////

// Récupérer un patient par son userId
app.get('/api/patient/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du patient" });
  }
});

// Modifier un patient
app.patch('/api/patient/:id', async (req, res) => {
  const { id } = req.params;
  const { parent_firstname, parent_lastname, phone } = req.body;
  try {
    await updatePatient(id, parent_firstname, parent_lastname, phone);
    res.status(200).json({ message: "Patient modifié avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la modification du patient :", err);
    res.status(500).json({ error: err.message });
  }
});

// Récupérer le statut de validation d'une carte pour un utilisateur
app.get('/api/patient/:userId/category/:categoryId/card/:cardId/status', async (req, res) => {
  const { userId, cardId, categoryId } = req.params;
  try {
    const status = await getCardValidationStatusForUser(userId, cardId, categoryId);
    res.json({ is_validated: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération du statut de la carte" });
  }
});

// Récupérer la progression d'un utilisateur dans une catégorie
app.get('/api/patient/:userId/category/:categoryId/progress', async (req, res) => {
  const { userId, categoryId } = req.params;
  try {
    const progress = await getUserCategoryProgress(userId, categoryId);
    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du calcul de la progression" });
  }
});

// Mettre à jour l'ordre des catégories d'un patient
app.patch('/api/user/:userId/categories/order', async (req, res) => {
  const { userId } = req.params;
  const { categoryIds } = req.body;
  try {
    await updatePatientCategoriesOrder(userId, categoryIds);
    res.status(200).json({ message: "Ordre des catégories mis à jour !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'ordre des catégories." });
  }
});

// Valider une carte pour un utilisateur
app.post('/api/validate/card', async (req,res)=> {
  const { userId, cardId, categoryId } = req.body;
  try {
    const result = await cardValidated(userId, cardId, categoryId);
    if (result.alreadyValidated) {
      res.status(200).json({ message: "Carte déjà validée." });
    } else {
      res.status(201).json({ message: "Carte validée avec succès !" });
    }
  } catch (err) {
    console.error("Erreur lors de la validation :", err);
    res.status(500).json({ error: "Erreur lors de la validation de la carte." });
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

// Récupérer les cartes non présentes dans une catégorie
app.get('/api/categories/:categoryId/available-cards', async (req, res) => {
  const { categoryId } = req.params;
  try {
    let cards = await getCardsNotInCategory(categoryId);
    cards = cards.map(card => ({
      ...card,
      draw_animation: card.draw_animation
        ? `data:image/png;base64,${card.draw_animation.toString('base64')}`
        : null,
    }));
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des cartes disponibles." });
  }
});

// Ajouter une/des carte(s) dans une catégorie
app.post('/api/categories/:categoryId/cards', async (req, res) => {
  const { categoryId } = req.params;
  const { cardIds } = req.body; // tableau d'ids
  try {
    await addCardsToCategory(categoryId, cardIds);
    res.status(200).json({ message: "Cartes ajoutées à la catégorie !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout des cartes à la catégorie." });
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
  const { name, description, therapistId, is_free, difficulty } = req.body;
  const safeTherapistId = therapistId ? therapistId : null;
  const image = req.file ? req.file.buffer : null;

  try {
    await createCategory(name, description, safeTherapistId, image, is_free, difficulty);
    res.status(201).json({ message: "Catégorie créée avec succès !" });
  } catch (err) {
    console.error("Erreur lors de la création de la catégorie :", err);
    res.status(500).json({ error: "Erreur lors de la création de la catégorie." });
  }
});

// Récupérer une catégorie par son id
app.patch('/api/categories/:categoryId', upload.single('image'), async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, is_free, difficulty } = req.body;
  const image = req.file ? req.file.buffer : null;

  try {
    await updateCategory(categoryId, name, description, image, is_free, difficulty);
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

app.patch('/api/patient/:id/therapist', async (req, res) => {
  const { id } = req.params;
  const { therapist_id } = req.body;
  try {
    const affiliation_count = await updatePatientTherapist(id, therapist_id);
    // Envoi du mail au thérapeute si une demande est créée
    if (therapist_id) {
      // Récupérer infos thérapeute
      const therapistInfos = await getTherapistUserInfos(therapist_id);
      // Récupérer infos patient
      const patient = await getPatientByUserId(id); // id = patient.id
      // Récupérer nom/prénom du patient (via users)
      let patientUser = null;
      if (patient && patient.user_id) {
        patientUser = await getUserById(patient.user_id);
      }
      if (therapistInfos && therapistInfos.mail && patientUser) {
        await mailjetClient
          .post("send", { version: "v3.1" })
          .request({
            Messages: [
              {
                From: {
                  Email: process.env.MAILJET_FROM_EMAIL,
                  Name: process.env.MAILJET_FROM_NAME,
                },
                To: [{ Email: therapistInfos.mail }],
                Subject: "Nouvelle demande d'affiliation sur SoundSwipes",
                HTMLPart: `
                  <div style='font-family:Arial,sans-serif;font-size:16px;'>
                    Bonjour ${therapistInfos.firstname},<br><br>
                    Vous avez reçu une nouvelle demande d'affiliation de la part du patient <b>${patientUser.firstname} ${patientUser.lastname}</b>.<br>
                    Connectez-vous à votre espace SoundSwipes pour accepter ou refuser cette demande.<br><br>
                    <a href="http://localhost:3000/" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Accéder à SoundSwipes</a>
                    <br><br>
                    Merci,<br>L'équipe SoundSwipes
                  </div>
                `
              }
            ]
          });
      }
    }
    res.status(200).json({ message: "Patient modifié avec succès !", affiliation_count });
  } catch (err) {
    console.error("Erreur lors de la modification du patient :", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/therapist/:id/validate', async (req, res) => {
  const { id } = req.params;
  const { is_validated } = req.body;
  try {
    await validateTherapist(id, is_validated);

    // Récupère l'utilisateur concerné
    const con = await require('../db/db.connect')();
    const [[therapist]] = await con.query(
      `SELECT users.mail, users.firstname, users.lastname 
       FROM therapist 
       JOIN users ON users.id = therapist.user_id 
       WHERE therapist.user_id = ?`, [id]
    );
    await con.end();

    if (therapist && therapist.mail) {
      let subject, html;
      if (is_validated === 1) {
        subject = "Votre compte SoundSwipes a été validé";
        html = `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8" />
              <title>Réinitialisation de mot de passe - SoundSwipes</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <style>
                body {
                  background: #f4f6fa;
                  font-family: 'Segoe UI', Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 420px;
                  margin: 40px auto;
                  background: #fff;
                  border-radius: 18px;
                  box-shadow: 0 2px 12px rgba(37,99,235,0.07);
                  padding: 32px 24px 24px 24px;
                  text-align: center;
                }
                .logo {
                  width: 80px;
                  margin-bottom: 16px;
                }
                .title {
                  color: #2563eb;
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .subtitle {
                  color: #22223b;
                  font-size: 1.1rem;
                  margin-bottom: 24px;
                }
                .btn {
                  display: inline-block;
                  background: #2563eb;
                  color: #fff !important;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 999px;
                  font-weight: 600;
                  font-size: 1rem;
                  margin: 24px 0 16px 0;
                  transition: background 0.2s;
                }
                .btn:hover {
                  background: #1d4ed8;
                }
                .info {
                  color: #6b7280;
                  font-size: 0.95rem;
                  margin-top: 18px;
                }
                .footer {
                  color: #a0aec0;
                  font-size: 0.85rem;
                  margin-top: 32px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="title">Compte validé ✅</div>
                <div class="subtitle">
                  Bonjour ${therapist.firstname},<br>
                  Votre compte orthophoniste a été <b>validé</b> par un administrateur.<br>
                  Vous pouvez maintenant vous connecter à SoundSwipes.
                </div>
                <div class="info">
                <a href="http://localhost:3000/" class="btn">Se connecter</a>
                  <div>
                    Merci de votre confiance.<br>L'équipe SoundSwipes.
                  </div>
                </div>
                <div class="footer">
                  &copy; 2025 SoundSwipes
                  <a href="http://localhost:3000/" style="color:#2563eb;text-decoration:none;">soundswipes.fr</a>
                </div>
              </div>
            </body>
          </html>`;
      } else if (is_validated === 2) {
        const editToken = jwt.sign(
          { id, type: "edit-therapist" },
          SECRET,
          { expiresIn: "1h" }
        );

        subject = "Votre compte SoundSwipes a été refusé";
        html =
        `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8" />
              <title>Réinitialisation de mot de passe - SoundSwipes</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <style>
                body {
                  background: #f4f6fa;
                  font-family: 'Segoe UI', Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 420px;
                  margin: 40px auto;
                  background: #fff;
                  border-radius: 18px;
                  box-shadow: 0 2px 12px rgba(37,99,235,0.07);
                  padding: 32px 24px 24px 24px;
                  text-align: center;
                }
                .logo {
                  width: 80px;
                  margin-bottom: 16px;
                }
                .title {
                  color: #2563eb;
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .subtitle {
                  color: #22223b;
                  font-size: 1.1rem;
                  margin-bottom: 24px;
                }
                .btn {
                  display: inline-block;
                  background: #2563eb;
                  color: #fff !important;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 999px;
                  font-weight: 600;
                  font-size: 1rem;
                  margin: 24px 0 16px 0;
                  transition: background 0.2s;
                }
                .btn:hover {
                  background: #1d4ed8;
                }
                .info {
                  color: #6b7280;
                  font-size: 0.95rem;
                  margin-top: 18px;
                }
                .footer {
                  color: #a0aec0;
                  font-size: 0.85rem;
                  margin-top: 32px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="title">Compte refusé ❌</div>
                <div class="subtitle">
                  Bonjour ${therapist.firstname},<br>
                  Votre compte orthophoniste a été <b>refusé</b> par un administrateur.<br>
                  Vous pouvez modifier vos informations afin qu'un administrateur vous valide.
                  Pour plus d'informations, contactez le support SoundSwipes.
                </div>
                <div class="info">
                  <a href="http://localhost:3000/therapist/edit?token=${editToken}" class="btn">Modifier vos informations</a>
                  <div>
                    Merci de votre compréhension.<br>L'équipe SoundSwipes.
                  </div>
                </div>
                <div class="footer">
                  &copy; 2025 SoundSwipes
                  <a href="http://localhost:3000/" style="color:#2563eb;text-decoration:none;">soundswipes.fr</a>
                </div>
              </div>
            </body>
          </html>`;
      }

      if (subject && html) {
        await mailjetClient
          .post("send", { version: "v3.1" })
          .request({
            Messages: [
              {
                From: {
                  Email: process.env.MAILJET_FROM_EMAIL,
                  Name: process.env.MAILJET_FROM_NAME,
                },
                To: [{ Email: therapist.mail }],
                Subject: subject,
                HTMLPart: html,
              },
            ],
          });
      }
    }

    res.status(200).json({ message: "Thérapeute validé avec succès !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la validation du thérapeute." });
  }
});

// Génération d'un token pour la modification des informations d'un orthophoniste
app.post('/api/therapist/edit-by-token', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.type !== "edit-therapist") return res.status(403).json({ error: "Token invalide" });
    const userId = decoded.id;
    // Récupère les infos user et therapist
    const user = await getUserById(userId);
    const therapist = await getTherapistIdByUserId(userId);
    res.json({ user, therapist });
  } catch (err) {
    res.status(400).json({ error: "Token invalide ou expiré" });
  }
});

// Modifier un thérapeute
app.patch('/api/therapist/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { professional_number, indentification_type, city, country } = req.body;
  try {
    // Met à jour les infos et remet is_validated à null
    const con = await require('../db/db.connect')();
    await con.query(
      `UPDATE therapist 
      SET professional_number = ?, indentification_type = ?, is_validated = NULL 
      WHERE user_id = ?`,
      [professional_number, indentification_type, id]
    );
    await con.end();
    res.status(200).json({ message: "Profil thérapeute modifié et demande renvoyée." });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la modification du thérapeute." });
  }
});

// Récupérer un medecin par son userid
app.get('/api/therapist-id/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const therapist = await getTherapistIdByUserId(userId);
    console.log(therapist)
    if (!therapist) return res.status(404).json({ error: "Therapist not found" });
    res.json({ therapist});
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du therapist" });
  }
});

app.patch('/api/validate/patient/:id', async (req, res) => {
  const { id } = req.params;
  const { is_accepted } = req.body;
  try {
    await validatePatient(id, is_accepted);
    res.status(200).json({ message: "Patient validé avec succès !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la validation du patient." });
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

app.get('/api/therapists', async (req, res) => {
  try {
    let therapists = await getAllTherapists();
    res.json(therapists);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des therapeutes." });
  }
});

app.get('/api/therapist/patient/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let therapist = await getPatientTherapist(id);
    res.json(therapist);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du thérapeute." });
  }
});