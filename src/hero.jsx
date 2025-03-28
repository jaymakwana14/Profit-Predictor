import { useState } from 'react';
import { TrendingUp, DollarSign, LineChart } from 'lucide-react';
import './App.css';

export default function Hero() {
  return (
    <section className="pt-24 pb-12 overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800" id="Hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Text */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-6 animate-gradient">
            Navigate the Markets with Confidence
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Harness the power of AI to predict market trends and make informed investment decisions
          </p>
        </div>

        {/* 3D Model with Glass Effect */}
        <div className="relative mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl"></div>
          <iframe
            className="w-full h-[60vh] rounded-2xl relative z-10"
            src="https://my.spline.design/untitled-fb03ae29a0a47c6832bde4fc4e651703/"
            title="3D Model"
          ></iframe>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: <TrendingUp className="w-8 h-8 text-teal-400" />,
              title: "Market Analysis",
              description: "Advanced algorithms analyze market patterns to predict future trends"
            },
            {
              icon: <DollarSign className="w-8 h-8 text-teal-400" />,
              title: "Real-time Updates",
              description: "Stay informed with live market data and instant predictions"
            },
            {
              icon: <LineChart className="w-8 h-8 text-teal-400" />,
              title: "AI Insights",
              description: "Machine learning models provide accurate market forecasts"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-teal-500/50 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Market Understanding Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-2xl blur"></div>
            <img
              src="/src/assets/Stocks.jpg"
              alt="Market Visualization"
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
          
          <div className="space-y-6 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Understanding the Markets
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  title: "Stock Market",
                  description: "A dynamic marketplace where company shares are traded, influenced by economic trends and corporate performance."
                },
                {
                  title: "Crypto Market",
                  description: "The innovative world of digital assets, known for its volatility and revolutionary blockchain technology."
                },
                {
                  title: "Forex Market",
                  description: "The largest financial market globally, where currencies are exchanged based on geopolitical and economic factors."
                }
              ].map((market, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-teal-400 mb-2">{market.title}</h3>
                  <p className="text-gray-300">{market.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
