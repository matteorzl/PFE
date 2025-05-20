-- Désactiver temporairement les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS=0;

-- Insertion des utilisateurs
INSERT INTO users (firstname, lastname, password, role, mail, country, city) VALUES 
('Jean', 'Dupont', '$2b$10$ABC123', 'patient', 'jean.dupont@email.com', 'France', 'Paris'),
('Marie', 'Martin', '$2b$10$DEF456', 'therapist', 'marie.martin@email.com', 'France', 'Lyon'),
('Pierre', 'Bernard', '$2b$10$GHI789', 'therapist', 'pierre.bernard@email.com', 'France', 'Marseille'),
('Sophie', 'Petit', '$2b$10$JKL012', 'patient', 'sophie.petit@email.com', 'France', 'Bordeaux');

-- Insertion des patients (role 0)
INSERT INTO patient (user_id) 
SELECT id FROM users WHERE role = 'patient';

-- Insertion des thérapeutes (role 1)
INSERT INTO therapist (user_id) 
SELECT id FROM users WHERE role = 'therapist';

-- Mise à jour des liens thérapeutes-patients
UPDATE patient p
JOIN (SELECT id FROM therapist LIMIT 1) t1 ON 1=1
SET p.therapist_id = p1.id
WHERE p.id = 1;

UPDATE patient p
JOIN (SELECT id FROM therapist WHERE id != (SELECT therapist_id FROM patient WHERE id = 1) LIMIT 1) t2 ON 1=1
SET p.therapist_id = p2.id
WHERE p.id = 2;

-- Insertion des catégories (maintenant avec AUTO_INCREMENT)
INSERT INTO category (name, description, image, created_by) VALUES 
('Animaux', 'Sons d''animaux', 'animals.jpg', 1),
('Transport', 'Sons de véhicules', 'transport.jpg', 1),
('Nature', 'Sons de la nature', 'nature.jpg', 2),
('Musique', 'Instruments de musique', 'music.jpg', 2);

-- Association thérapeutes-catégories (après création des catégories)
INSERT INTO therapist_category (therapist_id, category_id) VALUES
(1, 1), (1, 2), (2, 3), (2, 4);

-- Association patients-catégories
INSERT INTO patient_category (patient_id, category_id) VALUES
(1, 1), (1, 3), (2, 2), (2, 4);

-- Insertion des cartes
INSERT INTO card (name, category_id, order_list, is_validated, created_by) VALUES
('Chat', 1, 1, 1, 1),
('Chien', 1, 2, 1, 1),
('Voiture', 2, 1, 1, 1),
('Train', 2, 2, 1, 1),
('Pluie', 3, 1, 1, 2),
('Vent', 3, 2, 1, 2),
('Piano', 4, 1, 1, 2),
('Guitare', 4, 2, 1, 2);

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS=1;