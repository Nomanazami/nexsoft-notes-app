const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook for Mongoose to hash passwords
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const UserModel = mongoose.model('User', UserSchema);

// File storage configurations
const USERS_FILE = path.join(__dirname, '../data/users.json');

const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const User = {
  // Query operations
  findOne: async (query) => {
    if (global.isMockDB) {
      const users = readUsersFromFile();
      const email = query.email;
      if (email) {
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return found || null;
      }
      return null;
    } else {
      return await UserModel.findOne(query);
    }
  },

  findById: async (id) => {
    if (global.isMockDB) {
      const users = readUsersFromFile();
      const found = users.find(u => u._id === id);
      if (found) {
        // Return user record copy without exposing password in general queries
        const { password, ...userWithoutPassword } = found;
        return userWithoutPassword;
      }
      return null;
    } else {
      return await UserModel.findById(id).select('-password');
    }
  },

  create: async (userData) => {
    if (global.isMockDB) {
      const users = readUsersFromFile();
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('User already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const newUser = {
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date()
      };

      users.push(newUser);
      writeUsersToFile(users);
      return newUser;
    } else {
      const newUser = new UserModel(userData);
      return await newUser.save();
    }
  },

  // Password comparison
  comparePassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = User;
