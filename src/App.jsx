import { useState } from 'react'
import './App.css'
import Header from "./header.jsx";
import Hero from "./hero.jsx";
import StockDetails from './stockdetails.jsx';
import Footer from './footer.jsx';
import Crypto from './crypto.jsx';
import PredictionSection from './components/PredictionSection';
import StockDisplay from './components/StockDisplay';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [activeTab, setActiveTab] = useState('Home');

  const handleStockSelect = (stock, data, options) => {
    setSelectedStock(stock);
    setChartData(data);
    setChartOptions(options);
  };

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Home' && <Hero/>}
      {activeTab === 'Market' && (
        <div className="market-section px-4 py-8 bg-gray-900">
          <Crypto/>
          <StockDetails onStockSelect={handleStockSelect}/>
          {selectedStock && (
            <StockDisplay 
              selectedStock={selectedStock}
              chartData={chartData}
              chartOptions={chartOptions}
            />
          )}
        </div>
      )}
      {activeTab === 'Home' && <PredictionSection/>}
      <Footer/>
    </>
  )
}

export default App
