import schedule
import time
from datetime import datetime, timedelta
import os
import sys
import logging
from pathlib import Path
import shutil

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training_schedule.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

def clean_old_data():
    """清理過期的資料"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(current_dir, 'data')
        output_dir = os.path.join(current_dir, 'output')
        
        # 設定保留期限（例如：保留最近3次的資料）
        current_date = datetime.now()
        
        # 清理 data 目錄
        if os.path.exists(data_dir):
            logging.info("開始清理 data 目錄...")
            for file in os.listdir(data_dir):
                if file.endswith('.csv'):
                    file_path = os.path.join(data_dir, file)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    # 如果檔案超過3個月，就刪除
                    if (current_date - file_time).days > 90:
                        os.remove(file_path)
                        logging.info(f"已刪除過期檔案: {file}")
        
        # 清理 output 目錄
        if os.path.exists(output_dir):
            logging.info("開始清理 output 目錄...")
            for file in os.listdir(output_dir):
                file_path = os.path.join(output_dir, file)
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                # 如果檔案超過3個月，就刪除
                if (current_date - file_time).days > 90:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                    logging.info(f"已刪除過期檔案/目錄: {file}")
        
        logging.info("清理完成")
        
    except Exception as e:
        logging.error(f"清理過程中發生錯誤: {str(e)}")

def get_next_quarter_date():
    """計算下一個季報的日期"""
    today = datetime.now()
    current_month = today.month
    
    # 定義季報日期
    quarter_dates = {
        1: (5, 15),    # Q1: 5月15日
        2: (8, 14),    # Q2: 8月14日
        3: (11, 14),   # Q3: 11月14日
        4: (4, 1)      # Q4: 4月1日
    }
    
    # 判斷當前季度
    if current_month <= 3:
        quarter = 1
    elif current_month <= 6:
        quarter = 2
    elif current_month <= 9:
        quarter = 3
    else:
        quarter = 4
    
    # 獲取下一個季度的日期
    next_quarter = quarter % 4 + 1
    month, day = quarter_dates[next_quarter]
    
    # 如果是第四季度，年份要加1
    year = today.year + 1 if next_quarter == 1 else today.year
    
    return datetime(year, month, day)

def run_training():
    """執行資料更新和模型訓練"""
    try:
        logging.info("開始執行資料更新和模型訓練")
        
        # 執行資料爬取
        logging.info("執行資料爬取...")
        os.system('python finmind_scrapt.py')
        
        # 執行模型訓練
        logging.info("執行模型訓練...")
        os.system('python train.py')
        
        logging.info("資料更新和模型訓練完成")
        
    except Exception as e:
        logging.error(f"執行過程中發生錯誤: {str(e)}")

def schedule_next_training():
    """排程下一次訓練"""
    next_date = get_next_quarter_date()
    logging.info(f"下次訓練時間設定為: {next_date.strftime('%Y-%m-%d')}")
    
    # 設定排程
    schedule.every().day.at("00:00").do(check_and_run_training)
    # 設定每月1號清理過期資料
    schedule.every().month.at("01:00").do(clean_old_data)
    
    while True:
        schedule.run_pending()
        time.sleep(3600)  # 每小時檢查一次

def check_and_run_training():
    """檢查是否需要執行訓練"""
    next_date = get_next_quarter_date()
    today = datetime.now()
    
    # 如果今天是季報日期，執行訓練
    if today.date() == next_date.date():
        run_training()

if __name__ == "__main__":
    logging.info("啟動排程系統")
    
    # 檢查是否為季報日期
    next_date = get_next_quarter_date()
    today = datetime.now()
    
    if today.date() == next_date.date():
        logging.info("今天是季報日期，立即執行訓練")
        run_training()
    
    # 執行一次清理
    clean_old_data()
    
    # 開始排程
    schedule_next_training() 