# Git 工作流程指南

## 目錄
1. [基本概念](#基本概念)
2. [分支的關係與管理](#分支的關係與管理)
3. [不同情境的工作流程](#不同情境的工作流程)
4. [常用指令參考](#常用指令參考)
5. [常見問題及解決方案](#常見問題及解決方案)
6. [協作最佳實踐](#協作最佳實踐)

## 基本概念
- **Repository (repo)**: 程式碼倉庫
- **Branch**: 程式碼的分支，可以獨立開發
  - **本地分支**: 在您電腦上的分支
  - **遠端分支**: 在 GitHub 上的分支
- **Commit**: 提交程式碼更改
- **Push**: 上傳本地更改到遠端
- **Pull Request (PR)**: 請求將您的更改合併到原始專案
- **Remote**: 遠端倉庫
  - `origin`: 您的 GitHub repo
  - `upstream`: 原始作者的 repo（fork 時才需要）

## 分支的關係與管理

### 分支的類型與關係
1. **本地分支**
   - 位於您電腦上
   - 名稱格式：`feature-name`
   - 可以離線工作

2. **遠端分支**
   - 位於 GitHub 上
   - 名稱格式：`origin/feature-name` 或 `upstream/feature-name`
   - 需要網路連接才能同步

3. **追蹤關係**
   - 本地分支可以追蹤遠端分支
   - 一個本地分支只能追蹤一個遠端分支
   - 追蹤關係決定了 `git push` 和 `git pull` 的預設目標

### 查看分支關係
1. **檢視分支追蹤狀態**：
   ```bash
   git branch -vv
   ```
   輸出說明：
   ```
   * your-branch  abc123 [upstream/your-branch] 最新的提交訊息   # 本地分支追蹤 upstream 的分支
     main         def456 [origin/main]         某個提交訊息     # 本地分支追蹤 origin 的分支
     dev          789xyz                       提交訊息        # 沒有追蹤遠端分支
   ```

2. **查看所有分支**：
   ```bash
   git branch -a
   ```
   輸出說明：
   ```
   * your-branch                    # 本地分支，* 表示當前分支
     main                      # 本地分支
     remotes/origin/main      # 您 fork 的 GitHub 分支
     remotes/origin/your-branch    # 您 fork 的 GitHub 分支
     remotes/upstream/main    # 原始專案的分支
     remotes/upstream/your-branch  # 原始專案的分支
   ```

3. **確認遠端倉庫**：
   ```bash
   git remote -v
   ```
   輸出說明：
   ```
   origin    https://github.com/您的帳號/專案.git (fetch)
   origin    https://github.com/您的帳號/專案.git (push)
   upstream  https://github.com/原作者/專案.git (fetch)
   upstream  https://github.com/原作者/專案.git (push)
   ```

### 管理分支追蹤關係
1. **切換分支時設定追蹤**：
   ```bash
   # 切換到遠端分支並建立追蹤關係
   git checkout -b your-branch upstream/your-branch  # 追蹤 upstream 的 your-branch
   # 或
   git checkout -b your-branch origin/your-branch    # 追蹤 origin 的 your-branch
   ```

2. **修改現有分支的追蹤關係**：
   ```bash
   # 設定本地 your-branch 分支追蹤 upstream 的 your-branch
   git branch --set-upstream-to=upstream/your-branch your-branch
   # 或
   git branch --set-upstream-to=origin/your-branch your-branch
   ```

3. **重設追蹤關係**：
   ```bash
   # 刪除本地分支
   git branch -D your-branch
   
   # 重新建立並設定追蹤
   git checkout -b your-branch upstream/your-branch
   ```

### 重要說明：
1. **關於 origin 和 upstream**：
   - 當您有專案直接權限時，有兩種方式：
     1. 直接克隆原始專案：此時 `origin` 指向原始專案
     2. Fork 後設定 upstream：此時 `upstream` 指向原始專案，`origin` 指向您的 fork
   - 兩種方式都可以正常工作，選擇哪種方式取決於：
     - 團隊的工作流程規範
     - 是否需要在您的 fork 中進行實驗性開發
     - 是否需要管理多個遠端倉庫

2. **使用建議**：
   - 如果您主要在原始專案中工作：直接克隆並使用 `origin`
   - 如果您需要同時管理自己的版本：使用 fork 和 `upstream`
   - 無論使用哪種方式，都要遵循團隊的開發規範

3. **分支操作建議**：
   - 如果是小改動，可以直接在主分支操作（3.1 的方式）
   - 如果是較大的功能開發，建議使用獨立分支（3.2 的方式）
   - 無論使用哪種方式，都要先確認團隊的開發規範

### 分支管理指令
1. **查看所有分支**
   ```bash
   # 查看本地分支
   git branch
   
   # 查看本地和遠端所有分支
   git branch -a
   
   # 查看分支追蹤關係
   git branch -vv
   ```

2. **切換分支**
   ```bash
   # 切換到本地已存在的分支
   git checkout feature-name
   
   # 切換到遠端分支（自動建立本地追蹤分支）
   git checkout -b feature-name origin/feature-name
   ```

3. **建立新分支**
   ```bash
   # 從當前分支建立新分支
   git checkout -b new-feature
   
   # 從特定分支建立新分支
   git checkout -b new-feature main
   ```

4. **設定分支追蹤關係**
   ```bash
   # 推送並設定追蹤（首次推送時）
   git push -u origin feature-name
   
   # 手動設定已存在分支的追蹤關係
   git branch --set-upstream-to=origin/feature-name feature-name
   ```

### 分支同步情況
1. **本地有分支，遠端沒有**
   ```bash
   # 首次推送到遠端
   git push -u origin feature-name
   ```

2. **遠端有分支，本地沒有**
   ```bash
   # 方法1：直接切換（建議）
   git checkout -b feature-name origin/feature-name
   
   # 方法2：先抓取再切換
   git fetch origin
   git checkout feature-name
   ```

3. **本地和遠端都有分支**
   ```bash
   # 確認追蹤關係
   git branch -vv
   
   # 更新本地分支
   git pull origin feature-name
   
   # 推送更新到遠端
   git push origin feature-name
   ```

### 常見分支操作範例
1. **想要在遠端的 `develop` 分支上開發**：
   ```bash
   # 確保有最新的遠端資訊
   git fetch origin
   
   # 建立並切換到本地 develop 分支，同時設定追蹤遠端的 develop
   git checkout -b develop origin/develop
   ```

2. **不確定分支是否存在**：
   ```bash
   # 先查看所有分支
   git branch -a
   
   # 如果看到 remotes/origin/feature-name，表示遠端有這個分支
   # 如果看到 feature-name，表示本地有這個分支
   ```

3. **合併分支時的注意事項**：
   ```bash
   # 確保目標分支是最新的
   git checkout main
   git pull origin main
   
   # 再合併您的功能分支
   git merge feature-name
   ```

### Fork 專案的分支管理

#### 情境說明
當您已經 fork 了一個專案，並且：
1. 已設定好 `origin`（指向您的 fork）和 `upstream`（指向原始專案）
2. 在本地創建了新的分支

您可以用以下指令確認您的遠端設定：
```bash
git remote -v
# 輸出範例：
# origin    https://github.com/您的帳號/專案.git (fetch)
# origin    https://github.com/您的帳號/專案.git (push)
# upstream  https://github.com/原作者/專案.git (fetch)
# upstream  https://github.com/原作者/專案.git (push)
```

#### 新分支的操作流程
1. **創建並切換到新分支**：
   ```bash
   git checkout -b your-branch
   ```

2. **選擇分支的推送目標**：
   - 推送到您的 fork（適合實驗性功能）：
     ```bash
     git push -u origin your-branch
     ```
   - 推送到原始專案（適合正式功能開發）：
     ```bash
     git push -u upstream your-branch
     ```

3. **設定分支追蹤關係**：
   - 追蹤您的 fork：
     ```bash
     git branch --set-upstream-to=origin/your-branch your-branch
     ```
   - 追蹤原始專案：
     ```bash
     git branch --set-upstream-to=upstream/your-branch your-branch
     ```

4. **更新分支內容**：
   - 如果追蹤 origin：
     ```bash
     git pull origin your-branch
     ```
   - 如果追蹤 upstream：
     ```bash
     git pull upstream your-branch
     ```

#### 重要說明
1. **關於新分支的追蹤選擇**：
   - 即使是本地創建的新分支，如果要與原始專案互動，還是使用 `upstream`
   - 選擇追蹤目標時，考慮：
     - 這個分支的目的（實驗性質還是正式開發）
     - 是否需要與團隊成員協作
     - 是否需要提交 Pull Request

2. **使用建議**：
   - 正式功能開發：使用 `upstream`
   - 實驗性功能：使用 `origin`
   - 個人測試：保持在本地，不設定追蹤

3. **注意事項**：
   - 第一次推送新分支時，必須使用 `-u` 參數設定追蹤關係
   - 可以隨時使用 `git branch -vv` 檢查追蹤狀態
   - 追蹤關係設定後，可以直接使用 `git push` 和 `git pull`

## 不同情境的工作流程

### 1. 在自己的新專案工作
#### 第一次設定：
```bash
# 1. 在本地建立專案
git init

# 2. 在 GitHub 建立新的空 repo

# 3. 連接遠端 repo
git remote add origin <your-repo-url>

# 4. 建立本地主分支（如果需要）
git checkout -b main

# 5. 第一次推送到 GitHub
git push -u origin main
```

#### 再次開始工作時：
1. 確認目前狀態：
   ```bash
   # 查看當前分支
   git branch
   
   # 查看遠端設定
   git remote -v
   ```

2. 建立新功能分支（如果需要）：
   ```bash
   # 在本地建立並切換到新分支
   git checkout -b feature-name
   
   # 推送新分支到 GitHub（首次）
   git push -u origin feature-name
   ```

3. 開發完成後：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"
   
   # 推送到 GitHub
   git push origin feature-name
   
   # 如果要合併到主分支
   git checkout main
   git merge feature-name
   git push origin main
   ```

### 2. Fork 別人的專案進行開發
#### 第一次設定：
```bash
# 1. 在 GitHub 上 fork 原始專案

# 2. 複製您的 fork 到本地
git clone <your-fork-url>

# 3. 進入專案目錄
cd <project-name>

# 4. 設定原始專案的遠端位置
git remote add upstream <original-repo-url>

# 5. 確認遠端設定
git remote -v
```

#### 再次開始工作時：
1. 確認並更新分支：
   ```bash
   # 查看所有分支（本地和遠端）
   git branch -a
   
   # 從您的 fork 取得最新更新
   git fetch origin
   
   # 如果要同步原始專案的更新（選擇性）
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main  # 更新您的 fork
   ```

2. 建立新功能分支：
   ```bash
   # 建立並切換到新分支
   git checkout -b feature-name
   
   # 推送新分支到您的 fork（首次）
   git push -u origin feature-name
   ```

3. 開發完成後：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"
   
   # 推送到您的 fork
   git push origin feature-name
   ```

### 3. 參與多人協作專案（有權限）

#### 3.1 直接在主分支開發
#### 第一次設定：
```bash
# 1. 複製專案到本地
git clone <original-repo-url>

# 2. 確認遠端設定
git remote -v
```

#### 再次開始工作時：
1. 確認並更新主分支：
   ```bash
   # 確保在主分支上
   git checkout main
   
   # 取得最新更新
   git pull origin main
   ```

2. 開發完成後：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"
   
   # 直接推送到主分支
   git push origin main
   ```

#### 3.2 在獨立分支開發
#### 第一次設定：
```bash
# 1. 複製專案到本地
git clone <original-repo-url>

# 2. 確認遠端設定
git remote -v

# 3. 建立您的開發分支
git checkout -b your-branch
git push -u origin your-branch  # 推送新分支到遠端
```

#### 再次開始工作時：
1. 檢查並確認分支狀態：
   ```bash
   # 查看所有分支狀態
   git branch -a  # 這會列出所有本地和遠端分支
   # 輸出範例：
   #   * main                      # 目前在本地 main 分支
   #     your-branch              # 本地的 your-branch 分支
   #     remotes/origin/main      # 遠端的 main 分支
   #     remotes/origin/your-branch # 遠端的 your-branch 分支

   # 查看分支的追蹤關係
   git branch -vv
   # 輸出範例：
   #   * main        abc123 [origin/main] 最新的提交訊息
   #     your-branch def456 [origin/your-branch] 您的分支訊息
   ```

2. 切換到您的開發分支：
   ```bash
   # 如果本地已有分支，直接切換
   git checkout your-branch
   
   # 如果是要切換到遠端的分支（本地沒有）
   git checkout -b your-branch origin/your-branch
   ```

3. 更新分支內容：
   ```bash
   # 取得遠端最新狀態
   git fetch origin
   
   # 更新您的分支
   git pull origin your-branch
   
   # 如果需要與主分支同步
   git merge origin/main
   ```

4. 開發完成後：
   ```bash
   # 提交更改
   git add .
   git commit -m "更改說明"
   
   # 推送到您的分支
   git push origin your-branch
   ```

5. 合併到主分支（如果需要）：
   ```bash
   # 切換到主分支
   git checkout main
   
   # 確保主分支是最新的
   git pull origin main
   
   # 合併您的分支
   git merge your-branch
   
   # 推送到主分支
   git push origin main
   ```

## 常用指令參考

### 1. 確認遠端設定
```bash
git remote -v
```
- **用途**: 查看當前設定的遠端倉庫
- **可能輸出**: 
  - `origin` 指向您的 repo
  - `upstream` 指向原始 repo

### 2. 切換分支
```bash
git checkout <branch_name>
```
- **用途**: 切換到指定的分支
- **可能輸出**: 
  - `Switched to branch '<branch_name>'` 表示成功切換
  - `error: pathspec '<branch_name>' did not match any file(s) known to git` 表示分支不存在

### 3. 查看當前分支
```bash
git branch
```
- **用途**: 查看當前所在的分支
- **可能輸出**: 
  - `* <branch_name>` 表示當前分支

### 4. 添加更改
```bash
git add .
```
- **用途**: 將所有更改添加到暫存區
- **可能輸出**: 無輸出，表示成功

### 5. 提交更改
```bash
git commit -m "您的更改說明"
```
- **用途**: 提交暫存區的更改
- **可能輸出**: 
  - `[branch_name <commit_hash>] Your commit message` 表示成功提交
  - `nothing to commit, working tree clean` 表示沒有更改可提交

### 6. 推送更改
```bash
git push origin <branch_name>
```
- **用途**: 將更改推送到 GitHub 的指定分支
- **可能輸出**: 
  - `To <url>` 表示成功推送
  - `error: failed to push some refs` 表示推送失敗，可能因為本地分支落後於遠端分支

### 7. 獲取原始 repo 更新
```bash
git fetch upstream
```
- **用途**: 獲取原始 repo 的最新更新
- **可能輸出**: 無輸出，表示成功

### 8. 合併更新
```bash
git merge upstream/<branch_name>
```
- **用途**: 將原始 repo 的更新合併到當前分支
- **可能輸出**: 
  - `Merge made by the 'recursive' strategy` 表示成功合併
  - `CONFLICT` 表示合併衝突，需要手動解決

### 9. 查看遠端詳細資訊
```bash
git remote -vv
```
- **用途**: 顯示遠端倉庫的詳細資訊，包括 fetch 和 push 的 URL
- **可能輸出**: 
  ```
  origin  https://github.com/your-username/repo.git (fetch)
  origin  https://github.com/your-username/repo.git (push)
  upstream  https://github.com/original-owner/repo.git (fetch)
  upstream  https://github.com/original-owner/repo.git (push)
  ```
- **說明**: 
  - `(fetch)`: 從哪裡拉取更新
  - `(push)`: 推送更改的目標位置

## 常見問題及解決方案

### 1. 推送被拒絕
- **情況**: `error: failed to push some refs`
- **解決方案**: 先拉取更新：
```bash
git pull upstream <branch_name>
```

### 2. 合併衝突
- **情況**: `CONFLICT`
- **解決方案**: 手動編輯衝突的檔案，然後：
```bash
git add <conflicted_file>
git commit -m "Resolve conflicts"
```

### 3. 切換到不存在的分支
- **情況**: `error: pathspec '<branch_name>' did not match any file(s) known to git`
- **解決方案**: 確認分支名稱是否正確，或使用 `git branch` 查看可用分支。

## 協作最佳實踐

### 開始新專案時的選擇指南

#### 情境一：核心開發者（有原始專案的直接權限）
建議使用直接克隆的方式：

1. **初始設定**：
   ```bash
   # 直接克隆原始專案
   git clone <原始專案URL>

   # 確認遠端設定
   git remote -v
   # 應該只看到：
   # origin  https://github.com/原作者/專案.git (fetch)
   # origin  https://github.com/原作者/專案.git (push)
   ```

2. **開發流程**：
   ```bash
   # 建立新功能分支
   git checkout -b feature-name

   # 開發完成後直接推送
   git push -u origin feature-name
   ```

**優點**：
- 設定簡單，只需管理一個遠端
- 直接與團隊協作
- 減少同步的複雜度

#### 情境二：外部協作者（沒有直接權限）
建議使用 Fork 的方式：

1. **初始設定**：
   ```bash
   # 1. 先在 GitHub 上 fork 專案
   
   # 2. 克隆您的 fork
   git clone <您的fork的URL>
   
   # 3. 添加原始專案作為 upstream
   git remote add upstream <原始專案URL>
   
   # 4. 確認遠端設定
   git remote -v
   # 應該看到：
   # origin    https://github.com/您的帳號/專案.git (fetch)
   # origin    https://github.com/您的帳號/專案.git (push)
   # upstream  https://github.com/原作者/專案.git (fetch)
   # upstream  https://github.com/原作者/專案.git (push)
   ```

2. **開發流程**：
   ```bash
   # 建立新功能分支
   git checkout -b feature-name
   
   # 定期從原始專案更新
   git pull upstream main
   
   # 推送到您的 fork
   git push -u origin feature-name
   
   # 然後在 GitHub 上發起 Pull Request
   ```

**優點**：
- 可以安全地進行實驗
- 通過 Pull Request 進行代碼審查
- 不會直接影響原始專案

### 選擇建議
1. **使用直接克隆（情境一）的情況**：
   - 您是專案的核心開發者
   - 您有直接的提交權限
   - 團隊規模較小，協作緊密

2. **使用 Fork（情境二）的情況**：
   - 您是外部協作者
   - 您想要進行實驗性開發
   - 專案要求使用 Pull Request 流程
   - 團隊規模較大，需要更嚴格的代碼審查

### 注意事項
- 無論選擇哪種方式，都要遵循專案的貢獻指南
- 定期與原始專案同步，避免過大的合併衝突
- 保持良好的分支命名和提交信息習慣
- 在進行重大更改前，最好先與團隊討論

這樣的指南應該能幫助您在未來的開發中更順利。如果有其他問題或需要進一步的解釋，隨時告訴我！