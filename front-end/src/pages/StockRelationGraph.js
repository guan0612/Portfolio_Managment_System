import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Slider, Switch, Space, Button, Select, Alert, message } from 'antd';
import '../style/StockRelationGraph.css';
import { stockNames } from '../data/stockNames';
import { stockIndustries, getAllIndustries } from '../data/stockIndustries';
import { industryColors } from '../data/industryColors';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL;

const StockRelationGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [threshold, setThreshold] = useState(0.0330);
    const [showLabels, setShowLabels] = useState(true);
    const [selectedStock, setSelectedStock] = useState('1101');
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [highlightedEdges, setHighlightedEdges] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('2024-05-16');
    const [errorMessage, setErrorMessage] = useState('');
    const [barChartData, setBarChartData] = useState([]);
    const [correlationData, setCorrelationData] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState({});
    const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
    const allIndustries = getAllIndustries();

    // 添加一個輔助函數來獲取季度
    const getQuarter = (dateStr) => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1; // JavaScript 月份從 0 開始
        const day = date.getDate();
        let year = date.getFullYear();

        // 處理年份
        if (month === 4) {
            year = year - 1;
        } else if (month >= 11 || month <= 3) {
            year = year - 1;
        }

        if ((month === 5 && day >= 16) || (month >= 6 && month <= 8 && day < 15)) {
            return `${year}Q1`;
        } else if ((month === 8 && day >= 15) || (month >= 9 && month <= 11 && day < 15)) {
            return `${year}Q2`;
        } else if ((month === 11 && day >= 15) || month === 12 || month <= 3) {
            return `${year}Q3`;
        } else {
            return `${year}Q4`;
        }
    };

    // 添加一個輔助函數來獲取完整的股票代碼
    const getFullStockCode = (code) => `${code}.TW`;

    // 添加一個輔助函數來獲取公司名稱
    const getCompanyName = (code) => {
        const fullCode = getFullStockCode(code);
        return stockNames[fullCode] || code;
    };

    // 添加一個輔助函數來獲取股票的產業類別
    const getStockIndustry = (code) => {
        const fullCode = getFullStockCode(code);
        return stockIndustries[fullCode] || '其他';
    };

    // 添加一個輔助函數來獲取產業顏色
    const getIndustryColor = (code) => {
        const industry = getStockIndustry(code);
        return industryColors[industry] || '#7986CB'; // 預設顏色
    };

    // 獲取日期列表
    useEffect(() => {
        fetch(`${API_URL}/dates`)
            .then(response => response.json())
            .then(dates => {
                // 將日期轉換為季度格式並去重
                const quarters = Array.from(new Set(dates.map(date => getQuarter(date))))
                    .sort((a, b) => {
                        // 解析季度字串（例如：2023Q1）
                        const [yearA, quarterA] = a.split('Q');
                        const [yearB, quarterB] = b.split('Q');
                        if (yearA !== yearB) {
                            return parseInt(yearB) - parseInt(yearA); // 年份降序
                        }
                        return parseInt(quarterB) - parseInt(quarterA); // 季度降序
                    });
                
                setAvailableDates(quarters);
                if (quarters.length > 0) {
                    setSelectedDate(quarters[0]);
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
    }, []);

    // 當選擇的日期變化時，獲取該日期的相關性數據
    useEffect(() => {
        if (!selectedDate) return;
        
        setLoading(true);
        // 將季度轉換回日期格式（使用該季度的最後一天）
        const [year, quarter] = selectedDate.split('Q');
        let date;
        switch(quarter) {
            case '1':
                date = `${year}-08-14`;
                break;
            case '2':
                date = `${year}-11-14`;
                break;
            case '3':
                date = `${year}-05-15`;
                break;
            case '4':
                date = `${year}-08-15`;
                break;
            default:
                date = `${year}-12-31`;
        }
        
        fetch(`${API_URL}/${date}`)
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
            fetch(`${API_URL}/${date}`)
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

    // 監聽圖數據變化
    useEffect(() => {
        if (!loading && graphData.nodes.length > 0) {
            console.log('Graph data updated, running search...');
            handleSearch();
        }
    }, [graphData, loading]);

    // 監聽股票和閥值變化
    useEffect(() => {
        if (!loading && graphData.nodes.length > 0) {
            console.log('Stock or threshold changed, running search...');
            handleSearch();
        }
    }, [selectedStock, threshold]);

    // 取得圖數據
    useEffect(() => {
        if (!selectedDate) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/${selectedDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                if (data.error) {
                    console.error('Server error:', data.error);
                    setLoading(false);
                    return;
                }

                if (Array.isArray(data)) {
                    const nodes = new Set();
                    const links = [];
                    
                    // 先取得所有股票代碼（從第一行的keys）
                    const stockCodes = Object.keys(data[0]);
                    
                    // 遍歷每一行（每一行代表一支股票與其他股票的關係）
                    data.forEach((row, rowIndex) => {
                        const sourceStock = stockCodes[rowIndex].replace('.TW', '');  // 移除 .TW
                        
                        // 遍歷該股票與其他股票的關係
                        stockCodes.forEach((targetStock, colIndex) => {
                            if (rowIndex === colIndex) return;  // 跳過自己 or 跳過重複的關係
                            
                            const weight = parseFloat(row[targetStock]);
                            
                            if (!isNaN(weight) && weight > 0) {
                                nodes.add(sourceStock.replace('.TW', ''));  // 移除 .TW
                                nodes.add(targetStock.replace('.TW', ''));  // 移除 .TW
                                links.push({
                                    source: sourceStock.replace('.TW', ''),
                                    target: targetStock.replace('.TW', ''),  // 移除 .TW
                                    value: weight,
                                    lineStyle: {
                                        opacity: Math.min(weight * 2, 1),
                                        width: Math.max(1, weight * 5)
                                    }
                                });
                            }
                        });
                    });

                    if (nodes.size > 0) {
                        const newGraphData = {
                            nodes: Array.from(nodes).map(code => ({
                                name: code,
                                value: links.filter(link => 
                                    link.target === code && link.value > 0 
                                ).length,  // 只計算指向該節點的邊的數量
                                category: getStockIndustry(code)
                            })),
                            links: links
                        };

                        // 檢查預設股票是否存在
                        if (!nodes.has(selectedStock)) {
                            console.log('Selected stock not found, switching to first available stock');
                            setSelectedStock(Array.from(nodes)[0]);
                        }

                        setGraphData(newGraphData);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching graph data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDate]);

    const handleSearch = () => {
        // 清除之前的高亮狀態
        setHighlightedNodes([]);
        setHighlightedEdges([]);

        // 驗證輸入
        if (!selectedStock) {
            console.warn('Please select a stock');
            return;
        }

        // 檢查股票是否存在於圖表中
        const stockExists = graphData.nodes.some(node => node.name === selectedStock);
        if (!stockExists) {
            console.warn(`Stock ${selectedStock} not found in the graph`);
            return;
        }

        // 找出指向選中股票的所有連接
        const EPSILON = 1e-10;  // 添加一個很小的容差值
        const relatedLinks = graphData.links.filter(link => 
            link.target === selectedStock &&  // 只保留目標是選中股票的邊
            link.value >= threshold - EPSILON  // 使用容差值進行比較
        );

        if (relatedLinks.length === 0) {
            // 清空高亮狀態
            setHighlightedNodes([selectedStock]);
            setHighlightedEdges([]);
            setErrorMessage(`股票 ${selectedStock} (${getCompanyName(selectedStock)}) 沒有相關度 >= ${threshold} 的連接`);
            setBarChartData([]); // 清空柱状图数据
            return;
        }
        // 如果有找到連接，清除錯誤訊息
        setErrorMessage('');

        // 取得相關節點（只包含源節點和目標節點）
        const relatedNodes = new Set();
        relatedNodes.add(selectedStock); // 添加選中的股票
        relatedLinks.forEach(link => {
            relatedNodes.add(link.source); // 只添加源節點
        });

        setHighlightedNodes(Array.from(relatedNodes));
        setHighlightedEdges(relatedLinks);

        // 打印相關信息，按照相關度排序
        console.log(`指向 ${selectedStock} (${getCompanyName(selectedStock)}) 的連接:`);
        relatedLinks
            .sort((a, b) => b.value - a.value)  // 依相關度從高到低排序
            .forEach(link => {
                const sourceName = getCompanyName(link.source);
                console.log(`${link.source} (${sourceName}) → ${selectedStock} (${getCompanyName(selectedStock)}): ${link.value.toFixed(5)}`);
            });

        // 處理柱狀圖數據
        const barData = relatedLinks.map(link => ({
            stock: link.source,
            value: link.value,
            name: getCompanyName(link.source),
            industry: getStockIndustry(link.source)
        })).sort((a, b) => b.value - a.value);

        setBarChartData(barData);
    };

    // 更新關聯最高的股票列表
    const updateTopCorrelatedStocks = () => {
        if (!selectedStock || correlationData.length === 0 || stockList.length === 0) return;
        
        // 找到選定股票在列表中的索引
        const stockIndex = stockList.indexOf(selectedStock);
        if (stockIndex === -1) return;
        
        // 獲取相關係數
        const correlations = [];
        stockList.forEach((targetStock, i) => {
            if (targetStock !== selectedStock) {
                const value = correlationData[stockIndex][targetStock];
                if (value && value >= threshold) {
                    correlations.push({
                        stock: targetStock,
                        correlation: value
                    });
                }
            }
        });
        
        // 按相關度排序
        correlations.sort((a, b) => b.correlation - a.correlation);
        
        // 取前5支股票
        const topStocks = correlations.slice(0, 5).map(item => item.stock);
        return topStocks;
    };

    const getOption = () => {
        return {
            title: {
                text: 'Stock Relation Graph(based on GAT model)',
                subtext: '邊的方向表示影響關係：A→B 表示 A 對 B 的重要性',
                top: 'top',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (params.dataType === 'edge') {
                        const sourceName = getCompanyName(params.data.source);
                        const targetName = getCompanyName(params.data.target);
                        const sourceIndustry = getStockIndustry(params.data.source);
                        const targetIndustry = getStockIndustry(params.data.target);
                        return `${params.data.source} (${sourceName}, ${sourceIndustry}) → ${params.data.target} (${targetName}, ${targetIndustry})<br/>相關度: ${params.data.value.toFixed(4)}`;
                    }
                    const companyName = getCompanyName(params.name);
                    const industry = getStockIndustry(params.name);
                    return `股票代碼: ${params.name}<br/>公司名稱: ${companyName}<br/>產業類別: ${industry}<br/>連接數: ${params.value}`;
                }
            },
            legend: {
                data: allIndustries,
                top: 50,
                type: 'scroll',
                width: '80%',
                textStyle: {
                    fontSize: 12
                },
                selected: allIndustries.reduce((acc, industry) => {
                    acc[industry] = true;
                    return acc;
                }, {}),
                selector: [
                    { type: 'all', title: '全選' },
                    { type: 'inverse', title: '反選' }
                ]
            },
            series: [{
                type: 'graph',
                layout: 'force',
                animation: false,
                draggable: true,
                roam: true,  // 允許縮放和平移
                zoom: 1,     // 初始縮放級別
                scaleLimit: {  // 縮放限制
                    min: 0.1,
                    max: 5
                },
                data: graphData.nodes
                    .filter(node => highlightedNodes.length === 0 || highlightedNodes.includes(node.name))
                    .map(node => ({
                        ...node,
                        symbolSize: Math.max(10, 10 + 2*node.value),  // 選中的節點要大一點
                        itemStyle: {
                            color: getIndustryColor(node.name),
                        }
                    })),
                categories: allIndustries.map(industry => ({
                    name: industry,
                    itemStyle: {
                        color: industryColors[industry]
                    }
                })),
                force: {
                    repulsion: 1000,
                    gravity: 0.1,
                    edgeLength: 200,
                    friction: 0.6,
                    layoutAnimation: true
                },
                edges: graphData.links
                    .filter(link => highlightedEdges.length === 0 || highlightedEdges.includes(link))
                    .map(link => ({
                        ...link,
                        lineStyle: {
                            width: 3,
                            opacity: Math.min(link.value * 2, 1),
                            curveness: 0.1
                        },
                        symbol: ['none', 'arrow'],  // 起點無符號，終點為箭頭
                        symbolSize: [15, 15],  // 箭頭大小
                        emphasis: {
                            lineStyle: {
                                width: 6,
                                opacity: 1
                            }
                        }
                    })),
                label: {
                    show: showLabels,
                    position: 'right',
                    formatter: '{b}'
                }
            }]
        };
    };

    // 添加柱状图配置函数
    const getBarOption = () => {
        // 计算数据的范围
        const minValue = Math.min(...barChartData.map(item => item.value));
        const maxValue = Math.max(...barChartData.map(item => item.value));
        
        return {
            title: {
                text: `與 ${selectedStock} (${getCompanyName(selectedStock)}) 的關聯度`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    const data = params[0].data;
                    return `股票代碼: ${data.stock}<br/>
                            公司名稱: ${data.name}<br/>
                            產業類別: ${data.industry}<br/>
                            關聯度: ${data.value.toFixed(4)}`;
                }
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '20%',  // 增加底部空间
                top: '15%',     // 增加顶部空间
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: barChartData.map(item => `${item.stock}\n${item.name}`),
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    fontSize: 12,
                    formatter: function (value) {
                        const [code, name] = value.split('\n');
                        const shortName = name.length > 8 ? name.substring(0, 8) + '...' : name;
                        return `${code}\n${shortName}`;
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: '關聯度',
                min: threshold,
                max: maxValue * 1.1,
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [{
                name: '關聯度',
                type: 'bar',
                barWidth: '50%',  // 调整柱子宽度
                barGap: '30%',    // 调整柱子间距
                data: barChartData.map(item => ({
                    value: item.value,
                    stock: item.stock,
                    name: item.name,
                    industry: item.industry,
                    itemStyle: {
                        color: getIndustryColor(item.stock)
                    }
                })),
                markLine: {
                    data: [
                        {
                            yAxis: threshold,
                            lineStyle: {
                                color: '#ff4d4f',
                                type: 'dashed'
                            },
                            label: {
                                formatter: '閾值',
                                position: 'end'
                            }
                        }
                    ]
                }
            }]
        };
    };

    return (
        <div className="stock-graph-container">
            <Card className="stock-graph-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                    {errorMessage && (
                        <Alert
                            message={errorMessage}
                            type="warning"
                            showIcon
                            closable
                            onClose={() => setErrorMessage('')}
                        />
                    )}
                    <Space className="control-space">
                        <Select
                            className="control-item"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            options={availableDates.map(date => ({ value: date, label: date }))}
                            placeholder="選擇季度"
                        />
                        <Select
                            className="control-item"
                            value={selectedStock}
                            onChange={setSelectedStock}
                            options={Object.keys(stockNames).map(code => ({
                                value: code.replace('.TW', ''),
                                label: `${code.replace('.TW', '')} - ${stockNames[code]}`
                            }))}
                            placeholder="選擇股票代碼"
                        />
                        <span className="threshold-text">閾值: {threshold}</span>
                        <Slider
                            className="control-item"
                            min={0.03}
                            max={0.04}
                            step={0.0001}
                            value={threshold}
                            onChange={setThreshold}
                        />
                    </Space>
                    <div className="graph-content">
                        {loading ? (
                            <div className="loading">loading...</div>
                        ) : (
                            <ReactECharts
                                option={getOption()}
                                opts={{ renderer: 'canvas' }}
                                className="echarts-for-react"
                            />
                        )}
                    </div>
                </Space>
            </Card>
            
            {/* 添加柱状图卡片 */}
            {barChartData.length > 0 && (
                <Card className="stock-graph-card">
                    <div className="bar-chart-container">
                        <ReactECharts
                            option={getBarOption()}
                            opts={{ renderer: 'canvas' }}
                            className="echarts-for-react"
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default StockRelationGraph;