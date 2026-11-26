const service = require('../services/pickupService');

exports.get = async (req, res) => res.json(await service.get(req.params.id));
exports.setSchedule = async (req, res) => res.json(await service.setSchedule(req.params.id, req.body));
exports.updateStatus = async (req, res) => res.json(await service.updateStatus(req.params.id, req.body));

