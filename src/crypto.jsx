import React, { useEffect, useState } from 'react';

const CryptoSection = () => {
  const [cryptoPrices, setCryptoPrices] = useState({
    bitcoin: 0,
    ethereum: 0,
    litecoin: 0,
    neo: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Clitecoin%2Cneo&vs_currencies=inr"
        );
        const data = await response.json();
        setCryptoPrices({
          bitcoin: data.bitcoin.inr,
          ethereum: data.ethereum.inr,
          litecoin: data.litecoin.inr,
          neo: data.neo.inr
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
        setLoading(false);
      }
    };

    fetchCryptoPrices();
    
    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchCryptoPrices, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="py-8 px-4 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-800 rounded-xl">
      <h2 className="text-2xl font-bold text-center text-teal-400 mb-6">Live Crypto Prices</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-300">Loading prices...</span>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gray-800/80 rounded-lg p-4 flex items-center w-full max-w-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-700">
            <img
              src="https://cdn.pixabay.com/photo/2021/04/30/16/47/bitcoin-logo-6219385_1280.png"
              className="w-12 h-12 mr-4 object-contain rounded-full ring-2 ring-teal-500"
              alt="Bitcoin"
            />
            <div>
              <p className="text-teal-400 font-medium">Bitcoin (BTC)</p>
              <p className="text-2xl font-bold text-gray-300">₹ {cryptoPrices.bitcoin.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-lg p-4 flex items-center w-full max-w-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-700">
            <img
              src="https://cdn.pixabay.com/photo/2021/05/24/09/15/ethereum-6278326_1280.png"
              className="w-12 h-12 mr-4 object-contain rounded-full ring-2 ring-teal-500"
              alt="Ethereum"
            />
            <div>
              <p className="text-teal-400 font-medium">Ethereum (ETH)</p>
              <p className="text-2xl font-bold text-gray-300">₹ {cryptoPrices.ethereum.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-lg p-4 flex items-center w-full max-w-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-700">
            <img
              src="https://img.freepik.com/free-vector/litecoin-blockchain-cryptocurrency-logo-vector-open-source-finance-concept_53876-126024.jpg?w=2000"
              className="w-12 h-12 mr-4 object-contain rounded-full ring-2 ring-teal-500"
              alt="Litecoin"
            />
            <div>
              <p className="text-teal-400 font-medium">Litecoin (LTC)</p>
              <p className="text-2xl font-bold text-gray-300">₹ {cryptoPrices.litecoin.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-lg p-4 flex items-center w-full max-w-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-700">
            <img
              src="https://w7.pngwing.com/pngs/629/719/png-transparent-neo-crypto-cryptocurrency-cryptocurrencies-cash-money-bank-payment-icon.png"
              className="w-12 h-12 mr-4 object-contain rounded-full ring-2 ring-teal-500"
              alt="Neo"
            />
            <div>
              <p className="text-teal-400 font-medium">Neo (NEO)</p>
              <p className="text-2xl font-bold text-gray-300">₹ {cryptoPrices.neo.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center text-gray-400 text-xs mt-6">
        Data provided by CoinGecko  • Updated every minute
      </div>
    </section>
  );
};

export default CryptoSection;