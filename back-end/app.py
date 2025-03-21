from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import glob
import os

app = Flask(__name__)
CORS(app)

@app.route('/gat/dates', methods=['GET'])
def get_available_dates():
    # 取得所有CSV文件
    files = glob.glob('./GAT_main/output/*.csv')
    # 從文件名中提取日期
    dates = [os.path.basename(f).replace('tensor_epoch_', '').replace('.csv', '') for f in files]
    dates.sort(reverse=True)  # 最新日期在前
    return jsonify(dates)

@app.route('/gat/<date>', methods=['GET'])
def gat(date):
    try:
        # 取得指定日期的CSV文件
        file_path = f'./GAT_main/output/tensor_epoch_{date}.csv'
        df = pd.read_csv(file_path)
        
        # 將DataFrame轉換為所需的JSON格式
        matrix_data = df.to_dict(orient='records')
        return jsonify(matrix_data)
    except FileNotFoundError:
        return jsonify({"error": "Data not found for the specified date"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
