-- Désactiver temporairement les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS=0;

-- hugopro! , claire789, thera456, alice123
-- Insertion des utilisateurs
INSERT INTO users (firstname, lastname, password, role, mail, country, city) VALUES 
('Alice', 'Moreau', '$2b$10$4jwRZKnN9B5Dv2avhHftbeVSTk/Dp9YZKjdz3Mv1jPE/yrLZuKRzK', 'patient', 'alice.moreau@email.com', 'France', 'Nantes'),
('Thomas', 'Leroy', '$2b$10$6UkneROx.5fF3qQezDByROJ0zNj7vNDaUuI1EqQ56LrUaeVj5BBLO', 'therapist', 'thomas.leroy@email.com', 'France', 'Lille'),
('Claire', 'Fabre', '$2b$10$e4Q9PD5LeHM2hWnZCEr50OTU9/22uSbNc7PMFFs8a8W2Z6TAmTT6K', 'patient', 'claire.fabre@email.com', 'France', 'Rennes'),
('Hugo', 'Laurent', '$2b$10$2f81EnqN3D1fwr/IRa7yVu0nKYK7VD6zJNRKBD30PFAodCz.QieVK', 'therapist', 'hugo.laurent@email.com', 'France', 'Nice');

-- Insertion des patients (role 0)
INSERT INTO patient (user_id) 
SELECT id FROM users WHERE role = 'patient';

-- Insertion des thérapeutes (role 1)
INSERT INTO therapist (user_id) 
SELECT id FROM users WHERE role = 'therapist';

-- Mise à jour des liens thérapeutes-patients
UPDATE patient p
JOIN (SELECT id FROM therapist WHERE id = 1) t1 ON 1=1
SET p.therapist_id = t1.id
WHERE p.id = 1;

UPDATE patient p
JOIN (SELECT id FROM therapist WHERE id = 2) t2 ON 1=1
SET p.therapist_id = t2.id
WHERE p.id = 2;

-- Insertion des catégories (maintenant avec AUTO_INCREMENT)
INSERT INTO category (name, description, image, created_by) VALUES 
('Animaux', "Sons d'animaux", 'animals.jpg', 1),
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
INSERT INTO card (name, order_list, is_validated, created_by) VALUES
('Chat', 1, 1, 1),
('Chien', 2, 1, 1),
('Voiture', 1, 1, 1),
('Train', 2, 1, 1),
('Pluie', 1, 1, 2),
('Vent', 2, 1, 2),
('Piano', 1, 1, 2),
('Guitare', 2, 1, 2);

-- Association cartes-catégories
INSERT INTO card_category (card_id, category_id) VALUES
(1, 1), (2, 1), (3, 2), (4, 2), (5, 3), (6, 3), (7, 4), (8, 4);

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS=1;