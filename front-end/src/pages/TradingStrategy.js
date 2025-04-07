import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Papa from 'papaparse';
import TradingAgent from './TradingAgent';

const API_URL = process.env.REACT_APP_API_URL;
const TradingStrategy = () => {
  const [stockData, setStockData] = useState([]);
  const [dates, setDates] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStocks, setSelectedStocks] = useState({ buy: [], sell: [] });
  const [selectedLegend, setSelectedLegend] = useState({});
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' or 'strategy'
  const chartRef = useRef(null);

  const handleChartClick = (params) => {
    // Get the date whether clicking on a point or the axis
    const date = params.name || params.value;
    if (date) {
      setSelectedDate(date);
      
      // Find stocks for this date
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
    
    // Toggle the selected state for this stock
    setSelectedLegend(prev => {
      const newState = { ...prev };
      // Set all stocks to false first
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      // Toggle the clicked stock
      newState[stockName] = true;
      return newState;
    });
    
    // Preserve the current zoom state
    setZoomRange({
      start: currentZoom.start,
      end: currentZoom.end
    });
  };

  useEffect(() => {
    // Fetch the CSV data with the full URL
    fetch(`${API_URL}/api/low-risk-stocks`)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data;
            // Get dates and stock symbols
            const stockSymbols = Object.keys(data[0]).filter(key => key !== 'date');
            const dateList = data.map(row => row.date);
            
            // Initialize legend selection state
            const initialLegendState = stockSymbols.reduce((acc, stock) => {
              acc[stock] = false;
              return acc;
            }, {});
            setSelectedLegend(initialLegendState);
            
            // Process data for visualization
            const processedData = stockSymbols.map(stock => {
              return {
                name: stock,
                type: 'line',
                data: data.map(row => [row.date, parseInt(row[stock])]),
                symbol: 'circle',
                symbolSize: 8,
                // step: 'middle',
                lineStyle: {
                  width: 2,
                  opacity: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0,0,0,0.3)'
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#fff',
                  shadowBlur: 4,
                  shadowColor: 'rgba(0,0,0,0.2)'
                },
                emphasis: {
                  focus: 'series',
                  scale: true,
                  lineStyle: {
                    width: 3,
                    opacity: 1
                  },
                  itemStyle: {
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.3)'
                  }
                }
              };
            });

            setStockData(processedData);
            setDates(dateList);
            setStocks(stockSymbols);
          }
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const getOption = () => {
    return {
      title: {
        text: 'Stock-Picked Agent',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: [10, 15],
        textStyle: {
          color: '#333'
        },
        formatter: function (params) {
          const date = params[0].data[0];
          let result = `<div style="font-weight: bold; margin-bottom: 8px">Date: ${date}</div>`;
          let selectedStocks = [];
          let notSelectedStocks = [];
          
          params.forEach(param => {
            const value = param.data[1];
            if (value === 1) {
              selectedStocks.push(param.seriesName);
            } else if (value === 0) {
              notSelectedStocks.push(param.seriesName);
            }
          });
          
          if (selectedStocks.length > 0) {
            result += `<div style="color: #52c41a; padding: 3px 0;"><b>SELECTED (${selectedStocks.length}):</b> ${selectedStocks.join(', ')}</div>`;
          }
          if (notSelectedStocks.length > 0) {
            result += `<div style="color: #ff4d4f; padding: 3px 0;"><b>NOT SELECTED (${notSelectedStocks.length}):</b> ${notSelectedStocks.join(', ')}</div>`;
          }
          
          return result;
        }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 40,
        bottom: 40,
        textStyle: {
          fontSize: 11
        },
        selected: selectedLegend,
        selectedMode: 'multiple',
        selector: [
          {
            type: 'all',
            title: 'All'
          },
          {
            type: 'inverse',
            title: 'Inverse'
          }
        ]
      },
      grid: {
        left: 50,
        right: '15%',
        top: 50,
        bottom: 80,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          interval: 0,
          color: '#333',
          fontWeight: 'normal',
          show: true,
          clickable: true
        },
        axisTick: {
          alignWithLabel: true,
          show: true,
          length: 8,  // Make ticks longer
          lineStyle: {
            color: '#666'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ddd'
          }
        },
        triggerEvent: true  // This is crucial for enabling axis clicks
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        interval: 1,
        axisLabel: {
          formatter: function(value) {
            if (value === 1) return '↑ SELECTED';
            if (value === 0) return '↓ NOT SELECTED';
            return '';
          },
          fontSize: 12,
          color: (value) => value === 1 ? '#52c41a' : value === 0 ? '#ff4d4f' : '#666',
          fontWeight: 'bold'
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ddd'
          }
        }
      },
      series: stockData,
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        },
        right: 60,
        top: 10
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: zoomRange.start,
          end: zoomRange.end,
          bottom: 10
        }
      ]
    };
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
            Stock-Picked Agent
          </button>
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
            Trading Agent
          </button>
        </div>
      </div>

      {activeTab === 'agent' ? (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ height: '600px' }}>
            <ReactECharts
              ref={chartRef}
              option={getOption()}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
              onEvents={{
                'legendselectchanged': (params) => {
                  const option = chartRef.current.getEchartsInstance().getOption();
                  const currentZoom = option.dataZoom[0];
                  setSelectedLegend(params.selected);
                  setZoomRange({
                    start: currentZoom.start,
                    end: currentZoom.end
                  });
                },
                'datazoom': (params) => {
                  if (Array.isArray(params) && params[0]) {
                    setZoomRange({
                      start: params[0].start,
                      end: params[0].end
                    });
                  }
                },
                'click': (params) => {
                  let date;
                  if (params.componentType === 'xAxis' && params.value) {
                    date = params.value;
                  }
                  else if (params.componentType === 'series' && params.data) {
                    date = params.data[0];
                  }

                  if (date) {
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
                }
              }}
            />
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
                          ':hover': {
                            backgroundColor: 'rgba(82, 196, 26, 0.2)'
                          }
                        }}
                      >
                        {stock}
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
                          transition: 'all 0.2s',
                          ':hover': {
                            backgroundColor: 'rgba(255, 77, 79, 0.2)'
                          }
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
        </div>
      ) : (
        <TradingAgent />
      )}
    </div>
  );
};

export default TradingStrategy;
