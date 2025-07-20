const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./db.config');

const users = [
  {
    firstname: 'Alice',
    lastname: 'Moreau',
    password: '...',
    role: 'patient',
    mail: 'alice.moreau@email.com',
    country: 'France',
    city: 'Nantes',
    created_at: new Date('2024-07-01')
  },
  {
    firstname: 'Thomas',
    lastname: 'Leroy',
    password: '...',
    role: 'therapist',
    mail: 'thomas.leroy@email.com',
    country: 'France',
    city: 'Lille',
    created_at: new Date('2024-07-01')
  },
  {
    firstname: 'Claire',
    lastname: 'Fabre',
    password: '...',
    role: 'patient',
    mail: 'claire.fabre@email.com',
    country: 'France',
    city: 'Rennes',
    created_at: new Date('2024-07-02')
  },
  {
    firstname: 'Hugo',
    lastname: 'Laurent',
    password: '...',
    role: 'therapist',
    mail: 'hugo.laurent@email.com',
    country: 'France',
    city: 'Nice',
    created_at: new Date('2024-07-03')
  }
];

const categories = [
  { name: 'Animaux', description: "Sons d'animaux", image: 'animals.jpg', created_by: 1, is_free: 1, difficulty: 'FACILE', order_list: 1 },
  { name: 'Transport', description: 'Sons de véhicules', image: 'transport.jpg', created_by: 1, is_free: 1, difficulty: 'MOYEN', order_list: 2 },
  { name: 'Nature', description: 'Sons de la nature', image: 'nature.jpeg', created_by: 2, is_free: 1, difficulty: 'DIFFICILE', order_list: 3 },
  { name: 'Musique', description: 'Instruments de musique', image: 'music.jpg', created_by: 2, is_free: 0, difficulty: 'FACILE', order_list: 4 }
];

const cards = [
  {
    name: 'Chat',
    order_list: 1,
    is_validated: 1,
    created_by: 1,
    sound_file: 'cat.mp3',
    draw_animation: 'cat.jpg',
    real_animation: 'cat.gif'
  },
  {
    name: 'Chien',
    order_list: 2,
    is_validated: 1,
    created_by: 1,
    sound_file: 'dog.mp3',
    draw_animation: 'dog.jpg',
    real_animation: 'dog.gif'
  },
  {
    name: 'Voiture',
    order_list: 1,
    is_validated: 1,
    created_by: 1,
    sound_file: 'car.mp3',
    draw_animation: 'car.jpg',
    real_animation: 'car.gif'
  },
  {
    name: 'Train',
    order_list: 2,
    is_validated: 1,
    created_by: 1,
    sound_file: 'train.mp3',
    draw_animation: 'train.jpeg',
    real_animation: 'train.gif'
  },
  {
    name: 'Pluie',
    order_list: 1,
    is_validated: 1,
    created_by: 2,
    sound_file: 'rain.mp3',
    draw_animation: 'rain.jpeg',
    real_animation: 'rain.gif'
  },
  {
    name: 'Vent',
    order_list: 2,
    is_validated: 1,
    created_by: 2,
    sound_file: 'wind.mp3',
    draw_animation: 'wind.jpg',
    real_animation: 'wind.gif'
  },
  {
    name: 'Piano',
    order_list: 1,
    is_validated: 1,
    created_by: 2,
    sound_file: 'piano.mp3',
    draw_animation: 'piano.JPG',
    real_animation: 'piano.gif'
  },
  {
    name: 'Guitare',
    order_list: 2,
    is_validated: 1,
    created_by: 2,
    sound_file: 'guitar.mp3',
    draw_animation: 'guitar.webp',
    real_animation: 'guitar.gif'
  }
];

const cardCategoryLinks = [
  { cardIndex: 0, categoryIndex: 0 },
  { cardIndex: 1, categoryIndex: 0 },
  { cardIndex: 2, categoryIndex: 1 },
  { cardIndex: 3, categoryIndex: 1 },
  { cardIndex: 4, categoryIndex: 2 },
  { cardIndex: 5, categoryIndex: 2 },
  { cardIndex: 6, categoryIndex: 3 },
  { cardIndex: 7, categoryIndex: 3 }
];

const therapistCategoryLinks = [
  { therapistIndex: 0, categoryIndex: 0 },
  { therapistIndex: 0, categoryIndex: 1 },
  { therapistIndex: 1, categoryIndex: 2 },
  { therapistIndex: 1, categoryIndex: 3 }
];

const patientCategoryLinks = [
  { patientIndex: 0, categoryIndex: 0 },
  { patientIndex: 0, categoryIndex: 2 },
  { patientIndex: 1, categoryIndex: 1 },
  { patientIndex: 1, categoryIndex: 3 }
];

async function main() {
  const conn = await mysql.createConnection({
    host: config.host,
    database: config.database,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  // Désactiver les contraintes de clés étrangères
  await conn.query('SET FOREIGN_KEY_CHECKS=0');

  // Vider les tables concernées (optionnel, à commenter si tu veux garder les données)
  await conn.query('DELETE FROM card_category');
  await conn.query('DELETE FROM patient_category');
  await conn.query('DELETE FROM therapist_category');
  await conn.query('DELETE FROM card');
  await conn.query('DELETE FROM category');
  await conn.query('DELETE FROM therapist');
  await conn.query('DELETE FROM patient');
  await conn.query('DELETE FROM users');

  // Insertion des utilisateurs
  const userIds = [];
  for (const user of users) {
    const [result] = await conn.execute(
      `INSERT INTO users (firstname, lastname, password, role, mail, country, city, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.firstname, user.lastname, user.password, user.role, user.mail, user.country, user.city, user.created_at]
    );
    userIds.push(result.insertId);
  }

  // Insertion des patients et thérapeutes
  const patientIds = [];
  const therapistIds = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === 'patient') {
      const [result] = await conn.execute(
        `INSERT INTO patient (user_id) VALUES (?)`,
        [userIds[i]]
      );
      patientIds.push(result.insertId);
    } else if (users[i].role === 'therapist') {
      const [result] = await conn.execute(
        `INSERT INTO therapist (user_id) VALUES (?)`,
        [userIds[i]]
      );
      therapistIds.push(result.insertId);
    }
  }

  // Mise à jour des liens thérapeutes-patients
  // patient 1 -> therapist 1, patient 2 -> therapist 2
  await conn.execute(
    `UPDATE patient SET therapist_id = ? WHERE id = ?`,
    [therapistIds[0], patientIds[0]]
  );
  await conn.execute(
    `UPDATE patient SET therapist_id = ? WHERE id = ?`,
    [therapistIds[1], patientIds[1]]
  );

  // Insertion des catégories
  const categoryIds = [];
  for (const [i, cat] of categories.entries()) {
    // created_by = 1 ou 2 (user index), il faut retrouver le bon id utilisateur
    const createdByUserId = userIds[cat.created_by - 1];

    // Ajout : lecture du buffer image selon le nom de fichier
    let imageBuffer = null;
    if (cat.image) {
      const imagePath = path.join(__dirname, 'seeder', 'image', cat.image);
      if (fs.existsSync(imagePath)) {
        imageBuffer = fs.readFileSync(imagePath);
      }
    }

    const [result] = await conn.execute(
      `INSERT INTO category (name, description, image, created_by, is_free, difficulty, order_list)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cat.name, cat.description, imageBuffer, createdByUserId, cat.is_free, cat.difficulty, cat.order_list]
    );
    categoryIds.push(result.insertId);
  }

  // Association thérapeutes-catégories
  for (const link of therapistCategoryLinks) {
    await conn.execute(
      `INSERT INTO therapist_category (therapist_id, category_id) VALUES (?, ?)`,
      [therapistIds[link.therapistIndex], categoryIds[link.categoryIndex]]
    );
  }

  // Association patients-catégories
  for (const link of patientCategoryLinks) {
    await conn.execute(
      `INSERT INTO patient_category (patient_id, category_id) VALUES (?, ?)`,
      [patientIds[link.patientIndex], categoryIds[link.categoryIndex]]
    );
  }

  // Insertion des cartes
  // created_by = 1 ou 2 (user index), il faut retrouver le bon id thérapeute
  // On fait la correspondance : userIds -> therapistIds
  // On suppose que created_by dans cards = 1 => therapistIds[0], 2 => therapistIds[1]
  const cardIds = [];
  for (const card of cards) {
    const soundPath = path.join(__dirname, 'seeder', 'audio', card.sound_file);
    const drawPath = path.join(__dirname, 'seeder', 'image', card.draw_animation);
    const realPath = path.join(__dirname, 'seeder', 'image', card.real_animation);

    const soundBuffer = fs.existsSync(soundPath) ? fs.readFileSync(soundPath) : null;
    const drawBuffer = fs.existsSync(drawPath) ? fs.readFileSync(drawPath) : null;
    const realBuffer = fs.existsSync(realPath) ? fs.readFileSync(realPath) : null;

    // created_by = 1 ou 2 (user index), donc therapistIds[created_by-1]
    const therapistIndex = card.created_by - 1;
    const createdByTherapistId = therapistIds[therapistIndex];

    const [result] = await conn.execute(
      `INSERT INTO card (name, order_list, is_validated, created_by, sound_file, draw_animation, real_animation)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        card.name,
        card.order_list,
        card.is_validated,
        createdByTherapistId,
        soundBuffer,
        drawBuffer,
        realBuffer
      ]
    );
    cardIds.push(result.insertId);
    console.log(`Carte "${card.name}" insérée avec id ${result.insertId}.`);
  }

  // Association cartes-catégories
  for (const link of cardCategoryLinks) {
    await conn.execute(
      `INSERT INTO card_category (card_id, category_id) VALUES (?, ?)`,
      [cardIds[link.cardIndex], categoryIds[link.categoryIndex]]
    );
  }

  // Remplissage automatique de patient_card :
  // Pour chaque patient, pour chaque catégorie associée, pour chaque carte de la catégorie, on insère patient_card
  for (const link of patientCategoryLinks) {
    const patientId = patientIds[link.patientIndex];
    const categoryId = categoryIds[link.categoryIndex];
    // Trouver toutes les cartes de cette catégorie
    const [catCardsRows] = await conn.query(
      `SELECT card_id FROM card_category WHERE category_id = ?`,
      [categoryId]
    );
    for (const row of catCardsRows) {
      // On récupère l'index de la carte dans cardIds pour retrouver is_validated du seeder
      const cardIndex = cardIds.findIndex(id => id === row.card_id);
      const isValidated = cardIndex !== -1 ? cards[cardIndex].is_validated : 0;
      await conn.execute(
        `INSERT INTO patient_card (patient_id, card_id, category_id, is_validated) VALUES (?, ?, ?, ?)`,
        [patientId, row.card_id, categoryId, isValidated]
      );
    }
  }

  // Réactiver les contraintes de clés étrangères
  await conn.query('SET FOREIGN_KEY_CHECKS=1');

  await conn.end();
  console.log('Terminé !');
}

main().catch(console.error);