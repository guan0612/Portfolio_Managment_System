import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Slider, Switch, Space, Input, Button } from 'antd';
import '../style/StockRelationGraph.css';

const StockRelationGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [threshold, setThreshold] = useState(0.01);
    const [showLabels, setShowLabels] = useState(true);
    const [searchCode, setSearchCode] = useState('');
    const [highlightedNodes, setHighlightedNodes] = useState([]);

    useEffect(() => {
        fetchGraphData();
    }, [threshold]);

    const fetchGraphData = async () => {
        try {
            const response = await fetch('http://localhost:5000/gat');
            const data = await response.json();
            console.log('Raw data:', data);

            const nodes = new Set();
            const links = [];
            
            // 处理邻接矩阵
            data.forEach((row, rowIndex) => {
                // 获取当前行的股票代码（作为源节点）
                const stockCodes = Object.keys(row);
                const sourceCode = stockCodes[rowIndex];  // 使用行索引对应的股票代码
                nodes.add(sourceCode);

                // 遍历该行所有的值，建立连接
                stockCodes.forEach((targetCode, colIndex) => {
                    const weight = row[targetCode];
                    // 只添加权重大于阈值的连接，并且避免自连接
                    if (weight > threshold && sourceCode !== targetCode) {
                        links.push({
                            source: sourceCode,
                            target: targetCode,
                            value: parseFloat(weight),
                            lineStyle: {
                                width: Math.max(1, parseFloat(weight) * 10),
                                opacity: Math.min(parseFloat(weight) * 5, 1)
                            }
                        });
                    }
                });
            });

            // 创建节点数组
            const nodesArray = Array.from(nodes).map(code => {
                const connectionCount = links.filter(link => 
                    link.source === code || link.target === code
                ).length;
                
                return {
                    name: code,
                    value: connectionCount,
                    symbolSize: Math.max(20, Math.min(50, 20 + connectionCount * 2)),
                    itemStyle: {
                        color: '#1890ff'
                    }
                };
            });

            console.log('Nodes:', nodesArray);
            console.log('Links:', links);
            console.log('Total links:', links.length);
            console.log('Sample links:', links.slice(0, 5));

            setGraphData({
                nodes: nodesArray,
                links: links
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching graph data:', error);
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchCode) return;

        // 找出与搜索股票相关的所有连接
        const relatedLinks = graphData.links.filter(link => 
            link.source === searchCode || link.target === searchCode
        );

        // 获取相关节点
        const relatedNodes = new Set();
        relatedLinks.forEach(link => {
            relatedNodes.add(link.source);
            relatedNodes.add(link.target);
        });

        setHighlightedNodes(Array.from(relatedNodes));

        // 打印相关信息
        console.log(`股票 ${searchCode} 的相關連接：`);
        relatedLinks.forEach(link => {
            console.log(`${link.source} → ${link.target}: ${link.value.toFixed(4)}`);
        });
    };

    const getOption = () => ({
        title: {
            text: '股票關聯圖',
            subtext: '基於GAT模型的分析結果',
            top: 'top',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (params.dataType === 'edge') {
                    return `${params.data.source} → ${params.data.target}<br/>相關度: ${params.data.value.toFixed(4)}`;
                }
                return `股票代碼: ${params.name}<br/>連接數: ${params.value}`;
            }
        },
        series: [{
            name: '股票關聯',
            type: 'graph',
            layout: 'force',
            data: graphData.nodes.map(node => ({
                ...node,
                itemStyle: {
                    color: highlightedNodes.length === 0 || highlightedNodes.includes(node.name) 
                        ? '#1890ff' 
                        : '#cccccc'
                }
            })),
            links: graphData.links.map(link => ({
                ...link,
                lineStyle: {
                    ...link.lineStyle,
                    opacity: highlightedNodes.length === 0 || 
                        (highlightedNodes.includes(link.source) && highlightedNodes.includes(link.target))
                        ? link.lineStyle.opacity
                        : 0.1
                }
            })),
            roam: true,
            label: {
                show: showLabels,
                position: 'right',
                fontSize: 12
            },
            force: {
                repulsion: 500,
                gravity: 0.1,
                edgeLength: 200,
                layoutAnimation: true
            },
            lineStyle: {
                color: '#1890ff',
                curveness: 0.3
            },
            emphasis: {
                focus: 'adjacency',
                lineStyle: {
                    width: 10
                }
            }
        }]
    });

    return (
        <Card title="股票關聯圖" style={{ margin: '20px' }}>
            <Space direction="vertical" style={{ marginBottom: '20px', width: '100%' }}>
                <div>
                    相關度閾值: {threshold}
                    <Slider
                        min={0}
                        max={0.1}
                        step={0.001}
                        value={threshold}
                        onChange={setThreshold}
                    />
                </div>
                <div>
                    顯示標籤:
                    <Switch
                        checked={showLabels}
                        onChange={setShowLabels}
                        style={{ marginLeft: '10px' }}
                    />
                </div>
                <Space>
                    <Input 
                        placeholder="輸入股票代碼" 
                        value={searchCode}
                        onChange={e => setSearchCode(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button onClick={handleSearch}>查看關聯</Button>
                    <Button onClick={() => {
                        setSearchCode('');
                        setHighlightedNodes([]);
                    }}>重置</Button>
                </Space>
            </Space>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>載入中...</div>
            ) : (
                <div style={{ height: '600px', width: '100%' }}>
                    <ReactECharts
                        option={getOption()}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                    />
                </div>
            )}
        </Card>
    );
};

export default StockRelationGraph; 