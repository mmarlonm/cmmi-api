const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const analysisRoutes = require('./routes/analysis.routes');
const processRoutes = require('./routes/process.routes');
const sharepointRoutes = require('./routes/sharepoint.routes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // support large metrics payloads

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/process', processRoutes);
app.use('/api/sharepoint', sharepointRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CMMI5 Versioning API is running smoothly.' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
