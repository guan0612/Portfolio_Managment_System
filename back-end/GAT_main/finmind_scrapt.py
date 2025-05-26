from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from datetime import datetime

def login_finmind():
    driver = webdriver.Chrome()
    driver.get("https://finmindtrade.com/analysis/#/account/login")
    time.sleep(1)
    #login
    driver.find_element(By.ID, "exampleInput1").send_keys("shig378@gmail.com")
    driver.find_element(By.ID, "exampleInput2").send_keys("3SqLirKr5KSL7Xk")
    driver.find_element(By.CSS_SELECTOR, ".btn.btn-primary.btn-lg").click()
    time.sleep(5)
    
    #generate api token
    driver.find_element(By.CSS_SELECTOR, ".btn.btn-resent_verify_email.btn-info.velmld-parent").click()
    time.sleep(1)

    #wait for token to be generated and get the actual token
    token_div = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "td[aria-colindex='3'] div.velmld-parent"))
    )
    # 擷取 token 文字並去除空白
    api_token = token_div.text.strip()
    print(api_token)
    return api_token

def append_tw_suffix(stock_id):
        if not stock_id.endswith('.TW'):
            stock_id += '.TW'
        return stock_id

if __name__ == "__main__":
    
    import numpy as np
    import pandas as pd
    from FinMind.data import DataLoader
    import yfinance as yf
    
    # 使用絕對路徑
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, 'data')
    if not os.path.exists(data_dir):
        print(f"建立目錄: {data_dir}")
        os.makedirs(data_dir)
    
    #get finmind api token
    api_token = login_finmind()
    
    merged_all = pd.DataFrame()

    api = DataLoader()
    api.login_by_token(api_token=api_token)

    stock_pool = ["2330","2317","2454","2412","2308","6505","2303","2382",
                "1303","1301","2002","2207","1216","1326","3045","5871",
                "2395","2912","3008","1101","3037","3231","3034","4904",
                "2301","2357","2609","2408","3443","2618","2327","1590",
                "4938","2379","2603","2345","1402","9910","8046","2615",
                "2610","1102","2356","2376","1605","2377","3481","2409",
                "1476","2105","2324","2371","2474","1504","9945","2344",
                "2360","3017","1229","4958","9941","2347","2027","3533",
                "2353","9904","3702","2352","9921","2201","3023","3653",
                "2049","2383"]

    #get financial statement from finmind
    for stock_id in stock_pool:
        print(stock_id)
        # 計算十年前的年月
        current_year = datetime.now().year
        start_year = current_year - 10
        start_date = f'{start_year}-01-01'
        
        df = api.taiwan_stock_financial_statement(
            stock_id=stock_id,
            start_date=start_date,
        )

        df_financial_pivot = df.pivot_table(index=['date', 'stock_id'], columns='type', values='value', aggfunc='first').reset_index()
        df_financial_pivot.columns.name = None
        
        
        df = api.taiwan_stock_balance_sheet(
        stock_id=stock_id,
        start_date=start_date,
        )
        df_balance_pivot = df.pivot_table(index=['date', 'stock_id'], columns='type', values='value', aggfunc='first').reset_index()

        df_balance_pivot.columns.name = None
        
        df = api.taiwan_stock_cash_flows_statement(
        stock_id=stock_id,
        start_date=start_date,
        )
        df_cash_pivot = df.pivot_table(index=['date', 'stock_id'], columns='type', values='value', aggfunc='first').reset_index()

        df_cash_pivot.columns.name = None
        
        merged_df = df_financial_pivot.merge(df_balance_pivot, on=['date', 'stock_id']).merge(df_cash_pivot, on=['date', 'stock_id'])
        
        merged_all = pd.concat([merged_all, merged_df], ignore_index=True)
        
    merged_all = merged_all.dropna(axis=1)
    merged_all['stock_id'] = merged_all['stock_id'].apply(lambda x: x + '.TW')
    
    # 創建日期替换規則
    date_rules = {
        '03-31': '05-16',
        '06-30': '08-15',
        '09-30': '11-15',
    }

    for rule in date_rules:
        old_date = rule
        new_date = date_rules[rule]
        merged_all['date'] = merged_all['date'].str.replace(old_date, new_date)
        


    for year in range(start_year, current_year + 1):
        old_date = f'{year}-12-31'
        new_date = f'{year + 1}-04-01'
        merged_all['date'] = merged_all['date'].str.replace(old_date, new_date)

    merged_all['stock_id'] = merged_all['stock_id'].apply(append_tw_suffix)
    
    merged_all.to_csv('Financial statements.csv', index=False)
    
    # 設定 CSV 檔案路徑
    csv_file_path = 'Financial statements.csv'

    Financial_df = pd.DataFrame()

    # 讀取 CSV 檔案並轉換成 DataFrame
    df = pd.read_csv(csv_file_path)

    def append_tw_suffix(stock_id):
        if not stock_id.endswith('.TW'):
            stock_id += '.TW'
        return stock_id

    # Use the apply method to modify the 'stock_id' column
    df['stock_id'] = df['stock_id'].apply(append_tw_suffix)
    
    #get sharpe ratio from yfinance
    for stock_id in df['stock_id'].unique():
    
        #GNN使用此資料(利用上一季到這一季的資料算Sharpe Ratio),為了要讓當季財報有夏普值可以訓練edge, 預測下一季夏普值無法訓練edge
        selected_data = df[df['stock_id'] == stock_id].copy()
        selected_data['before_date'] = selected_data['date'].shift(1)
        
        selected_data['sharpe_ratio'] = None
        for index, row in selected_data.iterrows():
            if pd.isna(row['before_date']):
                continue;
            date = row['date'].replace("/", "-")
            before_date = row['before_date'].replace("/", "-")

            df_sin = yf.download(stock_id, start= before_date, end=date) 
            
            df_sin = df_sin[df_sin['Volume'] != 0]
            close = df_sin['Close']
            pct_change = close.pct_change()
        
            profit = pct_change.mean()
            risk = pct_change.std()
            sharpe_ratio = profit/ risk
        
            selected_data.at[index, 'sharpe_ratio'] = float(sharpe_ratio.iloc[0])
            
        selected_data = selected_data.drop(['before_date'], axis=1, errors='ignore')
        
        stock_filename = stock_id[:4]
        file_path = os.path.join(data_dir, f'{stock_filename}.csv')
        selected_data.to_csv(file_path, index=False)
    
