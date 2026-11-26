const db = require('../config/db');

const SELECT = `SELECT r.id, r.resident_name, r.contact_number, r.facility_id, f.name AS facility_name,
    r.reservation_date AS date, TIME_FORMAT(r.start_time,'%H:%i') AS start_time,
    TIME_FORMAT(r.end_time,'%H:%i') AS end_time, r.purpose, r.status, r.admin_remarks, r.created_at,
    p.pickup_date, TIME_FORMAT(p.pickup_time,'%H:%i') AS pickup_time,
    p.status AS pickup_status, p.remarks AS pickup_remarks
  FROM reservations r
  JOIN facilities f ON f.id = r.facility_id
  LEFT JOIN pickups p ON p.reservation_id = r.id`;

exports.listFacilities = async () => (await db.query('SELECT id, name, description FROM facilities ORDER BY name'))[0];

exports.facilityExists = async (id) => (await db.query('SELECT 1 FROM facilities WHERE id=?', [id]))[0].length > 0;

exports.create = async (d) => {
  const [r] = await db.query(
    `INSERT INTO reservations (resident_name,contact_number,facility_id,reservation_date,start_time,end_time,purpose)
     VALUES (?,?,?,?,?,?,?)`,
    [d.resident_name, d.contact_number, d.facility_id, d.date, d.start_time, d.end_time, d.purpose]
  );
  return r.insertId;
};

exports.findById = async (id) => (await db.query(`${SELECT} WHERE r.id=?`, [id]))[0][0];

// Plain row (no joins): used for checks such as "is it approved?"
exports.findRaw = async (id) =>
  (await db.query('SELECT id, status, reservation_date AS date FROM reservations WHERE id=?', [id]))[0][0];

// Optional filters: status, contact_number
exports.findAll = async ({ status, contact_number } = {}) => {
  const where = [];
  const args = [];
  if (status) { where.push('r.status=?'); args.push(status); }
  if (contact_number) { where.push('r.contact_number=?'); args.push(contact_number); }
  const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY r.id DESC`;
  return (await db.query(sql, args))[0];
};

// Same facility and date, overlapping time, against approved reservations only
exports.findConflict = async (facilityId, date, start, end) =>
  (await db.query(
    `SELECT id FROM reservations
     WHERE facility_id=? AND reservation_date=? AND status='approved' AND start_time<? AND end_time>? LIMIT 1`,
    [facilityId, date, end, start]
  ))[0][0];
