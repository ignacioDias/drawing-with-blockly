import * as Blockly from 'blockly/core';
// jsonGenerator.forBlock['logic_null'] = function(block) {
//   return ['null', Order.ATOMIC];
// };


export const customBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    "type": "call_moveUp",
    "message0": "move up",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "moves up",
    "helpUrl": ""
  },
  {
    "type": "call_moveDown",
    "message0": "move down",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "moves down",
    "helpUrl": ""
  },
  {
    "type": "call_moveLeft",
    "message0": "move left",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "moves left",
    "helpUrl": ""
  },
  {
    "type": "call_moveRight",
    "message0": "move right",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "moves right",
    "helpUrl": ""
  },
  {
    "type": "call_paint",
    "message0": "paint current cell with color: %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "COLOR",
        "options": [
          ["Red", "#ff0000"],
          ["Green", "#00ff00"],
          ["Blue", "#0000ff"],
          ["Yellow", "#ffff00"],
          ["Orange", "#ffa500"],
          ["Purple", "#800080"],
          ["Black", "#000000"],
          ["White", "#ffffff"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Paint the current cell with the selected color",
    "helpUrl": ""
  },
  {
    "type": "call_eraseColor",
    "message0": "erase color",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "erase color of current cell",
    "helpUrl": ""
  },
  {
    "type": "get_current_color",
    "message0": "get current color",
    "output": "String",
    "colour": 160,
    "tooltip": "Returns the current color",
    "helpUrl": ""
  },
  {
    "type": "win_game",
    "message0": "win game",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "win game",
    "helpUrl": ""
  },
  {
    "type": "lose_game",
    "message0": "lose game",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "lose game",
    "helpUrl": ""
  },
  {
    "type": "call_setStartingRow",
    "message0": "set starting Row to %1",
    "args0": [
      {
        "type": "field_number",
        "name": "STARTING_ROW",
        "value": 0,
        "min": 0,
        "max": 19,
        "precision": 1
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290,
    "tooltip": "Set starting row to a given integer value",
    "helpUrl": ""
  },
  {
    "type": "call_setStartingCol",
    "message0": "set starting Col to %1",
    "args0": [
      {
        "type": "field_number",
        "name": "STARTING_COL",
        "value": 0,
        "min": 0,
        "max": 19,
        "precision": 1
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 290,
    "tooltip": "Set starting Col to a given integer value",
    "helpUrl": ""
  },
  {
  "type": "color_value",
  "message0": "color %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "COLOR",
      "options": [
        ["Red", "#ff0000"],
        ["Green", "#00ff00"],
        ["Blue", "#0000ff"],
        ["Yellow", "#ffff00"],
        ["Orange", "#ffa500"],
        ["Purple", "#800080"],
        ["Black", "#000000"],
        ["White", "#ffffff"]
      ]
    }
  ],
  "output": "String",
  "colour": 160,
  "tooltip": "Choose a color",
  "helpUrl": ""
  },
  {
  "type": "call_paint_with_param",
  "message0": "paint current cell with color: %1",
  "args0": [
    {
      "type": "input_value",
      "name": "COLOR"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Paint the current cell with a color from a connected block",
  "helpUrl": ""
  },
  {
    "type": "is_current_cell_painted",
    "message0": "Is current cell painted",
    "colour": 160,
    "tooltip": "True if the current cell has a color asigned",
    "helpUrl": "",
    "output": "Boolean"
  },
  {
    "type": "get_current_column",
    "message0": "Get current column",
    "colour": 160,
    "tooltip": "Get current column",
    "helpUrl": "",
    "output": "Number"
  },
    {
    "type": "get_current_row",
    "message0": "Get current row",
    "colour": 160,
    "tooltip": "Get current row",
    "helpUrl": "",
    "output": "Number"
  },
]);