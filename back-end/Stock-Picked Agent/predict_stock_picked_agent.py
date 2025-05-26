import pandas as pd
import numpy as np
from finrl.meta.env_stock_trading.env_stocktrading import StockTradingEnv
from stable_baselines3.common.logger import configure
import pandas as pd
from sklearn.preprocessing import StandardScaler #平均值是0, 標準差是1
from finrl.meta.preprocessor.preprocessors import FeatureEngineer
from stable_baselines3 import PPO
from finrl.meta.preprocessor.preprocessors import data_split
import os
from datetime import datetime

from finrl import config
from finrl.main import check_and_make_directories
from finrl.config import (
    DATA_SAVE_DIR,
    TRAINED_MODEL_DIR,
    TENSORBOARD_LOG_DIR,
    RESULTS_DIR,
    INDICATORS,
    TRAIN_START_DATE,
    TRAIN_END_DATE,
    TEST_START_DATE,
    TEST_END_DATE,
    TRADE_START_DATE,
    TRADE_END_DATE,
    CHIPS,
)
check_and_make_directories([DATA_SAVE_DIR, TRAINED_MODEL_DIR, TENSORBOARD_LOG_DIR, RESULTS_DIR])

# read input data
path = os.path.join(os.path.dirname(__file__), 'Input for Stock-Picked Agent train.csv')
df = pd.read_csv(path)
df = df.fillna(0)

# 將日期轉換為datetime格式
df['date'] = pd.to_datetime(df['date'])

# 檢查資料的日期範圍
print("資料日期範圍：")
print(f"最早日期：{df['date'].min()}")
print(f"最晚日期：{df['date'].max()}")

# 自定義季度判斷函數
def get_quarter(date):
    month = date.month
    day = date.day
    
    # 處理年份
    if month == 4:
        year = date.year - 1  # 4月的資料屬於前一年
    elif month in [11, 12]:
        year = date.year
    elif month in [1, 2, 3]:
        year = date.year - 1  # 1-3月屬於前一年
    else:
        year = date.year
    
    if (month == 5 and day >= 16) or (month == 6) or (month == 7) or (month == 8 and day < 15):
        return f"{year}Q1"
    elif (month == 8 and day >= 15) or (month == 9) or (month == 10) or (month == 11 and day < 15):
        return f"{year}Q2"
    elif (month == 11 and day >= 15) or (month == 12) or (month == 1) or (month == 2) or (month == 3):
        return f"{year}Q3"
    else:  # 4月1日到5月15日
        return f"{year}Q4"

# 新增季度欄位
df['quarter'] = df['date'].apply(get_quarter)

features = ['CostOfGoodsSold',
            'EPS',
            'EquityAttributableToOwnersOfParent_x',
            'IncomeAfterTaxes',
            'IncomeFromContinuingOperations',
            'OtherComprehensiveIncome',
            'Revenue',
            'TAX',
            'TotalConsolidatedProfitForThePeriod',	
            'CapitalStock',
            'CapitalStock_per',	
            'CapitalSurplus',
            'CapitalSurplus_per',	
            'CashAndCashEquivalents',	
            'CashAndCashEquivalents_per',	
            'CurrentAssets',
            'CurrentAssets_per',	
            'Equity',
            'EquityAttributableToOwnersOfParent_y',
            'EquityAttributableToOwnersOfParent_per',	
            'Equity_per',
            'NoncurrentAssets',
            'NoncurrentAssets_per',	
            'NoncurrentLiabilities',
            'NoncurrentLiabilities_per',	
            'OrdinaryShare',
            'OrdinaryShare_per',	
            'OtherCurrentLiabilities',	
            'OtherCurrentLiabilities_per',	
            'OtherEquityInterest',
            'OtherEquityInterest_per',	
            'RetainedEarnings',
            'RetainedEarnings_per',	
            'TotalAssets',
            'TotalAssets_per',	
            'CashBalancesBeginningOfPeriod',
            'CashBalancesEndOfPeriod',
            'Depreciation',
            'PayTheInterest',	
            'PropertyAndPlantAndEquipment' ]

# 建立 StandardScaler 物件
ss = StandardScaler()

# 對每個季度分別進行標準化
quarterly_results = {}
for quarter in df['quarter'].unique():
    print(f"處理季度: {quarter}")
    
    # 取得該季度的資料
    quarter_df = df[df['quarter'] == quarter].copy()
    
    # 標準化特徵
    df_features_scaled = pd.DataFrame(
        ss.fit_transform(quarter_df[features]), 
        columns=features, 
        index=quarter_df.index
    )
    
    quarter_df.update(df_features_scaled)
    
    fe = FeatureEngineer(
        use_technical_indicator=False,
        tech_indicator_list=INDICATORS,
        use_vix=False,
        use_turbulence=False, 
        user_defined_feature=False
    )
    
    # 預處理資料
    processed = fe.preprocess_data(quarter_df)
    
    # 設定環境參數
    stock_dimension = len(processed.tic.unique())
    state_space = 1 + 2*stock_dimension + len(INDICATORS)*stock_dimension
    
    buy_cost_list = [0] * stock_dimension
    sell_cost_list = [0] * stock_dimension
    num_stock_shares = [0] * stock_dimension
    
    env_kwargs = {
        "hmax": 1,
        "initial_amount": 0,
        "num_stock_shares": num_stock_shares,
        "buy_cost_pct": buy_cost_list,
        "sell_cost_pct": sell_cost_list,
        "state_space": state_space,
        "stock_dim": stock_dimension,
        "tech_indicator_list": INDICATORS,
        "action_space": stock_dimension,
        "reward_scaling": 0
    }
    
    # 載入訓練好的模型
    trained_ppo = PPO.load("PPO_Stock_Picked_Agent_Sharpe_Ratio.zip")
    
    # 建立預測環境
    e_predict_gym = StockTradingEnv(
        df=processed,
        turbulence_threshold=None,
        risk_indicator_col=None,
        **env_kwargs
    )
    
    predict_env, predict_obs = e_predict_gym.get_sb_env()
    predict_env.reset()
    
    # 進行預測
    action, _states = trained_ppo.predict(predict_obs, deterministic=True)
    
    # 將預測結果與股票代碼對應
    stock_codes = processed.tic.unique()
    selected_stocks = [stock_codes[i] for i, a in enumerate(action[0]) if a > 0]
    
    # 儲存結果
    quarterly_results[str(quarter)] = {
        'selected_stocks': selected_stocks,
        'action_values': action[0].tolist()
    }

# 輸出結果
print("\n各季度選股結果：")
for quarter, result in quarterly_results.items():
    print(f"\n季度: {quarter}")
    print(f"選中的股票: {result['selected_stocks']}")
    print(f"動作值: {result['action_values']}")

# 將結果轉換為DataFrame並儲存
results_list = []
for quarter, result in quarterly_results.items():
    # 取得該季度的所有股票代碼
    quarter_df = df[df['quarter'] == quarter]
    all_stocks = quarter_df['tic'].unique()  # 使用 'tic' 作為股票代碼欄位
    
    # 建立股票代碼到動作值的映射
    stock_action_map = dict(zip(result['selected_stocks'], result['action_values']))
    
    # 為所有股票建立記錄
    for stock in all_stocks:
        results_list.append({
            'quarter': quarter,
            'stock_code': stock,
            'action_value': stock_action_map.get(stock, 0)  # 如果股票未被選中，動作值為0
        })

results_df = pd.DataFrame(results_list)
results_path = os.path.join(os.path.dirname(__file__), 'quarterly_stock_predictions.csv')
results_df.to_csv(results_path, index=False, encoding='utf-8')
print(f"\n預測結果已儲存至：{results_path}")
