-- FOR TESTING ONLY. Not part of the real data.
-- Adds 3 pending reservation requests from the demo resident (juan@email.com) so the admin has something to approve.
-- Run it once in phpMyAdmin (SQL tab) after importing schema.sql.
USE baranggay_db;

INSERT INTO reservations (user_id, facility_id, resident_name, contact_number, date, start_time, end_time, purpose, status) VALUES
  (5, 'court',  'Juan Dela Cruz', '09171234567', CURDATE() + INTERVAL 14 DAY, '18:00', '21:00', 'Basketball league night', 'Pending'),
  (5, 'tables', 'Juan Dela Cruz', '09171234567', CURDATE() + INTERVAL 10 DAY, '08:00', '17:00', 'Birthday party at home', 'Pending'),
  (5, 'sound',  'Juan Dela Cruz', '09171234567', CURDATE() + INTERVAL 21 DAY, '09:00', '12:00', 'Barangay program', 'Pending');
