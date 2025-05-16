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

forBlock['call_moveUp'] = function (_block) {
  return 'moveUp();\n';
};
forBlock['call_moveDown'] = function (_block) {
  return 'moveDown();\n';
};
forBlock['call_moveLeft'] = function (_block) {
  return 'moveLeft();\n';
};
forBlock['call_moveRight'] = function (_block) {
  return 'moveRight();\n';
};