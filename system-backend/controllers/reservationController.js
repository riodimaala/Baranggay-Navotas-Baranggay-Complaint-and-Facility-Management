const service = require('../services/reservationService');

exports.listFacilities = async (req, res) => res.json(await service.listFacilities());
exports.submit = async (req, res) => res.status(201).json(await service.submit(req.body));
exports.list = async (req, res) => res.json(await service.list(req.query));
