/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {customBlocks} from './blocks/custom_blocks';
import {forBlock} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {getToolbox} from './toolbox';
import * as Board from './board.js';
import './index.css';

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

const storageKeys = {
  theme: 'drawing-with-blockly-theme',
  language: 'drawing-with-blockly-language',
};

const translations = {
  en: {
    heading: '✨ Make a picture with blocks ✨',
    runButton: 'Start drawing!',
    themeButtonLight: '🌙 Dark mode',
    themeButtonDark: '☀️ Light mode',
    languageLabel: 'Language',
    languageOptionEn: 'English',
    languageOptionEs: 'Español',
  },
  es: {
    heading: '✨ ¡Haz una imagen con bloques! ✨',
    runButton: '¡Empieza a dibujar!',
    themeButtonLight: '🌙 Modo oscuro',
    themeButtonDark: '☀️ Modo claro',
    languageLabel: 'Idioma',
    languageOptionEn: 'English',
    languageOptionEs: 'Español',
  },
};

let currentLanguage = localStorage.getItem(storageKeys.language) || 'en';
let currentTheme = localStorage.getItem(storageKeys.theme) || 'light';

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === 'dark'));
  const translation = translations[currentLanguage];
  themeToggle.textContent = currentTheme === 'dark'
    ? translation.themeButtonDark
    : translation.themeButtonLight;
};

const applyLanguage = () => {
  const translation = translations[currentLanguage];
  pageTitle.textContent = translation.heading;
  runButton.textContent = translation.runButton;
  languageLabel.textContent = translation.languageLabel;
  languageSelect.querySelector('option[value="en"]').textContent = translation.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = translation.languageOptionEs;
  languageSelect.value = currentLanguage;

  if (typeof ws.updateToolbox === 'function') {
    ws.updateToolbox(getToolbox(currentLanguage));
  }

  applyTheme();
};

const ws = Blockly.inject(blocklyDiv, {toolbox: getToolbox(currentLanguage)});

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const processCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;
  outputDiv.innerHTML = '';
};

// Load the initial state from storage and run the code.
load(ws);
processCode();
Board.setup();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
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
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(storageKeys.theme, currentTheme);
  applyTheme();
});

languageSelect.addEventListener('change', () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem(storageKeys.language, currentLanguage);
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
// Usage:
// Board.paint('#ff0000');
// Board.moveUp();
// etc.