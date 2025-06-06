const bcrypt = require('bcrypt');
const createConnection = require('./db.connect');

// Fonction pour créer un utilisateur
async function createUser(user) {
  const { firstname, lastname, email, password, country, city } = user;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const role = 'patient';

  const query = `
    INSERT INTO users (firstname, lastname, mail, password, role, country, city)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  const values = [firstname, lastname, email, hashedPassword, role, country, city];

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect");
    }

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
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();
    return rows[0].count;
  } catch (err) {
    console.error("Erreur lors de la récupération du nombre d'utilisateurs :", err);
    throw err;
  }
}

// Modifier un utilisateur
async function updateUser(id, firstname, lastname, mail) {
  const query = `
    UPDATE users
    SET firstname = ?, lastname = ?, mail = ?
    WHERE id = ?
  `;
  const values = [firstname, lastname, mail, id];

  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification de l'utilisateur :", err);
    throw err;
  }
}

// Supprimer un utilisateur
const deleteUser = async (userId) => {
  const con = await createConnection();
  try {
    const [result] = await con.query(
      'DELETE FROM users WHERE id = ? RETURNING *',
      [userId]
    );
    if (!result || result.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    return result[0];
  } catch (error) {
    throw error;
  } finally {
    con.end();
  }
};

// Récupérer un utilisateur par son id
async function getUserById(id) {
  const query = `
    SELECT id, firstname, lastname, mail, country, city
    FROM users
    WHERE id = ?
  `;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [id]);
    await con.end();
    return rows[0] || null;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur :", err);
    throw err;
  }
}

async function getAllUsers() {
  const query = `SELECT * FROM users`;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();
    return rows;
  }
  catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    throw err;
  }
}

async function getAllCategories() {
  const query = `SELECT * FROM category`;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();
    return rows;
  }
  catch (err) {
    console.error("Erreur lors de la récupération des catégories :", err);
    throw err;
  }
}

async function getCardsByCategory(categoryId) {
  const query = `
    SELECT * FROM card 
    WHERE category_id = ?
    ORDER BY order_list ASC
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [categoryId]);
    await con.end();
    return rows;
  }
  catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    throw err;
  }
}

async function updateCategory(id, name, description, image) {
  let query, values;
  if (image) {
    query = `UPDATE category SET name = ?, description = ?, image = ? WHERE id = ?`;
    values = [name, description, image, id];
  } else {
    query = `UPDATE category SET name = ?, description = ? WHERE id = ?`;
    values = [name, description, id];
  }

  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification de la catégorie :", err);
    throw err;
  }
}

async function getCategoryById(categoryId) {
  const query = `
    SELECT * FROM category
    WHERE id = ?
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [categoryId]);
    await con.end();
    return rows[0]; // Retourne seulement la première (et unique) catégorie trouvée
  }
  catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    throw err;
  }
}

async function getTherapistIdByUserId(userId) {
  const query = `SELECT id FROM Therapist WHERE user_id = ?`;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [userId]);
    await con.end();
    return rows[0]; // ou null si pas trouvé
  } catch (err) {
    throw err;
  }
}

async function createCategory(name, description, therapistId, image) {
  const query = `
    INSERT INTO category (name, description, image, created_by)
    VALUES (?, ?, ?, ?);
  `;
  const values = [name, description, image, therapistId];

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

// Fonction pour récupérer toutes les cartes
async function getAllCards() {
  const query = `
    SELECT id, name, sound_file, draw_animation, real_animation, is_validated, order_list
    FROM card
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();
    return rows;
  } catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    throw err;
  }
}


module.exports = {
  createUser,
  loginUser,
  getUsersNumber,
  updateUser,
  getUserById,   
  getAllUsers,
  getAllCategories,
  getAllCards,
  getCardsByCategory,
  updateCategory,
  getCategoryById,
  getTherapistIdByUserId,
  deleteUser,
  createCategory,
};