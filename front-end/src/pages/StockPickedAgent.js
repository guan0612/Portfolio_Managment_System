import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
// Import only the components we need without CSS import
import { Select } from 'antd';
import TradingAgent from './TradingAgent';
import '../style/StockPickedAgent.css';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL;
const TradingStrategy = () => {
  const navigate = useNavigate();
  
  // ===== 圖表相關的 state =====
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // ===== 股票數據相關的 state =====
  const [stockData, setStockData] = useState([]);        // 所有股票的數據
  const [dates, setDates] = useState([]);                // 所有日期
  const [stocks, setStocks] = useState([]);              // 所有股票代碼
  const [tableData, setTableData] = useState([]);        // 表格數據
  
  // ===== 選擇相關的 state =====
  const [selectedDate, setSelectedDate] = useState(null);                // 當前選擇的日期
  const [selectedStocks, setSelectedStocks] = useState({ buy: [], sell: [] });  // 當前選擇的股票
  const [selectedLegend, setSelectedLegend] = useState({});             // 圖例選擇狀態
  const [activeTab, setActiveTab] = useState('strategy');               // 當前活動的標籤
  
  // ===== 表格相關的 state =====
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // ===== 下拉選單相關的 ref =====
  const tableWrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  
  // ===== 績效指標相關的 state =====
  const [sharpeRatios, setSharpeRatios] = useState({});           // 夏普比率
  const [sharpeRatioData, setSharpeRatioData] = useState({});    // 夏普比率數據
  const [currentQuarterStocks, setCurrentQuarterStocks] = useState({ buy: [], sell: [] });  // 當季股票

  // ===== 導航相關的處理函數 =====
  const handleTabChange = (tab) => {
    if (tab === 'agent') {
      navigate('/trading-agent');
    } else if (tab === 'strategy') {
      navigate('/stock-picked-agent');
    }
  };

  // ===== 圖表相關的處理函數 =====
  const handleChartClick = (params) => {
    console.log('Chart clicked:', params);
    // 檢查是否點擊了軸標籤
    if (params.componentType === 'xAxis') {
      const date = params.value;
      console.log('Selected date from axis:', date);
      setSelectedDate(date);
      
      // 找出該日期的股票
      const stocksForDate = stockData.reduce((acc, stock) => {
        const dataPoint = stock.data.find(d => d[0] === date);
        if (dataPoint) {
          if (dataPoint[1] === 1) {
            acc.buy.push(stock.name);
          } else if (dataPoint[1] === 0) {
            acc.sell.push(stock.name);
          }
        }
        return acc;
      }, { buy: [], sell: [] });
      
      console.log('Stocks for date:', stocksForDate);
      setSelectedStocks(stocksForDate);
    } else if (params.name) { // 處理點擊點的情況
      const date = params.name;
      setSelectedDate(date);
      
      const stocksForDate = stockData.reduce((acc, stock) => {
        const dataPoint = stock.data.find(d => d[0] === date);
        if (dataPoint) {
          if (dataPoint[1] === 1) {
            acc.buy.push(stock.name);
          } else if (dataPoint[1] === 0) {
            acc.sell.push(stock.name);
          }
        }
        return acc;
      }, { buy: [], sell: [] });
      
      setSelectedStocks(stocksForDate);
    }
  };

  const handleStockBoxClick = (stockName) => {
    const option = chartRef.current.getEchartsInstance().getOption();
    const currentZoom = option.dataZoom[0];
    
    // 切換該股票的選擇狀態
    setSelectedLegend(prev => {
      const newState = { ...prev };
      // 先將所有股票設為 false
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      // 切換點擊的股票
      newState[stockName] = true;
      return newState;
    });
    
    // 保持當前的縮放狀態
    setZoomRange({
      start: currentZoom.start,
      end: currentZoom.end
    });
  };

  // ===== 表格相關的處理函數 =====
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return; // 只在縮放時啟用拖動
    setIsDragging(true);
    const wrapper = tableWrapperRef.current;
    setStartX(e.pageX - wrapper.offsetLeft);
    setStartY(e.pageY - wrapper.offsetTop);
    setScrollLeft(wrapper.scrollLeft);
    setScrollTop(wrapper.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    e.preventDefault();
    const wrapper = tableWrapperRef.current;
    const x = e.pageX - wrapper.offsetLeft;
    const y = e.pageY - wrapper.offsetTop;
    const walkX = (x - startX);
    const walkY = (y - startY);
    wrapper.scrollLeft = scrollLeft - walkX;
    wrapper.scrollTop = scrollTop - walkY;
  };

  // ===== 股票選擇相關的處理函數 =====
  const handleStockClick = (stock) => {
    const newSelected = { ...selectedLegend };
    newSelected[stock] = !newSelected[stock];
    setSelectedLegend(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected = {};
    stocks.forEach(stock => {
      newSelected[stock] = true;
    });
    setSelectedLegend(newSelected);
  };

  const handleClearAll = () => {
    const newSelected = {};
    stocks.forEach(stock => {
      newSelected[stock] = false;
    });
    setSelectedLegend(newSelected);
  };

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          dropdownButtonRef.current && 
          !dropdownButtonRef.current.contains(event.target)) {
        dropdownRef.current.style.display = 'none';
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ===== 數據載入相關的 useEffect =====
  useEffect(() => {
    // 載入股票數據
    console.log('Fetching data from:', `${API_URL}/low-risk-stocks`);
    fetch(`${API_URL}/low-risk-stocks`)
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(csvText => {
        console.log('Received CSV data:', csvText.substring(0, 200) + '...');
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('Parsed CSV data:', results.data.slice(0, 2));
            const data = results.data;
            // 獲取日期和股票代碼
            const stockSymbols = Object.keys(data[0]).filter(key => key !== 'date');
            const dateList = data.map(row => row.date);
            
            console.log('Stock symbols:', stockSymbols);
            console.log('Date list:', dateList);
            
            // 初始化圖例選擇狀態
            const initialLegendState = stockSymbols.reduce((acc, stock) => {
              acc[stock] = false;  // 初始時所有股票都設為未選擇
              return acc;
            }, {});
            setSelectedLegend(initialLegendState);
            
            // 處理數據用於可視化
            const processedData = stockSymbols.map(stock => {
              return {
                name: stock,
                type: 'line',
                data: data.map(row => [row.date, parseInt(row[stock])]),
                symbol: 'circle',
                symbolSize: 8,
                step: 'end',
                showSymbol: true,
                connectNulls: true,
                lineStyle: {
                  width: 2,
                  type: 'solid'
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#fff'
                }
              };
            });

            console.log('Processed data sample:', processedData.slice(0, 2));
            setStockData(processedData);
            setDates(dateList);
            setStocks(stockSymbols);
            setTableData(data);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching CSV data:', error);
      });
  }, []);

  // ===== 圖表更新相關的 useEffect =====
  useEffect(() => {
    // 當選擇改變時更新圖表
    if (chartRef.current) {
      const chart = chartRef.current.getEchartsInstance();
      if (!chart) return;

      try {
        chart.setOption({
          legend: {
            selected: selectedLegend
          }
        });
      } catch (error) {
        console.warn('Chart not ready yet:', error);
      }
    }
  }, [selectedLegend]);

  // ===== 夏普比率數據載入相關的 useEffect =====
  useEffect(() => {
    fetch(`${API_URL}/sharpe-ratios`)
      .then(response => response.text())
      .then(text => {
        try {
          const cleanedText = text.replace(/NaN/g, '0');
          const data = JSON.parse(cleanedText);
          console.log('Sharpe ratio data:', data);
          
          // 處理數據格式
          const processedData = {};
          Object.entries(data).forEach(([stockId, stockData]) => {
            if (stockData && stockData.dates && stockData.values) {
              processedData[stockId] = {
                dates: stockData.dates,
                values: stockData.values.map(value => parseFloat(value) || 0)
              };
            }
          });
          
          setSharpeRatioData(processedData);
        } catch (error) {
          console.error('Error parsing Sharpe ratio data:', error);
        }
      })
      .catch(error => {
        console.error('Error fetching Sharpe ratios:', error);
      });
  }, []);

  // ===== 當季股票計算相關的 useEffect =====
  useEffect(() => {
    // 計算當季的股票
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
    
    console.log('Current quarter dates:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
    console.log('Stock data:', stockData);
    
    const currentQuarterData = stockData.reduce((acc, stock) => {
      const quarterData = stock.data.filter(d => {
        const date = new Date(d[0]);
        return date >= startDate && date <= endDate;
      });
      
      console.log(`Quarter data for ${stock.name}:`, quarterData);
      
      if (quarterData.length > 0) {
        const lastSignal = quarterData[quarterData.length - 1][1];
        if (lastSignal === 1) {
          acc.buy.push(stock.name);
        } else if (lastSignal === 0) {
          acc.sell.push(stock.name);
        }
      }
      return acc;
    }, { buy: [], sell: [] });
    
    console.log('Current quarter stocks:', currentQuarterData);
    setCurrentQuarterStocks(currentQuarterData);
  }, [stockData]);

  // ===== 圖表配置函數 =====
  const getOption = () => {
    const allSeries = [];
    
    if (sharpeRatioData && Object.keys(sharpeRatioData).length > 0) {
      Object.entries(sharpeRatioData).forEach(([stockId, data]) => {
        if (selectedLegend[stockId] && data.dates && data.values) {
          const seriesData = data.dates.map((date, index) => {
            const value = data.values[index];
            return [date, value];
          });

          allSeries.push({
            name: stockId,
            type: 'line',
            data: seriesData,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              width: 2,
              opacity: 1
            },
            itemStyle: {
              opacity: 1
            }
          });
        }
      });
    }

    // 使用 stockData 中的日期
    const dates = stockData.length > 0 ? stockData[0].data.map(d => d[0]) : [];

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params) {
          let result = params[0].axisValue + '<br/>';
          params.forEach(param => {
            result += param.seriesName + ': ' + param.value[1].toFixed(3) + '<br/>';
          });
          return result;
        }
      },
      legend: {
        type: 'plain',
        orient: 'vertical',
        right: 0,
        top: 200,
        padding: [5, 10],
        itemGap: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: 50,
        right: '15%',
        top: 150,
        bottom: 180,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          margin: 14
        }
      },
      yAxis: {
        type: 'value',
        name: 'Sharpe Ratio',
        axisLine: {
          show: true
        },
        splitLine: {
          show: true
        }
      },
      dataZoom: [{
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: zoomRange.start,
        end: zoomRange.end,
        height: 30,
        bottom: 80
      }],
      series: allSeries
    };
  };

  return (
    <div className="trading-strategy-container">
      {console.log('Rendering with currentQuarterStocks:', currentQuarterStocks)}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Trading Strategy</h1>
        <div style={{
          display: 'flex',
          gap: '10px',
          backgroundColor: '#fff',
          padding: '4px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('strategy')}
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
            onClick={() => handleTabChange('agent')}
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

      {activeTab === 'strategy' ? (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ 
                height: '780px',
                marginTop: '-100px',
                marginBottom: '0px',
                position: 'relative'
              }}>
            <ReactECharts
              ref={chartRef}
              option={getOption()}
                  style={{ 
                    height: '100%', 
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  opts={{ 
                    renderer: 'svg',
                    width: 'auto',
                    height: 'auto'
                  }}
              onEvents={{
                    'click': handleChartClick,
                    'axisClick': handleChartClick,
                'datazoom': (params) => {
                  if (Array.isArray(params) && params[0]) {
                    setZoomRange({
                      start: params[0].start,
                      end: params[0].end
                    });
                  }
                    }
                  }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            </div>
            <div style={{ width: '200px', padding: '10px' }}>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                position: 'relative',
                width: '100%'
              }}>
                <div 
                  ref={dropdownButtonRef}
                  style={{ 
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    if (dropdownRef.current) {
                      dropdownRef.current.style.display = dropdownRef.current.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  <span>{Object.values(selectedLegend).filter(Boolean).length} stocks selected</span>
                  <span>▼</span>
                </div>
                <div 
                  ref={dropdownRef}
                  style={{ 
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '0 0 4px 4px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    display: 'none',
                    zIndex: 100,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff', padding: '8px', borderBottom: '1px solid #eee' }}>
                    <input 
                      type="text" 
                      placeholder="Search stocks..." 
                      style={{ 
                        width: '100%', 
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        const items = document.querySelectorAll('.stock-item');
                        items.forEach(item => {
                          const text = item.textContent.toLowerCase();
                          item.style.display = text.includes(value) ? 'block' : 'none';
                        });
                      }}
                    />
                  </div>
                  <div style={{ padding: '8px 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 8px' }}>
                      <button 
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#1890ff', 
                          cursor: 'pointer',
                          padding: '4px 8px',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          const newSelected = {};
                          stocks.forEach(stock => {
                            newSelected[stock] = true;
                          });
                          setSelectedLegend(newSelected);

                          // Update chart for Select All
                          if (chartRef.current) {
                            const chart = chartRef.current.getEchartsInstance();
                            if (chart) {
                              chart.setOption({
                                legend: {
                                  selected: newSelected
                                }
                              }, { replaceMerge: ['series'] });
                            }
                          }
                        }}
                      >
                        Select All
                      </button>
                      <button 
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#1890ff', 
                          cursor: 'pointer',
                          padding: '4px 8px',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          const newSelected = {};
                          stocks.forEach(stock => {
                            newSelected[stock] = false;
                          });
                          setSelectedLegend(newSelected);

                          // Update chart for Clear All
                          if (chartRef.current) {
                            const chart = chartRef.current.getEchartsInstance();
                            if (chart) {
                              chart.setOption({
                                legend: {
                                  selected: newSelected
                                }
                              }, { replaceMerge: ['series'] });
                            }
                          }
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                    {stocks.map(stock => (
                      <div 
                        key={stock} 
                        className="stock-item"
                        style={{ 
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedLegend[stock] ? '#e6f7ff' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onClick={() => {
                          const newSelected = { ...selectedLegend };
                          newSelected[stock] = !newSelected[stock];
                          setSelectedLegend(newSelected);

                          if (chartRef.current) {
                            const chart = chartRef.current.getEchartsInstance();
                            if (chart) {
                              chart.setOption({
                                legend: {
                                  selected: newSelected
                                }
                              }, { replaceMerge: ['series'] });
                            }
                          }
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedLegend[stock] || false}
                          onChange={() => {}}
                        />
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%',
                          gap: '12px'
                        }}>
                          <span>{stock}</span>
                          {sharpeRatios[stock] !== undefined && (
                            <span style={{ 
                              fontSize: '12px',
                              fontWeight: '500',
                              color: Number(sharpeRatios[stock]) > 0 ? '#52c41a' : '#ff4d4f',
                              backgroundColor: Number(sharpeRatios[stock]) > 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              SR: {Number(sharpeRatios[stock]).toFixed(3)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#666',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Selected: {Object.values(selectedLegend).filter(Boolean).length}</span>
                <span>Total: {stocks.length}</span>
              </div>
            </div>
          </div>
          
          <div className="current-quarter-container">
            <h3 className="current-quarter-title">Current Quarter Selected Stocks</h3>
            <div className="current-quarter-content">
              <div className="current-quarter-section">
                <h4 className="current-quarter-section-title selected">
                  <span className="current-quarter-section-title-indicator selected"></span>
                  SELECTED Stocks ({currentQuarterStocks.buy.length})
                </h4>
                <div className="current-quarter-stocks-grid selected">
                  {currentQuarterStocks.buy.map((stock) => (
                    <div 
                      key={stock} 
                      onClick={() => handleStockBoxClick(stock)}
                      className="current-quarter-stock-item selected"
                    >
                      <div>{stock}</div>
                      {sharpeRatios[stock] !== undefined && (
                        <div className={`current-quarter-stock-sharpe ${sharpeRatios[stock] > 0 ? 'positive' : 'negative'}`}>
                          SR: {sharpeRatios[stock].toFixed(3)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="current-quarter-section">
                <h4 className="current-quarter-section-title not-selected">
                  <span className="current-quarter-section-title-indicator not-selected"></span>
                  NOT SELECTED Stocks ({currentQuarterStocks.sell.length})
                </h4>
                <div className="current-quarter-stocks-grid not-selected">
                  {currentQuarterStocks.sell.map((stock) => (
                    <div 
                      key={stock} 
                      onClick={() => handleStockBoxClick(stock)}
                      className="current-quarter-stock-item not-selected"
                    >
                      {stock}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {selectedDate && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              borderTop: '1px solid #eee'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Signals for {selectedDate}</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    color: '#52c41a', 
                    marginBottom: '10px', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#52c41a',
                      display: 'inline-block',
                      borderRadius: '2px'
                    }}></span>
                    SELECTED Stocks ({selectedStocks.buy.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: 'rgba(82, 196, 26, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(82, 196, 26, 0.2)'
                  }}>
                    {selectedStocks.buy.map((stock, index) => (
                      <div 
                        key={stock} 
                        onClick={() => handleStockBoxClick(stock)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: selectedLegend[stock] ? 'rgba(82, 196, 26, 0.2)' : 'rgba(82, 196, 26, 0.1)',
                          borderRadius: '4px',
                          color: '#52c41a',
                          fontSize: '14px',
                          fontWeight: 500,
                          textAlign: 'center',
                          border: '1px solid rgba(82, 196, 26, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div>{stock}</div>
                        {sharpeRatios[stock] !== undefined && (
                          <div style={{ 
                            fontSize: '12px',
                            color: sharpeRatios[stock] > 0 ? '#52c41a' : '#ff4d4f'
                          }}>
                            SR: {sharpeRatios[stock].toFixed(3)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    color: '#ff4d4f', 
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ff4d4f',
                      display: 'inline-block',
                      borderRadius: '2px'
                    }}></span>
                    NOT SELECTED Stocks ({selectedStocks.sell.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: 'rgba(255, 77, 79, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 77, 79, 0.2)'
                  }}>
                    {selectedStocks.sell.map((stock, index) => (
                      <div 
                        key={stock} 
                        onClick={() => handleStockBoxClick(stock)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: selectedLegend[stock] ? 'rgba(255, 77, 79, 0.2)' : 'rgba(255, 77, 79, 0.1)',
                          borderRadius: '4px',
                          color: '#ff4d4f',
                          fontSize: '14px',
                          fontWeight: 500,
                          textAlign: 'center',
                          border: '1px solid rgba(255, 77, 79, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {stock}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Stock Selection Table */}
          <div className="stock-selection-table-container" style={{ marginTop: '60px' }}>
            <div 
              ref={tableWrapperRef}
              className="table-wrapper"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <table 
                className="stock-selection-table"
                style={{ 
                  transform: `scale(${zoomLevel})`, 
                  transformOrigin: 'top left',
                  marginBottom: '50px'
                }}
              >
                <thead>
                  <tr>
                    <th>Stock ID</th>
                    {dates.map((date, index) => (
                      <th key={index}>{date}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock, stockIndex) => (
                    <tr key={stockIndex}>
                      <td>{stock}</td>
                      {dates.map((date, dateIndex) => {
                        const value = tableData[dateIndex]?.[stock];
                        return (
                          <td 
                            key={dateIndex}
                            className={value === '1' ? 'selected' : 'not-selected'}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="zoom-controls">
                <button className="zoom-button" onClick={handleZoomOut}>−</button>
                <div className="zoom-level">{Math.round(zoomLevel * 100)}%</div>
                <button className="zoom-button" onClick={handleZoomIn}>+</button>
                <button className="zoom-button" onClick={handleResetZoom}>↺</button>
              </div>
            </div>
            <div className="table-legend">
              <div className="legend-item">
                <div className="legend-color selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-color not-selected"></div>
                <span>Not Selected</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TradingAgent />
      )}
    </div>
  );
};

export default TradingStrategy;
