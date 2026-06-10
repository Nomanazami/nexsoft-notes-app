const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

global.isMockDB = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI found in env. Switching to Local File Mock DB.');
    enableMockDB();
    return;
  }

  try {
    // Attempt Mongoose connection with a quick timeout of 3s so the application doesn't hang
await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,  // 30 seconds
  socketTimeoutMS: 45000,
});
    console.log('✅ Connected to MongoDB via Mongoose.');
  } catch (err) {
    console.error(`❌ Mongoose connection failed: ${err.message}`);
    console.log('⚠️  Falling back to Local File Mock DB.');
    enableMockDB();
  }
};

function enableMockDB() {
  global.isMockDB = true;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([], null, 2));
  }
  console.log(`📂 Mock DB files initialized at: ${DATA_DIR}`);
}

module.exports = { connectDB };
