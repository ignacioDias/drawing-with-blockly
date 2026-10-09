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
import {
  buildLevelFile,
  downloadJson,
  extractLevels,
  localizedText,
  readFileAsJson,
} from '../../shared/level-io';
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
const pairsInput = document.getElementById('level-pairs');
const submit = document.getElementById('level-submit');
const titleLabel = document.getElementById('title-label');
const descriptionLabel = document.getElementById('description-label');
const difficultyLabel = document.getElementById('difficulty-label');
const publishedLabel = document.getElementById('published-label');
const pairsLabel = document.getElementById('pairs-label');
const pairSelector = document.getElementById('pair-selector');
const modeStartingButton = document.getElementById('mode-starting');
const modeTargetButton = document.getElementById('mode-target');
const exportLevelButton = document.getElementById('export-level');
const importLevelButton = document.getElementById('import-level');
const importFileInput = document.getElementById('import-file');
const boardLabel = document.getElementById('board-label');
const runButton = document.getElementById('run-button');
const clearBoardButton = document.getElementById('clear-board-button');
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');

let currentLanguage = readLanguage();
let currentTheme = readTheme();
let mode = 'starting';
let currentPair = 0;
let pairCount = 1;
const boards = [];
const workspaceStates = [];

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

const ensurePair = (index) => {
  if (!boards[index]) boards[index] = {starting: null, target: null};
  if (!workspaceStates[index]) workspaceStates[index] = {starting: null, target: null};
};

const saveCurrentState = () => {
  ensurePair(currentPair);
  workspaceStates[currentPair][mode] = Blockly.serialization.workspaces.save(ws);
  boards[currentPair][mode] = Board.getBoardState();
};

const loadCurrentState = () => {
  ensurePair(currentPair);
  const state = workspaceStates[currentPair][mode] || null;
  Blockly.Events.disable();
  try {
    ws.clear();
    if (state) Blockly.serialization.workspaces.load(state, ws, false);
  } finally {
    Blockly.Events.enable();
  }
  const board = (boards[currentPair] || {})[mode] || EMPTY_BOARD;
  Board.setup({startingBoard: board, startingRow: 0, startingColumn: 0});
  processCode();
};

const switchMode = (nextMode) => {
  if (nextMode === mode) return;
  saveCurrentState();
  mode = nextMode;
  loadCurrentState();
  updateModeUI();
};

const renderPairSelector = () => {
  pairSelector.innerHTML = '';
  const pairText = translations[currentLanguage].create.level.pair;
  for (let i = 0; i < pairCount; i++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pair-button${i === currentPair ? ' active' : ''}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(i === currentPair));
    button.textContent = `${pairText} ${i + 1}`;
    button.addEventListener('click', () => switchPair(i));
    pairSelector.appendChild(button);
  }
};

const switchPair = (nextPair) => {
  if (nextPair === currentPair) return;
  saveCurrentState();
  currentPair = nextPair;
  loadCurrentState();
  updateModeUI();
  renderPairSelector();
};

const setPairCount = (next) => {
  const value = Math.max(1, Math.min(50, Math.floor(Number(next)) || 1));
  if (value === pairCount) return;
  saveCurrentState();
  pairCount = value;
  for (let i = 0; i < pairCount; i++) ensurePair(i);
  if (currentPair >= pairCount) currentPair = pairCount - 1;
  loadCurrentState();
  updateModeUI();
  renderPairSelector();
  pairsInput.value = pairCount;
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
  pairsLabel.textContent = copy.pairs;
  titleInput.placeholder = copy.titlePlaceholder;
  descriptionInput.placeholder = copy.descriptionPlaceholder;
  runButton.textContent = copy.run;
  clearBoardButton.textContent = copy.clearBoard;
  submit.textContent = copy.submit;
  modeStartingButton.textContent = copy.startingBoard;
  modeTargetButton.textContent = copy.targetBoard;
  exportLevelButton.textContent = common.exportLevel;
  importLevelButton.textContent = common.importLevel;
  renderAuthLink();
  updateModeUI();
  renderPairSelector();
  refreshBlocksLanguage();
  applyTheme();
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const gatherLevel = () => {
  saveCurrentState();
  const pairs = [];
  for (let i = 0; i < pairCount; i++) {
    ensurePair(i);
    pairs.push({
      starting_board: boards[i].starting || EMPTY_BOARD,
      target_board: boards[i].target || EMPTY_BOARD,
    });
  }
  return {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    difficulty: Number(difficultyInput.value),
    is_published: publishedInput.checked,
    starting_row: 0,
    starting_column: 0,
    validation_config: {type: 'drawing'},
    board_pairs: pairs,
  };
};

const exportLevel = () => {
  const level = gatherLevel();
  const name = slugify(level.title) || 'level';
  downloadJson(`${name}.json`, buildLevelFile(level));
};

const importLevel = async (file) => {
  const copy = translations[currentLanguage].levelIO;
  let levels;
  try {
    levels = extractLevels(await readFileAsJson(file));
  } catch (error) {
    status.textContent = error.message === 'Invalid JSON file' ? copy.loadError : copy.noLevels;
    return;
  }

  const level = levels[0];
  titleInput.value = localizedText(level.title);
  descriptionInput.value = localizedText(level.description ?? '');
  difficultyInput.value = String(Math.min(5, Math.max(1, Math.round(Number(level.difficulty) || 1))));
  publishedInput.checked = Boolean(level.is_published);

  const pairs = Array.isArray(level.board_pairs) && level.board_pairs.length > 0
    ? level.board_pairs
    : [{starting_board: level.starting_board, target_board: level.target_board}];

  boards.length = 0;
  workspaceStates.length = 0;
  pairCount = Math.min(50, Math.max(1, pairs.length));
  pairs.forEach((pair, i) => {
    ensurePair(i);
    boards[i].starting = pair.starting_board || EMPTY_BOARD;
    boards[i].target = pair.target_board || EMPTY_BOARD;
  });
  currentPair = 0;
  mode = 'starting';

  pairsInput.value = String(pairCount);
  updateModeUI();
  renderPairSelector();
  loadCurrentState();
  status.textContent = copy.loadSuccess;
};

const captureBoard = () => {
  ensurePair(currentPair);
  boards[currentPair][mode] = Board.getBoardState();
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

exportLevelButton.addEventListener('click', exportLevel);
importLevelButton.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', () => {
  const [file] = importFileInput.files;
  if (file) importLevel(file);
  importFileInput.value = '';
});

pairsInput.addEventListener('change', () => setPairCount(pairsInput.value));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  submit.disabled = true;
  captureBoard();

  const title = titleInput.value.trim();
  const pairs = [];
  for (let i = 0; i < pairCount; i++) {
    ensurePair(i);
    pairs.push({
      starting_board: boards[i].starting || EMPTY_BOARD,
      target_board: boards[i].target || EMPTY_BOARD,
    });
  }

  const level = {
    slug: `${slugify(title) || 'level'}-${Date.now()}`,
    title: {en: title},
    description: {en: descriptionInput.value.trim()},
    difficulty: Number(difficultyInput.value),
    sort_order: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000),
    collection_id: Number(collectionId),
    board_pairs: pairs,
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
