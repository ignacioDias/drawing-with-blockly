/**
 * @fileoverview Public contract for the drawing board module.
 *
 * The drawing board is the mutable grid the user manipulates with generated
 * Blockly code. This interface documents every public method the rest of the
 * application relies on, so the underlying drawing library (currently p5.js)
 * can be replaced without modifying application code.
 *
 * `board.js` is the p5.js-backed implementation of this interface.
 */

/**
 * A sparse board state. Unlisted cells use the empty color.
 * @typedef {Object} BoardData
 * @property {number} rows Number of board rows (always 20).
 * @property {number} columns Number of board columns (always 20).
 * @property {Array<{row: number, column: number, color: string}>} cells
 *     Painted cells.
 */

/**
 * Options used to set up the playable board.
 * @typedef {Object} BoardSetupOptions
 * @property {BoardData} startingBoard The board's initial state.
 * @property {number} [startingRow] Initial cursor row.
 * @property {number} [startingColumn] Initial cursor column.
 */

/**
 * Options used to set up the read-only target board.
 * @typedef {Object} BoardTargetOptions
 * @property {BoardData} targetBoard The board state to render.
 */

/**
 * The public drawing-board interface.
 * @interface
 */
class BoardInterface {
  /**
   * Creates the drawing canvas and initializes the board to its starting
   * state.
   * @param {BoardSetupOptions} options
   */
  setup(options) {}

  /**
   * Restores the board to its original starting state.
   */
  reset() {}

  /**
   * Renders the read-only target board.
   * @param {BoardTargetOptions} options
   */
  setupTarget(options) {}

  /**
   * Redraws the current board.
   */
  drawBoard() {}

  /**
   * Moves the cursor to the given column.
   * @param {number} col
   */
  setStartingCol(col) {}

  /**
   * Moves the cursor to the given row.
   * @param {number} row
   */
  setStartingRow(row) {}

  /**
   * Paints the current cell with the given color.
   * @param {string} color
   */
  paint(color) {}

  /**
   * Erases the current cell.
   */
  eraseColor() {}

  /**
   * Returns the current cell's color.
   * @return {string}
   */
  getCurrentColor() {}

  /**
   * Moves the cursor up.
   */
  moveUp() {}

  /**
   * Moves the cursor down.
   */
  moveDown() {}

  /**
   * Moves the cursor left.
   */
  moveLeft() {}

  /**
   * Moves the cursor right.
   */
  moveRight() {}

  /**
   * Returns whether the current cell has a color assigned.
   * @return {boolean}
   */
  isCurrentCellPainted() {}

  /**
   * Returns the cursor's current row.
   * @return {number}
   */
  getCurrentRow() {}

  /**
   * Returns the cursor's current column.
   * @return {number}
   */
  getCurrentColumn() {}
}

export {};
