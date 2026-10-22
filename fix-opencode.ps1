# 修复 opencode 在 PowerShell 中无法运行的问题
# 以管理员身份运行 PowerShell 后执行: .\fix-opencode.ps1

Write-Host "=== OpenCode PowerShell 修复脚本 ===" -ForegroundColor Cyan

# 1. 修改执行策略(当前用户级别)
Write-Host "[1/3] 设置执行策略为 RemoteSigned..." -ForegroundColor Yellow
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue
$policy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host "    当前执行策略: $policy" -ForegroundColor Green

# 2. 解除 opencode.ps1 的下载阻止标记
Write-Host "[2/3] 解除 opencode.ps1 的阻止标记..." -ForegroundColor Yellow
$ps1Path = "$env:APPDATA\npm\opencode.ps1"
if (Test-Path $ps1Path) {
    Unblock-File $ps1Path -ErrorAction SilentlyContinue
    Write-Host "    已解除阻止" -ForegroundColor Green
}

# 3. 删除有问题的 .ps1 文件(PowerShell 会自动回退到 .cmd)
Write-Host "[3/3] 删除 opencode.ps1,让 PowerShell 使用 .cmd 版本..." -ForegroundColor Yellow
if (Test-Path $ps1Path) {
    Remove-Item $ps1Path -Force
    Write-Host "    已删除 opencode.ps1" -ForegroundColor Green
} else {
    Write-Host "    opencode.ps1 不存在,跳过" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== 修复完成 ===" -ForegroundColor Cyan
Write-Host "请关闭当前 PowerShell 窗口,重新打开一个新窗口,然后运行: opencode" -ForegroundColor White
Write-Host "如果仍然报错,请尝试: opencode.cmd" -ForegroundColor White
