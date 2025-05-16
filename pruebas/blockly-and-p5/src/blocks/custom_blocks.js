import * as Blockly from 'blockly/core';
// jsonGenerator.forBlock['logic_null'] = function(block) {
//   return ['null', Order.ATOMIC];
// };

const callMoveUp = {
  type: 'call_moveUp',
  message0: 'Llamar a moveUp()',
  args0: [],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: 'Llama a la función moveUp()',
  helpUrl: '',
};
// Blockly.Blocks.make_pin = {
//   init: function() {
//     if (profile.default.description === "Scribbler Robot") {
//       this.setHelpUrl(Blockly.MSG_S3_IO_HELPURL);
//     } else {
//       this.setHelpUrl(Blockly.MSG_PINS_HELPURL);
//     }
//     this.setTooltip(Blockly.MSG_MAKE_PIN_TOOLTIP);
//     this.setColour(BlocklyColourPalette.getColor('io'));
//     this.setPreviousStatement(true, "Block");
//     this.setNextStatement(true, null);
//     this.appendDummyInput()
//       .appendField("make PIN")
//       .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
//       .appendField(new Blockly.FieldDropdown([["high", "HIGH"], ["low", "LOW"], ["toggle", "TOGGLE"]]));
//   }
// };

const callMoveDown = {
  type: 'call_moveDown',
  message0: 'Llamar a moveDown()',
  args0: [],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: 'Llama a la función moveDown()',
  helpUrl: '',
};

const callMoveLeft = {
  type: 'call_moveLeft',
  message0: 'Llamar a moveLeft()',
  args0: [],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: 'Llama a la función moveLeft()',
  helpUrl: '',
};

const callMoveRight = {
  type: 'call_moveRight',
  message0: 'Llamar a moveRight()',
  args0: [],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: 'Llama a la función moveRight()',
  helpUrl: '',
};
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  callMoveUp,
  callMoveDown,
  callMoveRight,
  callMoveLeft,
]);
