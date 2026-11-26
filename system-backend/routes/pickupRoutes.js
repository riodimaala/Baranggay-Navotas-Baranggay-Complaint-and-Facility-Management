const router = require('express').Router();
const controller = require('../controllers/pickupController');

router.get('/reservations/:id/pickup', controller.get);
router.put('/reservations/:id/pickup', controller.setSchedule);            // 1.2.1 set / update pickup schedule
router.patch('/reservations/:id/pickup/status', controller.updateStatus);  // 1.2.1 prepared / released

module.exports = router;
