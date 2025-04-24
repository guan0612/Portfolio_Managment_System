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
import matplotlib.pyplot as plt
import torch
from torch import nn
import torch.nn.functional as F
from torch.optim import Adam

#################################
### TRAIN AND TEST FUNCTIONS  ###
#################################

min_loss_val = 0

def test(model, criterion, input, target, mask):
    model.eval()
    with torch.no_grad():
        output , edge= model(*input)
        output, target = output[mask], target[mask]
        output = output.squeeze(1)

        loss = criterion(output, target)
    return loss.item()
    
def train_iter(epoch, model, optimizer, criterion, input, target, mask_train, mask_val, F_date, print_every=10):

    global min_loss_val
    
    start_t = time.time()
    model.train()
    optimizer.zero_grad()

    # Forward pass
    output, edge = model(*input)

    output = output.squeeze(1)

    loss = criterion(output[mask_train], target[mask_train]) # Compute the loss using the training mask

    loss.backward()
    optimizer.step()

    # Evaluate the model performance on training and validation sets
    loss_train = test(model, criterion, input, target, mask_train)
    loss_val = test(model, criterion, input, target, mask_val)

    
    if epoch % (print_every*10) == 0:
        # Print the training progress at specified intervals
        print(f'Epoch: {epoch:04d} ({(time.time() - start_t):.4f}s) loss_train: {loss_train:.4f}  loss_val: {loss_val:.4f} ')

    if epoch ==1:
        min_loss_val = loss_val
        
    if loss_val <  min_loss_val or epoch == 1:
        min_loss_val = loss_val
        numpy_array = edge.detach().cpu().numpy()
        # 重塑numpy_array為二維數組
        reshaped_array = numpy_array.reshape(-1, numpy_array.shape[2])
        df = pd.DataFrame(reshaped_array)
        
        file_name = f'tensor_epoch_{F_date}.csv'
        df.to_csv(file_name, index=False)
        
    return loss_train, loss_val

def get_dates_from_csv():
    # 讀取第一個股票文件來獲取日期
    first_stock_file = glob.glob("./data/*.csv")[0]  # 獲取第一個CSV文件
    df = pd.read_csv(first_stock_file)
    dates = df['date'].unique().tolist()  # 獲取所有不重複的日期
    return dates

if __name__ == '__main__':

    # Training settings
    # All defalut values are the same as in the config used in the main paper

    parser = argparse.ArgumentParser(description='PyTorch Graph Attention Network')
    parser.add_argument('--epochs', type=int, default=300,
                        help='number of epochs to train (default: 300)')
    parser.add_argument('--lr', type=float, default=0.005,
                        help='learning rate (default: 0.005)')
    parser.add_argument('--l2', type=float, default=5e-4,
                        help='weight decay (default: 6e-4)')
    parser.add_argument('--dropout-p', type=float, default=0.6,
                        help='dropout probability (default: 0.6)')
    parser.add_argument('--hidden-dim', type=int, default=64,
                        help='dimension of the hidden representation (default: 64)')
    parser.add_argument('--num-heads', type=int, default=8,
                        help='number of the attention heads (default: 4)')
    parser.add_argument('--concat-heads', action='store_true', default=False,
                        help='wether to concatinate attention heads, or average over them (default: False)')
    parser.add_argument('--val-every', type=int, default=20,
                        help='epochs to wait for print training and validation evaluation (default: 20)')
    parser.add_argument('--no-cuda', action='store_true', default=False,
                        help='disables CUDA training')
    parser.add_argument('--no-mps', action='store_true', default=False,
                        help='disables macOS GPU training')
    parser.add_argument('--dry-run', action='store_true', default=False,
                        help='quickly check a single pass')
    parser.add_argument('--seed', type=int, default=13, metavar='S',
                        help='random seed (default: 13)')
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    use_cuda = not args.no_cuda and torch.cuda.is_available()
    use_mps = not args.no_mps and torch.backends.mps.is_available()

    # Set the device to run on
    if use_cuda:
        device = torch.device('cuda')
    elif use_mps:
        device = torch.device('mps')
    else:
        device = torch.device('cpu')
    print(f'Using {device} device')

    def read_data(file_paths,index):
        feature_cols = ["CostOfGoodsSold",	
                        "EPS",
                        "IncomeAfterTaxes",
                        "IncomeFromContinuingOperations",
                        "OtherComprehensiveIncome",
                        "Revenue",	
                        "TAX",
                        "TotalConsolidatedProfitForThePeriod",
                        "CapitalStock",		
                        "CapitalSurplus",		
                        "CashAndCashEquivalents",	
                        "CurrentAssets",	
                        "Equity",	
                        "NoncurrentAssets",	
                        "NoncurrentLiabilities",	
                        "OrdinaryShare",	
                        "OtherCurrentLiabilities",	
                        "OtherEquityInterest",	
                        "RetainedEarnings",	
                        "TotalAssets",	
                        "CashBalancesBeginningOfPeriod",	
                        "CashBalancesEndOfPeriod",	
                        "Depreciation",	
                        "PayTheInterest",	
                        "PropertyAndPlantAndEquipment" ]
                        
        label_cols = ["sharpe_ratio"]
        
        feature = pd.DataFrame()
        label = pd.DataFrame()
        
        file_paths.sort()  # 确保文件按字母顺序读取
        
        feature_tensor = torch.tensor([], dtype=torch.float)  # 初始化为空Tensor
        label_tensor = torch.tensor([], dtype=torch.float)  # 初始化为空Tensor
        adj_mat = torch.tensor([], dtype=torch.float)  # 如果你需要重新初始化adj_mat
    
    
        for files in file_paths:
            for f in files:
                feature_csv = pd.read_csv(f, usecols=feature_cols).iloc[index:index+1]
                feature = pd.concat([feature, feature_csv], ignore_index=True)
                
                label_csv = pd.read_csv(f, usecols=label_cols).iloc[index:index+1]
                label = pd.concat([label, label_csv], ignore_index=True)
        
        #for col in feature_cols:
        #    feature[col] = (feature[col] - feature[col].min()) / (feature[col].max() - feature[col].min())
        #for col in label_cols:
        #    label[col] = (label[col] - label[col].min()) / (label[col].max() - label[col].min())
    
        for col in feature_cols:
            feature[col] = (feature[col] - feature[col].mean()) / feature[col].std()
        for col in label_cols:
            label[col] = (label[col] - label[col].mean()) / label[col].std()
    
        feature_tensor = torch.tensor(feature.values.astype(float))
        
        label_tensor = torch.tensor(label.values.astype(float)).squeeze()
        
        adj_mat = torch.ones((74, 74))
    
        # 將所有張量移到同一個設備上
        feature_tensor = feature_tensor.float().to(device)
        adj_mat = adj_mat.float().to(device)
        label_tensor = label_tensor.float().to(device)

        return feature_tensor, label_tensor, adj_mat
 

    file_paths = [glob.glob("./data/*.csv")]
    
    # 替換原來的 date.txt 讀取方式
    dates = get_dates_from_csv()
    
    # Create the model
    # The model consists of a 2-layer stack of Graph Attention Layers (GATs).
    gat_net = GAT(
        in_features=25,#features.shape[1],          # Number of input features per node  
        n_hidden=args.hidden_dim,               # Output size of the first Graph Attention Layer
    	n_heads=args.num_heads,                 # Number of attention heads in the first Graph Attention Layer
    	num_classes=1,#labels.max().item() + 1,    # Number of classes to predict for each node
    	concat=args.concat_heads,               # Wether to concatinate attention heads
    	dropout=args.dropout_p,                 # Dropout rate
    	leaky_relu_slope=0.2                    # Alpha (slope) of the leaky relu activation
    ).to(device)
    
    # configure the optimizer and loss function
    optimizer = Adam(gat_net.parameters(), lr=args.lr, weight_decay=args.l2)
    criterion = nn.MSELoss()
    
    for graph in range(40, len(dates)+1):
        if graph <= len(dates):
            F_date = dates[graph-1]
            print(f"第{graph}筆的資料: {F_date}")
        else:
            F_date = ''
            print(f"第{graph}筆的資料不存在。")

        features, labels, adj_mat = read_data(file_paths,graph-1)
        
        # 創建並移動索引
        idx = torch.randperm(len(labels)).to(device)
        idx_train, idx_val, idx_test = idx[:60], idx[60:68], idx[68:]
        
        # 初始化損失列表
        train_losses = []
        val_losses = []
        
        min_loss_val = 0

        # Train and evaluate the model
        for epoch in range(args.epochs):
            loss_train, loss_val = train_iter(epoch + 1, gat_net, optimizer, criterion, (features, adj_mat), labels, idx_train, idx_val, F_date , args.val_every)
            train_losses.append(loss_train)
            val_losses.append(loss_val)
            if args.dry_run:
                break
        
        
        loss_test = test(gat_net, criterion, (features, adj_mat), labels, idx_test)
        #print(gat_net)
        print(f'Test set results: loss {loss_test:.4f}')
        
        # 獲得最小訓練損失及其對應的epoch
        min_train_loss_epoch = train_losses.index(min(train_losses)) + 1  # 索引+1，因為epoch從1開始
        min_train_loss = min(train_losses)
        
        # 獲得最小驗證損失及其對應的epoch
        min_val_loss_epoch = val_losses.index(min(val_losses)) + 1  # 索引+1，因為epoch從1開始
        min_val_loss = min(val_losses)
        
        print(f"Minimum training loss of {min_train_loss} occurred at epoch {min_train_loss_epoch}.")
        print(f"Minimum validation loss of {min_val_loss} occurred at epoch {min_val_loss_epoch}.")