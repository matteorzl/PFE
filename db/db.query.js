const bcrypt = require('bcrypt');
const createConnection = require('./db.connect');

// Nombre de séries complétées à 100%
async function getCompletedSeriesCount() {
  const query = `
    SELECT COUNT(*) AS completed_series_count
    FROM (
      SELECT pc.patient_id, pc.category_id
      FROM patient_category pc
      JOIN (
        SELECT category_id, COUNT(*) AS total_cards
        FROM card_category
        GROUP BY category_id
      ) cc ON cc.category_id = pc.category_id
      JOIN (
        SELECT patient_id, category_id, COUNT(*) AS validated_cards
        FROM patient_card
        WHERE is_validated = 1
        GROUP BY patient_id, category_id
      ) pcv ON pcv.patient_id = pc.patient_id AND pcv.category_id = pc.category_id
      WHERE pcv.validated_cards = cc.total_cards
      GROUP BY pc.patient_id, pc.category_id
    ) AS completed_series;
  `;
  const con = await createConnection();
  const [rows] = await con.query(query);
  await con.end();
  return rows[0]?.completed_series_count || 0;
}

// Nombre total d'exercices réalisés
async function getTotalExercisesDone() {
  const query = `SELECT COUNT(*) AS total_exercises FROM patient_card WHERE is_validated = 1`;
  const con = await createConnection();
  const [rows] = await con.query(query);
  await con.end();
  return rows[0]?.total_exercises || 0;
}

// Fonction pour créer un utilisateur
async function createUser(user) {
  const { firstname, lastname, email, password, country, city, role } = user;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const query = `
    INSERT INTO users (firstname, lastname, mail, password, role, country, city)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  const values = [firstname, lastname, email, hashedPassword, role, country, city];

  try {
    const con = await createConnection();
    const [result] = await con.execute(query, values); 
    const userId = result.insertId;

    // Ajout automatique dans patient ou therapist selon le rôle
    if (role === 'patient') {
      await con.execute('INSERT INTO patient (user_id) VALUES (?)', [userId]);
    } else if (role === 'therapist') {
      await con.execute(
        'INSERT INTO therapist (user_id, professional_number, indentification_type) VALUES (?, ?, ?)',
        [
          userId,
          user.professional_number ?? null,
          user.indentification_type ?? null
        ]
      );
    }

    await con.end();
    return result;
  } catch (err) {
    console.error("Erreur lors de l'insertion :", err);
    throw err;
  }
}

// Mettre à jour un utilisateur
async function loginUser(email, password) {
  const query = `
    SELECT users.*, therapist.is_validated
    FROM users
    LEFT JOIN therapist ON therapist.user_id = users.id
    WHERE users.mail = ?;
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.execute(query, [email]);
    await con.end();

    if (rows.length === 0) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = rows[0];

    if (user.is_deleted === 1) {
      throw new Error("Utilisateur non trouvé");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect");
    }

    // Vérifie la validation du thérapeute
    if (user.role === "therapist" && user.is_validated !== 1) {
      const err = new Error("Compte en attente de validation");
      err.code = "THERAPIST_PENDING";
      throw err;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    if (err.code === "THERAPIST_PENDING") throw err;
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
const deleteUser = async (userId, role) => {
  const con = await createConnection();
  try {
    if (role === 'therapist') {
      const [result] = await con.query(
        'UPDATE users SET is_deleted = 1 WHERE id = ?',
        [userId]
      );
      if (!result || result.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      return result[0];
    }
    if (role === 'patient') {
      // Récupérer l'id du patient
      const [patientidRows] = await con.query(
        'SELECT id FROM patient WHERE user_id = ?',
        [userId]
      );
      if (!patientidRows || patientidRows.length === 0) {
        throw new Error('Patient non trouvé');
      }
      const patientId = patientidRows[0].id;
      // Suppression en cascade des associations
      await con.query('DELETE FROM patient_category WHERE patient_id = ?', [patientId]);
      await con.query('DELETE FROM patient_card WHERE patient_id = ?', [patientId]);
      await con.query('DELETE FROM billing WHERE user_id = ?', [userId]);
      // Supprimer le patient
      await con.query('DELETE FROM patient WHERE user_id = ?', [userId]);
      // Mettre à jour le champ is_deleted dans users
      const [result] = await con.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      if (!result || result.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      return result[0];
    }
    throw new Error('Rôle non supporté pour la suppression');
  } catch (error) {
    throw error;
  } finally {
    con.end();
  }
};

// Récupérer un patient par son userId
async function getPatientByUserId(userId) {
  const query = `SELECT * FROM patient WHERE user_id = ?`;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [userId]);
    await con.end();
    return rows[0];
  } catch (err) {
    throw err;
  }
}

// Vérifier si un utilisateur est premium
async function isPremium(id) {
  const query = `
    SELECT 1 FROM billing
    WHERE user_id = ?
      AND MONTH(updated_at) = MONTH(NOW())
      AND YEAR(updated_at) = YEAR(NOW())
    LIMIT 1
  `;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [id]);
    await con.end();
    // Si aucun enregistrement, retourne false (pas d'erreur)
    return rows.length > 0;
  } catch (err) {
    console.error("Erreur lors de la vérification premium :", err);
    // Si erreur SQL, tu peux choisir de retourner false ou relancer l'erreur
    return false;
  }
}

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

// Récupérer tous les utilisateurs
async function getAllUsers() {
  const query = `
  SELECT 
    users.id,
    users.firstname,
    users.lastname,
    users.mail,
    users.country,
    users.city,
    users.role,
    users.is_deleted,
    therapist.is_validated,
    patient.is_accepted,
    patient.therapist_id
  FROM users
  LEFT JOIN therapist ON therapist.user_id = users.id
  LEFT JOIN patient ON patient.user_id = users.id
  WHERE users.is_deleted IS NULL OR users.is_deleted = 0
`;

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

// Récupérer les catégories associées à un utilisateur, ordonnées par ordre de liste et nom
async function getCategoriesOrderedForUser(userId) {
  const con = await createConnection();

  // 1. Trouver le patient.id à partir du userId
  const [patients] = await con.query(
    `SELECT id FROM patient WHERE user_id = ?`,
    [userId]
  );
  if (patients.length === 0) {
    await con.end();
    return []; // Pas de patient => pas de catégories
  }
  const patientId = patients[0].id;

  // 2. Récupérer les catégories associées à ce patient
  const [rows] = await con.query(
    `SELECT c.* FROM category c
     JOIN patient_category pc ON pc.category_id = c.id
     WHERE pc.patient_id = ?
     ORDER BY c.order_list ASC, c.name ASC`,
    [patientId]
  );
  await con.end();
  return rows;
}

// Récupérer le statut de validation d'une carte pour un utilisateur
async function getCardValidationStatusForUser(userId, cardId, category_id) {
  const con = await createConnection();
  const [patients] = await con.query(
    `SELECT id FROM patient WHERE user_id = ?`,
    [userId]
  );
  if (patients.length === 0) {
    await con.end();
    return 0;
  }

  const [rows] = await con.query(
    `SELECT is_validated FROM patient_card WHERE patient_id = ? AND card_id = ? AND category_id = ? LIMIT 1`,
    [userId, cardId, category_id]
  );
  await con.end();
  return rows.length > 0 ? rows[0].is_validated : 0;
}

// Récupérer la progression d'un utilisateur dans une catégorie
async function getUserCategoryProgress(userId, categoryId) {
  const con = await createConnection();
  const [patients] = await con.query(
    `SELECT id FROM patient WHERE user_id = ?`,
    [userId]
  );
  if (patients.length === 0) {
    await con.end();
    return 0;
  }
  const [totalRows] = await con.query(
    `SELECT COUNT(*) AS total FROM card_category WHERE category_id = ?`,
    [categoryId]
  );
  const total = totalRows[0]?.total || 0;

  // Nombre de cartes validées par l'utilisateur dans cette catégorie
  const [validatedRows] = await con.query(
    `SELECT COUNT(*) AS validated FROM patient_card WHERE patient_id = ? AND category_id = ? AND is_validated = 1`,
    [patients[0].id, categoryId]
  );
  const validated = validatedRows[0]?.validated || 0;

  await con.end();

  // Calcul du pourcentage
  return total === 0 ? 0 : Math.round((validated / total) * 100);
}

// Valider une carte pour un utilisateur
async function cardValidated(userId, cardId, categoryId){
  const con = await createConnection();
  const [patients] = await con.query(
    `SELECT id FROM patient WHERE user_id = ?`,
    [userId]
  );
  if (patients.length === 0) {
    await con.end();
    return 0;
  }
  const [rows] = await con.query(
    `SELECT 1 FROM patient_card WHERE patient_id = ? AND card_id = ? AND category_id = ? LIMIT 1`,
    [patients[0].id, cardId, categoryId]
  );
  if (rows.length > 0) {
    await con.end();
    return { alreadyValidated: true };
  }
  // Sinon, insérer
  await con.query(
    `INSERT INTO patient_card (patient_id, card_id, category_id, is_validated) VALUES (?, ?, ?, 1)`,
    [patients[0].id, cardId, categoryId]
  );
  await con.end();
  return { alreadyValidated: false };
}

// Récupérer toutes les catégories
async function getAllCategories() {
  const query = `SELECT * FROM category
      ORDER BY is_free DESC`;

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

// Mettre à jour un patient
async function updatePatient(id, parent_firstname, parent_lastname, phone) {
  const query = `
    UPDATE patient
    SET parent_name = ?, parent_lastname = ?, phone = ?
    WHERE id = ?
  `;
  const values = [parent_firstname, parent_lastname, phone, id];

  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification du patient :", err);
    throw err;
  }
}

// Récupérer le thérapeute d'un patient
async function getPatientTherapist(id) {
  const query = `
    SELECT therapist_id, CONCAT(users.firstname, ' ', users.lastname) AS name
    FROM patient
    JOIN therapist ON therapist.id = patient.therapist_id
    JOIN users ON users.id = therapist.user_id
    WHERE patient.id = ?
  `;

  const values = [id];

  try {
    const con = await createConnection();
    const [rows] = await con.query(query, values);
    await con.end();
    return rows;
  }
  catch (err) {
    console.error("Erreur lors de la récupération des therapeutes :", err);
    throw err;
  }
}

// Mettre à jour le thérapeute d'un patient
async function updatePatientTherapist(id, therapist_id) {
  const query = `
    UPDATE patient
    SET therapist_id = ?
    WHERE id = ?
  `;
  const values = [therapist_id, id];
  try {
    const con = await createConnection();
    await con.execute(query, values);
    await con.end();
  } catch (err) {
    console.error("Erreur lors de la modification du patient :", err);
    throw err;
  }
}

// Récupérer les cartes d'une catégorie
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

// Mettre à jour une catégorie
async function updateCategory(id, name, description, image, is_free, difficulty) {
  let query, values;
  if (image) {
    query = `UPDATE category SET name = ?, description = ?, image = ?, is_free = ?, difficulty = ? WHERE id = ?`;
    values = [name, description, image, is_free, difficulty, id];
  } else {
    query = `UPDATE category SET name = ?, description = ?, is_free = ?, difficulty = ? WHERE id = ?`;
    values = [name, description, is_free, difficulty, id];
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

// Récupérer une catégorie par son ID
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

// Récupérer les cartes qui ne sont pas dans une catégorie spécifique
async function getCardsNotInCategory(categoryId) {
  const query = `
    SELECT * FROM card
    WHERE id NOT IN (
      SELECT card_id FROM card_category WHERE category_id = ?
    )
  `;
  const con = await createConnection();
  const [rows] = await con.query(query, [categoryId]);
  await con.end();
  return rows;
}

// Ajouter des cartes à une catégorie
async function addCardsToCategory(categoryId, cardIds) {
  const con = await createConnection();
  try {
    for (const cardId of cardIds) {
      await con.query(
        'INSERT INTO card_category (card_id, category_id) VALUES (?, ?)',
        [cardId, categoryId]
      );
    }
  } finally {
    await con.end();
  }
}

// Récupérer l'id du thérapeute à partir de l'id de l'utilisateur
async function getTherapistIdByUserId(userId) {
  const query = `SELECT * FROM therapist WHERE user_id = ?`;
  try {
    const con = await createConnection();
    const [rows] = await con.query(query, [userId]);
    await con.end();
    return rows[0]; // ou null si pas trouvé
  } catch (err) {
    throw err;
  }
}

// Valider un thérapeute
async function validateTherapist(id, is_validated) {
  const query = `UPDATE therapist SET is_validated = ? WHERE user_id = ?`;
  const values = [is_validated, id];
  const con = await createConnection();
  await con.execute(query, values);
  await con.end();
}

// Valider un patient
async function validatePatient(id, is_accepted) {
  const query = `UPDATE patient SET is_accepted = ? WHERE user_id = ?`;
  const values = [is_accepted, id];
  const con = await createConnection();
  await con.execute(query, values);
  await con.end();
}

// Créer un paiement utilisateur
async function createUserPayment(payment){
  const {userId, phone, line1, line2, city, zipcode} = payment
  const query = `
    INSERT INTO billing (user_id, phone, line1, line2, city, zipcode)
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  const values = [userId, phone, line1, line2, city, zipcode];

  try {
    const con = await createConnection();
    const [result] = await con.execute(query, values);
    await con.end();
    return result;
  } catch (err) {
    console.error("Erreur lors de l'insertion du paiement :", err);
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

// Créer une nouvelle catégorie
async function createCategory(name, description, therapistId, image, is_free, difficulty) {
  const query = `
    INSERT INTO category (name, description, image, created_by, is_free, difficulty)
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  const values = [name, description, image, therapistId, is_free, difficulty];

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

// Valider une carte
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

// Récupérer tous les thérapeutes validés
async function getAllTherapists() {
  const query = `
    SELECT therapist.id, CONCAT(users.firstname, ' ', users.lastname) AS name
    FROM therapist
    JOIN users ON users.id = therapist.user_id
    WHERE therapist.is_validated = 1
  `;

  try {
    const con = await createConnection();
    const [rows] = await con.query(query);
    await con.end();
    return rows;
  }
  catch (err) {
    console.error("Erreur lors de la récupération des therapeutes :", err);
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

// Fonction pour récupérer un utilisateur par son email
async function getUserByEmail(email) {
  const con = await createConnection();
  const [rows] = await con.query('SELECT * FROM users WHERE mail = ?', [email]);
  await con.end();
  return rows[0];
}

// Fonction pour sauvegarder un token de réinitialisation de mot de passe
async function saveResetToken(userId, token, expires) {
  const con = await createConnection();
  await con.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, userId]);
  await con.end();
}

// Fonction pour récupérer un utilisateur par son token de réinitialisation
async function getUserByResetToken(token) {
  const con = await createConnection();
  const [rows] = await con.query('SELECT * FROM users WHERE reset_token = ?', [token]);
  await con.end();
  return rows[0];
}

// Fonction pour mettre à jour le mot de passe d'un utilisateur
async function updateUserPassword(userId, password) {
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(password, 10);
  const con = await createConnection();
  await con.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
  await con.end();
}

// Fonction pour supprimer le token de réinitialisation après utilisation
async function clearResetToken(userId) {
  const con = await createConnection();
  await con.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [userId]);
  await con.end();
}

module.exports = {
  getCompletedSeriesCount,
  getTotalExercisesDone,

  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getUsersNumber,
  getUsersEvolution,
  getUserById,   
  getAllUsers,
  getTherapistIdByUserId,
  isPremium,
  createUserPayment,
  getCategoriesOrderedForUser,
  getCardValidationStatusForUser,
  getUserCategoryProgress,
  cardValidated,
  getPatientByUserId,
  updatePatient,
  updatePatientTherapist,
  getAllTherapists,
  getPatientTherapist,
  validateTherapist,
  validatePatient,

  getAllCategories,
  getCardsNotInCategory,
  addCardsToCategory,
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
  
  getUserByEmail,
  saveResetToken,
  getUserByResetToken,
  updateUserPassword,
  clearResetToken
};