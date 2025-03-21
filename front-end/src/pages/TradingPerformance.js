import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import '../style/TradingPerformance.css';

const TradingPerformance = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/trading-performance');
        setPerformanceData(response.data);
        
        // 預設選擇最後一個日期
        if (response.data.account_value.length > 0) {
          setSelectedDate(response.data.account_value[response.data.account_value.length - 1].date);
        }
        
        setLoading(false);
      } catch (err) {
        setError('獲取數據失敗');
        setLoading(false);
        console.error('獲取數據錯誤:', err);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div className="trading-performance-loading">數據加載中...</div>;
  if (error) return <div className="trading-performance-error">{error}</div>;
  if (!performanceData) return <div className="trading-performance-error">無法獲取數據</div>;
  
  // 處理日期選擇變更
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  // 獲取所選日期的交易動作
  const getSelectedDateActions = () => {
    const actionData = performanceData.actions.find(item => item.date === selectedDate);
    if (!actionData) return [];
    
    const result = [];
    for (const [stock, action] of Object.entries(actionData)) {
      if (stock !== 'date' && action !== 0) {
        result.push({
          stock,
          action: Number(action)
        });
      }
    }
    return result;
  };
  
  // 獲取當前選擇日期的累積收益率
  const getCurrentReturn = () => {
    const data = performanceData.account_value.find(item => item.date === selectedDate);
    return data ? (data.cumulative_return * 100).toFixed(2) : '0.00';
  };
  
  return (
    <div className="trading-performance-container">
      <h1>交易表現與累積回報</h1>
      
      <div className="summary-section">
        <div className="summary-card">
          <h3>累積收益率</h3>
          <p className={`return-value ${getCurrentReturn() >= 0 ? 'positive' : 'negative'}`}>
            {getCurrentReturn()}%
          </p>
        </div>
      </div>
      
      <div className="chart-container">
        <h2>帳戶價值變化</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={performanceData.account_value}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => new Intl.NumberFormat('zh-TW').format(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="account_value" 
              stroke="#8884d8" 
              name="帳戶價值" 
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h2>累積收益率變化</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={performanceData.account_value}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(2)}%`} />
            <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cumulative_return" 
              stroke="#82ca9d" 
              name="累積收益率" 
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="actions-section">
        <h2>交易操作</h2>
        <div className="date-selector">
          <label>選擇日期：</label>
          <select value={selectedDate || ''} onChange={handleDateChange}>
            {performanceData.account_value.map(item => (
              <option key={item.date} value={item.date}>{item.date}</option>
            ))}
          </select>
        </div>
        
        <div className="actions-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getSelectedDateActions()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stock" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="action" name="交易量">
                {getSelectedDateActions().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.action > 0 ? '#82ca9d' : '#ff8042'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="actions-table">
          <h3>當日交易明細 ({selectedDate})</h3>
          <table>
            <thead>
              <tr>
                <th>股票代碼</th>
                <th>交易動作</th>
              </tr>
            </thead>
            <tbody>
              {getSelectedDateActions().map(action => (
                <tr key={action.stock}>
                  <td>{action.stock}</td>
                  <td className={action.action > 0 ? 'buy' : 'sell'}>
                    {action.action > 0 ? `買入 ${action.action}` : `賣出 ${Math.abs(action.action)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingPerformance;