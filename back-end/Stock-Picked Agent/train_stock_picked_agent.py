import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from finrl.meta.preprocessor.preprocessors import FeatureEngineer, data_split
from finrl.meta.env_stock_trading.env_stocktrading import StockTradingEnv
from stable_baselines3.common.logger import configure
from finrl.meta.data_processor import DataProcessor
from sklearn.preprocessing import StandardScaler #平均值是0, 標準差是1
from finrl.agents.stablebaselines3.models import DRLAgent
from finrl.plot import backtest_stats, backtest_plot, get_daily_return, get_baseline
from pprint import pprint
import sys
sys.path.append("../FinRL")
import itertools

from finrl import config
from finrl import config_tickers
import os
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

# create directories
check_and_make_directories([DATA_SAVE_DIR, TRAINED_MODEL_DIR, TENSORBOARD_LOG_DIR, RESULTS_DIR])

# set dates
TRAIN_START_DATE = '2015-01-01'
TRAIN_END_DATE = '2022-11-01'
TRADE_START_DATE = '2022-11-01'
TRADE_END_DATE = '2025-05-20'
PREDICT_START_DATE = '2025-05-01'
PREDICT_END_DATE = '2025-05-25'

# read input data
path = os.path.join(os.path.dirname(__file__), 'Input for Stock-Picked Agent train.csv')
df = pd.read_csv(path)
df = df.fillna(0)


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

df_features_scaled = pd.DataFrame(ss.fit_transform(df[features]), columns=features, index=df.index)


df.update(df_features_scaled)

fe = FeatureEngineer(
                    use_technical_indicator=False,
                    tech_indicator_list = INDICATORS,
                    use_vix=False,
                    use_turbulence=False, 
                    user_defined_feature = False)

# preprocess data
processed = fe.preprocess_data(df)

# split data
train = data_split(processed, TRAIN_START_DATE,TRAIN_END_DATE)
trade = data_split(processed, TRADE_START_DATE,TRADE_END_DATE)
PREDICT = data_split(processed, PREDICT_START_DATE,PREDICT_END_DATE)

print(len(train))
print(len(trade))
print(len(PREDICT))

stock_dimension = len(train.tic.unique()) 
state_space = 1 + 2*stock_dimension + len(INDICATORS)*stock_dimension 
print(f"Stock Dimension: {stock_dimension}, State Space: {state_space}")

buy_cost_list =  [0] * stock_dimension
sell_cost_list = [0] * stock_dimension
buy_cost_list =  [0] * stock_dimension
sell_cost_list = [0] * stock_dimension
num_stock_shares = [0] * stock_dimension

# set environment parameters
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

# create environment
e_train_gym = StockTradingEnv(df = train, **env_kwargs)
env_train, _ = e_train_gym.get_sb_env()

# create agent
agent = DRLAgent(env = env_train)


df_account_value_ppo = pd.DataFrame()
PPO_PARAMS = {
    "n_steps": 2048,
    "ent_coef": 0.01,
    "learning_rate": 0.00025,
    "batch_size": 2048,
}
#model_ppo = agent.get_model("ppo")
model_ppo = agent.get_model("ppo",model_kwargs = PPO_PARAMS)
# set up logger
tmp_path = RESULTS_DIR + '/ppo'
new_logger_ppo = configure(tmp_path, ["stdout", "csv", "tensorboard"])
# Set new logger
model_ppo.set_logger(new_logger_ppo)

# train model
trained_ppo = agent.train_model(model=model_ppo, 
                         tb_log_name='ppo',
                         total_timesteps=3440)

# save model
trained_ppo.save("PPO_Stock_Picked_Agent_Sharpe_Ratio.zip")

e_predict_gym = StockTradingEnv(df = PREDICT, turbulence_threshold = None,risk_indicator_col=None, **env_kwargs)

predict_env, predict_obs = e_predict_gym.get_sb_env()
predict_env.reset()
action, _states = trained_ppo.predict(predict_obs, deterministic=True)

print(action)