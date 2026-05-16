const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Database connection used by the whole app.
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "parking",
  password: process.env.DB_PASSWORD || "Nandan@123"
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }
  console.log("MySQL connected successfully");
});

module.exports = connection.promise();
