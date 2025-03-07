import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupDB, teardownDB, clearDB } from './setup.js';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import interviewRoutes from '../routes/interviews.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import auth from '../middleware/auth.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/interviews', interviewRoutes);

beforeAll(async () => await setupDB());
afterAll(async () => await teardownDB());
afterEach(async () => await clearDB());

describe('Interview Routes', () => {
  let token;
  let user;

  // Setup a user and token before each test
  beforeEach(async () => {
    // Create a test user
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();

    // Generate token for the user
    token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'voicehire_secret_key',
      { expiresIn: '1d' }
    );
  });

  describe('GET /api/interviews', () => {
    it('should get all interviews for a user', async () => {
      // Create some test interviews for the user
      const interviews = [
        {
          candidateName: 'Candidate 1',
          candidateEmail: 'candidate1@example.com',
          company: 'Company A',
          interviewDate: new Date(),
          user: user._id
        },
        {
          candidateName: 'Candidate 2',
          candidateEmail: 'candidate2@example.com',
          company: 'Company B',
          interviewDate: new Date(),
          user: user._id
        }
      ];

      await Interview.insertMany(interviews);

      // Get all interviews
      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('candidateName');
      expect(response.body[0]).toHaveProperty('candidateEmail');
      expect(response.body[0]).toHaveProperty('company');
      expect(response.body[0]).toHaveProperty('interviewDate');
    });

    it('should not get interviews without authentication', async () => {
      const response = await request(app)
        .get('/api/interviews');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token, authorization denied');
    });
  });

  describe('GET /api/interviews/:id', () => {
    it('should get a single interview by ID', async () => {
      // Create a test interview
      const interview = new Interview({
        candidateName: 'Single Candidate',
        candidateEmail: 'single@example.com',
        company: 'Single Company',
        interviewDate: new Date(),
        user: user._id
      });
      await interview.save();

      // Get the interview by ID
      const response = await request(app)
        .get(`/api/interviews/${interview._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id', interview._id.toString());
      expect(response.body).toHaveProperty('candidateName', interview.candidateName);
      expect(response.body).toHaveProperty('candidateEmail', interview.candidateEmail);
      expect(response.body).toHaveProperty('company', interview.company);
    });

    it('should not get an interview that does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/interviews/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });

    it('should not get an interview belonging to another user', async () => {
      // Create another user
      const anotherUser = new User({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123'
      });
      await anotherUser.save();

      // Create an interview for the other user
      const interview = new Interview({
        candidateName: 'Other Candidate',
        candidateEmail: 'other@example.com',
        company: 'Other Company',
        interviewDate: new Date(),
        user: anotherUser._id
      });
      await interview.save();

      // Try to get the interview with the first user's token
      const response = await request(app)
        .get(`/api/interviews/${interview._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });
  });

  describe('POST /api/interviews', () => {
    it('should create a new interview', async () => {
      const interviewData = {
        candidateName: 'New Candidate',
        candidateEmail: 'new@example.com',
        company: 'New Company',
        interviewDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send(interviewData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('candidateName', interviewData.candidateName);
      expect(response.body).toHaveProperty('candidateEmail', interviewData.candidateEmail);
      expect(response.body).toHaveProperty('company', interviewData.company);
      expect(response.body).toHaveProperty('user', user._id.toString());
      expect(response.body).toHaveProperty('status', 'scheduled');

      // Verify the interview was created in the database
      const interview = await Interview.findById(response.body._id);
      expect(interview).toBeTruthy();
      expect(interview.candidateName).toBe(interviewData.candidateName);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing required fields
          company: 'Incomplete Company'
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/interviews/:id', () => {
    it('should update an existing interview', async () => {
      // Create a test interview
      const interview = new Interview({
        candidateName: 'Update Candidate',
        candidateEmail: 'update@example.com',
        company: 'Update Company',
        interviewDate: new Date(),
        user: user._id
      });
      await interview.save();

      // Update data
      const updateData = {
        candidateName: 'Updated Name',
        company: 'Updated Company'
      };

      // Update the interview
      const response = await request(app)
        .put(`/api/interviews/${interview._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('candidateName', updateData.candidateName);
      expect(response.body).toHaveProperty('company', updateData.company);
      expect(response.body).toHaveProperty('candidateEmail', interview.candidateEmail); // Unchanged field

      // Verify the update in the database
      const updatedInterview = await Interview.findById(interview._id);
      expect(updatedInterview.candidateName).toBe(updateData.candidateName);
      expect(updatedInterview.company).toBe(updateData.company);
    });

    it('should not update an interview that does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/interviews/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          candidateName: 'Non-existent Update'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });
  });

  describe('PATCH /api/interviews/:id/status', () => {
    it('should update the status of an interview', async () => {
      // Create a test interview
      const interview = new Interview({
        candidateName: 'Status Candidate',
        candidateEmail: 'status@example.com',
        company: 'Status Company',
        interviewDate: new Date(),
        status: 'scheduled',
        user: user._id
      });
      await interview.save();

      // Update the status
      const response = await request(app)
        .patch(`/api/interviews/${interview._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'completed');

      // Verify the update in the database
      const updatedInterview = await Interview.findById(interview._id);
      expect(updatedInterview.status).toBe('completed');
    });

    it('should validate status values', async () => {
      // Create a test interview
      const interview = new Interview({
        candidateName: 'Invalid Status',
        candidateEmail: 'invalid@example.com',
        company: 'Invalid Company',
        interviewDate: new Date(),
        user: user._id
      });
      await interview.save();

      // Try to update with invalid status
      const response = await request(app)
        .patch(`/api/interviews/${interview._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid_status' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid status');
    });
  });

  describe('DELETE /api/interviews/:id', () => {
    it('should delete an interview', async () => {
      // Create a test interview
      const interview = new Interview({
        candidateName: 'Delete Candidate',
        candidateEmail: 'delete@example.com',
        company: 'Delete Company',
        interviewDate: new Date(),
        user: user._id
      });
      await interview.save();

      // Delete the interview
      const response = await request(app)
        .delete(`/api/interviews/${interview._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Interview deleted successfully');

      // Verify the interview was deleted from the database
      const deletedInterview = await Interview.findById(interview._id);
      expect(deletedInterview).toBeNull();
    });

    it('should not delete an interview that does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/interviews/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });

    it('should not delete an interview belonging to another user', async () => {
      // Create another user
      const anotherUser = new User({
        name: 'Another Delete User',
        email: 'anotherdelete@example.com',
        password: 'password123'
      });
      await anotherUser.save();

      // Create an interview for the other user
      const interview = new Interview({
        candidateName: 'Other Delete Candidate',
        candidateEmail: 'otherdelete@example.com',
        company: 'Other Delete Company',
        interviewDate: new Date(),
        user: anotherUser._id
      });
      await interview.save();

      // Try to delete the interview with the first user's token
      const response = await request(app)
        .delete(`/api/interviews/${interview._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');

      // Verify the interview still exists in the database
      const stillExistsInterview = await Interview.findById(interview._id);
      expect(stillExistsInterview).toBeTruthy();
    });
  });
});
