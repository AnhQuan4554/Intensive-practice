const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET data sensors
router.get('/data', sensorController.getDataSensor);
// DELETE data sensors
router.delete(
  '/data/delete',
  authMiddleware.verifyToken,
  sensorController.deleteDataSensor
);
// CREATE a ne sensor
router.post('/create', sensorController.createNew);
// GET a sensor info
router.get('/:sensorId', sensorController.getSensor);
// UPDATE a sensor info
router.put('/update', sensorController.updateSensor);
// Get all sensors
router.get('/', sensorController.getAll);

module.exports = router;
