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
import {toolbox} from './toolbox';
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
const ws = Blockly.inject(blocklyDiv, {toolbox});
const runButton = document.getElementById('run-button');

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
    e.type == Blockly.Events.FINISHED_LOADING ||
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
// Usage:
// Board.paint('#ff0000');
// Board.moveUp();
// etc.