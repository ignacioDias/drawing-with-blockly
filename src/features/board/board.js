import p5 from 'p5';

import {
    BOARD_CELL_SIZE,
    BOARD_COLS,
    BOARD_ROWS,
    CURRENT_CELL_HIGHLIGHT_COLOR,
    EMPTY_CELL_COLOR,
    GRID_STROKE_COLOR,
    GRID_STROKE_WEIGHT,
    HIGHLIGHT_STROKE_WEIGHT,
} from './constants';

import './board.interface.js';

/**
 * @fileoverview p5.js-backed implementation of the drawing board.
 * @implements {BoardInterface}
 */

let board = [];
let painted = [];
let currentCol = -1;
let currentRow = -1;
let p; // p5 instance
let targetP; // p5 instance for the read-only target board
let lastSetup = null;

/**
 * Creates the drawing canvas and initializes the board to its starting state.
 * @param {BoardSetupOptions} options
 */
export function setup({startingBoard, startingRow = -1, startingColumn = -1} = {}) {
    lastSetup = {startingBoard, startingRow, startingColumn};
    if (p) {
        p.remove(); // Remove previous canvas if exists
    }
    p = new p5((sk) => {
        sk.setup = () => {
            sk.createCanvas(BOARD_COLS * BOARD_CELL_SIZE, BOARD_ROWS * BOARD_CELL_SIZE).parent('board-container');
            sk.noLoop();
            initBoard(startingBoard);
            currentRow = startingRow;
            currentCol = startingColumn;
            drawBoard(sk);
        };
    });
}

/**
 * Restores the board to its original starting state.
 */
export function reset() {
    if (!lastSetup || !p) return;
    initBoard(lastSetup.startingBoard);
    currentRow = lastSetup.startingRow;
    currentCol = lastSetup.startingColumn;
    drawBoard();
}

/**
 * Renders the read-only target board.
 * @param {BoardTargetOptions} options
 */
export function setupTarget({targetBoard} = {}) {
    if (targetP) {
        targetP.remove();
    }
    targetP = new p5((sk) => {
        sk.setup = () => {
            sk.createCanvas(BOARD_COLS * BOARD_CELL_SIZE, BOARD_ROWS * BOARD_CELL_SIZE).parent('target-board-container');
            sk.noLoop();
            drawStaticBoard(sk, targetBoard);
        };
    });
}

function initBoard(startingBoard) {
    for (let row = 0; row < BOARD_ROWS; row++) {
        board[row] = [];
        painted[row] = [];
        for (let col = 0; col < BOARD_COLS; col++) {
            board[row][col] = EMPTY_CELL_COLOR;
            painted[row][col] = false;
        }
    }

    for (const cell of startingBoard?.cells || []) {
        if (isValidPosition(cell.column, cell.row) && typeof cell.color === 'string') {
            board[cell.row][cell.column] = cell.color;
            painted[cell.row][cell.column] = true;
        }
    }
}

function drawStaticBoard(sk, boardData) {
    const cells = boardData?.cells || [];
    const colors = new Map(
        cells
            .filter((cell) => isValidPosition(cell.column, cell.row) && typeof cell.color === 'string')
            .map((cell) => [`${cell.row}:${cell.column}`, cell.color]),
    );

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            sk.fill(colors.get(`${row}:${col}`) || EMPTY_CELL_COLOR);
            sk.stroke(GRID_STROKE_COLOR);
            sk.strokeWeight(GRID_STROKE_WEIGHT);
            sk.rect(col * BOARD_CELL_SIZE, row * BOARD_CELL_SIZE, BOARD_CELL_SIZE, BOARD_CELL_SIZE);
        }
    }
}

/**
 * Redraws the current board.
 */
export function drawBoard(sk = p) {
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            sk.fill(board[row][col]);
            sk.stroke(GRID_STROKE_COLOR);
            sk.strokeWeight(GRID_STROKE_WEIGHT);
            sk.rect(col * BOARD_CELL_SIZE, row * BOARD_CELL_SIZE, BOARD_CELL_SIZE, BOARD_CELL_SIZE);
        }
    }
    highlightCurrentCell(sk);
}

/**
 * Moves the cursor to the given column.
 * @param {number} col
 */
export function setStartingCol(col) {
    if (col >= 0 && col < BOARD_COLS) {
        currentCol = col;
        drawBoard();
    }
}

/**
 * Moves the cursor to the given row.
 * @param {number} row
 */
export function setStartingRow(row) {
    if (row >= 0 && row < BOARD_ROWS) {
        currentRow = row;
        drawBoard();
    }
}

/**
 * Paints the current cell with the given color.
 * @param {string} color
 */
export function paint(color) {
    if (isValidPosition(currentCol, currentRow)) {
        board[currentRow][currentCol] = color;
        painted[currentRow][currentCol] = true;
        drawBoard();
    }
}

/**
 * Erases the current cell.
 */
export function eraseColor() {
    if (isValidPosition(currentCol, currentRow)) {
        board[currentRow][currentCol] = EMPTY_CELL_COLOR;
        painted[currentRow][currentCol] = false;
        drawBoard();
    }
}

/**
 * Returns the current cell's color.
 * @return {string}
 */
export function getCurrentColor() {
    if (!isValidPosition(currentCol, currentRow)) {
        return EMPTY_CELL_COLOR;
    }
    return board[currentRow][currentCol];
}

/**
 * Moves the cursor up.
 */
export function moveUp()    { moveBy(0, -1); }

/**
 * Moves the cursor down.
 */
export function moveDown()  { moveBy(0, 1); }

/**
 * Moves the cursor left.
 */
export function moveLeft()  { moveBy(-1, 0); }

/**
 * Moves the cursor right.
 */
export function moveRight() { moveBy(1, 0); }

function moveBy(dx, dy) {
    if (!hasCurrentPosition()) {
        console.error("Movimiento ilegal: no hay posición actual");
        return;
    }

    const newCol = currentCol + dx;
    const newRow = currentRow + dy;

    if (isValidPosition(newCol, newRow)) {
        currentCol = newCol;
        currentRow = newRow;
        drawBoard();
    }
}

function hasCurrentPosition() {
    return currentCol !== -1 && currentRow !== -1;
}

function isValidPosition(col, row) {
    return col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS;
}

function highlightCurrentCell(sk = p) {
    if (!isValidPosition(currentCol, currentRow)) return;
    sk.noFill();
    sk.stroke(CURRENT_CELL_HIGHLIGHT_COLOR);
    sk.strokeWeight(HIGHLIGHT_STROKE_WEIGHT);
    sk.rect(currentCol * BOARD_CELL_SIZE, currentRow * BOARD_CELL_SIZE, BOARD_CELL_SIZE, BOARD_CELL_SIZE);
}

/**
 * Returns whether the current cell has a color assigned.
 * @return {boolean}
 */
export function isCurrentCellPainted() {
    if (!isValidPosition(currentCol, currentRow)) return false;
    return painted[currentRow][currentCol];
}

/**
 * Returns the cursor's current row.
 * @return {number}
 */
export function getCurrentRow() {
    return currentRow;
}

/**
 * Returns the cursor's current column.
 * @return {number}
 */
export function getCurrentColumn() {
    return currentCol;
}

/**
 * Returns the current board state as a serializable object.
 * @return {BoardData}
 */
export function getBoardState() {
    const cells = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (painted[row][col]) {
                cells.push({row, column: col, color: board[row][col]});
            }
        }
    }
    return {rows: BOARD_ROWS, columns: BOARD_COLS, cells};
}
