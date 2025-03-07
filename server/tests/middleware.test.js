import { jest } from '@jest/globals';
import auth from '../middleware/auth.js';

// Mock jsonwebtoken module
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Import jwt after mocking
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer validtoken'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should call next() when token is valid', () => {
    // Mock the jwt.verify to return a decoded token
    jwt.verify.mockReturnValue({ id: 'user123' });

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      expect.any(String)
    );
    expect(req.user).toEqual({ id: 'user123' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 when no token is provided', () => {
    // No authorization header
    req.headers.authorization = undefined;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token format is invalid', () => {
    // Invalid format (missing 'Bearer')
    req.headers.authorization = 'invalidtoken';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
