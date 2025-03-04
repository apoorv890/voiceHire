import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Demo user for testing
const demoUser = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'Demo User',
  email: 'demo@voicehire.com',
  password: '$2a$10$3JqKDPaJe9GUKJsfzwQYpO8KQ0jVgoBFAJvpCuUrODMWQVhNo4rnO', // hashed 'demo123'
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // For demo purposes, we'll just check if it's the demo email
    if (email === demoUser.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // For demo, we'll create a fake user
    const user = {
      _id: Math.random().toString(36).substring(2, 15),
      name,
      email
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'voicehire_secret_key',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if it's the demo account
    if (email === demoUser.email) {
      // Verify password
      const isMatch = await bcrypt.compare(password, demoUser.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: demoUser._id },
        process.env.JWT_SECRET || 'voicehire_secret_key',
        { expiresIn: '1d' }
      );
      
      return res.json({
        token,
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email
        }
      });
    }
    
    // For demo purposes, we'll accept any valid-looking email/password
    if (email.includes('@') && password.length >= 6) {
      // Generate a fake user
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        name: email.split('@')[0],
        email
      };
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'voicehire_secret_key',
        { expiresIn: '1d' }
      );
      
      return res.json({
        token,
        user
      });
    }
    
    res.status(400).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voicehire_secret_key');
    
    // For demo purposes, we'll just return a fake user
    const user = {
      id: decoded.id,
      name: 'Demo User',
      email: 'demo@voicehire.com'
    };
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

export default router;