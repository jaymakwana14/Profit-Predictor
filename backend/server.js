// Load environment variables from .env file
try {
    require('dotenv').config();
} catch (error) {
    // Silently continue if no .env file
}

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Cache configuration
const CACHE_DURATION = 1000; // 1 second cache for more frequent updates
let dataCache = {
    nifty50: { data: null, timestamp: 0 },
    bankNifty: { data: null, timestamp: 0 },
    cookies: { value: null, timestamp: 0 }
};

// NSE API endpoints
const NSE_BASE_URL = 'https://www.nseindia.com/api';

// Headers and cookies management
let HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nseindia.com/get-quotes/equity?symbol=SBIN',
    'Host': 'www.nseindia.com',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
};

// Axios instance with optimized timeout
const axiosInstance = axios.create({
    timeout: 15000, // 15 seconds timeout
    headers: HEADERS,
    withCredentials: true
});

// Cookie management with caching
const getCookies = async (retries = 2) => {
    const now = Date.now();
    if (dataCache.cookies.value && (now - dataCache.cookies.timestamp) < CACHE_DURATION) {
        HEADERS.Cookie = dataCache.cookies.value;
        return true;
    }

    for (let i = 0; i < retries; i++) {
        try {
            // First visit the main page
            const mainResponse = await axiosInstance.get('https://www.nseindia.com/', {
                headers: {
                    ...HEADERS,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                }
            });

            // Then visit a quote page
            await new Promise(resolve => setTimeout(resolve, 1000));
            const quoteResponse = await axiosInstance.get('https://www.nseindia.com/get-quotes/equity?symbol=SBIN', {
                headers: {
                    ...HEADERS,
                    Cookie: mainResponse.headers['set-cookie']?.join('; ') || ''
                }
            });

            const cookies = quoteResponse.headers['set-cookie'];
            if (cookies) {
                const cookieString = cookies.join('; ');
                HEADERS.Cookie = cookieString;
                dataCache.cookies = { value: cookieString, timestamp: now };
                console.log('Cookies refreshed successfully');
                return true;
            }
        } catch (error) {
            console.error('Cookie fetch error:', error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    return false;
};

// Optimized NSE request function
const makeNSERequest = async (url, cacheKey, maxRetries = 2) => {
    const now = Date.now();
    if (dataCache[cacheKey]?.data && (now - dataCache[cacheKey].timestamp) < CACHE_DURATION) {
        return dataCache[cacheKey].data;
    }

    for (let i = 0; i < maxRetries; i++) {
        try {
            await getCookies();
            
            // Add a delay between requests
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const response = await axiosInstance.get(url, {
                headers: {
                    ...HEADERS,
                    'Referer': 'https://www.nseindia.com/get-quotes/equity?symbol=SBIN'
                }
            });

            if (response.data) {
                dataCache[cacheKey] = { data: response.data, timestamp: now };
                return response.data;
            }
        } catch (error) {
            console.error(`NSE request error (attempt ${i + 1}/${maxRetries}):`, error.message);
            if (i === maxRetries - 1) throw error;
            
            // Clear cookies on error and wait longer
            dataCache.cookies = { value: null, timestamp: 0 };
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    throw new Error('Failed to fetch data after retries');
};

// Utility function to make NSE requests with retries
const makeNSERequestOld = async (url, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axiosInstance.get(url, { headers: HEADERS });
            return response.data;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            await getCookies();
        }
    }
};

// Process stock data
const processStockData = (data) => {
    if (!data || !data.data || !Array.isArray(data.data)) {
        return [];
    }

    return data.data.map(stock => ({
        symbol: stock.symbol || '',
        identifier: stock.identifier || '',
        lastPrice: stock.lastPrice || 0,
        change: stock.change || 0,
        pChange: stock.pChange || 0,
        open: stock.open || 0,
        dayHigh: stock.dayHigh || 0,
        dayLow: stock.dayLow || 0,
        previousClose: stock.previousClose || 0,
        totalTradedVolume: stock.totalTradedVolume || 0,
        totalTradedValue: stock.totalTradedValue || 0,
        yearHigh: stock.yearHigh || 0,
        yearLow: stock.yearLow || 0,
        perChange365d: stock.perChange365d || 0,
        perChange30d: stock.perChange30d || 0,
        lastUpdateTime: stock.lastUpdateTime || new Date().toLocaleString()
    }));
};

// Function to check market status
const getMarketStatus = () => {
    const now = new Date();
    const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const day = indiaTime.getDay();
    const hours = indiaTime.getHours();
    const minutes = indiaTime.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Check if it's a weekday (Monday-Friday)
    if (day >= 1 && day <= 5) {
        // Pre-market: 9:00 AM - 9:15 AM
        if (currentTime >= 900 && currentTime < 915) {
            return { status: 'pre-market', message: 'Pre-market Session' };
        }
        // Regular market hours: 9:15 AM - 3:30 PM
        else if (currentTime >= 915 && currentTime < 1530) {
            return { status: 'open', message: 'Market Open' };
        }
        // Post-market: 3:30 PM - 4:00 PM
        else if (currentTime >= 1530 && currentTime < 1600) {
            return { status: 'post-market', message: 'Post-market Session' };
        }
    }
    
    // Market is closed
    if (day === 0 || day === 6) {
        return { status: 'closed', message: 'Weekend - Market Closed' };
    }
    return { status: 'closed', message: 'Market Closed' };
};

// Proxy endpoint for NIFTY 50 data
app.get('/api/nifty50', async (req, res) => {
    try {
        const data = await makeNSERequest('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050', 'nifty50');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from NSE' });
    }
});

// API endpoints
app.get('/api/nifty', async (req, res) => {
    try {
        const data = await makeNSERequest('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500', 'nifty');
        const processedData = data ? processStockData(data) : [];
        res.json(processedData);
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/banknifty', async (req, res) => {
    try {
        // Get fresh cookies before fetching BANK NIFTY data
        await getCookies();
        
        const data = await makeNSERequest('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20BANK', 'bankNifty');
        const processedData = data ? processStockData(data) : [];
        res.json(processedData);
    } catch (error) {
        res.json([]);
    }
});

// Proxy endpoint for Bank Nifty stocks
app.get('/api/banknifty-stocks', async (req, res) => {
    try {
        // Fetch Bank Nifty constituent stocks
        const bankNiftyResponse = await makeNSERequest('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20BANK', 'bankNifty');
        
        const bankNiftyStocks = bankNiftyResponse.data.map(stock => ({
            symbol: stock.symbol,
            open: stock.open,
            high: stock.dayHigh,
            low: stock.dayLow,
            preClose: stock.previousClose,
            lastPrice: stock.lastPrice,
            change: stock.change,
            pChange: stock.pChange,
            volume: stock.totalTradedVolume,
            indices: ['NIFTY BANK']
        }));

        res.json(bankNiftyStocks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Bank Nifty stocks' });
    }
});

// Proxy endpoint for stock details
app.get('/api/stock/:symbol', async (req, res) => {
    try {
        console.log('Fetching stock details for:', req.params.symbol);
        
        // First get the quote data
        const quoteResponse = await makeNSERequestOld(`https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(req.params.symbol)}`);
        console.log('Quote Response:', JSON.stringify(quoteResponse, null, 2));
        
        // Then get the trade info data which has more detailed volume information
        const tradeInfoResponse = await makeNSERequestOld(`https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(req.params.symbol)}&section=trade_info`);
        console.log('Trade Info Response:', JSON.stringify(tradeInfoResponse, null, 2));
        
        // Combine the data
        const combinedData = {
            ...quoteResponse,
            tradeInfo: tradeInfoResponse
        };

        console.log('Combined Data Structure:', {
            lastPrice: combinedData.priceInfo?.lastPrice,
            high52: combinedData.priceInfo?.high52,
            low52: combinedData.priceInfo?.low52
        });

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching stock details:', error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

// Proxy endpoint for historical data
app.get('/api/historical/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;
        await getCookies(); // Get fresh cookies before making the request
        const response = await makeNSERequest(
            `https://www.nseindia.com/api/historical/cm/equity?symbol=${encodeURIComponent(symbol)}`,
            `historical_${symbol}`
        );
        
        if (!response || !response.data) {
            throw new Error('No data received from NSE');
        }

        // Transform the data for candlestick chart
        const historicalData = response.data.map(item => ({
            date: item.CH_TIMESTAMP,
            open: parseFloat(item.CH_OPENING_PRICE),
            high: parseFloat(item.CH_TRADE_HIGH_PRICE),
            low: parseFloat(item.CH_TRADE_LOW_PRICE),
            close: parseFloat(item.CH_CLOSING_PRICE)
        }));
        
        res.json(historicalData);
    } catch (error) {
        console.error('Historical data error:', error.message);
        res.status(500).json({ error: 'Failed to fetch historical data from NSE' });
    }
});

// Get index data
app.get('/api/indices', async (req, res) => {
    const startTime = Date.now();
    try {
        const marketStatus = getMarketStatus();
        const cookieSuccess = await getCookies();
        
        if (!cookieSuccess) {
            throw new Error('Failed to get NSE cookies');
        }

        // Add jitter to prevent exact synchronization of requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

        const [nifty50Data, bankNiftyData] = await Promise.all([
            makeNSERequest(
                'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050',
                'nifty50'
            ).catch(error => {
                console.error('Nifty50 fetch error:', error.message);
                return null;
            }),
            makeNSERequest(
                'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20BANK',
                'bankNifty'
            ).catch(error => {
                console.error('BankNifty fetch error:', error.message);
                return null;
            })
        ]);

        // Use cached data if API request fails
        const nifty50Response = nifty50Data?.data?.[0] || dataCache.nifty50?.data || {
            symbol: 'NIFTY 50',
            lastPrice: 0,
            change: 0,
            pChange: 0,
            open: 0,
            dayHigh: 0,
            dayLow: 0,
            previousClose: 0,
            yearHigh: 0,
            yearLow: 0,
            totalTradedVolume: 0,
            totalTradedValue: 0,
            previousDayVolume: 0,
            lowerCircuit: 0,
            upperCircuit: 0,
            lastUpdateTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        };

        const bankNiftyResponse = bankNiftyData?.data?.[0] || dataCache.bankNifty?.data || {
            symbol: 'NIFTY BANK',
            lastPrice: 0,
            change: 0,
            pChange: 0,
            open: 0,
            dayHigh: 0,
            dayLow: 0,
            previousClose: 0,
            yearHigh: 0,
            yearLow: 0,
            totalTradedVolume: 0,
            totalTradedValue: 0,
            previousDayVolume: 0,
            lowerCircuit: 0,
            upperCircuit: 0,
            lastUpdateTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        };

        // Update cache with latest data
        if (nifty50Data?.data?.[0]) {
            dataCache.nifty50.data = nifty50Data.data[0];
        }
        if (bankNiftyData?.data?.[0]) {
            dataCache.bankNifty.data = bankNiftyData.data[0];
        }

        const response = {
            marketStatus,
            nifty50: nifty50Response,
            bankNifty: bankNiftyResponse,
            performance: {
                fetchTime: `${Date.now() - startTime}ms`,
                cached: dataCache.nifty50?.timestamp > startTime
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Indices API error:', {
            message: error.message,
            stack: error.stack,
            cookies: HEADERS.Cookie ? 'Present' : 'Missing'
        });

        // Return cached data on error
        res.json({
            marketStatus: { status: 'open', message: 'Market Open' },
            nifty50: dataCache.nifty50?.data || {
                symbol: 'NIFTY 50',
                lastUpdateTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
            },
            bankNifty: dataCache.bankNifty?.data || {
                symbol: 'NIFTY BANK',
                lastUpdateTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
            },
            performance: {
                fetchTime: `${Date.now() - startTime}ms`,
                cached: true,
                error: error.message
            }
        });
    }
});

// Function to generate SVG logo for a stock
function generateStockLogoSVG(symbol) {
    // Get first two characters from the symbol
    const chars = symbol.slice(0, 2).toUpperCase();
    
    // Generate a consistent color based on the symbol
    const hue = (symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
    const backgroundColor = `hsl(${hue}, 60%, 45%)`;
    
    // Create SVG with the characters
    const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${backgroundColor}" rx="30"/>
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
              fill="white" text-anchor="middle">${chars}</text>
    </svg>`;
    
    // Convert SVG to base64 for URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

// Stock logo cache
const logoCache = new Map();

// Function to fetch stock logo
async function getStockLogo(symbol) {
    try {
        // Remove any indices from symbol (like .NS)
        const cleanSymbol = symbol.split('.')[0];
        
        // Check cache first
        if (logoCache.has(cleanSymbol)) {
            return logoCache.get(cleanSymbol);
        }

        // Add .NS to make it match the API response format
        const searchSymbol = `${cleanSymbol}.NS`;
        
        const response = await axios.get(`https://api.api-ninjas.com/v1/logo?ticker=${encodeURIComponent(searchSymbol)}`, {
            headers: {
                'X-Api-Key': 'oFjjwHB+0UDpzV6WSkhUlg==lp0IYblgEGDn6JHi',
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.length > 0 && response.data[0].image) {
            const logoUrl = response.data[0].image;
            logoCache.set(cleanSymbol, logoUrl);
            return logoUrl;
        }

        // If no logo found with ticker, try searching by company name
        const nameResponse = await axios.get(`https://api.api-ninjas.com/v1/logo?name=${encodeURIComponent(cleanSymbol)}`, {
            headers: {
                'X-Api-Key': 'oFjjwHB+0UDpzV6WSkhUlg==lp0IYblgEGDn6JHi',
                'Content-Type': 'application/json'
            }
        });

        if (nameResponse.data && nameResponse.data.length > 0 && nameResponse.data[0].image) {
            const logoUrl = nameResponse.data[0].image;
            logoCache.set(cleanSymbol, logoUrl);
            return logoUrl;
        }
        
        // If no logo found, generate an SVG logo
        const svgLogo = generateStockLogoSVG(cleanSymbol);
        logoCache.set(cleanSymbol, svgLogo);
        return svgLogo;
    } catch (error) {
        console.error(`Error fetching logo for ${symbol}:`, error.message);
        // On error, generate and return an SVG logo
        const svgLogo = generateStockLogoSVG(symbol.split('.')[0]);
        logoCache.set(symbol.split('.')[0], svgLogo);
        return svgLogo;
    }
}

// Endpoint to get stock logo
app.get('/api/stock/logo/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const logoUrl = await getStockLogo(symbol);
        
        if (!logoUrl) {
            return res.status(404).json({ error: 'Logo not found' });
        }
        
        res.json({ url: logoUrl });
    } catch (error) {
        console.error('Error in logo endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch logo' });
    }
});

// Test endpoint for Vercel deployment
app.get('/', (req, res) => {
    res.json({ message: 'Hello from Vercel Server!' });
});

// Export the Express app
module.exports = app;