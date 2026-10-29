---
name: submit-github
description: 提交当前项目到 GitHub 仓库 wuhuan-dev/wuhuan1028。使用本地已配置的 SSH 公钥（id_ed25519，经 443 端口连接）完成认证，执行 git add、commit、push 流程。
---

# 提交项目到 GitHub

## 功能

将当前项目提交并推送到 `https://github.com/wuhuan-dev/wuhuan1028.git`，使用本地 SSH 公钥 `C:\Users\wuhuan\.ssh\id_ed25519` 免密认证。

## 远程地址

- SSH（使用公钥）：`git@github.com:wuhuan-dev/wuhuan1028.git`
- HTTPS：`https://github.com/wuhuan-dev/wuhuan1028.git`

## 环境前提（已验证）

本机 SSH 已配置并验证通过：`ssh -T git@github.com` 返回 `Hi wuhuan-dev! You've successfully authenticated`。

- 本机 22 端口不通，`~/.ssh/config` 已将 `github.com` 映射到 `ssh.github.com:443`
- 已写入 `known_hosts`，指纹为 GitHub 官方 ED25519：`SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU`
- 公钥 `~/.ssh/id_ed25519.pub` 需已添加到 GitHub → Settings → SSH and GPG keys

## 执行步骤

1. **查看状态**：
   ```bash
   git status
   git branch --show-current
   git remote -v
   ```
2. **确认远程**：仓库当前 `origin` 指向 Gitee，因此 GitHub 使用独立远程名 `github`：
   ```bash
   git remote add github git@github.com:wuhuan-dev/wuhuan1028.git
   ```
   若已存在则跳过。若用户明确要求改用 `origin`：
   ```bash
   git remote set-url origin git@github.com:wuhuan-dev/wuhuan1028.git
   ```
3. **暂存**：`git add -A`，或按需添加指定文件
4. **提交**：`git commit -m "<提交信息>"`
   - 变更信息简洁描述本次改动，推荐 `feat:` / `fix:` / `docs:` 前缀
   - 用户未指定时，根据变更内容自动生成
5. **推送**：`git push github <当前分支>`
   - 首次推送新分支加 `-u`：`git push -u github <当前分支>`
6. **校验**：推送后运行 `git log --oneline -1` 与 `git remote show github` 确认

## 注意事项

- 当前分支为 `master`，推送时使用实际分支名，避免误用 `main`
- 若推送被拒（远端有新提交），先 `git pull github <分支> --rebase` 再推送
- 若报 `Permission denied (publickey)`，检查 `~/.ssh/config` 中的 443 配置与 GitHub 上的公钥
- 不提交敏感文件（`.env`、私钥等），必要时先补充 `.gitignore`

## 示例

```bash
git status
git remote add github git@github.com:wuhuan-dev/wuhuan1028.git
git add -A
git commit -m "feat: 新增成绩分析面板 Level 2"
git push -u github master
```
