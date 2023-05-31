require('dotenv').config({ path: `.env.local`, override: true });
const express = require('express');

// Import routes
const userRoutes = require('./routes/userRoutes');
const backendRoutes = require('./routes/backendRoutes');

// Create express app
const app = express();

// Use routes
app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use('/Documentation', express.static('Documentation'));
app.use('/', userRoutes);
app.use('/backend', backendRoutes);


// Start server
app.listen(3000, () => {
console.log('Server started on port 3000');
});