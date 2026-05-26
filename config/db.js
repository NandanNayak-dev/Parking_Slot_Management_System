const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const dbHost = process.env.DB_HOST || "localhost";
const sslMode = (process.env.DB_SSL || "").toLowerCase();

if (isProduction && ["localhost", "127.0.0.1"].includes(dbHost)) {
  console.warn(
    "DB_HOST is set to localhost in production. Use the hostname from your hosted MySQL provider."
  );
}

const ssl =
  sslMode === "true" || sslMode === "required"
    ? { rejectUnauthorized: true }
    : sslMode === "false" || sslMode === "disabled" || sslMode === ""
      ? undefined
      : { rejectUnauthorized: false };

// A pool is safer in production because dropped idle connections are replaced
// instead of leaving the app with one permanently closed connection.
const pool = mysql.createPool({
  host: dbHost,
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "parking",
  password: process.env.DB_PASSWORD || "Nandan@123",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  ssl
});

module.exports = pool;
