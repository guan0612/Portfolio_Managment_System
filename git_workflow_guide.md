# Git 工作流程指南

## 目錄
1. [基本概念](#基本概念)
2. [初始設定](#初始設定)
3. [日常開發流程](#日常開發流程)
4. [分支管理](#分支管理)
5. [與原始專案同步](#與原始專案同步)
6. [Pull Request 工作流程](#pull-request-工作流程)
7. [常用指令參考](#常用指令參考)

## 基本概念

### 重要術語
- **Repository (repo)**: 程式碼倉庫
- **Fork**: 複製別人的 repo 到自己的 GitHub 帳號下
- **Clone**: 下載 repo 到本地電腦
- **Branch**: 程式碼的分支，可以獨立開發
- **Commit**: 提交程式碼更改
- **Push**: 上傳本地更改到遠端
- **Pull Request (PR)**: 請求將您的更改合併到原始專案
- **Merge**: 合併程式碼
- **Remote**: 遠端倉庫
  - `origin`: 您的 fork
  - `upstream`: 原始專案

## 初始設定

### 1. Fork 專案
1. 在 GitHub 上找到原始專案
2. 點擊 "Fork" 按鈕
3. 選擇您的帳號

### 2. Clone 到本地
```bash
# 下載您的 fork
git clone https://github.com/您的用戶名/專案名稱.git

# 進入專案目錄
cd 專案名稱

# 添加原始專案作為 upstream
git remote add upstream https://github.com/原始用戶名/專案名稱.git
```

### 3. 創建開發分支
```bash
# 創建並切換到新分支
git checkout -b 您的分支名稱

# 例如
git checkout -b yaowen
```

## 日常開發流程

### 1. 開始工作前
```bash
# 確認在正確的分支上
git status

# 同步原始專案的更新
git fetch upstream
git merge upstream/main
```

### 2. 開發過程中
```bash
# 查看更改狀態
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到您的 fork
git push origin 您的分支名稱
```

### 提交訊息的格式
```bash
# 新功能
git commit -m "Add: 新增功能描述"

# 修復問題
git commit -m "Fix: 問題描述"

# 改進功能
git commit -m "Improve: 改進描述"

# 更新文檔
git commit -m "Update: 更新描述"
```

## 分支管理

### 創建新功能分支
```bash
# 從主分支創建新分支
git checkout main
git checkout -b feature-名稱

# 推送新分支到您的 fork
git push origin feature-名稱
```

### 切換分支
```bash
# 切換到已存在的分支
git checkout 分支名稱
```

## 與原始專案同步

### 更新本地專案
```bash
# 獲取原始專案更新
git fetch upstream

# 合併更新到您的分支
git merge upstream/main
```

## Pull Request 工作流程

### 1. 創建 Pull Request
- 推送更改到您的 fork
- 在 GitHub 上創建 Pull Request
- 填寫清楚的標題和描述

### 2. PR 被接受後
```bash
# 同步原始專案的更新
git fetch upstream
git checkout 您的分支名稱
git merge upstream/main

# 繼續開發新功能
# ... 修改程式碼 ...

# 提交新的更改
git add .
git commit -m "Add: 新功能"
git push origin 您的分支名稱

# 需要在 GitHub 上開新的 PR
```

## 常用指令參考

### 基本操作
```bash
# 查看狀態
git status

# 查看分支
git branch

# 查看遠端倉庫
git remote -v

# 查看提交歷史
git log --oneline

# 取消未提交的更改
git checkout -- 文件名稱

# 取消最後一次提交
git reset HEAD~1
```

### 解決衝突
```bash
# 當合併發生衝突時
1. 打開衝突文件
2. 尋找 <<<<<<< HEAD 和 >>>>>>> 標記
3. 修改衝突部分
4. 保存文件
5. git add .
6. git commit -m "Resolve conflicts"
```

## 注意事項
1. 經常同步原始專案的更新
2. 保持提交訊息清晰明確
3. 一個功能一個分支
4. 定期備份重要更改
5. 有疑問時多查看 git status

## 常見問題解決
1. 如果推送被拒絕：先拉取（pull）再推送（push）
2. 如果不小心提交了錯誤：使用 git reset
3. 如果需要臨時保存更改：使用 git stash 