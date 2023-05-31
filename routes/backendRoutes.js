const express = require('express');
const router = express.Router();
const backendController = require('../controllers/backendController');

// Add middleware function to parse the request body as JSON
router.use(express.json());

// Add GET route for embedding
router.get('/embedding', backendController.getEmbedding);

// Add POST route for processing data
router.post('/', backendController.processData);

module.exports = router;