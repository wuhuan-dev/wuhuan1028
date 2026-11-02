# AGENTS.md

## 语言约定
- 本项目所有文档、说明文字、检查清单一律使用简体中文。
- 文件路径、HTML、CSS、JS 标识符（类名、ID、变量名、函数名、文件名等）保留英文，不做翻译。

## 项目概览
纯静态 HTML/CSS/JS 课程项目（吴欢《高级网页设计》课堂实践）。无构建系统、无包管理器、无测试，直接用浏览器打开 HTML 文件即可运行。

## 仓库约定（本项目特有）
- 命名规范：新增或修改的 CSS 类名、ID、JS 变量统一以 `wh_` 为前缀（源自 `wh_prompt.md`）。
- 新建 HTML 页面必须在 `index.html` 中加入入口链接（双向链接约定，源自 `wh_prompt.md`）。
- 提示词记录追加写入 `wh_prompt.md`（时间/模型/内容），不得覆盖历史记录。

## 新建 HTML 文件的注释规则
每个新 HTML 文件必须包含注释，尤其是 JS 部分各函数的主要功能实现。注释内容必须包含：
- 作者：吴欢
- 建立时间：当前日期时间
- 使用模型：当前使用的 AI 模型名称
- 功能名称及简介：功能名称与简要说明

新 HTML 文件顶部模板：
```html
<!--
  作者: 吴欢
  建立时间: YYYY-MM-DD HH:mm
  使用模型: <模型名称>
  功能名称及简介: <功能名称> - <功能简介>
-->
```

每个 JS 函数必须携带注释：
```js
/**
 * 功能: <功能名称>
 * 简介: <主要实现说明>
 * 作者: 吴欢
 * 建立时间: YYYY-MM-DD HH:mm
 * 使用模型: <模型名称>
 */
```

## 入口文件
- `index.html` —— 主作品集首页，包含指向各练习页面的链接。
- 课程页面命名示例：`wh.html`、`stack1028.html`、`layout1028.html`、`CSS31028.html`、`iconfont-1.html`/`inconfont-2.html`、`iconfont-3.html`/`iconfont-4.html`、`dataTyp1028.html`、`JS_obj_fun1028.html`、`grid1028.html` 等。
- 练习数据源：`level1-data.js`（暴露 `window.SUBJECTS`/`window.STUDENTS`）。

## 资源目录
- 本地库文件位于 `cdn/`，字体位于 `font/`，图标与图片位于 `img/`、`png/`、`jpg/`。
- `skills/` 目录存放本地技能（如 `frontend-design/`、`submit-project/`、`submit-github/`）。

## 运行与预览
直接用浏览器打开任意 `.html` 文件即可，无需 `npm run`，无需启动服务器。

## 注意事项
- `index.html` 中部分链接指向 `level1.html`/`level2.html`，但仓库根目录下可能不存在这两个文件（仅有 `level1-data.js`），不要假设它们存在。
- 文件名存在拼写问题（如 `inconfont-2.html`），保持原样不要修正。
- `.gitignore` 已忽略 `.opencode/`、`node_modules/`、压缩包与二进制文件。
