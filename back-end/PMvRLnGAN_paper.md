Balancing Risk and Return: Two-Layer Reinforcement Learning
for Portfolio Management via Data Representation Learning

Chun-Chieh Huang
chieh072@gmail.com
National Central University
Taoyuan, Taiwan

Chia-Hui Chang
chia@csie.ncu.edu.tw
National Central University
Taoyuan, Taiwan

characteristics and often results in excessive diversification of funds,
which leads to suboptimal maximization of asset returns.

Abstract
This paper addresses the challenge of designing profitable stock
trading strategies using reinforcement learning (RL) while main-
taining low risk. We propose a novel two-layer RL framework
that prioritizes risk minimization in stock selection and then opti-
mizes investment return through a trading strategy. The first layer
leverages a Proximal Policy Optimization (PPO) agent with Graph
Attention Networks (GAT) to capture relationships between stocks
and trains a stock selection module focused on minimizing risk-
adjusted return, measured by the Sharpe ratio. The second layer
employs temporal convolutional networt autoencoder (TCN-AE)
to compress technical indicators of stocks to extract features for
PPO-based trading agent with average profit as the reward. The
performance is compared against established benchmarks: the SP
500 Index (SPY), the TWSE Taiwan 50 Index (0050.TW), and two
traditional strategies, one being the Mean-Variance Optimization
(MVO) and the other the 1/N portfolio allocation strategy.

Keywords
Portfolio Allocation, Graph Attention Networks, TCN-AE, Rein-
forcement Learning, Proximal Policy Optimization

ACM Reference Format:
Chun-Chieh Huang and Chia-Hui Chang. 2024. Balancing Risk and Return:
Two-Layer Reinforcement Learning for Portfolio Management via Data
Representation Learning. In Proceedings of 5th ACM International Conference
on AI in Finance (ICAIF’24). ACM, New York, NY, USA, 8 pages. https:
//doi.org/XXXXXXX.XXXXXXX

In recent years, machine learning and reinforcement learning
algorithms have been widely applied in financial markets for stock
price prediction and portfolio management. For example, Wang
et al. [13] designed a BWSL (buying winners and selling losers)
strategy called AlphaStock, which exploits the interrelationship
among stocks with a Sharpe ratio-oriented reinforcement learning
framework. Yuan et al. [15] proposed an ensemble strategy that
employs three actor-critic based algorithms to learn a stock trading
strategy by maximizing investment return with a reward function
that takes into account the portfolio value at two consecutive time
step, as well as transaction costs. Some methods also integrate
sentiment data [3] extracted from market news and social networks,
together with macroeconomic indicators such as gold prices, oil
prices, and USD exchange rates, to predict stock market trends
[9]. However, most previous research only use a single agent to
optimize a goal, either maximize the returns or minimize the risk,
which could not balance well between risk and profit.

w orking draft.
N otfordistribution.
U npublished

In this paper, we propose a two-stage four-step framework that
utilizes dual-layer reinforcement learning algorithms combined
with Graph Attention Networks (GAT) and Temporal Convolu-
tional Network-Autoencoder (TCN-AE) to identify optimal stock
selection and trading strategies in a complex and dynamic stock
market. Initially, we apply GAT for Stock Representation Learning.
Subsequently, we use Proximal Policy Optimization (PPO) with
the Sharpe ratio as the reward to select stocks for a portfolio with
minimized investment risk. Thirdly, we employ TCN-AE to com-
press technical indicators of stocks to extract higher-dimensional
data, which is then provided to the second layer of reinforcement
learning, targeting investment returns as the reward for stock posi-
tioning. The architecture is shown in Figure 1. Ultimately, by com-
paring the Sharpe ratio and total investment returns against two
ETFs and two traditional economic strategies (MVO[8], 1/N port-
folio allocation), our method demonstrates adaptability to various
market conditions and maximizes returns under risk constraints.

1 Introduction
Profitable stock trading strategies are critical for investors and firms
to optimize capital allocation and achieve desired returns. However,
navigating the uncertainties of the stock market while considering
all relevant factors remains a significant challenge for analysts.

Traditional methods, like the 1/N diversification strategy [4],
where weights are equally distributed across all assets in a portfo-
lio, have limitations. Research suggests that estimation errors often
negate the benefits of optimal diversification in out-of-sample sce-
narios [5]. Additionally, this method fails to consider asset-specific

Permission to make digital or hard copies of all or part of this work for personal or
Unpublished working draft. Not for distribution.
classroom use is granted without fee provided that copies are not made or distributed
for profit or commercial advantage and that copies bear this notice and the full citation
on the first page. Copyrights for components of this work owned by others than the
author(s) must be honored. Abstracting with credit is permitted. To copy otherwise, or
republish, to post on servers or to redistribute to lists, requires prior specific permission
and/or a fee. Request permissions from permissions@acm.org.
ICAIF’24, November 14–16, 2024, Brooklyn, NY, USA
© 2024 Copyright held by the owner/author(s). Publication rights licensed to ACM.
ACM ISBN 978-x-xxxx-xxxx-x/YY/MM
https://doi.org/XXXXXXX.XXXXXXX


The contribution of the paper includes three parts1:

(1) We propose a dual-layer reinforcement learning framework
to balance the optimization between risk and profit.
(2) Second, we enhance reinforcement learning by using GAT
to extract features from financial reports and TCN-AE to
compress technical features from exchange rates and mar-
ket indices.

1We share our codes on GitHub https://github.com/JonathanHuangC/Portfolio-
Management-via-Reinforcement-Learning-and-Graph-Attention-Network for future
comparison.



ICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

Huang and Chang

(3) Finally, by incorporating stock dividends and capital adjust-
ments into the reinforcement learning environment, our
model ensures that returns are not distorted.

The remainder of the paper is structured as follows. Section 2
presents related work in the field. Section 3 provides an introduction
to our model architecture. In Section 4, we discuss the datasets used
and the experiments conducted. Section 5 concludes the paper and
suggests future research direction.

Table 1: Thesis comparison

Thesis
Yang et al. [14]
Yuan et al. [15]
Guan and Liu [6]
Dabérius et al. [2]

Highest return Compare objects

PPO
PPO
PPO
PPO

A2C & DDPG
DQN & SAC
A2C
DDQN

Market
USA
China
USA
Hand-crafted

A2C: Advantage Actor Critic ; DDPG: Deep Deterministic Policy Gradient ;
SAC: Soft Actor-Critic ; DQN: Deep Q-learning ; DDQN: Double DQN ;

CAAN models the interdependencies between different stocks and
assigns a winner score to each stock based on its historical price
performance. Stocks with higher winner scores are more likely to
be winners and are included in the long positions of the portfo-
lio, while those with lower scores are more likely to be losers and
are included in the short positions. Finally, the portfolio generator
ranks the stocks based on their winner scores and calculates the
weight of each stock in the portfolio.

2 Related Research
In this section, we present the application of reinforcement learning
in asset allocation, examine the intricate interconnections between
stocks, and explore techniques for feature compression to aid our
research.

The exploration of Deep Reinforcement Learning (DRL) tech-
niques within the realm of Quantitative Trading (QT) has been
widely studied in recent years. For example, Sun et al. [10] exam-
ined the application of DRL across various tasks in quantitative
finance, such as algorithmic trading, portfolio management, order
execution, and market making. They hightlighted the potential of
DRL through an analysis of models and algorithms employed in
these activities.

w orking draft.
N otfordistribution.
U npublished

An important development in this field has been the creation of
FinRL by Liu et al. [7], an open-source framework engineered to sim-
plify the automation of quantitative financial trading through Deep
Reinforcement Learning (DRL). FinRL addresses the steep learning
curve associated with developing automated trading agents by of-
fering a user-friendly strategy design and iterative process. This is
further supported by its modular structure which eases debugging,
alongside practical tutorials and benchmarks for comprehensive
understanding and application in automated trading.

To determine which reinforcement learning method is best suited
for the stock market, Yang et al. [14] developed a composite strat-
egy using deep reinforcement learning for automated stock trading.
The objective was to maximize investment returns by learning ef-
fective trading strategies. The study utilized three actor-critic based
algorithms: Proximal Policy Optimization (PPO), Advantage Actor
Critic (A2C), and Deep Deterministic Policy Gradient (DDPG), com-
bined into a robust composite trading strategy. Tested on 30 stocks
from the Dow Jones Industrial Average, this strategy outperformed
the individual algorithms and two benchmarks, with PPO achieving
the highest cumulative returns.

3 Method
In this section, we outline techniques for optimizing asset allocation
using Reinforcement Learning, Graph Attention Network (GAT),
and Temporal Convolutional Network Autoencoders (TCN-AE) to
maximize returns and minimize risk. The methodology is struc-
tured into three primary components. First, we detail the training
process of GATs to unveil the intricate relationships between stocks,
thereby facilitating a comprehensive understanding of market dy-
namics. Second, we explore the application of TCN-AEs to enrich
feature representations derived from transaction data, consequently
enhancing predictive capabilities. Lastly, we delve into the imple-
mentation of Proximal Policy Optimization within the context of
two RL agents: a stock selection agent and a trading agent.

3.1 Stock Representation Learning via GAT
The Graph Attention Network (GAT) [12] leverages attention mech-
anisms to dynamically assign weights to the importance of nodes’
neighbors in graph-structured data. In contrast to traditional meth-
ods where node updates are independent, GAT updates a node’s
state by integrating features from its neighbors using calculated
attention weights. This enables GAT to better capture the structural
nuances within the graph.

To support the claim that Proximal Policy Optimization (PPO)
is the most suitable reinforcement learning algorithm for stock
trading, we surveyed several papers, as shown in Table 1. The
results indicate that in different stock markets and compared to
other reinforcement learning algorithms, PPO consistently achieves
the highest total returns.

In addition to maximizing investment returns, some studies
choose to minimize risks using Sharpe ratios. For example, Wang
et al. [13] proposed AlphaStock to achieve a risk-return balanced
investment strategy. AlphaStock consists of three primary com-
ponents: an LSTM-HA network, a cross-asset attention network
(CAAN), and a portfolio generator. The LSTM-HA network extracts
meaningful features from historical stock data, focusing on long-
term dependencies within the historical states of each stock. The

GAT is constructed with self-attention layers similar to those
in Transformers, with each layer processing node embeddings to
produce refined embeddings. Each node evaluates the embeddings
of its connected nodes, focusing on different features using multiple
“attention heads." These heads contribute to a more detailed feature
representation by either averaging or concatenating their outputs,
thereby enhancing the model’s ability to discern more complex
patterns. Moreover, GAT boosts model performance through graph
pooling, which selects key nodes based on scores computed by
a learnable projection vector. This integration at the model level
empowers GAT to excel in diverse applications, from image recogni-
tion to natural language processing and recommendation systems.
Overall, GAT’s approach, focusing on neighboring node features
through a weighted sum ensures that it adapts well to various data

Balancing Risk and Return: Two-Layer Reinforcement Learning for Portfolio Management via Data Representation LearningICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

(3)

( ˆ𝑦𝑖 − 𝑦𝑖 )2

Figure 1: Module architecture of reinforcement learning and graph attention mechanism applied to asset allocation

structures, maintaining effectiveness across different applications
without reliance on the underlying graph structure.

Let ℎ = { (cid:174)ℎ1, (cid:174)ℎ2, . . . , (cid:174)ℎ𝑁 } denote the input of 𝑁 stocks, where each
stock (cid:174)ℎ𝑖 ∈ R𝐹 has 𝐹 features. In this paper, 𝑁 is 74 and 𝐹 includes
19 financial statement fields. The output 𝑦 = {𝑦1, 𝑦2, . . . , 𝑦𝑁 } is the
Sharpe ratio we aim to predict for each stock.

To obtain corresponding input and output transformations, we
perform two linear transformations based on the input features to
obtain the output features. The first layer’s matrix 𝑊 (1) ∈ 𝑅𝐹 ′𝑥𝐹
has a size of 𝐹 ′𝑥𝐹 , mapping the 𝐹 features into 𝐹 ′ (=1024 in our
experiment). The second layer’s matrix 𝑊 (2) ∈ 𝑅1𝑥𝐹 ′
has a size of
1𝑥𝐹 ′.

We perform self-attention on the nodes — a shared attention
, which computes attention coefficients

mechanism 𝑎 ∈ R𝐹 ′
𝑒𝑖 𝑗 that indicate the importance of node 𝑗’s features to node 𝑖.

× R𝐹 ′

1
𝑛

𝑖=1

𝑛
∑︁

MSE =

w orking draft.
N otfordistribution.
U npublished

(1)

Here, the function 𝑎 is a learnalbe parameter vector of size
2 ∗ 𝐹 ′(twice the size of the transformed embedding dimensions),
also known as the attention parameter. In its most general formula-
tion, the model allows every node to attend on every other node,
dropping all structural information. We inject the graph structure
into the mechanism by performing masked attention — we only
compute 𝑒𝑖 𝑗 for nodes 𝑗 ∈ 𝑁𝑖 , where 𝑁𝑖 is some neighborhood of
node 𝑖 in the graph.

𝑒𝑖 𝑗 = 𝑎(𝑊 (cid:174)ℎ𝑖,𝑊 (cid:174)ℎ 𝑗 )

3.1.1 Training with Financial Report Data. The input to GAT con-
sists of 19 financial report fields, including revenue and profit (3),
assets (5), liabilities (2), equity (3), share capital and reserves (2),
and cash flow (4). Each category includes specific financial items
and their corresponding quantity as indicated in the parenthesis.
Initially, we form a complete graph with the 74 stock targets, where
each stock has an initial edge value of 1 with every other stock.
We then train the GAT to predict the Sharpe ratios as indicated in
Eq. (8).

During training, the loss backward is applied only to the training
data. Lastly, we extract the relationships between all 74x74 stock
pairs for use by the stock selection agent. To give an example of GAT
result, the highest edge weights for TSMC are with MediaTek and
Foxconn at 0.033787, followed by LTC at 0.033771; while the edge
weights with TCC and PCSC are zero, indicating no relationship.

3.2 Temporal Convolutional Autoencoder
The Temporal Convolutional Autoencoder (TCN-AE) [11] is a deep
learning model that combines Temporal Convolutional Networks
(TCN) with Autoencoders (AE) to process and analyze time series
data. Its main purposes include feature extraction, data compres-
sion, and anomaly detection. TCN-AE leverages the ability of TCNs
to capture long-term dependencies in time series while using the
architecture of autoencoders for efficient data compression and re-
construction, making it particularly suitable for scenarios requiring
analysis or monitoring of large volumes of data.

In practical applications, TCN-AE can automatically learn pat-
terns of normal behavior from time-series data and use these learned
features to detect deviations from normal behavior. The training
process of this model does not require manually labeled anom-
aly samples, making it well-suited for applications where labeled
data is difficult to obtain. Additionally, the structure of TCN-AE
enables it to handle input sequences of varying lengths, offering
great flexibility and adaptability.

𝛼 (𝑙 )
ij

= 𝑠𝑜 𝑓 𝑡𝑚𝑎𝑥 𝑗 (𝑒 (𝑙 )

𝑖 𝑗 ) =

𝑒𝑥𝑝 (𝑒 (𝑙 )
𝑖 𝑗 )
𝑒𝑥𝑝 (𝑒 (𝑙 )
𝑖𝑘 )

(cid:205)𝑘 ∈𝑁𝑖

(2)

In our experiments, 𝛼𝑖 𝑗 is taken to represent the relationships
between stocks, and these data are used together with financial
reports as training data for the stock picking agent. To implement
multi-head self-attention, we choose a value of 8 for training GAT.
The loss function used is the Mean Squared Error Loss (MSE
Loss), defined as in Eq. (3), where ˆ𝑦𝑖 is the predicted value, 𝑦𝑖 is the
actual value, and 𝑛 is the number of samples.



ICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

Huang and Chang

TCN-AE combines the powerful temporal processing capabilities
of TCN with the data compression and reconstruction abilities of
an autoencoder, effectively learning features from time-series data.
The overall architecture of TCN-AE is detailed in Figure 2, which
provides a visual understanding of how the parts work together.
This hybrid approach allows TCN-AE to excel in handling various
time-series tasks.

• 𝜃 represents the policy parameters, determined by the Ac-

tor.
• 𝑟𝑡 (𝜃 ) =

𝜋𝜃 (𝑎𝑡 |𝑠𝑡 )
𝜋𝜃𝑜𝑙𝑑 (𝑎𝑡 |𝑠𝑡 ) is the probability ratio between the

new and old policies.

• ˆ𝐴𝑡 is the advantage estimate at time 𝑡, calculated by the

Critic.

• 𝜖 is a small constant used to control the range of policy

updates.

Advantage Function Estimation. In PPO, the Advantage Function
is used to measure the advantage of a specific action relative to the
average return of all actions at the current state. This is usually
estimated through the Generalized Advantage Estimation (GAE)
method, which combines the Critic’s state value and the Temporal
Difference Error (TD Error) for estimation. The Critic’s evaluations
assist the Actor in updating its policy.

The Advantage Function ˆ𝐴𝑡 is typically calculated using the

Generalized Advantage Estimation (GAE) technique:

(𝛾𝜆)𝑘𝛿𝑡 +𝑘

𝛿𝑡 = 𝑅𝑡 + 𝛾𝑉 (𝑠𝑡 +1) − 𝑉 (𝑠𝑡 )

(5)

(6)

𝑘=0

∞
∑︁

ˆ𝐴𝑡 =

where the TD error 𝛿𝑡 is defined as:

w orking draft.
N otfordistribution.
U npublished

of future rewards.

policy learning.

Here:

Figure 2: TCN-AE Architecture

3.2.1 TCN-AE Training Method. The input to TCN-AE consists of
117 features per day, including technical indicators for individual
stocks and market indices as shown in appendix B, along with data
from the past 19 days, totaling 20 days of information as the input.
This input is then condensed into 20-dimensional features using
TCN-AE. The training data covers the period from 2013/01/01 to
2020/11/13, covering a period of approximately 8 years. The valida-
tion data covers the following 1 year from 2020/11/16 to 2021/11/14.
After training for 100 epochs, the Training Loss is approximately
0.0047, and the Validation Loss is around 0.0081.

3.3 Proximal Policy Optimization
In the realm of reinforcement learning, Proximal Policy Optimiza-
tion (PPO) has emerged as a highly effective and widely adopted
algorithm, particularly well-suited for scenarios with continuous
action spaces such as stock trading. PPO addresses the common
issues of large gradient fluctuations and hyperparameter sensitivity
in traditional policy gradient methods by introducing a clipped
surrogate objective function to stabilize policy updates. Specifi-
cally, PPO limits the policy change between updates, leading to
more stable and efficient policy learning. Moreover, PPO utilizes
advantage functions to evaluate the advantage of taking a specific
action over the average return of all actions in the current state,
and employs Generalized Advantage Estimation (GAE) to estimate
these advantage functions.

PPO Objective Function. The core objective function used in PPO
is known as the Clipped Surrogate Objective, which allows the
policy to deviate from the old policy to a limited extent. The specific
formula is:

𝐿𝐶𝐿𝐼 𝑃 (𝜃 ) = E𝑡 (cid:2)min(𝑟𝑡 (𝜃 ) ˆ𝐴𝑡 , clip(𝑟𝑡 (𝜃 ), 1 − 𝜖, 1 + 𝜖) ˆ𝐴𝑡 )(cid:3)

(4)

where:

• ˆ𝐴𝑡 is the advantage estimate at time 𝑡, critical for the Actor’s

• 𝑅𝑡 is the reward at time 𝑡, provided by the environment.
• 𝑉 (𝑠) is the value function of state 𝑠, estimated by the Critic.
• 𝛾 is the discount factor, used to calculate the present value

• 𝜆 is the smoothing parameter in GAE, used to balance the

prediction accuracy and variance of rewards.

Objective of Reinforcement Learning. PPO aims to maximize ex-
pected returns, where the return (Return, 𝐺𝑡 ) is defined as the sum
of all future rewards discounted to the current time 𝑡, expressed as:

𝐺𝑡 = 𝑅𝑡 +1 + 𝛾𝑅𝑡 +2 + 𝛾 2𝑅𝑡 +3 + · · · =

𝑅𝑘𝛾𝑡 +𝑘+1

(7)

∞
∑︁

𝑘=0

The discount factor 𝛾 reflects the uncertainty of future rewards, as
no perfect model can predict future changes.

In summary, PPO, with its innovative truncated probability ra-
tio objective function and stable policy update mechanism, ex-
cels in handling problems in continuous action spaces and high-
dimensional state spaces, achieving superior results in various re-
inforcement learning applications.

3.4 Algorithms
In this section, we integrate the previously introduced GAT and
TCN-AE into the PPO framework to construct two agents to col-
laboratively manage assets to pursue high-reward incentives while
assuming low risk.


Balancing Risk and Return: Two-Layer Reinforcement Learning for Portfolio Management via Data Representation LearningICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

(2) State: The state of the trading agent includes total assets,
cash balance, prices of N stocks, and the twenty-dimensional
features of N stocks obtained from the TCN AutoEncoder.
(3) Action: The action space of the trading agent is defined as

the buy or sell decisions for N stocks.

(4) Reward: A calculation method has been devised to assess
the reward that the trading agent receives based on its
actions from the state. This method primarily compares the
change in total assets from one day to the previous week.

Stock Selection Agent. The stock selection agent is designed
3.4.1
to identify the lowest-risk investment portfolio from a pool of 74
Taiwanese stocks at the end of each quarter. At the release of each
quarterly financial report, this agent extracts relationships calcu-
lated by the GAT and the financial report features to select stocks.
The agent’s actions involve selecting (1) or discarding (0) each stock
for the portfolio. The agent is rewarded based on the average Sharpe
ratio of the selected portfolio. To optimize its decision-making, the
agent is trained using the Proximal Policy Optimization (PPO) rein-
forcement learning algorithm. Through iterative training, the agent
learns to select a portfolio that maximizes the average Sharpe ratio,
i.e. minimizes the risk.

This portfolio is then handed over to the trading agent for stock
allocation. Before the next quarterly financial report is released, the
trading agent executes all trading activities based on this portfolio.
(1) Environment: The system selects a low-risk investment
portfolio from 74 stocks after the financial reports are pub-
lished, with no transaction fee settings involved in the se-
lection process.

(2) State: The state of the stock picking agent includes the
Sharpe ratios of 74 stocks and the relationships between
the stocks generated by GAT.

(3) Action: The action space of the stock-picking agent is de-
fined as the selection (1) or filtering (0) decision for the 74
stocks.

(4) Reward: A calculation method has been established to as-
sess the reward obtained by the stock-picking agent based
on its actions from the state. This method calculates the
average Sharpe ratio of the selected investment portfolio.

Stock Trading Agent. The goal of the stock trading agent
3.4.2
is to maximize the cumulative return of its investment portfolio
provided by the stock selection agent.

The trading agent trains a new model each quarter based on the
list from the stock selection agent. It operates within a simulated
trading environment that includes parameters such as initial capital
of 1 million NTD, a varying number of stocks per quarter, and stan-
dard transaction fees. The agent’s state consists of total assets, cash
balance, stock prices, and 20-dimensional feature vectors generated
by a TCN-AE for each stock. These feature vectors encapsulate the
past 20 days of market data, including open, high, low, close prices,
and KD values.

4 Experiments
In this section, we will explain the impact of ex-dividends and
capital reductions, two scenarios encountered in the stock market,
on the system. Next, we describe the financial data and the trading
data we used, followed by the evaluation methods and experimental
results.

In our experiment, the total assets are calculated by multiplying
the closing price with the number of shares held. The following
two scenarios can lead to changes in the closing price, and if we do
not adjust our holdings or cash in hand accordingly, it will result
in distorted total returns:

(1) Ex-dividend refers to the company’s action of adjusting the
stock price to distribute dividends or execute a stock split.
(2) A reduction in capital refers to the company decreasing the
total number of issued shares to increase the asset value
per share or to resolve financial difficulties.

During Q1 2021, we encountered three ex-dividend instances,
which resulted in an increase of 26,195 TWD in our cash holdings.

w orking draft.
N otfordistribution.
U npublished

4.1 Financial Reporting Data
We focus on top 100 companies by market capitalization in the
Taiwan stock market and collect trading data and financial reports
from January 1, 2013. Out of these, 26 stocks, including 16 financial
stocks with differing reporting times and formats and 10 stocks
with incomplete data, are excluded. The financial data used for
quarterly stock selection comprises 19 fields, categorized into six
areas such as income, assets, and liabilities. Technical indicators for
daily trading include a comprehensive set of 76 fields across various
categories like financial environment, momentum, and volatility
indicators. The study aims to provide a deep understanding of these
74 representative Taiwanese stocks and offer valuable investment
insights.

For comparison, the baselines include the world’s largest asset-
managed ETF, the SPDR S&P 500 ETF (hereafter referred to as
“SPY”) and Taiwan’s largest ETF by market value, Yuanta Taiwan 50
(hereafter referred to as “Yuanta50”), as well as the traditional 1/N
portfolio allocation strategy where funds are equally distributed
among all assets (74 stocks).

4.2 Evaluation Methods
In this study, we use two metrics to evaluate the model’s perfor-
mance. The first is the Sharpe ratio (Eq. 8), used to assess the risk
of the investment portfolio. A higher Sharpe ratio indicates lower
risk for the same level of return, and the reward for the stock selec-
tion agent is based on the Sharpe ratio. This metric uses adjusted
closing prices to account for actions affecting stock prices such as

The trading agent assigns a value between -1 and 1 to each stock,
which is then multiplied by the base value of 1000 to indicate the
quantity of each stock to buy or sell. The trading actions proceed
in the following order: first, sell stocks and then buy stocks. When
buying stocks, the purchase priority is determined by the magnitude
of the values, with stocks having larger values being prioritized for
purchase. If there is insufficient cash to continue purchases, trading
stops, meaning that stocks with higher priority are bought first.

(1) Environment: In the system’s trading environment, various
parameters critical to mimicking a real trading scenario are
considered. These include initial investment capital set at
$1,000,000 TWD, the number of stocks denoted as N which
varies each quarter, transaction fees at 0.1425%, brokerage
fees at 0.3%, and a daily trading cycle. These settings ensure
a realistic simulation for the trading strategies tested.


ICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

Huang and Chang

dividends and capital reductions, effectively including changes in
the net value of the investment portfolio during the investment
period. The risk-free rate is a variable value and is therefore not
considered in this experiment, with all methods using the same
baseline.

Sharpe Ratio =

Portfolio Return - Risk-Free Rate
Portfolio Return Standard Deviation

(8)

The second metric is the cumulative return rate (Eq. 9), used to
evaluate the overall profit of the investment portfolio, calculated
based on the net value of the portfolio plus cash to compute the total
assets. The reward for the trading agent is based on the cumulative
return rate.

Cumulative Return Rate =

4.3 Quarterly Experiments
First, we evaluate the investment portfolios selected by the stock
selection agent, holding each stock in equal proportion, and calcu-
lates the Sharpe ratio and cumulative returns compared to SPY and
Yuanta50.

From 2021/11/15 to 2024/4/19, spanning 10 quarters:
(1) Sharpe Ratio Comparison

Figure 4: Quarterly Cumulative Returns (Equal Holding)

meaning trades are only made post-market on stocks selected by
the stock selection agent. The changes in total assets are used to
calculate the Sharpe ratio and overall returns.

The testing is conducted from 2021/11/15 to 2024/4/19, covering
10 quarters. The results demonstrate that the stock selection agent
based on GAT exhibits superior performance in terms of both risk
reduction and return enhancement.

We begin by comparing the Sharpe ratios of the selected port-
folios in each season. Out of 10 comparisons, GAT-based stock
selection agents emerged victorious 8 times, SPY came out on top
2 times, and Yuanta50 did not win any times, as indicated in Fig-
ure 5. In terms of cumulative return, the trading agent achieved
106.97%, while Yuanta50 yielded 24.27%, SPY resulted in 14.56% and
the 1/N portfolio allocation strategy saw 46.48%. Additionally, the
Mean-Variance Optimization (MVO) strategy resulted in a return
of 19.34% as depicted in Figure 6.

(9)

End Value - Initial Value
Initial Value

w orking draft.
N otfordistribution.
U npublished

To compare the Sharpe ratios for each quarter, we select the
highest single Sharpe ratio from each comparison. In these
10 comparisons, the stock selection agent won 4 times, SPY
won 4 times, and Yuanta50 won 2 times, as shown in Figure
3.

(2) Cumulative Return Comparison

The cumulative return for Yuanta50 is 24.27%, for SPY it
is 14.56%, and for the investment portfolio selected by the
stock selection agent, it is 55.42%, representing increases of
31.15% and 40.86% over Yuanta50 and SPY respectively (as
shown in Figure 4).

Overall, our model significantly reduced risk and increased over-

all returns.

Figure 5: Daily Comparison of Sharpe Ratios

Figure 3: Quarterly Comparison of Sharpe Ratios (Equal
Holding)

4.4 Daily Experiments
This subsection presents the changes in total assets from daily
trading, starting by retaining only the portfolios with lower risk,

4.5 Three and Six-Month Investment Cycles
We compare the merits and demerits of our method with other
methods over short-term investment cycles of 3 and 6 months. Fig-
ure 7 compares various investment strategies that began randomly
between 2021 and 2024. Each strategy was tested ten times at ran-
dom intervals. The results show that our model outperformed other
ETFs both in terms of average returns and the number of times it
won in these 10 comparisons.


Balancing Risk and Return: Two-Layer Reinforcement Learning for Portfolio Management via Data Representation LearningICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

4.6 Investment Comparison in Bull and Bear

Markets

In the stock market, a persistent upward trend is called a bull mar-
ket, while a persistent downward trend is termed a bear market.
We selected the bull market period from November 2023 to April
2024, during which the Taiwan Weighted Index rose by 29.46%.
For the bear market, we chose the period from January to October
2022, when the Taiwan Weighted Index fell by 29.12%. Our model
outperformed the other two ETFs in both market conditions, as
illustrated in Figure 8.

Figure 6: Comparison performance of Ours model, Yuanta50,
SPY, 1/N Strategy, MVO

We compared the performance of our method with other ETFs
over short investment periods ranging from 3 to 6 months. Figure
7 shows the performance of various investment strategies that
started randomly during the period from 2021 to 2024. Each strategy
was tested ten times in randomly selected periods. The results
demonstrate that our model significantly outperformed other ETFs,
both in average returns and win rates.

w orking draft.
N otfordistribution.
U npublished

(a) 3 months investment

(a) Bull Market Investment

(b) Bear Market Investment

Figure 8: Comparison of Investment Returns in Bull and Bear
Markets

To examine the details of our model’s performance in a bear
market environment, we selected August 16, 2022 as an example.
At that time, the trading agent implemented the following strategy:
starting from August 16, purchasing 51 shares of 1229.TW and
25 shares of 2618.TW daily. Over a period of 10 trading days, our
model yielded a return of -0.09%, compared to -4.38% for Yuanta50
and -7.3% for SPY. This once again underscores the robust risk
management capabilities of our model in bear markets.

5 Conclusion and Future Work
Investment with balanced risks and returns is the goal of most in-
vestors. Selecting stocks based on the financial reports to maximize
the average Sharpe ratio reward is a promising and reasonable ap-
proach. GATs improve the model’s understanding of complex stock
relationships, leading to smarter trading decisions, while TCN-AEs

(b) 6 months investment

Figure 7: Experiment validation of various methods over 30
random start dates from 2019-2022


ICAIF’24, November 14–16, 2024, Brooklyn, NY, USA

Huang and Chang

boost predictive accuracy by effectively compressing and encoding
time-series data. The results indicate substantial improvements,
with the stock selection agent alone achieving a 55.42% return,
which rose to 106.97% when combined with the trading agent. Per-
formance surpassed other ETFs in both bull and bear markets.

For future work, applying the model to other asset classes such
as bonds or cryptocurrencies will require adjustments to the model
architecture to accommodate the unique characteristics and dy-
namics of these asset classes. Second, utilizing broader datasets and
integrating natural language processing tools like ChatGPT will
enhance the model’s understanding of the global financial environ-
ment and potentially improve its predictive capabilities. Advancing
these research areas could lead to a more comprehensive and effec-
tive quantitative trading system, offering higher economic benefits
and reduced investment risks.

the 1/N asset-allocation strategy? (2005).

John Benediktsson. [n. d.]. ta-lib-python.

References
[1]
[2] Kevin Dabérius, Elvin Granat, and Patrik Karlsson. 2019. Deep execution-value
and policy based reinforcement learning for trading and beating market bench-
marks. Available at SSRN 3374766 (2019).

[3] Narayana Darapaneni, Anwesh Reddy Paduri, Himank Sharma, Milind Manjrekar,
Nutan Hindlekar, Pranali Bhagat, Usha Aiyer, and Yogesh Agarwal. 2022. Stock
Price Prediction using Sentiment Analysis and Deep Learning for Indian Markets.
arXiv:2204.05783 [q-fin.ST] https://arxiv.org/abs/2204.05783

[4] Victor DeMiguel, Lorenzo Garlappi, and Raman Uppal. 2005. How inefficient is

9

12

5
13

2023 Q3

2023 Q2

2023 Q4
2024 Q1

w orking draft.
N otfordistribution.
U npublished

Indicator
Type
Financial Envi-
ronment
Indi-
cators
Momentum In-
dicators

Indicator Content

[5] Victor DeMiguel, Lorenzo Garlappi, and Raman Uppal. 2011. 644Optimal versus
Naive Diversification: How Inefficient Is the 1/N Portfolio Strategy? In Heuristics:
The Foundations of Adaptive Behavior. Oxford University Press. https://doi.org/
10.1093/acprof:oso/9780199744282.003.0034

[6] Mao Guan and Xiao-Yang Liu. 2021. Explainable Deep Reinforcement Learning
for Portfolio Management: An Empirical Approach. arXiv:2111.03995 [q-fin.PM]
[7] Xiao-Yang Liu, Hongyang Yang, Jiechao Gao, and Christina Dan Wang. 2021.
FinRL: deep reinforcement learning framework to automate trading in quantita-
tive finance. In Proceedings of the Second ACM International Conference on AI in
Finance (ICAIF’21). ACM. https://doi.org/10.1145/3490354.3494366

[8] Harry Markowitz. 1952. Portfolio Selection. The Journal of Finance 7, 1 (1952),

77–91. http://www.jstor.org/stable/2975974

[9] Gaurang Sonkavde, Deepak Sudhakar Dharrao, Anupkumar M. Bongale, Sarika T.
Deokate, Deepak Doreswamy, and Subraya Krishna Bhat. 2023. Forecasting Stock
Market Prices Using Machine Learning and Deep Learning Models: A Systematic
Review, Performance Analysis and Discussion of Implications.
International
Journal of Financial Studies 11, 3 (2023). https://doi.org/10.3390/ijfs11030094

[10] Shuo Sun, Rundong Wang, and Bo An. 2021. Reinforcement Learning for Quan-

titative Trading. arXiv:2109.13851 [cs.LG]

Table 2: Quarterly Stock Selection List

#
2021 Q4
2022 Q1

Quantity
5
13

2022 Q2

2022 Q3

2022 Q4

8

8

7

2023 Q1

26

Stock Code
1229.TW, 2317.TW, 3017.TW, 3443.TW, 4938.TW
1229.TW, 2317.TW, 2330.TW, 2352.TW, 2382.TW, 3008.TW,
3017.TW, 3231.TW, 3443.TW, 3533.TW, 3653.TW, 4938.TW,
9941.TW
1229.TW, 2356.TW, 2376.TW, 2382.TW, 2618.TW, 3443.TW,
9941.TW, 9945.TW
1229.TW, 2376.TW, 2618.TW, 3017.TW, 3443.TW, 3653.TW,
9941.TW, 9945.TW
1229.TW, 2317.TW, 2382.TW, 3443.TW, 4938.TW, 9941.TW,
9945.TW
1101.TW, 1229.TW, 2027.TW, 2303.TW, 2308.TW, 2317.TW,
2327.TW, 2330.TW, 2352.TW, 2353.TW, 2371.TW, 2379.TW,
2395.TW, 2454.TW, 2474.TW, 3008.TW, 3017.TW, 3034.TW,
3231.TW, 3443.TW, 3533.TW, 3653.TW, 4938.TW, 5871.TW,
8046.TW, 9941.TW
1229.TW, 2317.TW, 2352.TW, 2356.TW, 2371.TW, 2382.TW,
2618.TW, 3231.TW, 3443.TW, 3533.TW, 9941.TW, 9945.TW
1229.TW, 2317.TW, 2352.TW, 3037.TW, 3443.TW, 3533.TW,
3653.TW, 4938.TW, 9941.TW
2376.TW, 2610.TW, 2618.TW, 9941.TW, 9945.TW
1605.TW, 2049.TW, 2356.TW, 2357.TW, 2383.TW, 3017.TW,
3023.TW, 3037.TW, 3443.TW, 3533.TW, 3653.TW, 3702.TW,
4958.TW

B Technical indicators
We use the open, high, low, close, and volume of stocks for calcula-
tion by TA-lib Benediktsson [1], resulting in a total of 76 technical
indicators as shown in Table3. These indicators are categorized into
eight main types, and some indicators have two features, making a
total of 117 features.

Table 3: Daily Trading Fields

Taiwan Stock Index Open, Low, Close (4)/USD Exchange Rate
(2)

ADX/ADXR/APO/AROON/AROONOSC/BOP/CCI/CMO/
DX/MACD/MACDEXT/MACDFIX/MFI/MINUS_DI/MINUS_DM
/MOM/PLUS_DI/PLUS_DM/PPO/ROC/ROCP/ROCR /ROCR100
/RSI/STOCH/STOCHF/STOCHRSI/TRIX /ULTOSC /WILLR
AD/ADOSC/OBV

HT_DCPERIOD/HT_DCPHASE/HT_PHASOR/HT_SINE

AVGPRICE/MEDPRICE/TYPPRICE/WCLPRICE

ATR/NATR/TRANGE

BETA/CORREL/LINEARREG/LINEARREG_ANGLE/ LINEAR-
REG_INTERCEPT/ LINEARREG_SLOPE/STDDEV/TSF/VAR
BBANDS/DEMA/EMA/HT_TRENDLINE/KAMA/MA/MAMA/
MAVP/MIDPOINT/MIDPRICE/SAR/SAREXT/SMA/T3
/TEMA/TRIMA/WMA

Indica-

Volume Indica-
tors
Cycle
tors
Price Transfor-
mations
Volatility Indi-
cators
Statistical
Functions
Overlap Stud-
ies Indicators

[11] Markus Thill, Wolfgang Konen, and Thomas Bäck. 2020. Time Series Encodings
with Temporal Convolutional Networks. 161–173. https://doi.org/10.1007/978-3-
030-63710-1_13

[13]

[12] Petar Veličković, Guillem Cucurull, Arantxa Casanova, Adriana Romero,
Graph Attention Networks.

Pietro Liò, and Yoshua Bengio. 2018.
arXiv:1710.10903 [stat.ML]
Jingyuan Wang, Yang Zhang, Ke Tang, Junjie Wu, and Zhang Xiong. 2019. Alpha-
Stock: A Buying-Winners-and-Selling-Losers Investment Strategy using Inter-
pretable Deep Reinforcement Attention Networks. In Proceedings of the 25th ACM
SIGKDD International Conference on Knowledge Discovery &amp; Data Mining
(KDD ’19). ACM. https://doi.org/10.1145/3292500.3330647

[14] Hongyang Yang, Xiao-Yang Liu, Shan Zhong, and Anwar Walid. 2021. Deep
reinforcement learning for automated stock trading: an ensemble strategy. In
Proceedings of the First ACM International Conference on AI in Finance (New York,
New York) (ICAIF ’20). Association for Computing Machinery, New York, NY,
USA, Article 31, 8 pages. https://doi.org/10.1145/3383455.3422540

[15] Yuyu Yuan, Wen Wen, and Jincui Yang. 2020. Using data augmentation based
reinforcement learning for daily stock trading. Electronics 9, 9 (2020), 1384.

A Quarterly Stock Selection List
We provide the portfolio (stock list) selected by the stock selection
Agent on a quarterly basis, as shown in Table2.