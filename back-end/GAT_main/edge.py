import os
import time
import requests
import tarfile
import numpy as np
import argparse
import pandas as pd
import glob

from models import GAT
from utils import load_cora

import torch
from torch import nn
import torch.nn.functional as F
from torch.optim import Adam
import matplotlib.pyplot as plt
import networkx as nx


# 假设CSV文件的路径
csv_file_path = 'tensor_epoch_2579.csv'
# 从CSV文件中读取边权重数据
edge_weights_matrix = pd.read_csv(csv_file_path, header=None).values

print(edge_weights_matrix.shape[0])

# 创建有向图
G = nx.DiGraph()

# 添加节点
for i in range(edge_weights_matrix.shape[0]):
    G.add_node(i)

# 添加带权重的边
all_edges = []
for i in range(edge_weights_matrix.shape[0]):
    for j in range(edge_weights_matrix.shape[1]):
        weight = edge_weights_matrix[i, j]
        if weight != 0:
            all_edges.append((i, j, weight))

# 根据权重对边进行排序
all_edges.sort(key=lambda x: x[2], reverse=True)  # 保证是从大到小排序

# 获取前1%的边
top_edges = all_edges[:int(1 * len(all_edges))]

# 添加前1%的边
for edge in top_edges:
    G.add_edge(edge[0], edge[1], weight=edge[2])

# 绘制图形，其中节点大小为1000，边的宽度为3
pos = nx.spring_layout(G)  # 使用spring布局
plt.figure(figsize=(15, 15))  # 图形尺寸更大
nx.draw(G, pos, with_labels=True, node_size=5000, node_color='skyblue', font_size=20, width=2)

# 绘制边权重
edge_labels = nx.get_edge_attributes(G, 'weight')
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=7)

# 显示图形
plt.show()