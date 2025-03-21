from flask import Flask, jsonify
from flask_cors import CORS
from GAT_main.run_GATModel import GATModel
import pandas as pd
import os
app = Flask(__name__)
CORS(app)

@app.route('/gat', methods=['GET'])
def gat():
    # gat_model = GATModel()
    # result = gat_model.run_gat()
    # matrix_data = result.to_dict(orient='records')
    # print("Returning data:", matrix_data)  # 調試用
    
    # 讀取 CSV 文件
    file_path = f'E:/fintech/Portfolio-Management-via-Reinforcement-Learning-and-Graph-Attention-Network-main/back-end/GAT_main/output/tensor_epoch_2024-05-16.csv'
    df = pd.read_csv(file_path)
    
    # 将DataFrame转换为所需的JSON格式
    result = []
    for index, row in df.iterrows():
        # 将每一行转换为字典
        row_dict = row.to_dict()
        result.append(row_dict)
        
    print("Returning data:", result)  # 调试输出
    return jsonify(result)

@app.route('/trading-performance', methods=['GET'])
def trading_performance():
    # 讀取交易行為和帳戶價值數據
    actions_path = './Trading Agent/actions.csv'
    account_value_path = './Trading Agent/account_value.csv'
    
    # 確保文件存在
    if not os.path.exists(actions_path) or not os.path.exists(account_value_path):
        return jsonify({"error": "數據文件不存在"}), 404
    
    # 讀取數據
    actions_df = pd.read_csv(actions_path)
    account_value_df = pd.read_csv(account_value_path)
    
    # 處理數據以便前端使用
    actions_data = actions_df.to_dict(orient='records')
    account_value_data = account_value_df.to_dict(orient='records')
    
    # 計算每日收益率
    account_value_df['daily_return'] = account_value_df['account_value'].pct_change()
    account_value_df['daily_return'].iloc[0] = 0  # 第一天沒有收益率，設為0
    account_value_df['cumulative_return'] = (account_value_df['account_value'] / account_value_df['account_value'].iloc[0]) - 1
    
    # 將處理後的數據加入結果
    return jsonify({
        "actions": actions_data,
        "account_value": account_value_df[['date', 'account_value', 'daily_return', 'cumulative_return']].to_dict(orient='records'),
        "stocks": actions_df.columns[1:].tolist()  # 獲取股票代碼列表
    })

if __name__ == '__main__':
    app.run(debug=True)