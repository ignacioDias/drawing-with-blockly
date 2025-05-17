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
  }
]);
