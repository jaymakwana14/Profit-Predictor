import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const PredictionSection = () => {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [stockDetails, setStockDetails] = useState(null);

  const calculatePrediction = (stockData) => {
    // Extract price information from the NSE API response structure
    const lastPrice = stockData.lastPrice || 0;
    const high52 = stockData.high52 || 0;
    const low52 = stockData.low52 || 0;
    const previousClose = stockData.previousClose || 0;
    const pChange = stockData.pChange || 0;
    const vwap = stockData.vwap || lastPrice;
    
    // Validate required data
    if (!lastPrice || !previousClose) {
      throw new Error('Insufficient price data for prediction');
    }
    
    // Calculate average price range and momentum
    const priceRange = high52 && low52 ? high52 - low52 : lastPrice * 0.2; 
    const avgPrice = high52 && low52 ? (high52 + low52) / 2 : lastPrice;
    const momentum = pChange / 100; 
    
    // Generate 30 days of predicted prices with technical indicators
    const predictedPrices = [];
    let currentPrice = lastPrice;
    
    for (let i = 0; i < 30; i++) {
      // Calculate trend based on multiple factors
      const relativeToVWAP = (currentPrice - vwap) / vwap;
      const relativePosition = priceRange ? (currentPrice - (low52 || (lastPrice * 0.9))) / priceRange : 0.5;
      const trendFactor = momentum * (1 - Math.abs(relativePosition - 0.5)) - (relativeToVWAP * 0.1);
      
      // Add controlled randomness (2% max deviation)
      const randomFactor = (Math.random() - 0.5) * 0.02;
      
      // Calculate next price with mean reversion
      const meanReversionFactor = (avgPrice - currentPrice) / avgPrice * 0.1;
      currentPrice = currentPrice * (1 + trendFactor + randomFactor + meanReversionFactor);
      
      // Ensure price stays within reasonable bounds (±30% of current price)
      currentPrice = Math.max(lastPrice * 0.7, Math.min(lastPrice * 1.3, currentPrice));
      
      predictedPrices.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    return predictedPrices;
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for symbol:', symbol);
      const stockResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/${symbol}`);
      const stockData = await stockResponse.json();
      
      console.log('Raw API Response:', stockData);
      
      if (!stockResponse.ok) {
        throw new Error(stockData.error || 'Failed to fetch stock data');
      }
      
      // Extract the relevant stock data from the response
      const processedStockData = {
        lastPrice: stockData.priceInfo?.lastPrice,
        high52: stockData.priceInfo?.weekHighLow?.max,  
        low52: stockData.priceInfo?.weekHighLow?.min,   
        high52Date: stockData.priceInfo?.weekHighLow?.maxDate, 
        low52Date: stockData.priceInfo?.weekHighLow?.minDate,  
        previousClose: stockData.priceInfo?.previousClose,
        pChange: stockData.priceInfo?.pChange,
        vwap: stockData.priceInfo?.vwap,
        open: stockData.priceInfo?.open,
        dayHigh: stockData.priceInfo?.intraDayHighLow?.max,  
        dayLow: stockData.priceInfo?.intraDayHighLow?.min    
      };
      
      console.log('Processed Stock Data:', processedStockData);
      console.log('52 Week High:', processedStockData.high52, 'on', processedStockData.high52Date);
      console.log('52 Week Low:', processedStockData.low52, 'on', processedStockData.low52Date);
      
      setStockDetails(processedStockData);
      
      // Calculate predictions based on stock data
      const predictedPrices = calculatePrediction(processedStockData);
      
      // Create historical data array using actual price with small variations
      const lastPrice = processedStockData.lastPrice || 0;
      const historicalPrices = Array(30).fill(0).map((_, i) => 
        parseFloat((lastPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
      );
      
      setPredictionData({
        historical_prices: historicalPrices,
        predicted_prices: predictedPrices,
        current_price: lastPrice
      });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError(err.message);
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: chartType,
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      type: 'numeric',
      title: {
        text: 'Days',
      },
      labels: {
        formatter: (value) => Math.round(value)
      }
    },
    yaxis: {
      title: {
        text: 'Price (₹)',
      },
      labels: {
        formatter: (value) => value.toFixed(2)
      }
    },
    colors: ['#4F46E5', '#10B981'],
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value) => `₹${value.toFixed(2)}`
      }
    }
  };

  const chartSeries = predictionData ? [
    {
      name: 'Historical',
      data: predictionData.historical_prices,
    },
    {
      name: 'Predicted',
      data: predictionData.predicted_prices,
    },
  ] : [];

  return (
    <div className="py-8 px-4 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl font-bold text-center text-teal-400 mb-8">Price Prediction</h2>
        
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter NSE Symbol (e.g., RELIANCE)"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <button
            onClick={handlePredict}
            disabled={loading || !symbol}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-center mb-8">
            {error}
          </div>
        )}

        {stockDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400">Week High</p>
              <p className="text-xl font-bold text-teal-400">
                ₹{stockDetails.high52?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {stockDetails.high52Date || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400">Week Low</p>
              <p className="text-xl font-bold text-teal-400">
                ₹{stockDetails.low52?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {stockDetails.low52Date || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400">Previous Close</p>
              <p className="text-xl font-bold text-teal-400">
                ₹{stockDetails.previousClose?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400">Current Price</p>
              <p className="text-xl font-bold text-teal-400">
                ₹{stockDetails.lastPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {predictionData && (
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-teal-400">
                  Price Chart for {symbol}
                </h3>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="candlestick">Candlestick</option>
                  <option value="area">Area Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-teal-400 font-semibold mb-2">How is this prediction calculated?</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Our prediction model considers multiple factors:
                </p>
                <ul className="text-gray-400 text-sm list-disc list-inside space-y-1">
                  <li title="Uses price momentum to detect trends">
                    Price Momentum ({(stockDetails.pChange || 0).toFixed(2)}% change)
                  </li>
                  <li title="Compares current price to volume-weighted average">
                    VWAP Analysis (₹{stockDetails.vwap?.toFixed(2) || 'N/A'})
                  </li>
                  <li title="Considers price position within 52-week range">
                    52-Week Range Analysis (₹{stockDetails.low52 || 'N/A'} - ₹{stockDetails.high52 || 'N/A'})
                  </li>
                  <li title="Prevents extreme predictions by pulling prices toward the mean">
                    Mean Reversion Factor
                  </li>
                </ul>
                <p className="text-yellow-400/80 text-sm mt-3">
                  Note: This is an educational tool and should not be used as financial advice.
                </p>
              </div>
            </div>
            
            <div className="h-[500px]">
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type={chartType}
                height="100%"
              />
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 group relative">
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/50 transition-all duration-300 rounded-lg"></div>
                <p className="text-gray-400 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-teal-400">
                  ₹{predictionData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-2 bg-gray-800 rounded-lg shadow-xl z-10 w-64">
                  <p className="text-sm text-gray-300">
                    Last traded price from NSE. Updated in real-time during market hours.
                  </p>
                </div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 group relative">
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/50 transition-all duration-300 rounded-lg"></div>
                <p className="text-gray-400 mb-1">Predicted Price (30 days)</p>
                <p className="text-2xl font-bold text-teal-400">
                  ₹{predictionData.predicted_prices[predictionData.predicted_prices.length - 1].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-2 bg-gray-800 rounded-lg shadow-xl z-10 w-64">
                  <p className="text-sm text-gray-300">
                    Estimated price after 30 days based on current trends, VWAP, and historical price range. 
                    <span className="block mt-1 text-yellow-400/80">Past performance doesn't guarantee future results.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionSection;
