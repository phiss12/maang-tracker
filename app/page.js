import { MongoClient } from 'mongodb';

export const metadata = {
  title: 'Is MAANG Up?',
  description: 'Check if MAANG stocks are up or down today.',
};

export const revalidate = 0;

export default async function Page() {
  const stockData = await getMarketData();

  if (!stockData) {
    return <h1 style={{ color: 'red' }}>Failed to fetch stock data.</h1>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={mainTextStyle}>MAANG Stock Market Performance</h1>
      <div style={boxesContainerStyle}>
        {Object.entries(stockData).map(([name, stock], index) => (
          <div
            key={index}
            style={getBoxStyle(stock.down ? 'Down' : 'Up')}
          >
            <h2>{stock.symbol}</h2>
            <p>
              {stock.down ? 'Down' : 'Up'} by {stock.percentageChange}%
            </p>
            <p>Price: ${stock.price.toFixed(2)}</p>
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

    const [metaDoc, amazonDoc, appleDoc, netflixDoc, googleDoc] = await Promise.all([
      db.collection('meta').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
      db.collection('amazon').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
      db.collection('apple').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
      db.collection('netflix').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
      db.collection('google').findOne({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }),
    ]);

    return {
      meta: formatMarketData(metaDoc),
      amazon: formatMarketData(amazonDoc),
      apple: formatMarketData(appleDoc),
      netflix: formatMarketData(netflixDoc),
      google: formatMarketData(googleDoc),
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



function getBoxStyle(status) {
  const colors = {
    Up: '#155724',
    Down: '#cc9999',
  };
  return {
    backgroundColor: colors[status] || '#cccccc',
    borderRadius: '10px',
    padding: '20px',
    minWidth: '200px',
    textAlign: 'center',
    border: '5px solid black',
  };
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  boxSizing: 'border-box',
};

const mainTextStyle = {
  margin: 0,
  textAlign: 'center',
};

const boxesContainerStyle = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginTop: '30px',
  flexWrap: 'wrap',
};
  