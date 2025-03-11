import torch

print(torch.__version__)
print(torch.cuda.is_available())  # 檢查是否有 CUDA 支援
print(torch.version.cuda)