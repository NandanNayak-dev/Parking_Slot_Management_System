DROP DATABASE IF EXISTS parking;
CREATE DATABASE parking;
USE parking;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS parking_areas;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  mobile_no VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  parking_location VARCHAR(100) NOT NULL
);

CREATE TABLE vehicles (
  vehicle_reg_no VARCHAR(20) PRIMARY KEY,
  vehicle_make VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_type ENUM('Bike', 'Car', 'Truck') NOT NULL,
  customer_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_customer
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    ON DELETE CASCADE
);

CREATE TABLE parking_areas (
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
);

CREATE TABLE bookings (
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
);

CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_customer
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    ON DELETE CASCADE
);

CREATE TABLE receipts (
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
);

-- Default admin password for all locations: password
INSERT INTO admins (admin_name, email, password, parking_location) VALUES
('City Center Admin', 'city.admin@parking.com', '$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.', 'City Center Parking - Udupi'),
('Manipal Admin', 'manipal.admin@parking.com', '$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.', 'Manipal Parking Hub - Manipal'),
('Krishna Mall Admin', 'krishna.admin@parking.com', '$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.', 'Krishna Mall Parking - Udupi'),
('Mangalore Central Admin', 'mangalore.admin@parking.com', '$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.', 'Mangalore Central Parking - Mangalore'),
('Malpe Beach Admin', 'malpe.admin@parking.com', '$2b$10$6VewYtDM3jothiLIGgB9SONJPo3N63KnNTQvbRdMceQK34FmwxWo.', 'Malpe Beach Parking - Malpe');

INSERT INTO parking_areas (area_name, total_slots, remaining_slots, slot_status, admin_id) VALUES
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('City Center Parking - Udupi', 10, 10, 'available', 1),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Manipal Parking Hub - Manipal', 10, 10, 'available', 2),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Krishna Mall Parking - Udupi', 10, 10, 'available', 3),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Mangalore Central Parking - Mangalore', 10, 10, 'available', 4),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5),
('Malpe Beach Parking - Malpe', 10, 10, 'available', 5);
