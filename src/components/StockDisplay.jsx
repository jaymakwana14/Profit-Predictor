import React from 'react';

const StockDisplay = ({ selectedStock }) => {
  if (!selectedStock) {
    return null;
  }

  return (
    <div className="stock-display">
      <div className="stock-header">
        <h2></h2>
      </div>
    </div>
  );
};

export default StockDisplay;
