const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/strategyController');

router.post('/strategy/:id', ctrl.generateStrategy);
router.get('/strategy/:id', ctrl.getStrategy);

module.exports = router;
