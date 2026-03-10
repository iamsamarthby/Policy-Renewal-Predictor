const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customerController');

router.get('/customers', ctrl.getCustomers);
router.post('/customers', ctrl.createCustomer);
router.get('/customers/search', ctrl.searchCustomers);
router.get('/customers/:id', ctrl.getCustomerById);
router.get('/analytics/kpis', ctrl.getKPIs);
router.get('/analytics/distribution', ctrl.getDistribution);
router.get('/analytics/churn-by-type', ctrl.getChurnByType);
router.get('/analytics/renewal-trend', ctrl.getRenewalTrend);
router.get('/analytics/heatmap', ctrl.getHeatmap);

module.exports = router;
