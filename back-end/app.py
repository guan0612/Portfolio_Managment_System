from flask import Flask, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import glob
import os

app = Flask(__name__)
CORS(app)

# 從GAT_main/output中獲取所有日期
@app.route('/api/dates', methods=['GET'])
def get_available_dates():

    files = glob.glob('./GAT_main/output/*.csv')
    dates = [os.path.basename(f).replace('tensor_epoch_', '').replace('.csv', '') for f in files]
    dates.sort(reverse=True)  
    return jsonify(dates)

# 從GAT_main/output中獲取指定日期的CSV文件
@app.route('/api/<date>', methods=['GET'])
def gat(date):
    try:

        file_path = f'./GAT_main/output/tensor_epoch_{date}.csv'
        df = pd.read_csv(file_path)
        
        matrix_data = df.to_dict(orient='records')
        return jsonify(matrix_data)
    except FileNotFoundError:
        return jsonify({"error": "Data not found for the specified date"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 從Trading Agent中獲取交易行為和帳戶價值數據
@app.route('/api/trading-performance', methods=['GET'])
def trading_performance():

    actions_path = './Trading Agent/actions.csv'
    account_value_path = './Trading Agent/account_value.csv'
    

    if not os.path.exists(actions_path) or not os.path.exists(account_value_path):
        return jsonify({"error": "數據文件不存在"}), 404
    

    actions_df = pd.read_csv(actions_path)
    account_value_df = pd.read_csv(account_value_path)
 
    actions_data = actions_df.to_dict(orient='records')
    account_value_data = account_value_df.to_dict(orient='records')
    

    account_value_df['daily_return'] = account_value_df['account_value'].pct_change()
    account_value_df['daily_return'].iloc[0] = 0  
    account_value_df['cumulative_return'] = (account_value_df['account_value'] / account_value_df['account_value'].iloc[0]) - 1
    
 
    return jsonify({
        "actions": actions_data,
        "account_value": account_value_df[['date', 'account_value', 'daily_return', 'cumulative_return']].to_dict(orient='records'),
        "stocks": actions_df.columns[1:].tolist()  
    })

# 從Trading Agent中獲取低風險股票列表
@app.route('/api/low-risk-stocks', methods=['GET'])
def get_low_risk_stocks():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(current_dir, 'Trading Agent', 'Low-risk stock list.csv')
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return jsonify({"error": "Failed to read CSV file"}), 500

# 從Stock-Picked Agent中獲取Sharpe Ratio
@app.route('/api/sharpe-ratios')
def get_sharpe_ratios():
    try:
        # Get the absolute path to the CSV file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, 'Stock-Picked Agent', 'SharpeRatio.csv')
        
        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found at {file_path}'}), 404
        
        # Read the CSV file using pandas
        df = pd.read_csv(file_path)
        
        # Convert the data to a format suitable for the frontend
        # Group by stock_id to get time series of Sharpe ratios for each stock
        sharpe_data = {}
        for stock_id in df['stock_id'].unique():
            stock_data = df[df['stock_id'] == stock_id]
            sharpe_data[stock_id] = {
                'dates': stock_data['date'].tolist(),
                'values': stock_data['sharpe_ratio'].tolist()
            }
        
        return jsonify(sharpe_data)
    except Exception as e:
        print(f"Error reading Sharpe ratio file: {str(e)}")
        return jsonify({'error': str(e)}), 500

# 從Stock-Picked Agent中獲取季度預測結果
@app.route('/api/quarterly-predictions', methods=['GET'])
def get_quarterly_predictions():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(current_dir, 'Stock-Picked Agent', 'quarterly_stock_predictions.csv')
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return jsonify({"error": "Failed to read CSV file"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)




