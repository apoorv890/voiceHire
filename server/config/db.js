import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Use environment variable or fallback to hardcoded URI for Docker
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://apoorvabhatnagar:D7DFQVHsSDdWZuPE@voicehire.udjxn.mongodb.net/';
    
    if (!mongoURI) {
      console.error('MongoDB URI is not defined');
      throw new Error('MongoDB URI is not defined');
    }
    
    console.log('Using MongoDB URI:', mongoURI.substring(0, 20) + '...');
    
    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
    };
    
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit the process, allow the server to start anyway
    console.log('Server will continue without MongoDB connection');
    return null;
  }
};

export default connectDB;
