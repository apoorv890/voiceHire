import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use environment variable or fallback to hardcoded URI for Docker
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://apoorvabhatnagar:D7DFQVHsSDdWZuPE@voicehire.udjxn.mongodb.net/';
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
