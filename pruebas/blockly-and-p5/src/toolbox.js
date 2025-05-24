/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/*
This toolbox contains nearly every single built-in block that Blockly offers,
in addition to the custom block 'add_text' this sample app adds.
You probably don't need every single block, and should consider either rewriting
your toolbox from scratch, or carefully choosing whether you need each block
listed here.
*/

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if',
        },
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      categorystyle: 'loop_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_whileUntil',
        },
      
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      categorystyle: 'math_category',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: {
            NUM: 123,
          },
        },
        {
          kind: 'block',
          type: 'math_arithmetic',
          inputs: {
            A: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            B: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: 'Functions',
      categorystyle: 'procedure_category',
      custom: 'PROCEDURE',
    },
    {
      "kind": "category",
      "name": "Actions",
      "categoryStyle": "logic_category",
      "contents": [
        { "kind": "block", "type": "call_moveUp" },
        { "kind": "block", "type": "call_moveDown" },
        { "kind": "block", "type": "call_moveLeft" },
        { "kind": "block", "type": "call_moveRight" },
        { "kind": "block", "type": "call_eraseColor" },
        { "kind": "block", "type": "call_setStartingRow" },
        { "kind": "block", "type": "call_setStartingCol" },
        { "kind": "block", "type": "color_value" },
        { "kind": "block", "type": "call_paint" },
        { "kind": "block", "type": "call_paint_with_param" }
      ]
    },
    {
      "kind": 'category',
      "name": 'Game actions',
      "categorystyle": 'math_category',
      "contents": [
        { "kind": "block", "type": "get_current_color" },
        { "kind": "block", "type": "is_current_cell_painted" },
        { "kind": "block", "type": "get_current_row" },
        { "kind": "block", "type": "get_current_column" },
        { "kind": "block", "type": "win_game" },
        { "kind": "block", "type": "lose_game" }
      ]
    },
  ],
};
