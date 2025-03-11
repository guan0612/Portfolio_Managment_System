import os
import torch
from GAT_main.models import GAT
import pandas as pd
import numpy as np
import torch.nn as nn
import glob
import sys

def force_print(*args):
    print(*args, flush=True)
    sys.stdout.flush()

class GATModel:
    def __init__(self):
        # 使用絕對路徑
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(self.base_dir, 'output')
        self.data_dir = os.path.join(self.base_dir, 'data/*.csv')
        self.date_file = os.path.join(self.base_dir, 'date.txt')
        self.model = os.path.join(self.base_dir, 'output/gat_model.pth')

    def test(self, model, criterion, input, target, mask):
        model.eval()
        with torch.no_grad():
            output , edge= model(*input)
            output, target = output[mask], target[mask]
            output = output.squeeze(1)

            loss = criterion(output, target)
        return edge, loss.item()

    def load_model(self, device):
    
        if os.path.exists(self.model):
            checkpoint = torch.load(self.model, map_location=device)
            
            # 創建模型實例
            model = GAT(
                in_features=25,
                n_hidden=64,
                n_heads=8,
                num_classes=1,
                concat=False,
                dropout=0.6,
                leaky_relu_slope=0.2
            ).to(device)
            
            return model
        else:
            raise FileNotFoundError(f"No model found")
        

    def read_data(self, file_paths, index, device):
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

        for files in file_paths:
            for f in files:
                feature_csv = pd.read_csv(f, usecols=feature_cols).iloc[index:index+1]
                feature = pd.concat([feature, feature_csv], ignore_index=True)
                
                label_csv = pd.read_csv(f, usecols=label_cols).iloc[index:index+1]
                label = pd.concat([label, label_csv], ignore_index=True)

        for col in feature_cols:
            feature[col] = (feature[col] - feature[col].mean()) / feature[col].std()
        for col in label_cols:
            label[col] = (label[col] - label[col].mean()) / label[col].std()

        feature_tensor = torch.tensor(feature.values.astype(np.float32)).to(device)
        
        label_tensor = torch.tensor(label.values.astype(np.float32)).squeeze().to(device)
        
        adj_mat = torch.ones((74, 74), dtype=torch.float32).to(device)

        return feature_tensor,label_tensor,adj_mat

    def run_gat(self):
        file_paths_array = [glob.glob(self.data_dir)]
       
        for graph in range(1,45):
            features, labels, adj_mat = self.read_data(file_paths_array, graph, "cuda")
            
            idx = torch.randperm(len(labels)).to("cuda")
            idx_train, idx_val, idx_test = idx[:60], idx[60:68], idx[68:]

            criterion = nn.MSELoss()
            
            gat_model = self.load_model("cuda")
            
            edge, loss_test = self.test(gat_model, criterion, (features, adj_mat), labels, idx_test)
            numpy_array = edge.detach().cpu().numpy()
            
            # 重塑numpy_array為二維數組
            reshaped_array = numpy_array.reshape(-1, numpy_array.shape[2])
            # 定義股票代號列表
            stock_codes = [
                '1101', '1102', '1216', '1229', '1301', '1303', '1326', '1402', 
                '1476', '1504', '1590', '1605', '2002', '2027', '2049', '2105', 
                '2201', '2207', '2301', '2303', '2308', '2317', '2324', '2327', 
                '2330', '2344', '2345', '2347', '2352', '2353', '2356', '2357', 
                '2360', '2371', '2376', '2377', '2379', '2382', '2383', '2395', 
                '2408', '2409', '2412', '2454', '2474', '2603', '2609', '2610', 
                '2615', '2618', '2912', '3008', '3017', '3023', '3034', '3037', 
                '3045', '3231', '3443', '3481', '3533', '3653', '3702', '4904', 
                '4938', '4958', '5871', '6505', '8046', '9904', '9910', '9921', 
                '9941', '9945'
            ]
            
            # 使用股票代號作為DataFrame的列名
            df = pd.DataFrame(reshaped_array, columns=stock_codes)

            # 確保輸出目錄存在
            os.makedirs('./output', exist_ok=True)
            
            # 保存結果
            file_name = f'./output/tensor_epoch_{graph}.csv'
            df.to_csv(file_name, index=False)
        return df
