import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Tabs, Button, Slider, Switch, Table, Tag, Space, Spin, Radio, Alert, Tooltip, Divider } from 'antd';
import ReactECharts from 'echarts-for-react';
import { stockNames } from '../data/stockNames';
import { stockIndustries, getAllIndustries } from '../data/stockIndustries';
import { industryColors } from '../data/industryColors';
import '../style/StockRelationAnalysis.css';

const { Option } = Select;
const { TabPane } = Tabs;

// 定義多種色階方案
const colorSchemes = {
    green: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    blue: ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'],
    red: ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#de2d26', '#a50f15'],
    purple: ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#756bb1', '#54278f'],
    spectral: ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'],
    rainbow: ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
    hot: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
    precision: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'],
    viridis: ['#440154', '#433982', '#30678D', '#218F8B', '#36B677', '#8ED542', '#FDE725'],
    plasma: ['#0D0887', '#5B02A3', '#9A179B', '#CB4678', '#EB7852', '#FBB32F', '#F0F921'],
    inferno: ['#000004', '#320A5A', '#781B6C', '#BB3654', '#EC6824', '#FBB41A', '#FCFFA4'],
    magma: ['#000004', '#2C115F', '#721F81', '#B63679', '#F1605D', '#FEAF77', '#FCFDBF']
};

// 簡化視覺化預設方案，但保留必要參數
const visualPresets = {
    default: {
        name: '標準視圖',
        description: '適合一般資料瀏覽，均衡顯示整體分佈',
        normalizeMethod: 'linear',
        colorScheme: 'green'
    }
};

const StockRelationAnalysis = () => {
    const [correlationData, setCorrelationData] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStock, setSelectedStock] = useState('2330'); // 預設選擇台積電
    const [loading, setLoading] = useState(true);
    const [stockList, setStockList] = useState([]);
    const [thresholdValue, setThresholdValue] = useState(0.0335); // 修改為更接近數據真實分佈的值
    const [selectedVisualPreset, setSelectedVisualPreset] = useState('default'); // 預設使用標準視圖
    const [timeSeriesData, setTimeSeriesData] = useState({});
    const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
    const [topCorrelatedStocks, setTopCorrelatedStocks] = useState([]);
    const [focusedRegion, setFocusedRegion] = useState(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState('green'); // 預設色階為green
    const [normalizeMethod, setNormalizeMethod] = useState('linear'); // 恢復這個狀態變數
    const [showOnlyNonZero, setShowOnlyNonZero] = useState(false); // 是否只顯示非零值
    
    // 獲取完整的股票代碼
    const getFullStockCode = (code) => `${code}.TW`;
    
    // 獲取公司名稱
    const getCompanyName = (code) => {
        const fullCode = getFullStockCode(code);
        return stockNames[fullCode] || code;
    };
    
    // 獲取股票產業
    const getStockIndustry = (code) => {
        const fullCode = getFullStockCode(code);
        return stockIndustries[fullCode] || '其他';
    };
    
    // 獲取產業顏色
    const getIndustryColor = (code) => {
        const industry = getStockIndustry(code);
        return industryColors[industry] || '#7986CB';
    };

    // 獲取日期列表
    useEffect(() => {
        fetch('http://localhost:5000/gat/dates')
            .then(response => response.json())
            .then(dates => {
                setAvailableDates(dates.sort((a, b) => new Date(b) - new Date(a)));
                if (dates.length > 0) {
                    setSelectedDate(dates[0]);
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
    }, []);

    // 當選擇的日期變化時，獲取該日期的相關性數據
    useEffect(() => {
        if (!selectedDate) return;
        
        setLoading(true);
        fetch(`http://localhost:5000/gat/${selectedDate}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCorrelationData(data);
                    // 從第一行獲取所有股票代碼
                    const stocks = Object.keys(data[0]).filter(code => code !== 'Unnamed: 0');
                    setStockList(stocks);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching correlation data:', error);
                setLoading(false);
            });
    }, [selectedDate]);

    // 當選擇的股票變化時，預獲取時間序列數據
    useEffect(() => {
        if (!selectedStock || availableDates.length === 0) return;
        
        // 更新關聯最高的股票列表，用於時間序列圖
        updateTopCorrelatedStocks();
        
        // 已經有這支股票的數據，不需要重新獲取
        if (timeSeriesData[selectedStock]) return;
        
        setTimeSeriesLoading(true);
        
        // 為選中的股票提取過去10個日期的相關性數據
        const fetchDatesLimit = 10;
        const datesToFetch = availableDates.slice(0, fetchDatesLimit);
        
        // 創建一個對象來存儲每個日期的數據
        const tempData = {};
        
        // 使用Promise.all批量獲取數據
        Promise.all(datesToFetch.map(date => 
            fetch(`http://localhost:5000/gat/${date}`)
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const stockIndex = Object.keys(data[0])
                            .filter(code => code !== 'Unnamed: 0')
                            .indexOf(selectedStock);
                        
                        if (stockIndex >= 0) {
                            tempData[date] = data[stockIndex];
                        }
                    }
                    return date;
                })
                .catch(error => {
                    console.error(`Error fetching correlation data for ${date}:`, error);
                    return date;
                })
        ))
        .then(() => {
            setTimeSeriesData(prev => ({...prev, [selectedStock]: tempData}));
            setTimeSeriesLoading(false);
        });
    }, [selectedStock, correlationData]);

    // 當選擇的股票或日期變化時，更新關聯最高的股票列表
    useEffect(() => {
        if (!selectedStock || correlationData.length === 0) return;
        
        // 不論日期如何變化，都重新計算選中股票的前5個關聯股票
        updateTopCorrelatedStocks();
    }, [selectedStock, correlationData, selectedDate]);

    // 更新與所選股票關聯度最高的股票列表
    const updateTopCorrelatedStocks = () => {
        // 這個函數用於找出與選定股票關聯度最高的前5支股票
        // 它不依賴於timeSeriesData，而是每次都重新計算當前日期下的關聯度
        const result = getTopCorrelationsForStock(selectedStock);
        const topStocks = result.stocks && result.stocks.length > 0 
            ? result.stocks.slice(0, 5).map(item => item.stock)
            : [];
        
        // 打印日誌，説明更新邏輯
        console.log(`更新${selectedStock}在${selectedDate}的前5支關聯股票:`, topStocks);
        
        setTopCorrelatedStocks(topStocks);
    };

    // 計算相關性數據的統計信息
    const getCorrelationStats = () => {
        if (correlationData.length === 0) return { min: 0, max: 0.05, mean: 0.025, std: 0.01 };
        
        let values = [];
        for (let i = 0; i < correlationData.length; i++) {
            for (const key in correlationData[i]) {
                if (key !== 'Unnamed: 0' && correlationData[i][key] > 0) {
                    values.push(correlationData[i][key]);
                }
            }
        }
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            mean,
            std,
            q1: percentile(values, 25),
            median: percentile(values, 50),
            q3: percentile(values, 75)
        };
    };
    
    // 計算百分位數
    const percentile = (arr, p) => {
        if (arr.length === 0) return 0;
        
        // 排序數組
        const sorted = [...arr].sort((a, b) => a - b);
        const position = (sorted.length - 1) * p / 100;
        const base = Math.floor(position);
        const rest = position - base;
        
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };
    
    // 簡化後的色階範圍計算函數
    const getColorRange = (stats) => {
        // 線性映射 - 直接使用非零值的最小值和最大值
        return {
            min: stats.min,
            max: stats.max
        };
    };

    // 應用可視化預設方案
    const applyVisualPreset = (presetKey) => {
        const preset = visualPresets[presetKey];
        if (preset) {
            setSelectedVisualPreset(presetKey);
            setNormalizeMethod(preset.normalizeMethod); // 恢復這個設置
            setSelectedColorScheme(preset.colorScheme);
        }
    };

    // 1. 改進的股票相關性熱圖
    const getHeatmapOption = () => {
        if (correlationData.length === 0 || stockList.length === 0) return {};
        
        // 準備數據
        const data = [];
        const xAxisData = stockList;
        const yAxisData = stockList;
        
        // 獲取統計信息
        const stats = getCorrelationStats();
        
        // 計算色階範圍
        const { min: minValue, max: maxValue } = getColorRange(stats);
        
        // 填充數據，確保正確讀取行列關係
        for (let i = 0; i < xAxisData.length; i++) {
            for (let j = 0; j < yAxisData.length; j++) {
                // 獲取 i 行 j 列的值 - 更安全的數據存取方式
                const stockI = xAxisData[i]; // 行對應的股票代碼
                const stockJ = yAxisData[j]; // 列對應的股票代碼
                
                // 如果 correlationData[i] 存在且有 stockJ 屬性，使用該值
                // 否則嘗試從反向關係 correlationData[j][stockI] 獲取（如果可用）
                let value = 0;
                if (correlationData[i] && correlationData[i].hasOwnProperty(stockJ)) {
                    value = correlationData[i][stockJ];
                } else if (correlationData[j] && correlationData[j].hasOwnProperty(stockI)) {
                    // 嘗試反向查找，可能在某些API返回中很有用
                    value = correlationData[j][stockI];
                }
                
                // 根據值是否大於閾值決定是否顯示
                if (value >= thresholdValue) {
                    data.push([i, j, value]);
                }
                // 特殊處理0值，確保它們都有一致的顯示
                else if (value === 0) {
                    data.push([i, j, minValue - 0.0001]);
                }
                // 其他低於閾值的非零值不顯示
            }
        }
        
        // 調試信息 - 顯示前10條數據，確認轉換是否正確
        console.log("熱圖數據示例（前10條）:", data.slice(0, 10));
        
        // 如果有焦點區域，只顯示該區域的股票
        let showXAxisData = xAxisData;
        let showYAxisData = yAxisData;
        let filteredData = data;
        
        if (focusedRegion) {
            // 獲取焦點區域的股票
            const industry = focusedRegion;
            const industryStocks = stockList.filter(stock => getStockIndustry(stock) === industry);
            
            // 過濾X軸和Y軸
            showXAxisData = industryStocks;
            showYAxisData = industryStocks;
            
            // 重新映射數據
            const stockToIndex = {};
            industryStocks.forEach((stock, idx) => {
                stockToIndex[stock] = idx;
            });
            
            // 過濾數據
            filteredData = [];
            data.forEach(item => {
                const xStock = xAxisData[item[0]];
                const yStock = yAxisData[item[1]];
                
                if (industryStocks.includes(xStock) && industryStocks.includes(yStock)) {
                    filteredData.push([
                        stockToIndex[xStock],
                        stockToIndex[yStock],
                        item[2]
                    ]);
                }
            });
        }
        
        // 計算熱圖的格子和容器大小，確保正方形
        const gridSize = {
            left: 120,
            right: 80,
            bottom: 150,
            top: 120,
            containLabel: true
        };
        
        return {
            title: {
                text: focusedRegion ? `${focusedRegion}產業股票相關性熱圖` : '股票相關性熱圖',
                left: 'center',
                subtext: `視覺化方案: ${visualPresets[selectedVisualPreset]?.name || '自定義'} | 均值: ${stats.mean.toFixed(6)}, 標準差: ${stats.std.toFixed(6)} | 色階範圍: ${minValue.toFixed(6)} - ${maxValue.toFixed(6)}`
            },
            tooltip: {
                position: 'top',
                formatter: function(params) {
                    const xIndex = params.value[0];
                    const yIndex = params.value[1];
                    const xStock = showXAxisData[xIndex];
                    const yStock = showYAxisData[yIndex];
                    // 安全地檢查值是否存在且可以格式化
                    const correlationValue = params.value[2] !== undefined && params.value[2] !== null
                        ? params.value[2].toFixed(6)
                        : '未知';
                    return `${xStock} (${getCompanyName(xStock)}) → ${yStock} (${getCompanyName(yStock)})<br/>相關度: ${correlationValue}`;
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                },
                right: 20,
                top: 20
            },
            grid: gridSize,
            xAxis: {
                type: 'category',
                data: showXAxisData,
                splitArea: { show: true },
                axisLabel: {
                    rotate: 90,
                    fontSize: 10,
                    interval: 0
                },
                axisTick: { alignWithLabel: true }
            },
            yAxis: {
                type: 'category',
                data: showYAxisData,
                splitArea: { show: true },
                axisLabel: {
                    fontSize: 10,
                    interval: 0
                },
                axisTick: { alignWithLabel: true }
            },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                },
                {
                    type: 'slider',
                    show: true,
                    yAxisIndex: [0],
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    yAxisIndex: [0],
                    start: 0,
                    end: 100
                }
            ],
            visualMap: {
                min: minValue,
                max: maxValue,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 10,
                inRange: {
                    color: colorSchemes[selectedColorScheme]
                }
            },
            series: [{
                name: '相關性',
                type: 'heatmap',
                data: filteredData,
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                itemStyle: {
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                aspectScale: 1, // 確保使用正方形格子
                emphasis: {
                    itemStyle: {
                        borderColor: '#333',
                        borderWidth: 1
                    }
                }
            }]
        };
    };

    // 3. 改進的時間序列相關性變化圖
    const getTimeSeriesOption = () => {
        if (!selectedStock || !timeSeriesData[selectedStock] || topCorrelatedStocks.length === 0) {
            return {
                title: {
                    text: '數據載入中或無相關數據',
                    left: 'center'
                }
            };
        }
        
        // 準備數據
        const stockData = timeSeriesData[selectedStock];
        const dates = Object.keys(stockData).sort();
        const series = [];
        
        // 獲取統計信息，計算適合的y軸範圍
        let allValues = [];
        topCorrelatedStocks.forEach(relatedStock => {
            dates.forEach(date => {
                const value = stockData[date] && stockData[date][relatedStock];
                if (value) allValues.push(value);
            });
        });
        
        // 計算非零值的均值和標準差
        const nonZeroValues = allValues.filter(v => v > 0);
        const mean = nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;
        const std = Math.sqrt(nonZeroValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nonZeroValues.length);
        
        // 為每個相關股票準備數據
        topCorrelatedStocks.forEach(relatedStock => {
            let stockValues = dates.map(date => {
                return stockData[date][relatedStock] || 0;
            });
            
            // 在"只看非零值變化"模式下，我們仍然繪製所有點，但將特殊標記應用於非零值
            const symbolSizes = dates.map(date => {
                const value = stockData[date][relatedStock];
                return value > 0 ? 8 : (showOnlyNonZero ? 0 : 4); // 非零值點大，零值點小或隱藏
            });
            
            series.push({
                name: `${relatedStock} (${getCompanyName(relatedStock)})`,
                type: 'line',
                data: stockValues,
                smooth: true,
                connectNulls: true, // 連接NULL值點
                symbol: 'circle',
                symbolSize: function(value, params) {
                    return symbolSizes[params.dataIndex];
                },
                lineStyle: {
                    width: 3
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            });
        });
        
        // 根據當前模式設置適當的Y軸範圍
        let yAxisOption = {};
        if (showOnlyNonZero) {
            // 只顯示非零值模式 - 聚焦在非零值範圍
            const minY = Math.max(0, mean - std * 1.5);
            const maxY = mean + std * 2;
            yAxisOption = {
                min: minY,
                max: maxY
            };
        } else {
            // 顯示所有值模式 - 包含0
            yAxisOption = {
                min: 0,
                max: mean + std * 2
            };
        }
        
        return {
            title: {
                text: `${selectedStock} (${getCompanyName(selectedStock)}) 相關性隨時間變化`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = `日期: ${params[0].name}<br/>`;
                    params.forEach(param => {
                        // 安全地檢查 param.value 是否存在且不是 undefined 或 null
                        const valueDisplay = param.value !== undefined && param.value !== null 
                            ? param.value.toFixed(6) 
                            : '無數據';
                        result += `${param.seriesName}: ${valueDisplay}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: topCorrelatedStocks.map(stock => `${stock} (${getCompanyName(stock)})`),
                top: 50,
                type: 'scroll'
            },
            grid: {
                left: 60,
                right: 60,
                bottom: 60,
                top: 120,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '相關強度',
                axisLabel: {
                    formatter: (value) => value.toFixed(6)
                },
                ...yAxisOption
            },
            series: series,
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                },
                right: 20,
                top: 20
            },
            // 只保留X軸的縮放功能，移除Y軸的縮放功能
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    xAxisIndex: [0],
                    filterMode: 'filter'
                },
                {
                    type: 'slider',
                    show: true,
                    start: 0,
                    end: 100,
                    xAxisIndex: [0]
                }
            ]
        };
    };

    // 4. 關聯度排行榜與產業統計
    const getTopCorrelationsForStock = (stock) => {
        if (!stock || correlationData.length === 0 || stockList.length === 0) return { stocks: [], industries: [] };
        
        // 找到選定股票在列表中的索引
        const stockIndex = stockList.indexOf(stock);
        if (stockIndex === -1) return { stocks: [], industries: [] };
        
        // 獲取相關係數和產業信息
        const correlations = [];
        const industriesMap = {};
        
        stockList.forEach((targetStock, i) => {
            if (targetStock !== stock) {
                const value = correlationData[stockIndex][targetStock];
                if (value && value >= thresholdValue) {
                    const industry = getStockIndustry(targetStock);
                    
                    // 記錄產業統計
                    if (!industriesMap[industry]) {
                        industriesMap[industry] = {
                            count: 0,
                            totalCorrelation: 0
                        };
                    }
                    industriesMap[industry].count++;
                    industriesMap[industry].totalCorrelation += value;
                    
                    correlations.push({
                        stock: targetStock,
                        companyName: getCompanyName(targetStock),
                        industry: industry,
                        correlation: value
                    });
                }
            }
        });
        
        // 計算每個股票在其產業內的排名和比例
        const industryStocksCount = {};
        stockList.forEach(code => {
            const industry = getStockIndustry(code);
            if (!industryStocksCount[industry]) {
                industryStocksCount[industry] = 0;
            }
            industryStocksCount[industry]++;
        });
        
        // 添加產業內比例信息
        correlations.forEach(item => {
            item.industryRank = correlations.filter(
                c => c.industry === item.industry && c.correlation > item.correlation
            ).length + 1;
            
            item.industryTotal = correlations.filter(
                c => c.industry === item.industry
            ).length;
            
            item.industryPercentage = (item.industryRank / item.industryTotal * 100).toFixed(1);
            
            item.industryRatio = (item.industryTotal / industryStocksCount[item.industry] * 100).toFixed(1);
        });
        
        // 添加產業統計信息
        const industryStats = Object.keys(industriesMap).map(industry => ({
            industry,
            count: industriesMap[industry].count,
            percentage: (industriesMap[industry].count / correlations.length * 100).toFixed(1),
            avgCorrelation: (industriesMap[industry].totalCorrelation / industriesMap[industry].count).toFixed(6),
            totalInIndustry: industryStocksCount[industry],
            coverageRatio: (industriesMap[industry].count / industryStocksCount[industry] * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count);
        
        // 按照相關程度排序
        return {
            stocks: correlations.sort((a, b) => b.correlation - a.correlation),
            industries: industryStats
        };
    };

    const columns = [
        {
            title: '股票代碼',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: '公司名稱',
            dataIndex: 'companyName',
            key: 'companyName',
        },
        {
            title: '產業',
            dataIndex: 'industry',
            key: 'industry',
            render: industry => (
                <Tag color={industryColors[industry] || '#7986CB'}>
                    {industry}
                </Tag>
            ),
            filters: getAllIndustries().map(industry => ({
                text: industry,
                value: industry
            })),
            onFilter: (value, record) => record.industry === value,
        },
        {
            title: '相關度',
            dataIndex: 'correlation',
            key: 'correlation',
            render: correlation => correlation.toFixed(6),
            sorter: (a, b) => a.correlation - b.correlation,
            defaultSortOrder: 'descend',
        },
        {
            title: '產業內排名',
            dataIndex: 'industryRank',
            key: 'industryRank',
            render: (rank, record) => `${rank}/${record.industryTotal} (前${record.industryPercentage}%)`,
            sorter: (a, b) => a.industryRank - b.industryRank,
        },
        {
            title: '產業覆蓋率',
            dataIndex: 'industryRatio',
            key: 'industryRatio',
            render: ratio => `${ratio}%`,
            sorter: (a, b) => parseFloat(a.industryRatio) - parseFloat(b.industryRatio),
        }
    ];

    const industryColumns = [
        {
            title: '產業',
            dataIndex: 'industry',
            key: 'industry',
            render: industry => (
                <Tag color={industryColors[industry] || '#7986CB'} style={{ margin: '2px' }}>
                    {industry}
                </Tag>
            )
        },
        {
            title: '相關股票數量',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
            defaultSortOrder: 'descend',
        },
        {
            title: '佔總相關股票比例',
            dataIndex: 'percentage',
            key: 'percentage',
            render: percentage => `${percentage}%`,
            sorter: (a, b) => parseFloat(a.percentage) - parseFloat(b.percentage),
        },
        {
            title: '平均相關度',
            dataIndex: 'avgCorrelation',
            key: 'avgCorrelation',
            sorter: (a, b) => parseFloat(a.avgCorrelation) - parseFloat(b.avgCorrelation),
        },
        {
            title: '產業覆蓋率',
            dataIndex: 'coverageRatio',
            key: 'coverageRatio',
            render: ratio => `${ratio}%`,
            sorter: (a, b) => parseFloat(a.coverageRatio) - parseFloat(b.coverageRatio),
            render: (ratio, record) => `${ratio}% (${record.count}/${record.totalInIndustry})`,
        }
    ];

    // 計算產業股票統計
    const getIndustryStats = () => {
        if (stockList.length === 0) return [];
        
        const industries = {};
        stockList.forEach(stock => {
            const industry = getStockIndustry(stock);
            if (!industries[industry]) {
                industries[industry] = {
                    name: industry,
                    count: 0,
                    stocks: []
                };
            }
            industries[industry].count++;
            industries[industry].stocks.push(stock);
        });
        
        return Object.values(industries).sort((a, b) => b.count - a.count);
    };

    // 渲染組件
    return (
        <div className="stock-correlation-container">
            <h1 className="page-title">股票關係多維度分析</h1>
            
            <Card style={{ marginBottom: '20px' }}>
                <Space className="control-panel">
                    <span>選擇日期：</span>
                    <Select 
                        style={{ width: 200 }} 
                        value={selectedDate}
                        onChange={setSelectedDate}
                        loading={availableDates.length === 0}
                    >
                        {availableDates.map(date => (
                            <Option key={date} value={date}>{date}</Option>
                        ))}
                    </Select>
                    
                    <span>選擇股票：</span>
                    <Select
                        style={{ width: 280 }}
                        showSearch
                        value={selectedStock}
                        onChange={setSelectedStock}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {stockList.map(stock => (
                            <Option key={stock} value={stock}>
                                {stock} - {getCompanyName(stock)}
                            </Option>
                        ))}
                    </Select>
                    
                    {focusedRegion && (
                        <Button onClick={() => setFocusedRegion(null)} type="primary">
                            返回全部股票視圖
                        </Button>
                    )}
                </Space>
                
                <div>
                    <p style={{ marginBottom: '10px' }}>
                        <strong>當前分析：</strong> 
                        {selectedStock ? `${selectedStock} (${getCompanyName(selectedStock)})` : '未選擇'} 
                        在 {selectedDate || '未選擇日期'} 的關聯分析
                    </p>
                    <p>
                        <strong>分析說明：</strong> 
                        此頁面提供三種視覺化方式來分析股票間的關聯性，幫助投資者理解市場結構和優化投資組合。
                        關聯強度越高表示股票間的價格變動越相似，可用於風險分散和投資決策。
                    </p>
                    <p>
                        <strong>產業篩選：</strong> 點擊以下產業標籤可查看該產業內股票的關聯熱圖
                    </p>
                    <div className="industry-tags">
                        {getIndustryStats().map(industry => (
                            <Tag 
                                color={industryColors[industry.name] || '#7986CB'} 
                                key={industry.name}
                                className="industry-tag"
                                onClick={() => setFocusedRegion(industry.name)}
                            >
                                {industry.name} ({industry.count})
                            </Tag>
                        ))}
                    </div>
                </div>
            </Card>
            
            <Tabs defaultActiveKey="1">
                <TabPane tab="相關性熱圖" key="1">
                    <Card>
                        <div className="control-group">
                            <Tooltip title="關聯閾值用於過濾數據，只有高於此閾值的相關性才會被顯示。較高閾值可突顯重要關聯，較低閾值可展示更多資訊。">
                                <span>關聯閾值：{thresholdValue.toFixed(6)}</span>
                            </Tooltip>
                            <Slider
                                className="slider-control"
                                min={0.0330}
                                max={0.0345}
                                step={0.0001}
                                value={thresholdValue}
                                onChange={setThresholdValue}
                                marks={{
                                    0.0330: 'All',
                                    0.0337: 'Medium',
                                    0.0345: 'High'
                                }}
                            />
                            
                            <Divider type="vertical" />
                            
                            <span>Color Scheme：</span>
                            <Select
                                style={{ width: 120 }}
                                value={selectedColorScheme}
                                onChange={(value) => {
                                    setSelectedColorScheme(value);
                                    setSelectedVisualPreset('default');
                                }}
                            >
                                <Option value="green">Green</Option>
                                <Option value="blue">Blue</Option>
                                <Option value="red">Red</Option>
                                <Option value="purple">Purple</Option>
                                <Option value="spectral">Spectral</Option>
                                <Option value="rainbow">Rainbow</Option>
                                <Option value="precision">Precision</Option>
                                <Option value="viridis">Viridis</Option>
                                <Option value="plasma">Plasma</Option>
                                <Option value="inferno">Inferno</Option>
                                <Option value="magma">Magma</Option>
                            </Select>
                        </div>
                        
                        <div id="heatmap-container" className="heatmap-container">
                            {loading ? (
                                <div className="loading-spinner">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ReactECharts 
                                    option={getHeatmapOption()} 
                                    className="heatmap-wrapper"
                                    opts={{ renderer: 'canvas' }}
                                    notMerge={true}
                                    style={{ height: '1200px', width: '100%' }}
                                />
                            )}
                        </div>
                        <div className="guide-section">
                            <h3>熱圖解讀指南</h3>
                            <ul>
                                <li>顏色越深表示兩支股票的相關性越強，從柔和到深色的變化表示相關性強度的增加</li>
                                <li>對角線上為股票與自身的相關性（必然為1）</li>
                                <li>您可以使用底部和右側的縮放條來放大查看感興趣的區域</li>
                                <li>使用上方的產業標籤可以快速聚焦於特定產業內的股票關聯性</li>
                                <li>GAT精細視圖專為GAT模型數據特性優化，能更好地展示0.033左右的微小差異</li>
                                <li>通過「關聯閾值」滑桿調整顯示的數據範圍，較高閾值會過濾掉低關聯度的數據點</li>
                                <li>正方形格子提供更整齊的視覺效果，每個格子的X軸和Y軸長度相等</li>
                                <li>當資料集中在非常接近的數值範圍（如0.033-0.034）時，色階映射會自動調整以突顯微小差異</li>
                            </ul>
                        </div>
                    </Card>
                </TabPane>
                
                <TabPane tab="時間序列變化" key="2">
                    <Card>
                        <div style={{ marginBottom: '20px' }}>
                            <Alert
                                type="info"
                                message="前5支相關股票選擇邏輯說明"
                                description={`時間序列圖顯示的是與${selectedStock}關聯度最高的5支股票。這些股票是基於當前選擇的日期(${selectedDate})計算得出，反映當前時點的關聯強度排名。當切換到不同日期時，關聯度排名可能會發生變化，因此顯示的5支股票也會相應變化。這種設計能讓您了解在不同時間點哪些股票與目標股票的關聯最強。`}
                                showIcon
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <Space>
                                <span>顯示模式：</span>
                                <Switch
                                    checkedChildren="只看非零值變化"
                                    unCheckedChildren="顯示完整數據"
                                    checked={showOnlyNonZero}
                                    onChange={(checked) => setShowOnlyNonZero(checked)}
                                />
                                <Tooltip title="「顯示完整數據」模式顯示所有數據包括零值；「只看非零值變化」模式會自動調整Y軸範圍，聚焦在非零數據的變化趨勢上，但會連接所有數據點">
                                    <Button icon="info-circle" type="link">說明</Button>
                                </Tooltip>
                            </Space>
                        </div>
                        <div className="timeseries-container">
                            {timeSeriesLoading ? (
                                <div className="loading-spinner">
                                    <Spin size="large" tip="正在獲取歷史相關性數據..." />
                                </div>
                            ) : (
                                <ReactECharts 
                                    option={getTimeSeriesOption()} 
                                    style={{ height: '100%' }}
                                    opts={{ renderer: 'canvas' }}
                                    notMerge={true}
                                />
                            )}
                        </div>
                        <div className="guide-section">
                            <h3>時間序列圖解讀指南</h3>
                            <ul>
                                <li>線圖顯示所選股票與其他關聯度最高的5支股票間的關聯強度隨時間變化</li>
                                <li>「顯示所有數據」模式下，Y軸從0開始，完整展示數據範圍</li>
                                <li>「只顯示非零值」模式下，聚焦於非零數據的微小變化，更容易觀察趨勢差異</li>
                                <li>零值會在「只顯示非零值」模式中顯示為線條中斷點</li>
                                <li>數據來源為過去10個可用日期的GAT模型輸出結果，真實反映市場結構變化</li>
                                <li>關聯強度急劇變化通常表示市場結構變化，可能與重大事件相關</li>
                                <li>關聯性下降可能意味著分散投資的良機，而上升可能表示風險聚集</li>
                                <li>觀察相同產業和不同產業股票的關聯變化趨勢，可發現更深層的市場規律</li>
                                <li>您可以使用滑鼠拖拽來選擇區域進行放大，查看細微的變化</li>
                            </ul>
                        </div>
                    </Card>
                </TabPane>
                
                <TabPane tab="關聯排行榜" key="3">
                    <Card>
                        <h3>與 {selectedStock} ({getCompanyName(selectedStock)}) 關聯度最高的股票</h3>
                        
                        <h4 className="correlation-title">股票關聯排行</h4>
                        <Table 
                            columns={columns.filter(col => col.key !== 'industryRatio')} 
                            dataSource={(getTopCorrelationsForStock(selectedStock).stocks || []).map((item, index) => ({...item, key: index}))}
                            pagination={{ pageSize: 10 }}
                            loading={loading}
                        />
                        
                        <h4 className="industry-section">產業分布統計</h4>
                        <Table 
                            columns={industryColumns} 
                            dataSource={getTopCorrelationsForStock(selectedStock).industries || []}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: '20px' }}
                        />
                        
                        <div className="guide-section">
                            <h3>排行榜解讀指南</h3>
                            <ul>
                                <li>表格列出與所選股票關聯度最高的其他股票及其產業分布情況</li>
                                <li>「產業內排名」顯示該股票在其所屬產業中的相關度排名，例如「3/10 (前30%)」表示在此產業相關的10支股票中排第3位</li>
                                <li>「產業分布統計」表顯示各產業在高關聯股票中的佔比和平均關聯度，有助於分析跨產業關聯模式</li>
                                <li>數據來自GAT模型生成的關係矩陣，反映真實的股票關聯性</li>
                                <li>即使看似相近的數值，微小差異仍有重要意義，可通過排序和篩選發現有價值的關聯模式</li>
                                <li>可使用產業標籤篩選特定產業的相關股票，發現跨產業和產業內的關聯特點</li>
                            </ul>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default StockRelationAnalysis; 