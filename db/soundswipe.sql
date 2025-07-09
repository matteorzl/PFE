-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 30 avr. 2025 à 20:17
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `soundswipe`
--

-- --------------------------------------------------------

--
-- Structure de la table `card`
--

CREATE TABLE `card` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `order_list` int(11) DEFAULT NULL,
  `sound_file` longblob DEFAULT NULL,
  `draw_animation` longblob DEFAULT NULL,
  `real_animation` longblob DEFAULT NULL,
  `is_validated` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `order_list` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `image` longblob DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_free` tinyint(1) DEFAULT NULL,
  `difficulty` ENUM('FACILE', 'MOYEN', 'DIFFICILE') DEFAULT NULL,
  `followed` int(11) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `card_category`
--

CREATE TABLE `card_category` (
  `card_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Structure de la table `patient`
--

CREATE TABLE `patient` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `therapist_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `parent_lastname` varchar(20) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `patient_category`
--

CREATE TABLE `patient_category` (
  `patient_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `patient_category`
--
CREATE TABLE `patient_card` (
  `patient_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `is_validated` int(11) DEFAULT 0,
  `validated_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `therapist`
--

CREATE TABLE `therapist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `professional_number` varchar(11) DEFAULT NULL,
  `indentification_type` ENUM('ADELI', 'RPPS') DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `therapist_category`
--

CREATE TABLE `therapist_category` (
  `therapist_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `BILLING`
--

CREATE TABLE `billing` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `street` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zipcode` varchar(100) DEFAULT NULL,
  `line1` varchar(100) DEFAULT NULL,
  `line2` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`id`),
  ADD KEY `card_therapist_FK` (`created_by`);

--
-- Index pour la table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_therapist_FK` (`created_by`);

--
-- Index pour la table `card_category`
--
ALTER TABLE `card_category`
  ADD KEY `card_category_card_FK` (`card_id`),
  ADD KEY `card_category_category_FK` (`category_id`);

--
-- Index pour la table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_Users_FK` (`user_id`),
  ADD KEY `therapist_patient_FK` (`therapist_id`);

--
-- Index pour la table `patient_category`
--
ALTER TABLE `patient_category`
  ADD KEY `patient_category_patient_FK` (`patient_id`),
  ADD KEY `patient_category_category_FK` (`category_id`);

--
-- Index pour la table `patient_category`
--
ALTER TABLE `patient_card`
  ADD KEY `patient_card_patient_FK` (`patient_id`),
  ADD KEY `patient_card_card_FK` (`card_id`),
  ADD KEY `patient_card_category_FK` (`category_id`);

--
-- Index pour la table `therapist`
--
ALTER TABLE `therapist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `therapist_Users_FK` (`user_id`);

--
-- Index pour la table `therapist_category`
--
ALTER TABLE `therapist_category`
  ADD KEY `therapist_category_category_FK` (`category_id`),
  ADD KEY `therapist_category_therapist_FK` (`therapist_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `card`
--
ALTER TABLE `card`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `patient`
--
ALTER TABLE `patient`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `therapist`
--
ALTER TABLE `therapist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `card_therapist_FK` FOREIGN KEY (`created_by`) REFERENCES `therapist` (`id`);

--
-- Contraintes pour la table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `category_therapist_FK` FOREIGN KEY (`created_by`) REFERENCES `therapist` (`id`);

--
-- Contraintes pour la table `card_category`
--
ALTER TABLE `card_category`
  ADD CONSTRAINT `card_category_category_FK` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `card_category_card_FK` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`);

--
-- Contraintes pour la table `patient`
--
ALTER TABLE `patient`
  ADD CONSTRAINT `patient_Users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `patient_Therapist_FK` FOREIGN KEY (`therapist_id`) REFERENCES `therapist` (`id`);

--
-- Contraintes pour la table `patient_category`
--
ALTER TABLE `patient_category`
  ADD CONSTRAINT `patient_category_category_FK` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `patient_category_patient_FK` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`);

--
-- Contraintes pour la table `therapist`
--
ALTER TABLE `therapist`
  ADD CONSTRAINT `therapist_Users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `billing`
--
ALTER TABLE `billing`
  ADD CONSTRAINT `billing_user_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
--
-- Contraintes pour la table `patient_card`
--
ALTER TABLE `patient_card`
  ADD CONSTRAINT `patient_card_card_FK` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`),
  ADD CONSTRAINT 'patient_card_category_FR' FOREIGN KEY (`category_id`) REFERENCES `category`(`id`),
  ADD CONSTRAINT `patient_card_patient_FK` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`);

--
-- Contraintes pour la table `therapist_category`
--
ALTER TABLE `therapist_category`
  ADD CONSTRAINT `therapist_category_category_FK` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `therapist_category_therapist_FK` FOREIGN KEY (`therapist_id`) REFERENCES `therapist` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
