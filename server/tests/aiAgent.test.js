import { jest } from '@jest/globals';
import { AccessToken } from 'livekit-server-sdk';
import { createAccessToken } from '../aiAgent.js';

// Mock environment variables
process.env.LIVEKIT_API_KEY = 'test-api-key';
process.env.LIVEKIT_API_SECRET = 'test-api-secret';

// Mock the AccessToken class
jest.mock('livekit-server-sdk', () => {
  return {
    AccessToken: jest.fn().mockImplementation(() => {
      return {
        addGrant: jest.fn(),
        toJwt: jest.fn().mockResolvedValue('mock-jwt-token')
      };
    }),
    RoomServiceClient: jest.fn()
  };
});

// Mock console.log
console.log = jest.fn();

describe('AI Agent', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        name: 'testUser'
      }
    };
    res = {
      json: jest.fn()
    };
    
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should create an access token for a user', async () => {
    await createAccessToken(req, res);

    expect(AccessToken).toHaveBeenCalled();
    expect(AccessToken.mock.instances[0].addGrant).toHaveBeenCalledWith({
      roomJoin: true,
      room: expect.any(String)
    });
    expect(AccessToken.mock.instances[0].toJwt).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: 'mock-jwt-token',
      room: expect.any(String)
    });
  });

  it('should use the name from params for identity', async () => {
    req.params.name = 'customUser';
    
    await createAccessToken(req, res);

    expect(AccessToken).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { identity: 'customUser' }
    );
  });

  it('should log the access token', async () => {
    await createAccessToken(req, res);

    expect(console.log).toHaveBeenCalledWith('access token', 'mock-jwt-token');
  });
});
