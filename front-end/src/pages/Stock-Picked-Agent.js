import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { styled } from '@mui/material/styles';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { stockNames } from '../data/stockNames';

const API_URL = process.env.REACT_APP_API_URL;

// 自定義樣式
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
  },
}));

const StockPickedAgent = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(0); // 0: 表格視圖, 1: 歷史視圖

  // 添加輔助函數
  const getFullStockCode = (code) => `${code}.TW`;
  const getCompanyName = (code) => {
    const fullCode = code.endsWith('.TW') ? code : `${code}.TW`;
    return stockNames[fullCode] || code;
  };

  useEffect(() => {
    fetch(`${API_URL}/quarterly-predictions`)
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true });
        setData(parsed.data);

        const allQuarters = Array.from(new Set(parsed.data.map(row => row.quarter)))
          .filter(q => q)
          .sort((a, b) => b.localeCompare(a));
        setQuarters(allQuarters);

        if (allQuarters.length > 0) setSelectedQuarter(allQuarters[0]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const stocks = data.filter(row => row.quarter === selectedQuarter);
  const allStocks = Array.from(new Set(data.map(row => row.stock_code))).sort();

  // 準備歷史數據
  const prepareHistoryData = () => {
    if (!selectedStock) return [];
    const selectedStockFull = selectedStock.endsWith('.TW') ? selectedStock : `${selectedStock}.TW`;
    return quarters.map(quarter => {
      const record = data.find(row => row.stock_code === selectedStockFull && row.quarter === quarter);
      return {
        quarter,
        value: record ? parseFloat(record.action_value) : 0
      };
    });
  };

  const stockHistory = prepareHistoryData();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          選股代理人評估結果
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
            <Tab label="當季評估" />
            <Tab label="歷史評估" />
          </Tabs>
        </Box>

        {viewMode === 0 ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarMonthIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">評估期間</Typography>
                </Box>
                <FormControl fullWidth>
                  <InputLabel>選擇季度</InputLabel>
                  <Select
                    value={selectedQuarter}
                    label="選擇季度"
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                  >
                    {quarters.map((q) => (
                      <MenuItem key={q} value={q}>{q}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                {selectedQuarter} 評估結果
              </Typography>
              <Grid container spacing={2}>
                {stocks.map((row, idx) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                    <Card 
                      sx={{ 
                        p: 1,
                        backgroundColor: parseFloat(row.action_value) > 0 
                          ? 'rgba(76, 175, 80, 0.1)' 
                          : 'rgba(244, 67, 54, 0.1)',
                        height: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <Chip
                        label={`${row.stock_code} - ${getCompanyName(row.stock_code)}`}
                        color={parseFloat(row.action_value) > 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={parseFloat(row.action_value) > 0 ? '已選擇' : '未選擇'}
                        color={parseFloat(row.action_value) > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </>
        ) : (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarMonthIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">選擇股票</Typography>
                </Box>
                <FormControl fullWidth>
                  <InputLabel>選擇股票代碼</InputLabel>
                  <Select
                    value={selectedStock}
                    label="選擇股票代碼"
                    onChange={(e) => setSelectedStock(e.target.value)}
                  >
                    {Object.keys(stockNames).map(code => {
                      const stockCode = code.replace('.TW', '');
                      return (
                        <MenuItem key={stockCode} value={stockCode}>
                          {`${stockCode} - ${getCompanyName(stockCode)}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                歷史評估結果
              </Typography>
              {selectedStock ? (
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stockHistory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barSize={40}
                    >
                      <XAxis 
                        dataKey="quarter" 
                        type="category"
                        interval={0}
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        hide={true}
                      />
                      <Tooltip 
                        formatter={(value) => value === 1 ? '已選擇' : '未選擇'}
                        labelFormatter={(label) => `${selectedStock} - ${getCompanyName(selectedStock)} - ${label}`}
                      />
                      <Bar dataKey="value">
                        {stockHistory.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.value === 1 ? theme.palette.success.main : theme.palette.error.main}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    請選擇一支股票查看其歷史評估結果
                  </Typography>
                </Box>
              )}
            </StyledPaper>
          </>
        )}
      </Box>
    </Container>
  );
};

export default StockPickedAgent;
