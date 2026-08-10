/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly';
import {blocks} from '../../blocks/text';
import {customBlocks} from '../../blocks/custom_blocks';
import {forBlock} from '../../generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from '../../shared/serialization';
import {getToolbox} from '../../shared/toolbox';
import * as Board from '../../features/board/board';
import {
  LANGUAGES,
  THEMES,
  applyThemeToDocument,
  readLanguage,
  readTheme,
  writeLanguage,
  writeTheme,
} from '../../shared/preferences';
import {translations} from '../../shared/translations';
import './styles.css';

const levelParams = new URLSearchParams(window.location.search);
const currentLevel = levelParams.get('level') || '1';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Blockly.common.defineBlocks(customBlocks);
Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const runButton = document.getElementById('run-button');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');
const pageTitle = document.getElementById('page-title');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');

let currentLanguage = readLanguage();
let currentTheme = readTheme();

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const applyLanguage = () => {
  const copy = translations[currentLanguage];
  pageTitle.textContent = `${copy.drawing.heading} - ${copy.drawing.levelLabel} ${currentLevel}`;
  runButton.textContent = copy.drawing.runButton;
  languageLabel.textContent = copy.common.languageLabel;
  languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
  languageSelect.value = currentLanguage;
  backLink.textContent = copy.common.backToLevels;

  if (typeof ws.updateToolbox === 'function') {
    ws.updateToolbox(getToolbox(currentLanguage));
  }

  applyTheme();
};

const ws = Blockly.inject(blocklyDiv, {toolbox: getToolbox(currentLanguage)});
const workspaceStorageKey = `blockyAndP5:level:${currentLevel}`;

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const processCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;
  outputDiv.innerHTML = '';
};

// Load the initial state from storage and run the code.
load(ws, workspaceStorageKey);
processCode();
Board.setup();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws, workspaceStorageKey);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type === Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  processCode();
});

runButton.addEventListener('click', () => {
  Board.drawBoard();
  const code = javascriptGenerator.workspaceToCode(ws);
  eval(code);
});

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
  writeTheme(currentTheme);
  applyTheme();
});

languageSelect.addEventListener('change', () => {
  currentLanguage = languageSelect.value === LANGUAGES.es ? LANGUAGES.es : LANGUAGES.en;
  writeLanguage(currentLanguage);
  applyLanguage();
});

applyLanguage();

window.paint = Board.paint;
window.eraseColor = Board.eraseColor;
window.getCurrentColor = Board.getCurrentColor;
window.moveUp = Board.moveUp;
window.moveDown = Board.moveDown;
window.moveLeft = Board.moveLeft;
window.moveRight = Board.moveRight;
window.drawBoard = Board.drawBoard;
window.setStartingRow = Board.setStartingRow;
window.setStartingCol = Board.setStartingCol;
window.getCurrentColumn = Board.getCurrentColumn;
window.getCurrentRow = Board.getCurrentRow;
window.isCurrentCellPainted = Board.isCurrentCellPainted;
