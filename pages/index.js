import { MongoClient } from 'mongodb';

function formatMarketData(doc) {
    if (!doc) return null;

    const percentageChange = parseFloat(doc.percentageChange);
    const down = percentageChange < 0;

    return {
        symbol: doc.symbol,
        price: doc.price,
        percentageChange: Math.abs(percentageChange),
        down,
    };
}

export async function getServerSideProps() {
  const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI; // Your MongoDB connection string

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db(process.env.NEXT_PUBLIC_DB_NAME);

    // Fetch individual stock data
    const metaDoc = await db.collection('meta').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
    const amazonDoc = await db.collection('amazon').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
    const appleDoc = await db.collection('apple').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
    const netflixDoc = await db.collection('netflix').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });
    const googleDoc = await db.collection('google').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } });

    // Process and format the data
    const stockData = {
    meta: formatMarketData(metaDoc),
    amazon: formatMarketData(amazonDoc),
    apple: formatMarketData(appleDoc),
    netflix: formatMarketData(netflixDoc),
    google: formatMarketData(googleDoc),
    };

    return {
        props: {
            stockData,
        },
    };
    } catch (err) {
    console.error(err);
    return {
        props: {
            stockData: {},
            error: 'Failed to fetch stock data.',
        },
    };
    }
}

const Home = ({ stockData, error }) => {
  if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;

  return (
    <div className="container">
      <div className="stocks">
        {Object.entries(stockData).map(([name, stock], index) => (
          <div
            key={index}
            className={`stock-card ${stock.down ? 'down' : 'up'}`}
          >
            <p className="symbol">{stock.symbol}</p>
            <p className="status">
              {stock.down ? 'Down' : 'Up'} by {stock.percentageChange}%
            </p>
            <p className="price">${stock.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
