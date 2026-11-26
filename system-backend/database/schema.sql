-- Barangay Complaint and Facility Management
-- Task 1.1.1: Submit facility reservation request
-- Task 1.2.1: Schedule facility pickup and update pickup status
-- Run in phpMyAdmin (Import) or:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS barangay_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barangay_db;

CREATE TABLE IF NOT EXISTS facilities (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  resident_name    VARCHAR(100) NOT NULL,
  contact_number   VARCHAR(20)  NOT NULL,
  facility_id      INT          NOT NULL,
  reservation_date DATE         NOT NULL,
  start_time       TIME         NOT NULL,
  end_time         TIME         NOT NULL,
  purpose          VARCHAR(255) NOT NULL,
  status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_remarks    VARCHAR(255) NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservation_facility FOREIGN KEY (facility_id) REFERENCES facilities(id),
  INDEX idx_schedule (facility_id, reservation_date, status)
);

-- 1.2.1: one pickup schedule per approved reservation
CREATE TABLE IF NOT EXISTS pickups (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT  NOT NULL UNIQUE,
  pickup_date    DATE NOT NULL,
  pickup_time    TIME NOT NULL,
  status         ENUM('scheduled','prepared','released') NOT NULL DEFAULT 'scheduled',
  remarks        VARCHAR(255) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pickup_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- Sample facilities
INSERT IGNORE INTO facilities (name, description) VALUES
  ('Barangay Hall',            'Multi-purpose hall'),
  ('Basketball Court',         'Covered court'),
  ('Monobloc Chairs (50 pcs)', 'Chairs for events'),
  ('Tents',                    'Event tents');
