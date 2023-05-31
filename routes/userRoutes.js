const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const twig = require('twig');

router.get('/', userController.index, (req, res) => {
// Render the Twig view
res.render('../views/index.html.twig', { name: 'John Doe' });
});

module.exports = router;