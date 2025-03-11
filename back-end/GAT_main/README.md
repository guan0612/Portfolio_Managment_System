# Graph Attention Network

This repository contains a PyTorch implementation of the **Graph Attention Networks (GAT)** based on the paper ["Graph Attention Network" by Velickovic et al](https://arxiv.org/abs/1710.10903v3). 

The Graph Attention Network is a powerful graph neural network model for learning represtations on graph-structured data, which has shown excellent performance in various tasks such as node classification, link prediction, and graph classification.

# Reference
- Code reference: (https://github.com/ebrahimpichka/GAT-pt/tree/main)
- Paper on arxiv: [arXiv:1710.10903v3](https://doi.org/10.48550/arXiv.1710.10903)
- Original paper repository: [https://github.com/PetarV-/GAT](https://github.com/PetarV-/GAT)


# Usage

Train the GAT model by running the the `train.py` script as follows:: (Example using the default parameters)

"python train.py --epochs 10000 --lr 0.0005 --l2 5e-4 --dropout-p 0.6 --num-heads 8 --hidden-dim 1024 --val-every 1000"

GAT forms a graph for each quarter's financial statements, with the graph's nodes divided into train nodes, validation nodes, and test nodes. When a new quarter's financial statements is available, the model needs to be retrained.
