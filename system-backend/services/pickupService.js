const reservationModel = require('../models/reservationModel');
const pickupModel = require('../models/pickupModel');

const fail = (status, message) => Object.assign(new Error(message), { status });

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
// Status can only move forward
const NEXT = { scheduled: ['prepared', 'released'], prepared: ['released'], released: [] };

exports.get = async (reservationId) => {
  const pickup = await pickupModel.findByReservation(reservationId);
  if (!pickup) throw fail(404, 'No pickup schedule for this reservation yet');
  return pickup;
};

// 1.2.1 Schedule facility pickup (admin). Creates the schedule, or updates it if one already exists.
exports.setSchedule = async (reservationId, body = {}) => {
  const { pickup_date, pickup_time } = body;
  if (!pickup_date || !pickup_time) throw fail(400, 'Missing: pickup_date, pickup_time');
  if (!DATE.test(pickup_date) || Number.isNaN(Date.parse(pickup_date))) throw fail(400, 'pickup_date must be YYYY-MM-DD');
  if (!TIME.test(pickup_time)) throw fail(400, 'pickup_time must be HH:MM (24h)');

  const reservation = await reservationModel.findRaw(reservationId);
  if (!reservation) throw fail(404, 'Reservation not found');
  if (reservation.status !== 'approved') throw fail(400, 'Only approved reservations can have a pickup schedule');
  if (pickup_date > reservation.date) throw fail(400, 'pickup_date cannot be later than the reservation date');

  const existing = await pickupModel.findByReservation(reservationId);
  if (!existing) {
    await pickupModel.create(reservationId, { pickup_date, pickup_time });
  } else {
    if (existing.status === 'released') throw fail(400, 'Facility was already released; the schedule can no longer be changed');
    await pickupModel.updateSchedule(reservationId, { pickup_date, pickup_time });
  }
  return pickupModel.findByReservation(reservationId);
};

// 1.2.1 Update pickup status: scheduled -> prepared -> released (admin)
exports.updateStatus = async (reservationId, body = {}) => {
  const { status, remarks } = body;
  if (!['prepared', 'released'].includes(status)) throw fail(400, "status must be 'prepared' or 'released'");

  const pickup = await pickupModel.findByReservation(reservationId);
  if (!pickup) throw fail(404, 'No pickup schedule for this reservation yet');
  if (!NEXT[pickup.status].includes(status)) throw fail(400, `Cannot change status from ${pickup.status} to ${status}`);

  await pickupModel.updateStatus(reservationId, status, String(remarks ?? '').trim() || pickup.remarks);
  return pickupModel.findByReservation(reservationId);
};
