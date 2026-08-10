# Drawing With Blockly

A multi-page Blockly + p5.js app where users pick a level, then solve drawing challenges by programming with visual blocks.

This README is written as a full onboarding guide: from first run to architecture, customization, and extension.

## 1. What This Project Does

- Home page (`index.html`): shows a grid of drawing levels.
- Drawing page (`drawing.html`): opens Blockly workspace + drawing board for the selected level.
- Theme and language are global across pages:
	- Themes: Light / Dark
	- Languages: English / Spanish
- Workspace state is persisted per level in `localStorage`.

## 2. Stack and Tooling

- JavaScript (ES modules)
- [Blockly](https://developers.google.com/blockly)
- [p5.js](https://p5js.org/)
- Webpack + webpack-dev-server
- pnpm package manager

## 3. Quick Start (0 to Running)

### Prerequisites

- Node.js 18+ recommended
- pnpm installed globally

```bash
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm start
```

- Web app runs at `http://localhost:8080`
- Dev mode includes source maps for easier debugging.

### Build production bundle

```bash
pnpm build
```

- Output is generated in `dist/`.

## 4. Scripts

From `package.json`:

- `pnpm start`: run webpack dev server (`development` mode)
- `pnpm build`: production build (`production` mode)
- `pnpm test`: placeholder (currently no test suite configured)

## 5. Project Structure

```text
src/
	pages/
		home/
			index.html
			index.js
			styles.css
		drawing/
			index.html
			index.js
			styles.css
	features/
		board/
			board.js
			constants.js
	shared/
		preferences.js
		serialization.js
		toolbox.js
		translations.js
	blocks/
		custom_blocks.js
		text.js
	generators/
		javascript.js
webpack.config.js
```

### Folder responsibilities

- `pages/`: page entrypoints and page-specific UI/styles.
- `features/`: reusable domain features (board logic lives here).
- `shared/`: app-wide concerns (i18n, preferences, toolbox, persistence).
- `blocks/` and `generators/`: Blockly custom block definitions + JS generation logic.

## 6. Runtime Flow

### Home page (`src/pages/home`)

1. Renders level cards (`1..12` by default).
2. Reads global language/theme preferences.
3. Clicking a level routes to `drawing.html?level=<N>`.

### Drawing page (`src/pages/drawing`)

1. Reads selected level from URL query (`level`).
2. Initializes Blockly + custom blocks + toolbox.
3. Initializes p5 drawing board.
4. Saves/loads workspace using a per-level storage key:
	 - `blockyAndP5:level:<N>`

## 7. Theming and i18n

Shared files:

- `src/shared/preferences.js`
- `src/shared/translations.js`

How it works:

- Theme/language values are stored in `localStorage`.
- Both pages read/write the same keys, so preferences stay synchronized.
- Theme is applied by setting `data-theme` on `<html>`.
- Copy text is centralized in `translations` object.

## 8. Blockly Architecture

### Custom blocks

- Defined in:
	- `src/blocks/custom_blocks.js`
	- `src/blocks/text.js`

### JS generators

- Defined in:
	- `src/generators/javascript.js`

### Toolbox

- Configured in:
	- `src/shared/toolbox.js`
- Supports language-aware category labels.

## 9. Board (p5.js) Architecture

- Main board logic: `src/features/board/board.js`
- Board constants: `src/features/board/constants.js`

Board module exports actions used by generated Blockly code, for example:

- `paint(color)`
- `moveUp()`, `moveDown()`, `moveLeft()`, `moveRight()`
- `setStartingRow()`, `setStartingCol()`

These functions are exposed on `window` by the drawing page entry so block-generated JS can call them.

## 10. Webpack Setup

`webpack.config.js` defines a multi-page build:

- Entry `main` -> `src/pages/home/index.js`
- Entry `drawing` -> `src/pages/drawing/index.js`
- HTML templates are generated through `HtmlWebpackPlugin`

Production mode:

- Uses hashed filenames for caching (`[contenthash]`)
- Uses split chunks + runtime chunk
- Uses realistic performance budgets for Blockly+p5 bundle sizes

## 11. How to Add a New Level

Current level list is static (`DEFAULT_LEVEL_COUNT` in `src/pages/home/index.js`).

To add levels now:

1. Increase `DEFAULT_LEVEL_COUNT`.
2. Optionally create metadata mapping (name, difficulty, locked flag).

For future DB integration:

1. Replace static rendering with API-fetched level list.
2. Keep `drawing.html?level=<id>` routing contract.
3. Map server level IDs to workspace persistence/storage logic.

## 12. How to Add More Languages

1. Add a new language key in `src/shared/translations.js`.
2. Update language constants and selectors in `src/shared/preferences.js` and UI handlers.
3. Add language option in both page templates.

## 13. Troubleshooting

### Dev server shows chunk filename conflicts

- This is resolved by using entry-based filenames (`[name].js`) in development output.

### Theme text looks wrong in dark mode

- Check the page CSS variable bindings (`--text-color` / `--home-text`).
- Ensure controls/cards explicitly set `color` (button defaults can differ by browser).

### Blockly workspace not restoring

- Confirm current URL has the intended `?level=` value.
- Inspect `localStorage` keys prefixed with `blockyAndP5:level:`.

## 14. Next Improvements (Suggested)

- Add automated tests (unit tests for `shared` and `board` logic).
- Replace `eval` execution with a safer interpreter strategy.
- Add level metadata model and fetch from backend.
- Add linting + formatting scripts.

## 15. License

This project is licensed under Apache-2.0 (see `package.json`).
