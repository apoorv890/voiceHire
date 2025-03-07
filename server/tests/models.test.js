import mongoose from 'mongoose';
import { setupDB, teardownDB, clearDB } from './setup.js';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import bcrypt from 'bcryptjs';

beforeAll(async () => await setupDB());
afterAll(async () => await teardownDB());
afterEach(async () => await clearDB());

describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    // Password should be hashed
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should not save user without required fields', async () => {
    const user = new User({
      name: 'Incomplete User'
      // Missing email and password
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should not save user with duplicate email', async () => {
    // Create first user
    const firstUser = new User({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123'
    });
    await firstUser.save();

    // Try to create second user with same email
    const secondUser = new User({
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'anotherpassword'
    });

    let error;
    try {
      await secondUser.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should hash password before saving', async () => {
    const password = 'plainpassword';
    const user = new User({
      name: 'Hash Test User',
      email: 'hash@example.com',
      password
    });

    const savedUser = await user.save();
    
    // Verify password was hashed
    expect(savedUser.password).not.toBe(password);
    
    // Verify we can compare passwords correctly
    const isMatch = await bcrypt.compare(password, savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('should compare password correctly', async () => {
    const password = 'testpassword';
    const user = new User({
      name: 'Compare Test User',
      email: 'compare@example.com',
      password
    });

    await user.save();

    // Test correct password
    const correctMatch = await user.comparePassword(password);
    expect(correctMatch).toBe(true);

    // Test incorrect password
    const incorrectMatch = await user.comparePassword('wrongpassword');
    expect(incorrectMatch).toBe(false);
  });
});

describe('Interview Model', () => {
  let user;

  beforeEach(async () => {
    // Create a test user for interview association
    user = new User({
      name: 'Interview Test User',
      email: 'interview@example.com',
      password: 'password123'
    });
    await user.save();
  });

  it('should create a new interview', async () => {
    const interviewData = {
      candidateName: 'Test Candidate',
      candidateEmail: 'candidate@example.com',
      company: 'Test Company',
      interviewDate: new Date(),
      user: user._id
    };

    const interview = new Interview(interviewData);
    const savedInterview = await interview.save();

    expect(savedInterview._id).toBeDefined();
    expect(savedInterview.candidateName).toBe(interviewData.candidateName);
    expect(savedInterview.candidateEmail).toBe(interviewData.candidateEmail);
    expect(savedInterview.company).toBe(interviewData.company);
    expect(savedInterview.interviewDate).toEqual(interviewData.interviewDate);
    expect(savedInterview.status).toBe('scheduled'); // Default status
    expect(savedInterview.user.toString()).toBe(user._id.toString());
    expect(savedInterview.createdAt).toBeDefined();
  });

  it('should not save interview without required fields', async () => {
    const interview = new Interview({
      // Missing required fields
      company: 'Incomplete Company',
      user: user._id
    });

    let error;
    try {
      await interview.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.candidateName).toBeDefined();
    expect(error.errors.candidateEmail).toBeDefined();
    expect(error.errors.interviewDate).toBeDefined();
  });

  it('should only accept valid status values', async () => {
    const interview = new Interview({
      candidateName: 'Status Test Candidate',
      candidateEmail: 'status@example.com',
      company: 'Status Test Company',
      interviewDate: new Date(),
      status: 'invalid_status', // Invalid status
      user: user._id
    });

    let error;
    try {
      await interview.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it('should accept all valid status values', async () => {
    const validStatuses = ['scheduled', 'completed', 'cancelled'];

    for (const status of validStatuses) {
      const interview = new Interview({
        candidateName: `${status} Candidate`,
        candidateEmail: `${status}@example.com`,
        company: `${status} Company`,
        interviewDate: new Date(),
        status,
        user: user._id
      });

      const savedInterview = await interview.save();
      expect(savedInterview.status).toBe(status);
    }
  });
});
