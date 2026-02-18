const express = require('express');
const router = express.Router();
const {
    getClients,
    createClient,
    updateClient,
    deleteClient,
} = require('../controllers/clientController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getClients).post(protect, admin, createClient);
router
    .route('/:id')
    .put(protect, admin, updateClient)
    .delete(protect, admin, deleteClient);

module.exports = router;
