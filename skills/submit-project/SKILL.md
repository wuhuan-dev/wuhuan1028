---
name: submit-project
description: 提交当前项目到 Gitee 远程仓库。执行 git add、commit、push 流程，支持自定义提交信息。
---

# 提交项目到 Gitee

## 功能

将当前项目代码提交并推送到 `https://gitee.com/wu-huan-111/gaojiwangye.git`。

## 使用方式

调用本 skill 时，按以下步骤执行：

1. **检查状态**：运行 `git status` 查看变更文件
2. **添加文件**：运行 `git add -A` 或按需添加特定文件
3. **提交**：运行 `git commit -m "<提交信息>"`
   - 提交信息应简洁描述本次变更
   - 若用户未提供信息，根据变更内容自动生成
4. **推送**：运行 `git push origin main`

## 注意事项

- 若远程分支不存在，先运行 `git push -u origin main`
- 若遇到冲突，先拉取合并：`git pull origin main --rebase`
- 确保当前目录是 git 仓库（应有 `.git` 目录）
- 提交前确认变更内容符合预期

## 示例

```bash
# 查看变更
git status

# 添加所有变更
git add -A

# 提交
git commit -m "feat: 添加移动端下导航页面"

# 推送到 Gitee
git push origin main
```
