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

// Récupérer le nombre total d'utilisateurs
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

// Récupérer l'évolution du nombre d'utilisateurs dans le temps
async function getUsersEvolution() {
  const query = `
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  `;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();

    // Calcul du cumul pour chaque jour
    let total = 0;
    const cumulative = rows.map(row => {
      total += row.count;
      return { date: row.date, count: total };
    });

    return cumulative;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'évolution des utilisateurs :", err);
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
const deleteUser = async (userId,role) => {
  const con = await createConnection();
  try {
    if (role === 'therapist') {
      // Récupérer l'id du thérapeute
      const [therapistId] = await con.query(
        'SELECT id FROM Therapist WHERE user_id = ?',
        [userId]
      );
      // Supprimer les associations de thérapeute avec les catégories
      await con.query(
        'DELETE FROM therapist_category WHERE therapist_id = ?',
        [therapistId[0].id]
      );
      // Supprimer le thérapeute
      await con.query('DELETE FROM Therapist WHERE user_id = ?', [userId]);
    }
    if (role === 'patient') {
      const [patientid] = await con.query(
        'SELECT id FROM patient WHERE user_id = ?',
        [userId]
      );
      // Supprimer les associations de patient avec les catégories
      await con.query(
        'DELETE FROM patient_category WHERE patient_id = ?',
        [patientid[0].id]
      );
      // Supprimer le patient
      await con.query('DELETE FROM patient WHERE user_id = ?', [userId]);
    }

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
    WHERE id IN (SELECT card_id FROM card_category WHERE category_id = ?)
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

async function updateCategory(id, name, description, image, is_free) {
  let query, values;
  if (image) {
    query = `UPDATE category SET name = ?, description = ?, image = ?, is_free = ? WHERE id = ?`;
    values = [name, description, image, is_free, id];
  } else {
    query = `UPDATE category SET name = ?, description = ?, is_free = ? WHERE id = ?`;
    values = [name, description, is_free, id];
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

// Supprimer une catégorie
const deleteCategory = async (categoryId) => {
  const con = await createConnection();
  try {
    // Supprimer les associations de cartes avec la catégorie
    await con.query(
      'DELETE FROM card_category WHERE category_id = ?',
      [categoryId]
    );
    // Supprimer les associations de patients avec la catégorie
    await con.query(
      'DELETE FROM patient_category WHERE category_id = ?',
      [categoryId]
    );
    // Supprimer les associations de thérapeutes avec la catégorie
    await con.query(
      'DELETE FROM therapist_category WHERE category_id = ?',
      [categoryId]
    );

    // Supprimer la catégorie
    const [result] = await con.query(
      'DELETE FROM category WHERE id = ?',
      [categoryId]
    );
    if (!result || result.affectedRows === 0) {
      throw new Error('Catégorie non trouvée');
    }
    return result;
  } catch (error) {
    throw error;
  } finally {
    con.end();
  }
};

async function createCategory(name, description, therapistId, image, is_free) {
  const query = `
    INSERT INTO category (name, description, image, created_by, is_free)
    VALUES (?, ?, ?, ?, ?);
  `;
  const values = [name, description, image, therapistId, is_free];

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

// Récupérer l'image d'une carte
async function getCardImage(cardId) {
  const query = 'SELECT draw_animation FROM card WHERE id = ?';
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [cardId]);
    await con.end();
    return rows[0]?.draw_animation || null;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'image :", err);
    throw err;
  }
}

// Récupérer l'animation réelle d'une carte
async function getCardAnimation(cardId) {
  const query = 'SELECT real_animation FROM card WHERE id = ?';
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [cardId]);
    await con.end();
    return rows[0]?.real_animation || null;
  } catch (err) {
    console.error("Erreur lors de la récupération de l\'animation :", err);
    throw err;
  }
}

// Récupérer le son d'une carte
async function getCardSound(cardId) {
  const query = 'SELECT sound_file FROM card WHERE id = ?';
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [cardId]);
    await con.end();
    return rows[0]?.sound_file || null;
  } catch (err) {
    console.error("Erreur lors de la récupération du son :", err);
    throw err;
  }
}

// Créer une nouvelle carte
async function createCard(name, draw_animation, real_animation, sound_file) {
  const query = `
    INSERT INTO card (name, draw_animation, real_animation, sound_file, is_validated, order_list)
    VALUES (?, ?, ?, ?, 0, 1)
  `;
  const values = [name, draw_animation, real_animation, sound_file];

  try {
    const con = await createConnection();
    const [result] = await con.execute(query, values);
    await con.end();
    return result;
  } catch (err) {
    console.error("Erreur lors de la création de la carte :", err);
    throw err;
  }
}

async function validateCard(id, name, draw_animation, real_animation, sound_file, is_validated) {
  console.log('validateCard', { id, is_validated }); // Ajoute ce log
  if (is_validated === undefined) return;
  const query = `UPDATE card SET is_validated = ? WHERE id = ?`;
  const values = [is_validated, id];

  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification de la carte :", err);
    throw err;
  }
}

// Mettre à jour une carte
async function updateCard(id, name, draw_animation, real_animation, sound_file) {
  let fields = [];
  let values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (draw_animation !== undefined) {
    fields.push('draw_animation = ?');
    values.push(draw_animation);
  }
  if (real_animation !== undefined) {
    fields.push('real_animation = ?');
    values.push(real_animation);
  }
  if (sound_file !== undefined) {
    fields.push('sound_file = ?');
    values.push(sound_file);
  }

  if (fields.length === 0) return;

  const query = `UPDATE card SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification de la carte :", err);
    throw err;
  }
}

// Supprimer une carte
async function deleteCard(cardId) {
  const con = await createConnection();
  try {
    // Supprimer les associations éventuelles (ex: card_category)
    await con.query('DELETE FROM card_category WHERE card_id = ?', [cardId]);
    // Supprimer la carte
    const [result] = await con.query('DELETE FROM card WHERE id = ?', [cardId]);
    if (!result || result.affectedRows === 0) {
      throw new Error('Carte non trouvée');
    }
    return result;
  } catch (error) {
    throw error;
  } finally {
    await con.end();
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getUsersNumber,
  getUsersEvolution,
  getUserById,   
  getAllUsers,
  getTherapistIdByUserId,

  getAllCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
  createCategory,

  getAllCards,
  getCardsByCategory,
  getCardImage,
  getCardAnimation,
  getCardSound,
  createCard,
  validateCard,
  updateCard,
  deleteCard,
};