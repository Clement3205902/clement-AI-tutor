const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import route handlers
const aiTutorRoutes = require('./routes/aiTutor');
const uploadRoutes = require('./routes/upload');
const problemSolverRoutes = require('./routes/problemSolver');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('client'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.use('/api/tutor', aiTutorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/solve', problemSolverRoutes);

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`ME AI Tutor server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});