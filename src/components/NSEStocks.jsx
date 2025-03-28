import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const NSEStocks = () => {
  const [nseData, setNseData] = useState({
    nifty50: { last: 0, change: 0, change_percent: 0 },
    nifty_bank: { last: 0, change: 0, change_percent: 0 },
    stocks: [],
    top_gainers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNSEData = async () => {
      try {
        const [niftyResponse, indicesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/nifty`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/indices`)
        ]);
        
        setNseData({
          ...nseData,
          nifty50: niftyResponse.data,
          stocks: indicesResponse.data
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NSE data:', error);
        setLoading(false);
      }
    };

    fetchNSEData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchNSEData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const IndexCard = ({ title, data }) => (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mt: 1 }}>
          {formatNumber(data.last)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {data.change >= 0 ? (
            <TrendingUp color="success" />
          ) : (
            <TrendingDown color="error" />
          )}
          <Typography
            variant="body1"
            color={data.change >= 0 ? 'success.main' : 'error.main'}
            sx={{ ml: 1 }}
          >
            {data.change.toFixed(2)} ({data.change_percent.toFixed(2)}%)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <IndexCard title="Nifty 50" data={nseData.nifty50} />
        </Grid>
        <Grid item xs={12} md={6}>
          <IndexCard title="Bank Nifty" data={nseData.nifty_bank} />
        </Grid>
      </Grid>

      {/* Top Gainers */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Top Gainers
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>LTP</TableCell>
              <TableCell>Change</TableCell>
              <TableCell>% Change</TableCell>
              <TableCell>Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nseData.top_gainers.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{formatNumber(stock.lastPrice)}</TableCell>
                <TableCell sx={{ color: 'success.main' }}>
                  +{formatNumber(stock.change)}
                </TableCell>
                <TableCell sx={{ color: 'success.main' }}>
                  +{stock.pChange.toFixed(2)}%
                </TableCell>
                <TableCell>{formatNumber(stock.totalTradedVolume)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* All NSE Stocks */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        NSE 500 Stocks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Open</TableCell>
              <TableCell>High</TableCell>
              <TableCell>Low</TableCell>
              <TableCell>LTP</TableCell>
              <TableCell>Change</TableCell>
              <TableCell>Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nseData.stocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{formatNumber(stock.open)}</TableCell>
                <TableCell>{formatNumber(stock.dayHigh)}</TableCell>
                <TableCell>{formatNumber(stock.dayLow)}</TableCell>
                <TableCell>{formatNumber(stock.lastPrice)}</TableCell>
                <TableCell
                  sx={{
                    color: stock.change >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {formatNumber(stock.change)} ({stock.pChange.toFixed(2)}%)
                </TableCell>
                <TableCell>{formatNumber(stock.totalTradedVolume)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NSEStocks;
