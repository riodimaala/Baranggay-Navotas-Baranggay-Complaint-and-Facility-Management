const router = require('express').Router();
const controller = require('../controllers/reservationController');

router.get('/facilities', controller.listFacilities);   // for the form's dropdown
router.post('/reservations', controller.submit);        // 1.1.1 Submit reservation request
router.get('/reservations', controller.list);           // view requests and their status

module.exports = router;
