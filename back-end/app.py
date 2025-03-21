from flask import Flask, jsonify, send_file
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

@app.route('/api/low-risk-stocks', methods=['GET'])
def get_low_risk_stocks():
    try:
        # Get the absolute path to the CSV file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(current_dir, 'Trading Agent', 'Low-risk stock list.csv')
        
        # Read and return the CSV file
        with open(csv_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return jsonify({"error": "Failed to read CSV file"}), 500

if __name__ == '__main__':
    app.run(debug=True)


