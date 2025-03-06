import express from 'express';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  updateStatus,
  deleteInterview
} from '../controllers/interviewController.js';
import {createAccessToken} from '../aiAgent.js';
const router = express.Router();

// Middleware to authenticate token
const authMiddleware = (req, res, next) => {
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

// Get all interviews
router.get('/', auth, getInterviews);

// Get single interview
router.get('/:id', auth, getInterview);

// Create new interview
router.post('/', auth, createInterview);

// Update interview
router.put('/:id', auth, updateInterview);

// Update interview status
router.patch('/:id/status', auth, updateStatus);

// Delete interview
router.delete('/:id', auth, deleteInterview);

router.get("/ai-token/:name",createAccessToken)

router.get('/token/:name', createAccessToken);

export default router;