const model = require('../models/reservationModel');

const fail = (status, message) => Object.assign(new Error(message), { status });

const REQUIRED = ['resident_name', 'contact_number', 'facility_id', 'date', 'start_time', 'end_time', 'purpose'];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

exports.listFacilities = () => model.listFacilities();

// 1.1.1 Submit facility reservation request
exports.submit = async (body = {}) => {
  const missing = REQUIRED.filter((f) => !String(body[f] ?? '').trim());
  if (missing.length) throw fail(400, `Missing: ${missing.join(', ')}`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || Number.isNaN(Date.parse(body.date))) throw fail(400, 'date must be YYYY-MM-DD');
  if (!TIME.test(body.start_time) || !TIME.test(body.end_time)) throw fail(400, 'start_time and end_time must be HH:MM (24h)');
  if (body.start_time >= body.end_time) throw fail(400, 'end_time must be later than start_time');

  if (!(await model.facilityExists(body.facility_id))) throw fail(404, 'Facility not found');
  if (await model.findConflict(body.facility_id, body.date, body.start_time, body.end_time))
    throw fail(409, 'Facility is already reserved for that date and time');

  const id = await model.create({
    ...body,
    resident_name: body.resident_name.trim(),
    contact_number: body.contact_number.trim(),
    purpose: body.purpose.trim(),
  });
  return model.findById(id);
};

exports.list = (query = {}) => model.findAll({ status: query.status, contact_number: query.contact_number });
