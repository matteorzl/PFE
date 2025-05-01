const mysql = require('mysql2/promise');
const config = require('./db.config');

async function createConnection() {
  try {
    const con = await mysql.createConnection({
      host: config.host,
      database: config.database,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log("Connecté à la base de données !");
    return con;
  } catch (err) {
    console.error("Erreur de connexion à la base de données :", err);
    throw err;
  }
}

module.exports = createConnection;