const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Importer bcrypt

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données MySQL avec mysql2/promise
const db = mysql.createPool({
  host: 'localhost', // Remplacez par l'hôte de votre base de données
  user: 'root', // Remplacez par votre utilisateur MySQL
  password: 'root', // Remplacez par votre mot de passe MySQL
  database: 'soundswipes', // Remplacez par le nom de votre base de données
});

// Exemple d'endpoint pour récupérer les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Exemple d'endpoint pour ajouter un utilisateur
app.post('/users', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [result] = await db.query('INSERT INTO users (mail, password) VALUES (?, ?)', [
      email,
      password,
    ]);
    res.status(201).send('Utilisateur ajouté avec succès');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Endpoint pour la connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const [users] = await db.query('SELECT * FROM users WHERE mail = ?', [email]);

    if (users.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    const user = users[0];

    // Comparer le mot de passe fourni avec le mot de passe haché
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send('Mot de passe incorrect');
    }

    // Si tout est valide, renvoyer une réponse de succès
    res.status(200).send('Connexion réussie');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(port, () => {
  console.log(`Serveur API en cours d'exécution sur http://localhost:${port}`);
});