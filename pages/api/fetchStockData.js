import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_DB_NAME;

  if (!mongoUri || !dbName) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);

    const stockCollections = await db.listCollections().toArray();

    const stockData = {};

    await Promise.all(
      stockCollections.map(async (collection) => {
        const doc = await db
          .collection(collection.name)
          .findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
        if (doc) {
          const percentageChange = parseFloat(doc.percentageChange);
          stockData[collection.name] = {
            symbol: doc.symbol,
            price: doc.price,
            percentageChange: Math.abs(percentageChange),
            down: percentageChange < 0,
          };
        }
      })
    );

    res.status(200).json(stockData);
  } catch (err) {
    console.error("Error fetching stock data:", err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  } finally {
    if (client) {
      await client.close();
    }
  }
}


// Fetch stock data from MongoDB
async function getMarketData() {
  const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_DB_NAME;

  if (!mongoUri || !dbName) {
    console.error("Missing environment variables for MongoDB connection.");
    return null;
  }

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);

    // List of collections to fetch data from
    const stockCollections= await db.listCollections().toArray()
    
    const stockData = {};

    await Promise.all(
      stockCollections.map(async (collection) => {
        const doc = await db
          .collection(collection.name)
          .findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
        if (doc) {
          stockData[collection.name] = formatMarketData(doc);
        }
      })
    );

    return Object.fromEntries(
      Object.entries(stockData).sort(([keyA], [keyB]) => {
        const numA = parseInt(keyA.split('_')[0]); // Extract the number before '_'
        const numB = parseInt(keyB.split('_')[0]); // Extract the number before '_'
        return numA - numB; // Sort numerically in ascending order
      })
    );
  } catch (err) {
    console.error("Error fetching stock data:", err);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function formatMarketData(doc) {
  if (!doc) return null;

  const percentageChange = parseFloat(doc.percentageChange);
  return {
    symbol: doc.symbol,
    price: doc.price,
    percentageChange: Math.abs(percentageChange),
    down: percentageChange < 0,
  };
}
