import { MongoClient } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI; // Your MongoDB connection string
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the MongoClient instance.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, always create a new MongoClient.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
