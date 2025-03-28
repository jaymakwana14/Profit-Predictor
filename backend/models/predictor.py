import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import GradientBoostingRegressor
import yfinance as yf
import os
import logging

logger = logging.getLogger(__name__)

class StockPredictor:
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1)
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def get_stock_data(self, symbol, exchange='NSE'):
        """Get historical stock data from Yahoo Finance."""
        try:
            # Add .NS for NSE stocks and .BO for BSE stocks
            suffix = '.NS' if exchange == 'NSE' else '.BO'
            ticker = f"{symbol}{suffix}"
            
            # Download data
            df = yf.download(ticker, period='2y')
            
            if df.empty:
                logger.error(f"No data found for {ticker}")
                return None
                
            return df
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    def prepare_data(self, data, sequence_length=60):
        """Prepare data for prediction."""
        try:
            # Scale the data
            scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
            X, y = [], []
            
            # Create sequences
            for i in range(len(scaled_data) - sequence_length):
                X.append(scaled_data[i:(i + sequence_length)])
                y.append(scaled_data[i + sequence_length])
            
            # Convert to numpy arrays and reshape X
            X = np.array(X)
            X = X.reshape(X.shape[0], X.shape[1])
            y = np.array(y)
            
            return X, y, scaled_data
            
        except Exception as e:
            logger.error(f"Error preparing data: {str(e)}")
            raise
    
    def predict(self, symbol, exchange='NSE', future_steps=30):
        """Make predictions for the given stock."""
        try:
            # Get historical data
            df = self.get_stock_data(symbol, exchange)
            if df is None:
                raise ValueError(f"Could not fetch data for {symbol}")
            
            # Get closing prices
            data = df['Close'].values.reshape(-1, 1)
            
            # Prepare data
            X, y, scaled_data = self.prepare_data(data)
            
            # Train the model
            self.model.fit(X, y.ravel())
            
            # Prepare data for future predictions
            last_sequence = scaled_data[-60:]
            predictions = []
            
            # Make future predictions
            for _ in range(future_steps):
                # Reshape sequence for prediction
                current_sequence = last_sequence[-60:].reshape(1, -1)
                # Get prediction
                next_pred = self.model.predict(current_sequence)
                predictions.append(next_pred[0])
                # Update sequence
                last_sequence = np.append(last_sequence, next_pred)
            
            # Convert predictions back to original scale
            predictions_array = np.array(predictions).reshape(-1, 1)
            predicted_prices = self.scaler.inverse_transform(predictions_array)
            
            # Get historical prices for the chart
            historical_prices = df['Close'].values.tolist()
            
            return {
                'current_price': float(df['Close'].values[-1]),
                'predicted_prices': predicted_prices.flatten().tolist(),
                'historical_prices': historical_prices
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            raise
