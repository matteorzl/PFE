const createConnection = require('./db.connect');

// Fonction pour créer un utilisateur
async function createUser(user) {
  const query = `
    INSERT INTO users (firstname, lastname, mail, password, role, country, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    user.firstname,
    user.lastname,
    user.email,
    user.password,
    user.role || 1,
    user.country || '',
    user.city || '',
  ];

  try {
    const con = await createConnection();
    const [result] = await con.execute(query, values);
    await con.end(); // Fermer la connexion après utilisation
    return result;
  } catch (err) {
    console.error("Erreur lors de l'insertion :", err);
    throw err;
  }
}

module.exports = {
  createUser,
};