import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Slider, Switch, Space, Button, Select } from 'antd';
import '../style/StockRelationGraph.css';
import { stockNames } from '../data/stockNames';
import { stockIndustries, getAllIndustries } from '../data/stockIndustries';
import { industryColors } from '../data/industryColors';

const { Option } = Select;

const StockRelationGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [threshold, setThreshold] = useState(0.0330);
    const [showLabels, setShowLabels] = useState(true);
    const [selectedStock, setSelectedStock] = useState('1101');
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const allIndustries = getAllIndustries();

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

    useEffect(() => {
        setSelectedStock('1101');
    }, []);

    // 取得可用日期
    useEffect(() => {
        fetch('http://localhost:5000/gat/dates')
            .then(response => response.json())
            .then(dates => {
                setAvailableDates(dates);
                if (dates.length > 0) {
                    setSelectedDate(dates[0]); // 預設選擇最新日期
                }
            })
            .catch(error => console.error('Error fetching dates:', error));
    }, []);

    // 監聽選擇的股票變化
    useEffect(() => {
        if (selectedStock) {
            handleSearch();
        }
    }, [selectedStock]);

    // 取得圖數據
    useEffect(() => {
        if (!selectedDate) return;
        
        setLoading(true);
        fetch(`http://localhost:5000/gat/${selectedDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data); // 添加調試信息
                
                if (data.error) {
                    console.error('Server error:', data.error);
                    setLoading(false);
                    return;
                }

                console.log('Data length:', data.length);
                console.log('First row keys:', Object.keys(data[0]));
                console.log('First row:', data[0]);

                if (Array.isArray(data)) {
                    const nodes = new Set();
                    const links = [];
                    
                    // 先取得所有股票代碼（從第一行的keys）
                    const stockCodes = Object.keys(data[0]);
                    
                    // 遍歷每一行（每一行代表一支股票與其他股票的關係）
                    data.forEach((row, rowIndex) => {
                        const sourceStock = stockCodes[rowIndex];  // 該行代表的股票
                        
                        // 遍歷該股票與其他股票的關係
                        stockCodes.forEach((targetStock, colIndex) => {
                            if (rowIndex === colIndex || rowIndex > colIndex) return;  // 跳過自己 or 跳過重複的關係
                            
                            const weight = parseFloat(row[targetStock]);
                            
                            if (!isNaN(weight) && weight > 0) {
                                nodes.add(sourceStock);
                                nodes.add(targetStock);
                                links.push({
                                    source: sourceStock,
                                    target: targetStock,
                                    value: weight,
                                    lineStyle: {
                                        opacity: Math.min(weight * 2, 1),
                                        width: Math.max(1, weight * 5)
                                    }
                                });
                            }
                        });
                    });

                    console.log('Number of nodes:', nodes.size);
                    console.log('Number of links:', links.length);
                    console.log('Sample nodes:', Array.from(nodes).slice(0, 5));
                    console.log('Sample links:', links.slice(0, 5));
                    console.log('all links:', links);

                    if (nodes.size > 0) {
                        setGraphData({
                            nodes: Array.from(nodes).map(code => ({
                                name: code,
                                value: links.filter(link => 
                                    (link.source === code || link.target === code) && link.value > 0 
                                ).length,
                                category: getStockIndustry(code)
                            })),
                            links: links
                        });
                    }
                    setLoading(false);
                }
            })
            .catch(error => {
                console.error('Error fetching graph data:', error);
                setLoading(false);
            });
    }, [selectedDate, threshold]);

    const handleSearch = () => {
        // 清除之前的高亮狀態
        setHighlightedNodes([]);

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

        // 找出與搜索股票相關的所有連接
        const relatedLinks = graphData.links.filter(link => 
            (link.source === selectedStock || link.target === selectedStock) && link.value >= threshold  // 只顯示符合閥值的連接
        );

        if (relatedLinks.length === 0) {
            console.warn(`Stock ${selectedStock} has no connections above threshold (${threshold})`);
            return;
        }

        // 取得相關節點
        const relatedNodes = new Set();
        relatedLinks.forEach(link => {
            relatedNodes.add(link.source);
            relatedNodes.add(link.target);
        });

        setHighlightedNodes(Array.from(relatedNodes));

        // 打印相關信息，按照相關度排序
        console.log(`Stock ${selectedStock} (${getCompanyName(selectedStock)}) connections:`);
        relatedLinks
            .sort((a, b) => b.value - a.value)  // 依相關度從高到低排序
            .forEach(link => {
                const sourceName = getCompanyName(link.source);
                const targetName = getCompanyName(link.target);
                console.log(`${link.source} (${sourceName}) → ${link.target} (${targetName}): ${link.value.toFixed(4)}`);
            });
    };

    const getOption = () => {
        return {
            title: {
                text: 'Stock Relation Graph',
                subtext: 'based on GAT model',
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
                        symbolSize: Math.max(20, Math.min(50, 20 + node.value)),  // 根據連結數調整節點大小
                        itemStyle: {
                            color: getIndustryColor(node.name)
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
                    .filter(link => 
                        highlightedNodes.length === 0 || 
                        (highlightedNodes.includes(link.source) && highlightedNodes.includes(link.target))
                    )
                    .map(link => ({
                        ...link,
                        lineStyle: {
                            width: 3,
                            opacity: Math.min(link.value * 2, 1),
                            curveness: 0.1
                        },
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

    return (
        <div className="stock-graph-container">
            <Card className="stock-graph-card">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedDate}
                            onChange={setSelectedDate}
                            options={availableDates.map(date => ({ value: date, label: date }))}
                            placeholder="選擇日期"
                        />
                        <Select
                            style={{ width: 200 }}
                            value={selectedStock}
                            onChange={setSelectedStock}
                            options={Object.keys(stockNames).map(code => ({
                                value: code.replace('.TW', ''),
                                label: `${code.replace('.TW', '')} - ${stockNames[code]}`
                            }))}
                            placeholder="選擇股票代碼"
                        />
                        <span>閾值: {threshold}</span>
                        <Slider
                            style={{ width: 200 }}
                            min={0}
                            max={0.1000}
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
                                style={{ height: '100%', width: '100%' }}
                                opts={{ renderer: 'canvas' }}
                                className="echarts-for-react"
                            />
                        )}
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default StockRelationGraph;