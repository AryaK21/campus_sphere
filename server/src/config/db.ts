import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGO_URI provided. Initializing in-memory MongoDB server for seamless zero-config operation...');
      mongoMemoryServer = await MongoMemoryServer.create();
      mongoUri = mongoMemoryServer.getUri();
      console.log(`📦 In-Memory MongoDB connected at URI: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully to CampusSphere database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // If external mongo connection fails, fallback to memory server
    if (!mongoMemoryServer) {
      console.log('⚠️ Attempting fallback to in-memory MongoDB...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`📦 Fallback In-Memory MongoDB connected successfully at ${fallbackUri}`);
        return;
      } catch (fallbackErr) {
        console.error('❌ Fallback to In-Memory MongoDB also failed:', fallbackErr);
      }
    }
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
