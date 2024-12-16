import clientPromise from '/lib/mongodb';

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.NEXT_PUBLIC_DB_NAME); // Replace with your database name

    // List of collections to fetch data from
    const stockNames = ["meta", "amazon", "apple", "netflix", "google"];
    const stockData = {};

    for (const name of stockNames) {
      const collection = db.collection(name);

      // Fetch documents with required fields
      const documents = await collection.find({}, { projection: { _id: 0, symbol: 1, price: 1, percentageChange: 1 } }).toArray();

      // Process each document and store in stockData
      for (const doc of documents) {
        const percentageChange = parseFloat(doc.percentageChange);
        const down = percentageChange < 0;

        stockData[name] = {
          symbol: doc.symbol,
          price: doc.price,
          percentageChange: Math.abs(percentageChange),
          down,
        };
      }
    }

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
