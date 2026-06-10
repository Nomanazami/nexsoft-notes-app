require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// Connect Database (gracefully switches to file mock DB if connection details are missing or wrong)
connectDB();

// Middleware
app.use(cors({
  origin: 'https://nexsoft-notes-app.vercel.app',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));

// Basic status check route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Notes Manager API is running',
    databaseMode: global.isMockDB ? 'Local File Mock DB' : 'MongoDB (Atlas/Mongoose)'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`🔌 Database Mode: ${global.isMockDB ? 'Local File Mock DB' : 'MongoDB Connection'}`);
});
