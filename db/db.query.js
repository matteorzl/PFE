const bcrypt = require('bcrypt');
const createConnection = require('./db.connect');

// Fonction pour créer un utilisateur
async function createUser(user) {
  const { firstname, lastname, email, password, country, city } = user;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const query = `
    INSERT INTO users (firstname, lastname, mail, password, country, city)
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  const values = [firstname, lastname, email, hashedPassword, country, city];

  try {
    const con = await createConnection();
    const [result] = await con.execute(query, values); 
    await con.end();
    return result;
  } catch (err) {
    console.error("Erreur lors de l'insertion :", err);
    throw err;
  }
}

async function loginUser(email, password) {
  const query = `
    SELECT * FROM users WHERE mail = ?;
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.execute(query, [email]);
    await con.end();

    if (rows.length === 0) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = rows[0];

    // Comparer le mot de passe fourni avec le mot de passe hashé
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect");
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    throw err;
  }
}

async function getUsersNumber() {
  const query = `SELECT COUNT(*) AS count FROM users`;

  try {
    const con = await createConnection(); // Établir la connexion
    const [rows] = await con.query(query); // Utiliser `query` au lieu de `execute` pour une requête simple
    await con.end(); // Fermer la connexion
    return rows[0].count; // Retourner le nombre d'utilisateurs
  } catch (err) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
    throw err; // Relancer l'erreur pour la gestion en amont
  }
}

async function getAllUsers() {
  const query = `SELECT * FROM users`;

  try {
    const con = await createConnection(); // Établir la connexion
    const [rows] = await con.query(query); // Utiliser `query` au lieu de `execute` pour une requête simple
    await con.end(); // Fermer la connexion
    return rows; // Retourner tous les utilisateurs
  }
  catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    throw err; // Relancer l'erreur pour la gestion en amont
  }
}

module.exports = {
  createUser,
  loginUser,
  getUsersNumber,
  getAllUsers,
};