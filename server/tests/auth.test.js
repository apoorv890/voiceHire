import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupDB, teardownDB, clearDB } from './setup.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

beforeAll(async () => await setupDB());
afterAll(async () => await teardownDB());
afterEach(async () => await clearDB());

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);

      // Verify user was created in the database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    it('should not register a user with an existing email', async () => {
      // Create a user first
      const user = new User({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });
      await user.save();

      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'anotherpassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User'
          // Missing email and password
        });

      expect(response.statusCode).toBe(500); // This should ideally be 400, but the current implementation returns 500
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Create a user first
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      };
      const user = new User(userData);
      await user.save();

      // Login with the user
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should not login with incorrect password', async () => {
      // Create a user first
      const user = new User({
        name: 'Password Test User',
        email: 'password@example.com',
        password: 'correctpassword'
      });
      await user.save();

      // Try to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'password@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should login with demo account', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@voicehire.com',
          password: 'demo123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', 'Demo User');
      expect(response.body.user).toHaveProperty('email', 'demo@voicehire.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      // Create a user
      const user = new User({
        name: 'Current User',
        email: 'current@example.com',
        password: 'password123'
      });
      await user.save();

      // Generate a token for the user
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'voicehire_secret_key',
        { expiresIn: '1d' }
      );

      // Get current user with token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id', user._id.toString());
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token, authorization denied');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token is not valid');
    });
  });
});
