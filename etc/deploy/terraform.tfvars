# Google Cloud Project Configuration
project_id = "boot41"
region     = "asia-south1"

# Container Deployment Configuration
service_name    = "voice-hire"
container_image = "asia-south1-docker.pkg.dev/boot41/a3/voice-hire"
container_tag   = "latest"

# Environment Variables (Optional)
environment_variables = {
  "NODE_ENV"           = "production"
  "MONGODB_URI"        = "mongodb+srv://apoorvabhatnagar:D7DFQVHsSDdWZuPE@voicehire.udjxn.mongodb.net/"
  "JWT_SECRET"         = "voice-hire-jwt-secret-key-for-authentication-tokens"
  "LIVEKIT_API_KEY"    = "API5kjSzcmt5npV"
  "LIVEKIT_API_SECRET" = "nbkH5R1uoUczoy0oCEdf7X0zLpLXVI7oI2fewINfID8D"
}
