/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly';
import {blocks} from '../../blocks/text';
import {getCustomBlocks} from '../../blocks/custom_blocks';
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
import {getLevel} from '../../shared/api';
import {setupAuthNavigation} from '../../shared/auth-navigation';
import './styles.css';

const levelParams = new URLSearchParams(window.location.search);
const currentLevel = levelParams.get('level') || '1';
const levelStatus = document.createElement('p');
levelStatus.id = 'level-status';
document.getElementById('pageContainer').prepend(levelStatus);

// Register the blocks and generator with Blockly
const defineAppBlocks = (language) => {
  Blockly.common.defineBlocks(blocks);
  Blockly.common.defineBlocks(getCustomBlocks(translations[language].blocks));
};
defineAppBlocks(readLanguage());
Object.assign(javascriptGenerator.forBlock, forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const runButton = document.getElementById('run-button');
const clearBoardButton = document.getElementById('clear-board-button');
const clearBlocksButton = document.getElementById('clear-blocks-button');
const themeToggle = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('language-select');
const pageTitle = document.getElementById('page-title');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const currentBoardLabel = document.getElementById('current-board-label');
const targetBoardLabel = document.getElementById('target-board-label');
const currentBoardSubtitle = document.getElementById('current-board-subtitle');
const targetBoardSubtitle = document.getElementById('target-board-subtitle');
runButton.disabled = true;

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let loadedLevel = null;
const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink},
  () => translations[currentLanguage].common,
);

const localized = (value, language) => value?.[language] || value?.en || '';

const updatePageTitle = () => {
  const copy = translations[currentLanguage].drawing;
  if (loadedLevel) {
    pageTitle.textContent = `${localized(loadedLevel.title, currentLanguage)} - ${copy.levelLabel} ${loadedLevel.sort_order}`;
    return;
  }
  pageTitle.textContent = `${copy.heading} - ${copy.levelLabel} ${currentLevel}`;
};

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const refreshBlocksLanguage = () => {
  const state = Blockly.serialization.workspaces.save(ws);
  defineAppBlocks(currentLanguage);
  Blockly.Events.disable();
  try {
    ws.clear();
    Blockly.serialization.workspaces.load(state, ws, false);
  } finally {
    Blockly.Events.enable();
  }
  ws.updateToolbox(getToolbox(currentLanguage));
};

const applyLanguage = () => {
  const copy = translations[currentLanguage];
  updatePageTitle();
  runButton.textContent = copy.drawing.runButton;
  clearBoardButton.textContent = copy.drawing.clearBoard;
  clearBlocksButton.textContent = copy.drawing.clearBlocks;
  languageLabel.textContent = copy.common.languageLabel;
  languageSelect.querySelector('option[value="en"]').textContent = copy.common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = copy.common.languageOptionEs;
  languageSelect.value = currentLanguage;
  backLink.textContent = copy.common.backToLevels;
  currentBoardLabel.textContent = copy.drawing.currentBoard;
  targetBoardLabel.textContent = copy.drawing.targetBoard;
  currentBoardSubtitle.textContent = copy.drawing.currentBoardSubtitle;
  targetBoardSubtitle.textContent = copy.drawing.targetBoardSubtitle;
  renderAuthLink();
  refreshBlocksLanguage();
  applyTheme();
};

const setLevelStatus = (message) => {
  levelStatus.textContent = message;
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
setLevelStatus(translations[currentLanguage].drawing.loading);

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
  Board.reset();
  const code = javascriptGenerator.workspaceToCode(ws);
  eval(code);
  if (loadedLevel && Board.isSolved(loadedLevel.target_board)) {
    window.alert(translations[currentLanguage].drawing.levelComplete);
  }
});

clearBoardButton.addEventListener('click', () => {
  Board.reset();
});

clearBlocksButton.addEventListener('click', () => {
  ws.clear();
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

getLevel(currentLevel)
  .then((level) => {
    loadedLevel = level;
    updatePageTitle();
    Board.setup({
      startingBoard: level.starting_board,
      startingRow: level.starting_row,
      startingColumn: level.starting_column,
    });
    Board.setupTarget({targetBoard: level.target_board});
    runButton.disabled = false;
    setLevelStatus('');
  })
  .catch(() => {
    setLevelStatus(translations[currentLanguage].drawing.loadError);
  });

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
