import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import os
import glob

class StockPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = MinMaxScaler()
        
    def prepare_data(self, df):
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values('Date')
        
        # Create features
        df['MA7'] = df['Close'].rolling(window=7).mean()
        df['MA21'] = df['Close'].rolling(window=21).mean()
        df['RSI'] = self.calculate_rsi(df['Close'])
        df = df.dropna()
        
        # Prepare features and target
        features = ['Open', 'High', 'Low', 'Volume', 'MA7', 'MA21', 'RSI']
        X = df[features]
        y = df['Close']
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        return X_scaled, y
        
    def calculate_rsi(self, prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    def train(self, X, y):
        self.model.fit(X, y)
        
    def predict(self, X):
        return self.model.predict(X)

    @staticmethod
    def load_stock_data(category, symbol=None):
        base_path = r"C:\Users\Dell\Desktop\stock-prediction-app\Dataset"
        category_path = os.path.join(base_path, category)
        
        if symbol:
            file_path = os.path.join(category_path, f"{symbol}.csv")
            if os.path.exists(file_path):
                return pd.read_csv(file_path)
            return None
        
        # Return list of available stocks if no symbol provided
        stock_files = glob.glob(os.path.join(category_path, "*.csv"))
        return [os.path.splitext(os.path.basename(f))[0] for f in stock_files]
