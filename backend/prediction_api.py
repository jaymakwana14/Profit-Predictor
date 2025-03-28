from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
import pandas as pd
from models.predictor import StockPredictor
import requests
import logging
import os
from datetime import datetime, timedelta
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the prediction model
predictor = StockPredictor()

def get_nse_cookie_headers():
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        }
        
        session = requests.Session()
        response = session.get("https://www.nseindia.com/", headers=headers, timeout=5)
        if response.status_code == 200:
            cookies = response.cookies
            return {
                'headers': headers,
                'cookies': cookies
            }
    except Exception as e:
        logger.error(f"Error getting NSE cookies: {str(e)}")
    return None

def fetch_nse_data():
    try:
        # Get cookies and headers
        auth = get_nse_cookie_headers()
        if not auth:
            return None

        # Fetch Nifty 50 data
        nifty_url = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050"
        nifty_response = requests.get(nifty_url, headers=auth['headers'], cookies=auth['cookies'], timeout=5)
        nifty_data = nifty_response.json()

        # Fetch Bank Nifty data
        banknifty_url = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20BANK"
        banknifty_response = requests.get(banknifty_url, headers=auth['headers'], cookies=auth['cookies'], timeout=5)
        banknifty_data = banknifty_response.json()

        # Fetch top gainers
        gainers_url = "https://www.nseindia.com/api/live-analysis-variations?index=gainers"
        gainers_response = requests.get(gainers_url, headers=auth['headers'], cookies=auth['cookies'], timeout=5)
        gainers_data = gainers_response.json()

        # Fetch market status
        status_url = "https://www.nseindia.com/api/marketStatus"
        status_response = requests.get(status_url, headers=auth['headers'], cookies=auth['cookies'], timeout=5)
        status_data = status_response.json()

        return {
            'nifty50': nifty_data['data'][0] if nifty_data.get('data') else None,
            'nifty_bank': banknifty_data['data'][0] if banknifty_data.get('data') else None,
            'top_gainers': gainers_data.get('data', [])[:10],
            'market_status': status_data['marketState'][0]['marketStatus'] if status_data.get('marketState') else None
        }
    except Exception as e:
        logger.error(f"Error fetching NSE data: {str(e)}")
        return None

def get_stock_quote(symbol):
    try:
        # Try NSE first
        stock = yf.Ticker(f"{symbol}.NS")
        info = stock.info
        if info and 'regularMarketPrice' in info:
            return {
                'symbol': symbol,
                'price': info['regularMarketPrice'],
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0),
                'open': info.get('regularMarketOpen', 0),
                'high': info.get('regularMarketDayHigh', 0),
                'low': info.get('regularMarketDayLow', 0),
                'volume': info.get('regularMarketVolume', 0),
                'exchange': 'NSE'
            }
        
        # If NSE fails, try BSE
        stock = yf.Ticker(f"{symbol}.BO")
        info = stock.info
        if info and 'regularMarketPrice' in info:
            return {
                'symbol': symbol,
                'price': info['regularMarketPrice'],
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0),
                'open': info.get('regularMarketOpen', 0),
                'high': info.get('regularMarketDayHigh', 0),
                'low': info.get('regularMarketDayLow', 0),
                'volume': info.get('regularMarketVolume', 0),
                'exchange': 'BSE'
            }
    except Exception as e:
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
    return None

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
            
        # Get prediction
        result = predictor.predict(symbol)
        
        if result is None:
            return jsonify({'error': 'Failed to make prediction'}), 500
            
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-status')
def get_market_status():
    try:
        # Get NSE data which includes market status
        nse_data = fetch_nse_data()
        if nse_data and 'market_status' in nse_data:
            status = nse_data['market_status']
            if status == 'Open':
                return jsonify({'status': 'open', 'message': 'Market is Open'})
            elif status == 'Closed':
                return jsonify({'status': 'closed', 'message': 'Market is Closed'})
            else:
                return jsonify({'status': status.lower(), 'message': f'Market is {status}'})
        return jsonify({'status': 'unknown', 'message': 'Market status unknown'})
    except Exception as e:
        logger.error(f"Error getting market status: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Error fetching market status'})

@app.route('/api/nifty50')
def get_nifty50():
    try:
        nse_data = fetch_nse_data()
        if nse_data and 'nifty50' in nse_data:
            return jsonify(nse_data['nifty50'])
        return jsonify({'error': 'Failed to fetch Nifty 50 data'})
    except Exception as e:
        logger.error(f"Error getting Nifty 50: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/api/banknifty')
def get_banknifty():
    try:
        nse_data = fetch_nse_data()
        if nse_data and 'nifty_bank' in nse_data:
            return jsonify(nse_data['nifty_bank'])
        return jsonify({'error': 'Failed to fetch Bank Nifty data'})
    except Exception as e:
        logger.error(f"Error getting Bank Nifty: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/api/top-gainers')
def get_top_gainers():
    try:
        nse_data = fetch_nse_data()
        if nse_data and 'top_gainers' in nse_data:
            return jsonify(nse_data['top_gainers'])
        return jsonify([])
    except Exception as e:
        logger.error(f"Error getting top gainers: {str(e)}")
        return jsonify([])

@app.route('/api/stock-list')
def get_stock_list():
    try:
        # Get batch quotes for popular stocks
        return jsonify(get_batch_quotes())
    except Exception as e:
        logger.error(f"Error getting stock list: {str(e)}")
        return jsonify([])

if __name__ == '__main__':
    app.run(port=5001, debug=True)
