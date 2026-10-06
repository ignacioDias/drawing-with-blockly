import * as Blockly from 'blockly';
import {blocks} from '../../blocks/text';
import {getCustomBlocks} from '../../blocks/custom_blocks';
import {forBlock} from '../../generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
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
import {createLevel, getCurrentUser} from '../../shared/api';
import {setupAuthNavigation} from '../../shared/auth-navigation';
import './styles.css';

const EMPTY_BOARD = {rows: 20, columns: 20, cells: []};
const collectionId = new URLSearchParams(window.location.search).get('collection') || '';

const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const languageSelect = document.getElementById('language-select');
const languageLabel = document.querySelector('.control-group span');
const backLink = document.querySelector('.back-link');
const pageTitle = document.getElementById('page-title');
const status = document.getElementById('level-status');
const form = document.getElementById('level-form');
const titleInput = document.getElementById('level-title');
const descriptionInput = document.getElementById('level-description');
const difficultyInput = document.getElementById('level-difficulty');
const publishedInput = document.getElementById('level-published');
const submit = document.getElementById('level-submit');
const titleLabel = document.getElementById('title-label');
const descriptionLabel = document.getElementById('description-label');
const difficultyLabel = document.getElementById('difficulty-label');
const publishedLabel = document.getElementById('published-label');
const modeStartingButton = document.getElementById('mode-starting');
const modeTargetButton = document.getElementById('mode-target');
const boardLabel = document.getElementById('board-label');
const runButton = document.getElementById('run-button');
const clearBoardButton = document.getElementById('clear-board-button');
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let mode = 'starting';
const boards = {starting: null, target: null};
const workspaceStates = {starting: null, target: null};

const renderAuthLink = setupAuthNavigation(
  {authLink, profileLink},
  () => translations[currentLanguage].common,
);

backLink.href = `collection.html?id=${encodeURIComponent(collectionId)}`;

const defineAppBlocks = (language) => {
  Blockly.common.defineBlocks(blocks);
  Blockly.common.defineBlocks(getCustomBlocks(translations[language].blocks));
};
defineAppBlocks(readLanguage());
Object.assign(javascriptGenerator.forBlock, forBlock);

const ws = Blockly.inject(blocklyDiv, {toolbox: getToolbox(currentLanguage)});

Board.setup({startingBoard: EMPTY_BOARD, startingRow: 0, startingColumn: 0});

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

const applyTheme = () => {
  applyThemeToDocument(currentTheme);
  themeToggle.setAttribute('aria-pressed', String(currentTheme === THEMES.dark));
  const commonText = translations[currentLanguage].common;
  themeToggle.textContent = currentTheme === THEMES.dark
    ? commonText.themeButtonDark
    : commonText.themeButtonLight;
};

const processCode = () => {
  codeDiv.innerText = javascriptGenerator.workspaceToCode(ws);
  outputDiv.innerHTML = '';
};

const updateModeUI = () => {
  const copy = translations[currentLanguage].create.level;
  modeStartingButton.classList.toggle('active', mode === 'starting');
  modeTargetButton.classList.toggle('active', mode === 'target');
  modeStartingButton.setAttribute('aria-selected', String(mode === 'starting'));
  modeTargetButton.setAttribute('aria-selected', String(mode === 'target'));
  boardLabel.textContent = mode === 'starting' ? copy.startingBoard : copy.targetBoard;
};

const switchMode = (nextMode) => {
  if (nextMode === mode) return;
  workspaceStates[mode] = Blockly.serialization.workspaces.save(ws);
  mode = nextMode;
  Blockly.Events.disable();
  try {
    ws.clear();
    if (workspaceStates[mode]) Blockly.serialization.workspaces.load(workspaceStates[mode], ws, false);
  } finally {
    Blockly.Events.enable();
  }
  Board.setup({startingBoard: EMPTY_BOARD, startingRow: 0, startingColumn: 0});
  processCode();
  updateModeUI();
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
  const copy = translations[currentLanguage].create.level;
  const common = translations[currentLanguage].common;
  pageTitle.textContent = copy.title;
  languageLabel.textContent = common.languageLabel;
  languageSelect.querySelector('option[value="en"]').textContent = common.languageOptionEn;
  languageSelect.querySelector('option[value="es"]').textContent = common.languageOptionEs;
  languageSelect.value = currentLanguage;
  titleLabel.textContent = copy.titleLabel;
  descriptionLabel.textContent = copy.description;
  difficultyLabel.textContent = copy.difficulty;
  publishedLabel.textContent = copy.published;
  titleInput.placeholder = copy.titlePlaceholder;
  descriptionInput.placeholder = copy.descriptionPlaceholder;
  runButton.textContent = copy.run;
  clearBoardButton.textContent = copy.clearBoard;
  submit.textContent = copy.submit;
  modeStartingButton.textContent = copy.startingBoard;
  modeTargetButton.textContent = copy.targetBoard;
  renderAuthLink();
  updateModeUI();
  refreshBlocksLanguage();
  applyTheme();
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const captureBoard = () => {
  boards[mode] = Board.getBoardState();
};

runButton.addEventListener('click', () => {
  Board.reset();
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;
  outputDiv.innerHTML = '';
  eval(code);
  captureBoard();
});

clearBoardButton.addEventListener('click', () => {
  Board.reset();
  captureBoard();
});

modeStartingButton.addEventListener('click', () => switchMode('starting'));
modeTargetButton.addEventListener('click', () => switchMode('target'));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  submit.disabled = true;
  captureBoard();

  const title = titleInput.value.trim();
  const level = {
    slug: `${slugify(title) || 'level'}-${Date.now()}`,
    title: {en: title},
    description: {en: descriptionInput.value.trim()},
    difficulty: Number(difficultyInput.value),
    sort_order: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000),
    collection_id: Number(collectionId),
    starting_board: boards.starting || EMPTY_BOARD,
    target_board: boards.target || EMPTY_BOARD,
    starting_row: 0,
    starting_column: 0,
    validation_config: {type: 'drawing'},
    is_published: publishedInput.checked,
  };

  try {
    await createLevel(level);
    window.location.href = `collection.html?id=${encodeURIComponent(collectionId)}`;
  } catch (error) {
    status.textContent = error.message || translations[currentLanguage].create.level.error;
    submit.disabled = false;
  }
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

getCurrentUser()
  .then(({user}) => {
    if (user.role !== 'admin') {
      status.textContent = translations[currentLanguage].create.level.notAdmin;
      window.setTimeout(() => {
        window.location.href = `collection.html?id=${encodeURIComponent(collectionId)}`;
      }, 1500);
    }
  })
  .catch(() => {
    window.location.href = 'login.html';
  });
