const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/predictionController');

router.post('/predict/:id', ctrl.predictCustomer);
router.get('/predictions', ctrl.getAllPredictions);
router.get('/predictions/:id', ctrl.getCustomerPrediction);

module.exports = router;
