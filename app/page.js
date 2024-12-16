import { MongoClient } from 'mongodb';

// Adjust revalidate time to control how often data updates
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  const stockData = await getMarketData();

  if (!stockData || Object.keys(stockData).length === 0) {
    return <h1 style={{ color: 'red' }}>Failed to fetch stock data.</h1>;
  }

  return (
    <div className="container">
      <div className="stocks">
        {Object.entries(stockData).map(([name, stock]) => (
          <div key={name} className={`stock-card ${stock?.down ? 'down' : 'up'}`}>
            <p className="symbol">{stock?.symbol}</p>
            <p className="status">
              {stock?.down ? 'Down' : 'Up'} by {stock?.percentageChange}%
            </p>
            <p className="price">${stock?.price?.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
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
    const stockNames = ["meta", "amazon", "apple", "netflix", "google"];
    const stockData = {};

    await Promise.all(
      stockNames.map(async (name) => {
        const doc = await db
          .collection(name)
          .findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
        if (doc) {
          stockData[name] = formatMarketData(doc);
        }
      })
    );

    return stockData;
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
