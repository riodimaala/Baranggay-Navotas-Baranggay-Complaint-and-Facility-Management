const db = require('../config/db');

const SELECT = `SELECT id, reservation_id, pickup_date, TIME_FORMAT(pickup_time,'%H:%i') AS pickup_time,
  status, remarks, created_at, updated_at FROM pickups`;

exports.findByReservation = async (reservationId) =>
  (await db.query(`${SELECT} WHERE reservation_id=?`, [reservationId]))[0][0];

exports.create = (reservationId, d) =>
  db.query('INSERT INTO pickups (reservation_id,pickup_date,pickup_time) VALUES (?,?,?)',
    [reservationId, d.pickup_date, d.pickup_time]);

exports.updateSchedule = (reservationId, d) =>
  db.query('UPDATE pickups SET pickup_date=?, pickup_time=? WHERE reservation_id=?',
    [d.pickup_date, d.pickup_time, reservationId]);

exports.updateStatus = (reservationId, status, remarks) =>
  db.query('UPDATE pickups SET status=?, remarks=? WHERE reservation_id=?', [status, remarks, reservationId]);
