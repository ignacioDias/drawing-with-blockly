/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Order} from 'blockly/javascript';

export const forBlock = Object.create(null);

forBlock['add_text'] = function (block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  const addText = generator.provideFunction_(
    'addText',
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text) {

  // Add text to the output area.
  const outputDiv = document.getElementById('output');
  const textEl = document.createElement('p');
  textEl.innerText = text;
  outputDiv.appendChild(textEl);
}`,
  );
  // Generate the function call for this block.
  const code = `${addText}(${text});\n`;
  return code;
};
forBlock['call_moveUp'] = function(block, generator) {
  return 'moveUp();\n';
};
forBlock['call_moveDown'] = function (block, generator) {
  return 'moveDown();\n';
};
forBlock['call_moveLeft'] = function(block, generator) {
  return 'moveLeft();\n';
};
forBlock['call_moveRight'] = function(block, generator) {
  return 'moveRight();\n';
};
forBlock['call_paint'] = function(block) {
  const color = block.getFieldValue('COLOR');
  return `paint("${color}");\n`;
};
forBlock['call_eraseColor'] = function(block, generator) {
  return 'eraseColor();\n';
};
forBlock['call_eraseColor'] = function(block, generator) {
  return 'eraseColor();\n';
};
forBlock['get_current_color'] = function(block) {
  return ['getCurrentColor()', Order.FUNCTION_CALL];
};
forBlock['win_game'] = function(block, generator) {
  return 'winGame();\n';
};
forBlock['lose_game'] = function(block, generator) {
  return 'loseGame();\n';
};
forBlock['call_setStartingRow'] = function(block) {
  const startingRow = block.getFieldValue('STARTING_ROW');
  return `setStartingRow(${startingRow});\n`;
};

forBlock['call_setStartingCol'] = function(block) {
  const startingCol = block.getFieldValue('STARTING_COL');
  return `setStartingCol(${startingCol});\n`;
};
