# directory
from __future__ import annotations

DATA_SAVE_DIR = "datasets"
TRAINED_MODEL_DIR = "trained_models"
TENSORBOARD_LOG_DIR = "tensorboard_log"
RESULTS_DIR = "results"

# date format: '%Y-%m-%d'
TRAIN_START_DATE = "2014-01-06"  # bug fix: set Monday right, start date set 2014-01-01 ValueError: all the input array dimensions for the concatenation axis must match exactly, but along dimension 0, the array at index 0 has size 1658 and the array at index 1 has size 1657
TRAIN_END_DATE = "2020-07-31"

TEST_START_DATE = "2020-08-01"
TEST_END_DATE = "2021-10-01"

TRADE_START_DATE = "2021-11-01"
TRADE_END_DATE = "2021-12-01"



INDICATORS = [
'CostOfGoodsSold',
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
'PropertyAndPlantAndEquipment',
'0', '1', '2', '3',  '4', '5', '6', '7', '8', '9', '10',         
'11', '12', '13', '14', '15', '16', '17', '18', '19','20',
'21', '22', '23', '24',  '25', '26', '27', '28', '29','30',
'31', '32', '33', '34',  '35', '36', '37', '38', '39','40',   
'41', '42', '43', '44',  '45', '46', '47', '48', '49','50',   
'51', '52', '53', '54',  '55', '56', '57', '58', '59','60',   
'61', '62', '63', '64',  '65', '66', '67', '68', '69','70',   
'71', '72', '73'
]

CHIPS = [
]


# Model Parameters

PPO_PARAMS = {
    "n_steps": 4096,
    "ent_coef": 0.01,
    "learning_rate": 0.00025,
    "batch_size": 4096,
}

# Possible time zones
#TIME_ZONE_SHANGHAI = "Asia/Shanghai"  # Hang Seng HSI, SSE, CSI
#TIME_ZONE_USEASTERN = "US/Eastern"  # Dow, Nasdaq, SP
#TIME_ZONE_PARIS = "Europe/Paris"  # CAC,
#TIME_ZONE_BERLIN = "Europe/Berlin"  # DAX, TECDAX, MDAX, SDAX
#TIME_ZONE_JAKARTA = "Asia/Jakarta"  # LQ45
#TIME_ZONE_SELFDEFINED = "xxx"  # If neither of the above is your time zone, you should define it, and set USE_TIME_ZONE_SELFDEFINED 1.
#USE_TIME_ZONE_SELFDEFINED = 0  # 0 (default) or 1 (use the self defined)
#
## parameters for data sources
#ALPACA_API_KEY = "xxx"  # your ALPACA_API_KEY
#ALPACA_API_SECRET = "xxx"  # your ALPACA_API_SECRET
#ALPACA_API_BASE_URL = "https://paper-api.alpaca.markets"  # alpaca url
#BINANCE_BASE_URL = "https://data.binance.vision/"  # binance url

