const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../server/.env' });

// Connection URLs
const localUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/voicehire';
const atlasUrl = 'mongodb+srv://apoorvabhatnagar:D7DFQVHsSDdWZuPE@voicehire.udjxn.mongodb.net/';

// Database names
const localDbName = 'voicehire';
const atlasDbName = 'voicehire';

async function migrateData() {
  let localClient, atlasClient;

  try {
    console.log('Connecting to local MongoDB...');
    localClient = new MongoClient(localUrl);
    await localClient.connect();
    console.log('Connected to local MongoDB');

    console.log('Connecting to MongoDB Atlas...');
    atlasClient = new MongoClient(atlasUrl);
    await atlasClient.connect();
    console.log('Connected to MongoDB Atlas');

    const localDb = localClient.db(localDbName);
    const atlasDb = atlasClient.db(atlasDbName);

    // Get all collections from local database
    const collections = await localDb.listCollections().toArray();
    
    // Migrate each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);
      
      // Get all documents from local collection
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      if (documents.length === 0) {
        console.log(`Collection ${collectionName} is empty, skipping...`);
        continue;
      }
      
      // Insert documents into Atlas collection
      const atlasCollection = atlasDb.collection(collectionName);
      
      // Drop the collection in Atlas if it exists (to avoid duplicates)
      try {
        await atlasCollection.drop();
        console.log(`Dropped existing collection ${collectionName} in Atlas`);
      } catch (err) {
        // Collection might not exist, which is fine
        console.log(`Collection ${collectionName} doesn't exist in Atlas or couldn't be dropped`);
      }
      
      // Insert the documents
      const result = await atlasCollection.insertMany(documents);
      console.log(`Migrated ${result.insertedCount} documents for collection ${collectionName}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    // Close connections
    if (localClient) {
      await localClient.close();
      console.log('Local MongoDB connection closed');
    }
    if (atlasClient) {
      await atlasClient.close();
      console.log('MongoDB Atlas connection closed');
    }
  }
}

// Run the migration
migrateData();
