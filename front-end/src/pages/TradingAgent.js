import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Bar, ReferenceLine
} from 'recharts';
import { stockNames } from '../data/stockNames';
import { stockIndustries } from '../data/stockIndustries';
import { industryColors } from '../data/industryColors';
import '../style/TradingAgent.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const API_URL = process.env.REACT_APP_API_URL;
const TradingAgent = () => {
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStockName, setShowStockName] = useState(false);
  const [dateRange, setDateRange] = useState([0, 100]); // 百分比值
  const [allDates, setAllDates] = useState([]); // 存儲所有可用日期
  const [activeTab, setActiveTab] = useState('agent'); // Default to agent tab
  
  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'strategy') {
      navigate('/trading-strategy');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/trading-performance`);
        setPerformanceData(response.data);
        // 設置所有可用日期
        const dates = response.data.account_value.map(item => item.date);
        setAllDates(dates);
        setDateRange([0, 100]); // 初始顯示全部範圍
        setLoading(false);
      } catch (err) {
        setError('獲取數據失敗');
        setLoading(false);
        console.error('獲取數據錯誤:', err);
      }
    };
    
    fetchData();
  }, []);
  
  // 獲取股票顯示名稱
  const getStockDisplayName = (stockCode) => {
    if (showStockName) {
      // 從股票代號中移除 '.TW' 後綴
      const code = stockCode.replace('.TW', '');
      return stockNames[`${code}.TW`] || code;
    }
    return stockCode;
  };

  // 獲取股票的產業顏色
  const getStockColor = (stockCode) => {
    const industry = stockIndustries[stockCode + '.TW'];
    return industry ? industryColors[industry] : '#666';
  };

  // 產業分類標籤
  const renderIndustryLabels = () => {
    if (!performanceData) return null;
    
    // 獲取所有出現的股票的產業
    const industries = new Set();
    performanceData.stocks.forEach(stock => {
      const stockCode = stock + '.TW';
      const industry = stockIndustries[stockCode];
      if (industry) industries.add(industry);
    });

    return Array.from(industries).map(industry => (
      <span 
        key={industry} 
        className={`industry-label industry-${industry.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {industry} ({
          performanceData.stocks.filter(stock => 
            stockIndustries[stock + '.TW'] === industry
          ).length
        })
      </span>
    ));
  };

  // 準備圖表數據
  const prepareChartData = () => {
    if (!performanceData) return [];
    
    // 合併帳戶價值和交易行為數據
    return performanceData.account_value.map(dayValue => {
      const dayActions = performanceData.actions.find(a => a.date === dayValue.date) || {};
      
      // 創建包含所有數據的對象
      const dayData = {
        date: dayValue.date,
        cumulative_return: dayValue.cumulative_return
      };
      
      // 公司視圖：按交易量排序股票
      const buyStocks = [];
      const sellStocks = [];
      
      // 分類買入和賣出股票
      performanceData.stocks.forEach(stock => {
        const action = dayActions[stock] || 0;
        if (action > 0) {
          buyStocks.push({ stock, action });
        } else if (action < 0) {
          sellStocks.push({ stock, action });
        }
      });
      
      // 按交易量絕對值排序（大的在前）
      buyStocks.sort((a, b) => Math.abs(b.action) - Math.abs(a.action));
      sellStocks.sort((a, b) => Math.abs(b.action) - Math.abs(a.action));
      
      // 添加排序後的買入股票
      buyStocks.forEach((item, index) => {
        dayData[`buy_${index}_${item.stock}`] = item.action;
      });
      
      // 添加排序後的賣出股票
      sellStocks.forEach((item, index) => {
        dayData[`sell_${index}_${item.stock}`] = item.action;
      });
      
      return dayData;
    });
  };

  // 獲取圖表的Bar組件
  const renderBars = () => {
    if (!chartData || chartData.length === 0) return null;
    
    // 找出所有買入和賣出的鍵
    const buyKeys = new Set();
    const sellKeys = new Set();
    
    chartData.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key.startsWith('buy_')) buyKeys.add(key);
        if (key.startsWith('sell_')) sellKeys.add(key);
      });
    });
    
    // 渲染買入和賣出的Bar
    return [
      // 買入Bar
      ...Array.from(buyKeys).map(key => {
        const stockCode = key.split('_')[2];
        return (
          <Bar
            key={key}
            yAxisId="left"
            dataKey={key}
            name={getStockDisplayName(stockCode)}
            fill={getStockColor(stockCode)}
            opacity={0.6}
            stackId="positive"
          />
        );
      }),
      // 賣出Bar
      ...Array.from(sellKeys).map(key => {
        const stockCode = key.split('_')[2];
        return (
          <Bar
            key={key}
            yAxisId="left"
            dataKey={key}
            name={getStockDisplayName(stockCode)}
            fill={getStockColor(stockCode)}
            opacity={0.6}
            stackId="negative"
          />
        );
      })
    ];
  };

  // 自定義Tooltip內容
  const renderTooltip = ({ payload, label, active }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    // 過濾掉交易量為0的項目
    const filteredPayload = payload.filter(entry => 
      entry.name !== "累積報酬率" && entry.value !== 0 && entry.value !== null
    );
    
    // 獲取累積報酬率
    const returnEntry = payload.find(p => p.name === "累積報酬率");
    
    // 按公司分組
    const groupedItems = {};
    
    filteredPayload.forEach(entry => {
      let name;
      let value = entry.value;
      
      // 從key中提取股票代碼
      const parts = entry.dataKey.split('_');
      name = getStockDisplayName(parts[2]);
      
      // 合併同名項目
      if (groupedItems[name]) {
        groupedItems[name].value += value;
        groupedItems[name].color = entry.color;
      } else {
        groupedItems[name] = { value, color: entry.color };
      }
    });
    
    return (
      <div className="custom-tooltip">
        <p>{`日期: ${label}`}</p>
        {returnEntry && (
          <p>{`累積報酬率: ${(returnEntry.value * 100).toFixed(2)}%`}</p>
        )}
        {Object.entries(groupedItems)
          .sort(([, a], [, b]) => Math.abs(b.value) - Math.abs(a.value))
          .map(([name, { value, color }], index) => (
            <p key={index} className="tooltip-item" data-color={color}>
              {name}: {value}
            </p>
          ))
        }
      </div>
    );
  };

  // 處理日期範圍變化
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // 根據日期範圍過濾數據
  const getFilteredChartData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    const startIndex = Math.floor(chartData.length * dateRange[0] / 100);
    const endIndex = Math.ceil(chartData.length * dateRange[1] / 100);
    
    return chartData.slice(startIndex, endIndex);
  };

  // 格式化日期顯示
  const formatDate = (date) => {
    return date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$2');
  };

  // 修改表格渲染函數，新增累積報酬率欄位
  const renderDailyTable = () => {
    if (!performanceData) return null;

    const filteredData = getFilteredChartData();
    
    return (
      <div className="daily-table">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>資產總值</th>
              <th>當日報酬率</th>
              <th>累積報酬率</th>
              <th>交易行為</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(day => {
              // 找出當天的交易行為
              const trades = [];
              Object.entries(day).forEach(([key, value]) => {
                if ((key.startsWith('buy_') || key.startsWith('sell_')) && value !== 0) {
                  const [action, , stock] = key.split('_');
                  trades.push({
                    action: action === 'buy' ? '買入' : '賣出',
                    stock: showStockName ? getStockDisplayName(stock) : stock,
                    value: Math.abs(value)
                  });
                }
              });

              // 找出對應的資產價值
              const accountValue = performanceData.account_value.find(av => av.date === day.date);

              return (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{accountValue ? accountValue.account_value.toLocaleString() : '-'}</td>
                  <td className={accountValue?.daily_return > 0 ? 'positive' : 'negative'}>
                    {accountValue ? `${(accountValue.daily_return * 100).toFixed(2)}%` : '-'}
                  </td>
                  <td className={day.cumulative_return > 0 ? 'positive' : 'negative'}>
                    {`${(day.cumulative_return * 100).toFixed(2)}%`}
                  </td>
                  <td>
                    {trades.length > 0 ? (
                      <div className="trades-list">
                        {trades.map((trade, index) => (
                          <span 
                            key={index} 
                            className={trade.action === '買入' ? 'buy' : 'sell'}
                          >
                            {`${trade.action} ${trade.stock}(${trade.value})`}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div className="trading-performance-loading">數據加載中...</div>;
  if (error) return <div className="trading-performance-error">{error}</div>;
  if (!performanceData) return <div className="trading-performance-error">無法獲取數據</div>;
  
  const chartData = prepareChartData();
  
  return (
    <div className="trading-agent-container">
      {/* Navigation tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Trading Agent</h1>
        <div style={{
          display: 'flex',
          gap: '10px',
          backgroundColor: '#fff',
          padding: '4px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => handleTabChange('strategy')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === 'strategy' ? '#1890ff' : 'transparent',
              color: activeTab === 'strategy' ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.3s'
            }}
          >
            Stock-Picked Agent
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeTab === 'agent' ? '#1890ff' : 'transparent',
              color: activeTab === 'agent' ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.3s'
            }}
          >
            Trading Agent
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2>Trading Agent Performance</h2>
        
        {/* Add controls for date range and display options */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ marginRight: '10px' }}>
              <input 
                type="checkbox" 
                checked={showStockName} 
                onChange={(e) => setShowStockName(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Show Stock Names
            </label>
          </div>
        </div>
        
        {/* Industry labels */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Industries</h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px' 
          }}>
            {renderIndustryLabels()}
          </div>
        </div>
        
        {/* Daily performance table */}
        <div>
          <h3>Daily Performance</h3>
          {renderDailyTable()}
      <div className="chart-container">
        <div className="chart-header">
          <h2>交易行為與累積報酬率</h2>
          <div className="display-controls">
            <div className="display-toggle">
              <div className="view-mode-toggle">
                <label>
                  <input
                    type="radio"
                    name="displayMode"
                    value="code"
                    checked={!showStockName}
                    onChange={() => setShowStockName(false)}
                  />
                  顯示股票代號
                </label>
                <label>
                  <input
                    type="radio"
                    name="displayMode"
                    value="name"
                    checked={showStockName}
                    onChange={() => setShowStockName(true)}
                  />
                  顯示公司名稱
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* 新增表格 */}
        {renderDailyTable()}
        
        <div className="industry-labels">
          {renderIndustryLabels()}
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={getFilteredChartData()}
            margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
          >
            <ReferenceLine 
              y={0} 
              yAxisId="left"
              stroke="#666"
              strokeWidth={2}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              label={{ 
                value: '日期', 
                position: 'insideBottom',
                offset: -5
              }}
            />
            <YAxis 
              yAxisId="left"
              label={{ 
                value: '交易量/張', 
                position: 'top',
                offset: 20,
                className: 'axis-label'
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
              label={{ 
                value: '累積報酬率', 
                position: 'top',
                offset: 20,
                className: 'axis-label'
              }}
              domain={[-0.03, 0.03]}
            />
            <Tooltip content={renderTooltip} />
            <Legend 
              verticalAlign="bottom"
              margin={{ top:20 }}
              formatter={(value) => {
                if (!value) return '';  // 處理未定義的值
                if (value === "累積報酬率") return value;
                
                // 從 Bar 的 dataKey 中提取股票代碼
                if (!value.includes('_')) {
                  return getStockDisplayName(value);  // 使用 getStockDisplayName 來處理顯示
                }
                // 如果是 dataKey（來自 Bar）
                const stockCode = value.split('_')[2];
                return stockCode ? getStockDisplayName(stockCode) : value;
              }}
              // 自定義圖例項目
              payload={[
                // 添加累積報酬率
                {
                  value: "累積報酬率",
                  type: "line",
                  color: "#8884d8"
                },
                // 只顯示有交易的股票
                ...Array.from(new Set(
                  performanceData.stocks
                    .filter(stock => {
                      return performanceData.actions.some(day => {
                        const action = day[stock];
                        return action !== 0 && action !== undefined;
                      });
                    })
                )).map(stockCode => ({
                  value: stockCode,  // 保持原始股票代碼
                  type: "rect",
                  color: getStockColor(stockCode)
                }))
              ]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cumulative_return" 
              stroke="#8884d8"
              name="累積報酬率"
              dot={{ r: 3 }}
            />
            
            {renderBars()}
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="date-range-slider">
          <div className="date-range-labels">
            <span>{allDates[Math.floor(allDates.length * dateRange[0] / 100)]}</span>
            <span>{allDates[Math.ceil(allDates.length * dateRange[1] / 100) - 1]}</span>
          </div>
          <Slider
            range
            value={dateRange}
            onChange={handleDateRangeChange}
            className="date-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default TradingAgent; 