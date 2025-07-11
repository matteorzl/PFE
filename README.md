🎵 SoundSwipes – Monorepo
Projet musical fullstack comprenant :

💻 Un frontend en Next.js

🔌 Une API en Express.js

📱 Une application mobile React Native (Expo)

🚀 Prérequis
Node.js ≥ 18.x

npm ≥ 9.x

(Recommandé) Yarn ou pnpm pour la gestion des dépendances monorepo

Expo CLI :

npm install -g expo-cli

🧩 Installation
1. Cloner le dépôt

git clone https://github.com/matteorzl/PFE.git
cd PFE

2. Installer les dépendances

# À la racine du monorepo
npm install

# Pour l'application mobile
cd mobileApp
npm install

3. Configuration de l'environnement
🌐 Mobile (React Native)
Créer un fichier .env dans PFE/mobileApp/ :

API_IP=ton.ip.locale
Remplace ton.ip.locale par l’adresse IP locale de ta machine (ex. 192.168.1.42)

🗄️ Backend (Express / MySQL)
Crée une base de données nommée SoundSwipes via phpMyAdmin ou un autre outil MySQL.

Importe le fichier SQL :

PFE/db/soundswipes.sql
Vérifie la configuration dans PFE/db/db.config.js (utilisateur, mot de passe, nom de la DB, etc.).

Lance le script de seed :

node PFE/db/seed.js

▶️ Lancement du projet

1. Frontend – Next.js

cd PFE
npm run dev

2. Backend/API – Express.js

cd PFE
npm run api

3. Application Mobile – Expo

cd PFE/mobileApp
npm run start

Télécharge l’application Expo Go sur ton smartphone.

Scanne le QR code affiché dans le terminal ou sur le navigateur pour lancer l’app.


📁 Structure du projet

PFE/
├── api/             # Backend Express.js
├── db/              # Base de données, config et seed
├── mobileApp/       # Application React Native (Expo)
├── .env             # (optionnel)
└── package.json

