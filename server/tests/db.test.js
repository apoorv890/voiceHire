import { jest } from '@jest/globals';

// Mock mongoose before importing it
jest.mock('mongoose', () => {
  const connectMock = jest.fn();
  return {
    connect: connectMock,
    connection: {
      host: 'mockhost'
    }
  };
});

// Import after mocking
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

// Mock console.log and console.error
console.log = jest.fn();
console.error = jest.fn();

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    // Mock successful connection
    mongoose.connect.mockResolvedValue({
      connection: {
        host: 'mockhost'
      }
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MongoDB Connected'));
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should exit process on connection error', async () => {
    // Mock connection error
    const mockError = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(mockError);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error:'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should throw error if MongoDB URI is not defined', async () => {
    // Save original env
    const originalEnv = process.env;
    
    // Mock environment to remove MONGODB_URI
    process.env = { ...originalEnv };
    delete process.env.MONGODB_URI;
    
    // Also mock the fallback URI to be undefined
    const originalMongooseConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockImplementation((uri) => {
      if (!uri) throw new Error('MongoDB URI is not defined');
      return Promise.resolve({ connection: { host: 'mockhost' } });
    });

    await connectDB();

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error:'));
    expect(mockExit).toHaveBeenCalledWith(1);

    // Restore mocks
    process.env = originalEnv;
    mongoose.connect = originalMongooseConnect;
  });
});
