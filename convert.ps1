Add-Type -AssemblyName System.Drawing

$svgs = @("banner","goods1","goods2","goods3","goods4")

foreach ($name in $svgs) {
    $svgPath = "img\$name.svg"
    $jpgPath = "img\$name.jpg"
    if (Test-Path $svgPath) {
        # 用 WebBrowser 控件渲染 SVG 再截图（简化处理：直接提示手动转换）
        Write-Host "请手动将 $svgPath 转换为 $jpgPath（推荐用 cloudconvert.com）"
    }
}

Write-Host ""
Write-Host "提示：PowerShell 原生不支持 SVG→JPG 转换，"
Write-Host "建议访问 https://cloudconvert.com/svg-to-jpg 批量转换。"