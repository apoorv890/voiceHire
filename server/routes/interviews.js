import express from 'express';
import jwt from 'jsonwebtoken';
import Interview from '../models/Interview.js';

const router = express.Router();

// Middleware to authenticate token
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voicehire_secret_key');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all interviews for the current user
router.get('/', auth, async (req, res) => {
  try {
    // For demo purposes, we'll return mock data
    const mockInterviews = generateMockInterviews(req.user.id);
    res.json(mockInterviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new interview
router.post('/', auth, async (req, res) => {
  try {
    const { candidateName, candidateEmail, company, interviewDate } = req.body;
    
    // For demo purposes, we'll just return the created interview with a fake ID
    const newInterview = {
      _id: Math.random().toString(36).substring(2, 15),
      candidateName,
      candidateEmail,
      company,
      interviewDate,
      status: 'scheduled',
      user: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific interview
router.get('/:id', auth, async (req, res) => {
  try {
    // For demo purposes, we'll return a mock interview
    const mockInterview = {
      _id: req.params.id,
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      company: 'Tech Company',
      interviewDate: new Date().toISOString(),
      status: 'scheduled',
      user: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    res.json(mockInterview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update interview status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // For demo purposes, we'll just return the updated interview
    const updatedInterview = {
      _id: req.params.id,
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      company: 'Tech Company',
      interviewDate: new Date().toISOString(),
      status,
      user: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate mock interviews
function generateMockInterviews(userId) {
  const statuses = ['scheduled', 'completed', 'cancelled'];
  const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 14) - 7);
    
    return {
      _id: `mock-${i}`,
      candidateName: `Candidate ${i + 1}`,
      candidateEmail: `candidate${i + 1}@example.com`,
      company: companies[Math.floor(Math.random() * companies.length)],
      interviewDate: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      user: userId,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
    };
  });
}

export default router;