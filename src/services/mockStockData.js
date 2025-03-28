// Mock data for NSE stocks
export const generateMockStockData = () => {
  const nseStocks = [
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'ITC.NS', name: 'ITC' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
    // Add more stocks as needed
  ];

  // Generate random price movement
  const generatePrice = (base) => {
    const change = (Math.random() - 0.5) * 10;
    return {
      price: base + change,
      change: change,
      changePercent: (change / base) * 100
    };
  };

  // Generate OHLCV data
  const generateOHLCV = (basePrice) => {
    const variation = basePrice * 0.02; // 2% variation
    const high = basePrice + Math.random() * variation;
    const low = basePrice - Math.random() * variation;
    return {
      open: basePrice - Math.random() * variation,
      high,
      low,
      close: basePrice,
      volume: Math.floor(Math.random() * 1000000) + 500000
    };
  };

  // Base prices for stocks
  const basePrices = {
    'TCS.NS': 3500,
    'RELIANCE.NS': 2400,
    'HDFCBANK.NS': 1600,
    'INFY.NS': 1400,
    'ICICIBANK.NS': 900,
    'HINDUNILVR.NS': 2500,
    'ITC.NS': 400,
    'SBIN.NS': 500,
    'BHARTIARTL.NS': 800,
    'KOTAKBANK.NS': 1800,
  };

  // Generate mock data for each stock
  return nseStocks.map(stock => {
    const basePrice = basePrices[stock.symbol] || 1000;
    const priceData = generatePrice(basePrice);
    const ohlcv = generateOHLCV(basePrice);

    return {
      ...stock,
      ...priceData,
      ...ohlcv,
      isLive: true
    };
  });
};

// Generate mock market indices data
export const generateMockIndicesData = () => {
  const generateIndexData = (baseValue) => {
    const change = (Math.random() - 0.5) * 100;
    return {
      value: baseValue + change,
      change,
      isLive: true
    };
  };

  return {
    nifty50: generateIndexData(19500), // Base value for Nifty 50
    bankNifty: generateIndexData(44500) // Base value for Bank Nifty
  };
};

// Generate mock historical data
export const generateMockHistoricalData = (symbol, days = 30) => {
  const basePrice = 1000;
  const data = [];
  let currentPrice = basePrice;

  for (let i = days; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some random price movement
    currentPrice = currentPrice + (Math.random() - 0.5) * 20;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: currentPrice
    });
  }

  return data;
};

// Generate mock market statistics
export const generateMockMarketStats = () => {
  return {
    totalTrades: Math.floor(Math.random() * 10000000) + 5000000,
    niftyTrades: Math.floor(Math.random() * 1000000) + 500000,
    bankNiftyTrades: Math.floor(Math.random() * 800000) + 400000,
    lastUpdated: new Date().toLocaleTimeString()
  };
};
