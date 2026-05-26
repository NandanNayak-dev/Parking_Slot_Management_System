const mysql = require("mysql2/promise");
const db = require("../config/db");

const dbName = process.env.DB_NAME || "parking";

const admins = [
  ["City Center Admin", "city.admin@parking.com", "City Center Parking - Udupi"],
  ["Manipal Admin", "manipal.admin@parking.com", "Manipal Parking Hub - Manipal"],
  ["Krishna Mall Admin", "krishna.admin@parking.com", "Krishna Mall Parking - Udupi"],
  ["Mangalore Central Admin", "mangalore.admin@parking.com", "Mangalore Central Parking - Mangalore"],
  ["Malpe Beach Admin", "malpe.admin@parking.com", "Malpe Beach Parking - Malpe"]
];

const defaultAdminPasswordHash =
  "$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.";

function getSslConfig() {
  const sslMode = (process.env.DB_SSL || "").toLowerCase();

  if (sslMode === "true" || sslMode === "required") {
    return { rejectUnauthorized: true };
  }

  if (sslMode === "allow-invalid") {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

async function createDatabaseIfAllowed() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Nandan@123",
      port: Number(process.env.DB_PORT) || 3306,
      ssl: getSslConfig()
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, "``")}\``);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createTables() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      mobile_no VARCHAR(15) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      admin_id INT AUTO_INCREMENT PRIMARY KEY,
      admin_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      parking_location VARCHAR(100) NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_reg_no VARCHAR(20) PRIMARY KEY,
      vehicle_make VARCHAR(100) NOT NULL,
      vehicle_model VARCHAR(100) NOT NULL,
      vehicle_type ENUM('Bike', 'Car', 'Truck') NOT NULL,
      customer_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_vehicle_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS parking_areas (
      parking_slot_id INT AUTO_INCREMENT PRIMARY KEY,
      area_name VARCHAR(100) NOT NULL,
      total_slots INT NOT NULL DEFAULT 10,
      remaining_slots INT NOT NULL DEFAULT 10,
      slot_status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
      vehicle_reg_no VARCHAR(20) NULL,
      admin_id INT NOT NULL,
      CONSTRAINT fk_parking_vehicle
        FOREIGN KEY (vehicle_reg_no) REFERENCES vehicles(vehicle_reg_no)
        ON DELETE SET NULL,
      CONSTRAINT fk_parking_admin
        FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      vehicle_reg_no VARCHAR(20) NOT NULL,
      parking_slot_id INT NOT NULL,
      booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      booking_status ENUM('booked', 'entered', 'exited', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
      ticket_number VARCHAR(60) NOT NULL UNIQUE,
      entry_status ENUM('pending', 'entered') NOT NULL DEFAULT 'pending',
      CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE,
      CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehicle_reg_no) REFERENCES vehicles(vehicle_reg_no)
        ON DELETE CASCADE,
      CONSTRAINT fk_booking_slot
        FOREIGN KEY (parking_slot_id) REFERENCES parking_areas(parking_slot_id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
      payment_method VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_transaction_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS receipts (
      receipt_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      booking_id INT NOT NULL,
      transaction_id INT UNIQUE NULL,
      parking_slot_id INT NOT NULL,
      in_time DATETIME NULL,
      exit_time DATETIME NULL,
      duration VARCHAR(50) NULL,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      receipt_type ENUM('entry', 'exit') NOT NULL DEFAULT 'entry',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_receipt_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE,
      CONSTRAINT fk_receipt_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE CASCADE,
      CONSTRAINT fk_receipt_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
        ON DELETE SET NULL,
      CONSTRAINT fk_receipt_slot
        FOREIGN KEY (parking_slot_id) REFERENCES parking_areas(parking_slot_id)
        ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      INDEX idx_sessions_expires_at (expires_at)
    )
  `);
}

async function seedAdmins() {
  for (const [adminName, email, parkingLocation] of admins) {
    await db.execute(
      "INSERT INTO admins (admin_name, email, password, parking_location) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE admin_name = VALUES(admin_name), parking_location = VALUES(parking_location)",
      [adminName, email, defaultAdminPasswordHash, parkingLocation]
    );
  }
}

async function seedParkingSlots() {
  for (const [, email, parkingLocation] of admins) {
    const [[admin]] = await db.execute("SELECT admin_id FROM admins WHERE email = ?", [email]);
    const [[slotCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM parking_areas WHERE area_name = ?",
      [parkingLocation]
    );

    const missingSlots = Math.max(0, 10 - Number(slotCount.total || 0));

    for (let index = 0; index < missingSlots; index += 1) {
      await db.execute(
        "INSERT INTO parking_areas (area_name, total_slots, remaining_slots, slot_status, admin_id) VALUES (?, 10, 10, 'available', ?)",
        [parkingLocation, admin.admin_id]
      );
    }
  }
}

async function ensureDatabaseReady() {
  await createDatabaseIfAllowed();
  await createTables();
  await seedAdmins();
  await seedParkingSlots();
  await db.execute("DELETE FROM sessions WHERE expires_at <= NOW()");
  await db.execute("SELECT 1");
}

module.exports = { ensureDatabaseReady };
