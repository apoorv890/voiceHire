import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

// Assuming you have your API key and secret in environment variables
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

// Create a RoomServiceClient
// const client = new RoomServiceClient(apiKey, apiSecret);

// Function to create an access token for a participant to join a room
async function createAccessToken(req,res) {

    console.log(req.params.name)
    console.log("running")
    const roomName = 'name-of-room'; // Specify the room name

    const at = new AccessToken(apiKey, apiSecret, {
        identity: req.params.name,
    });

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    console.log('access token', token);
    return token;
}

export { createAccessToken };
