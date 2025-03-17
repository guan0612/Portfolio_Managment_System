# Git 工作流程指南

## 目錄
1. [基本概念](#基本概念)
2. [協作模式選擇](#協作模式選擇)
3. [常見工作流程](#常見工作流程)
4. [不同電腦的工作設定](#不同電腦的工作設定)
5. [分支管理指南](#分支管理指南)
6. [常用指令參考](#常用指令參考)
7. [常見問題解決](#常見問題解決)

## 基本概念
- **Repository (repo)**: 程式碼倉庫
- **Branch**: 程式碼的分支，可以獨立開發
  - **本地分支**: 在您電腦上的分支
  - **遠端分支**: 在 GitHub 上的分支
- **Commit**: 提交程式碼更改
- **Push**: 上傳本地更改到遠端
- **Pull Request (PR)**: 請求將您的更改合併到原始專案
- **Remote**: 遠端倉庫
  - `origin`: 直接操作的遠端倉庫（可能是原始專案或您的 fork）
  - `upstream`: 原始專案的倉庫（當您使用 fork 時才需要）

## 協作模式選擇

### 模式一：個人專案
適合情況：
- 這是您自己的專案
- 不需要與他人協作
- 可能需要在不同電腦上工作

設定步驟：
```bash
# 第一次設定：
# 1. 在 GitHub 上建立新的 repo

# 2. 在本地初始化
git init
git add .
git commit -m "初始提交"

# 3. 連接遠端 repo
git remote add origin <您的repo網址>
git push -u origin main

# 之後開始工作時：
# 1. 確認狀態
git status

# 2. 開發並提交
git add .
git commit -m "更新說明"
git push origin main
```

### 模式二：直接克隆（核心開發者 - 主分支）
適合情況：
- 您有專案的直接權限
- 主要在 main 分支上工作
- 團隊規模較小

設定步驟：
```bash
# 1. 克隆原始專案
git clone <原始專案URL>

# 2. 確認遠端設定（應該只有 origin）
git remote -v
# origin  https://github.com/原作者/專案.git (fetch)
# origin  https://github.com/原作者/專案.git (push)
```

### 模式三：直接克隆（核心開發者 - 特定分支）
適合情況：
- 您有專案的直接權限
- 需要在特定分支上工作
- 團隊有分支管理規範

設定步驟：
```bash
# 第一次設定：
# 1. 克隆原始專案
git clone <原始專案URL>

# 2. 切換到特定分支
git checkout specific-branch  # 如果遠端已有該分支
# 或
git checkout -b specific-branch  # 如果需要建立新分支
git push -u origin specific-branch

# 之後開始工作時：
# 1. 確保在正確的分支
git checkout specific-branch
git pull origin specific-branch

# 2. 開發並提交
git add .
git commit -m "更新說明"
git push origin specific-branch
```

### 模式四：Fork + Upstream（外部協作者）
適合情況：
- 您沒有直接權限
- 需要進行實驗性開發
- 需要嚴格的代碼審查

設定步驟：
```bash
# 1. 在 GitHub 上 fork 專案

# 2. 克隆您的 fork
git clone <您的fork的URL>

# 3. 添加原始專案作為 upstream
git remote add upstream <原始專案URL>

# 4. 確認遠端設定
git remote -v
# origin    https://github.com/您的帳號/專案.git (fetch)
# origin    https://github.com/您的帳號/專案.git (push)
# upstream  https://github.com/原作者/專案.git (fetch)
# upstream  https://github.com/原作者/專案.git (push)
```

## 不同電腦的工作設定

### 情境一：個人專案
```bash
# 在新電腦上第一次設定：
# 1. 克隆您的專案
git clone <您的repo網址>

# 2. 設定 Git 配置
git config --global user.name "您的名字"
git config --global user.email "您的email"

# 3. 設定 GitHub 認證（如果需要）
# 建議使用 SSH 金鑰或個人訪問令牌

# 之後開始工作時：
# 1. 拉取最新更新
git pull origin main

# 2. 開發並提交
git add .
git commit -m "更新說明"
git push origin main
```

### 情境二：團隊專案（直接權限）
```bash
# 在新電腦上第一次設定：
# 1. 克隆原始專案
git clone <原始專案URL>

# 2. 設定 Git 配置
git config --global user.name "您的名字"
git config --global user.email "您的email"

# 3. 切換到正確的分支
git checkout your-branch  # 如果遠端已有該分支
# 或
git checkout -b your-branch  # 如果需要建立新分支
git push -u origin your-branch

# 之後開始工作時：
# 1. 確保在正確的分支
git checkout your-branch
git pull origin your-branch

# 2. 開發並提交
git add .
git commit -m "更新說明"
git push origin your-branch
```

### 情境三：Fork 的專案
```bash
# 在新電腦上第一次設定：
# 1. 克隆您的 fork
git clone <您的fork網址>

# 2. 添加原始專案
git remote add upstream <原始專案URL>

# 3. 設定分支
git checkout -b your-branch
git push -u origin your-branch

# 之後開始工作時：
# 1. 更新原始專案的內容
git fetch upstream
git merge upstream/main

# 2. 開發並提交
git add .
git commit -m "更新說明"
git push origin your-branch
```

## 常見工作流程

### 模式一的工作流程（直接克隆）

1. **開始新功能開發**：
   ```bash
   # 確保主分支是最新的
   git checkout main
   git pull origin main

   # 建立新功能分支
   git checkout -b feature-name
   ```

2. **日常開發**：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"

   # 推送到遠端
   git push -u origin feature-name  # 第一次推送
   git push  # 之後的推送
   ```

3. **與主分支同步**：
   ```bash
   # 更新主分支
   git checkout main
   git pull origin main

   # 將主分支的更新合併到功能分支
   git checkout feature-name
   git merge main
   ```

### 模式二的工作流程（Fork）

1. **開始新功能開發**：
   ```bash
   # 確保主分支是最新的
   git checkout main
   git pull upstream main  # 從原始專案更新

   # 建立新功能分支
   git checkout -b feature-name
   ```

2. **日常開發**：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"

   # 推送到您的 fork
   git push -u origin feature-name
   ```

3. **與原始專案同步**：
   ```bash
   # 獲取原始專案的更新
   git fetch upstream
   
   # 合併更新
   git merge upstream/main
   ```

## 分支管理指南

### 查看分支狀態
```bash
# 查看所有分支
git branch -a

# 查看分支追蹤關係
git branch -vv

# 查看遠端設定
git remote -v
```

### 分支操作
```bash
# 切換分支
git checkout branch-name

# 建立並切換到新分支
git checkout -b new-branch

# 設定分支追蹤關係
git branch --set-upstream-to=origin/branch-name branch-name
```

## 常用指令參考

### 基本操作
```bash
# 查看狀態
git status

# 添加文件
git add .

# 提交更改
git commit -m "提交說明"

# 推送更改
git push

# 拉取更新
git pull
```

### 進階操作
```bash
# 查看提交歷史
git log

# 暫存當前更改
git stash

# 恢復暫存的更改
git stash pop

# 放棄本地更改
git checkout -- <file>
```

## 常見問題解決

### 推送被拒絕
```bash
# 先拉取最新更改
git pull origin branch-name

# 解決衝突後再推送
git push origin branch-name
```

### 合併衝突
1. 打開衝突文件
2. 找到並解決衝突部分
3. 保存文件
4. 提交解決結果：
   ```bash
   git add .
   git commit -m "解決合併衝突"
   ```

### 重要提醒
- 推送前先拉取最新更改
- 定期與主分支同步
- 保持良好的提交信息
- 有疑問時先諮詢團隊