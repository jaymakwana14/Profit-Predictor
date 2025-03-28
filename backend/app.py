from flask import Flask, jsonify, request
from flask_cors import CORS
from models.stock_predictor import StockPredictor
import pandas as pd
import numpy as np
import os
import glob

app = Flask(__name__)
CORS(app)

predictor = StockPredictor()
DATASET_PATH = r"C:\Users\Dell\Desktop\stock-prediction-app\Dataset"

@app.route('/api/categories')
def get_categories():
    return jsonify(['BSE', 'NSE', 'Nifty50', 'Crypto', 'Forex'])

@app.route('/api/stocks/<category>')
def get_stocks(category):
    stocks = predictor.load_stock_data(category)
    return jsonify(stocks)

@app.route('/api/search-stocks/<category>/<query>')
def search_stocks(category, query):
    category_path = os.path.join(DATASET_PATH, category)
    if not os.path.exists(category_path):
        return jsonify([])
    
    query = query.lower()
    stock_files = glob.glob(os.path.join(category_path, "*.csv"))
    matching_stocks = [
        os.path.splitext(os.path.basename(f))[0]
        for f in stock_files
        if query in os.path.splitext(os.path.basename(f))[0].lower()
    ]
    return jsonify(matching_stocks[:10])  # Limit to 10 suggestions

@app.route('/api/stock-data')
def get_stock_data():
    category = request.args.get('category')
    symbol = request.args.get('symbol')
    
    df = predictor.load_stock_data(category, symbol)
    if df is None:
        return jsonify({'error': 'Stock not found'}), 404
    
    # Prepare data for prediction
    X_scaled, y = predictor.prepare_data(df)
    
    # Train model on 80% of data
    train_size = int(len(X_scaled) * 0.8)
    X_train = X_scaled[:train_size]
    y_train = y[:train_size]
    
    # Train model
    predictor.train(X_train, y_train)
    
    # Make predictions on full dataset for visualization
    predictions = predictor.predict(X_scaled)
    
    # Prepare response data
    response_data = {
        'dates': df['Date'].astype(str).tolist(),
        'actual': df['Close'].tolist(),
        'predicted': predictions.tolist()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(port=5001)
