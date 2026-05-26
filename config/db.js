const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// A pool is safer in production because dropped idle connections are replaced
// instead of leaving the app with one permanently closed connection.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "parking",
  password: process.env.DB_PASSWORD || "Nandan@123",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

module.exports = pool;
