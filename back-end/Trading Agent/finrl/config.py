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
"coding1",
"coding2",
"coding3",
"coding4",
"coding5",
"coding6",
"coding7",
"coding8",
"coding9",
"coding10",
"coding11",
"coding12",
"coding13",
"coding14",
"coding15",
"coding16",
"coding17",
"coding18",
"coding19",
"coding20"
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