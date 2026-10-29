# AGENTS.md

## Overview
Static HTML/CSS/JS course project (Wu Huan's "Advanced Web Design" exercises). No build system, no package manager, no tests. Open HTML files directly in browser.

## Key conventions (repo-specific)
- Naming: follow `wh_` prefix for CSS classes/IDs/JS variables when adding/editting (from `wh_prompt.md`).
- New HTML pages must be linked from `index.html` (per `wh_prompt.md`).
- Prompt history is appended to `wh_prompt.md` (time/model/prompt) — don't overwrite it.

## Entrypoints
- `index.html` - main portfolio/index with links to all exercises.
- Course pages follow naming like `wh.html`, `stack1028.html`, `layout1028.html`, `CSS31028.html`, `iconfont-1.html`/`inconfont-2.html`, `iconfont-3.html`/`iconfont-4.html`, `dataTyp1028.html`, `JS_obj_fun1028.html`, `grid1028.html`, etc.
- Data for exercises: `level1-data.js` (exposes `window.SUBJECTS`/`window.STUDENTS`).

## Assets
- Local libs in `cdn/`, fonts in `font/`, icons/images in `img/`, `png/`, `jpg/`.
- `skills/` contains local skills (e.g. `frontend-design/`).

## Run/preview
Just open any `.html` file in a browser. No `npm run`, no server required.

## Gotchas
- Some links in `index.html` reference `level1.html`/`level2.html` but those files may not exist in repo root (only `level1-data.js` present). Don't assume they exist.
- Filenames have typos (`inconfont-2.html`) — preserve as-is.
- `.gitignore` ignores `.opencode/`, `node_modules/`, archives/binaries.
