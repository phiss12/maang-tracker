import { MongoClient } from 'mongodb';

export const metadata = {
  title: 'Is MAANG Up?'};

export const revalidate = 0;

export default async function Page() {
  const stockData = await getMarketData();

  if (!stockData) {
    return <h1 style={{ color: 'red' }}>Failed to fetch stock data.</h1>;
  }

  return (
    <div className="container">
      <div className="stocks">
        {Object.entries(stockData).map(([name, stock], index) => (
          <div
            key={index}
            className={`stock-card ${stock?.down ? 'down' : 'up'}`}
          >
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

// Ensure this function remains server-side
async function getMarketData() {
  const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_DB_NAME;

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);

    const [metaDoc] = await Promise.all([
      db.collection('meta').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
     
    ]);

    return {
      meta: formatMarketData(metaDoc),
     
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
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