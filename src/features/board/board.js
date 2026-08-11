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

let board = [];
let currentCol = -1;
let currentRow = -1;
let p; // p5 instance

export function setup({startingBoard, startingRow = -1, startingColumn = -1} = {}) {
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

function initBoard(startingBoard) {
    for (let row = 0; row < BOARD_ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_COLS; col++) {
            board[row][col] = EMPTY_CELL_COLOR;
        }
    }

    for (const cell of startingBoard?.cells || []) {
        if (isValidPosition(cell.column, cell.row) && typeof cell.color === 'string') {
            board[cell.row][cell.column] = cell.color;
        }
    }
}

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


export function setStartingCol(col) {
    if(col >= 0 && col < BOARD_COLS) {
        currentCol = col;
        drawBoard();
        highlightCurrentCell();
    }
}

export function setStartingRow(row) {
    if(row >= 0 && row < BOARD_ROWS) {
        currentRow = row;
        drawBoard();
        highlightCurrentCell();
    }
}



export function paint(color) {
    if (isValidPosition(currentCol, currentRow)) {
        board[currentRow][currentCol] = color;
        drawBoard();
        highlightCurrentCell();
    }
}

export function eraseColor() {
    if (isValidPosition(currentCol, currentRow)) {
        board[currentRow][currentCol] = EMPTY_CELL_COLOR;
        drawBoard();
        highlightCurrentCell();
    }
}
export function getCurrentColor() {
    if (isValidPosition(currentCol, currentRow)) {
        return board[currentRow][currentCol];
    }
    console.error("wrong call");
}
export function moveUp()    { moveBy(0, -1); }
export function moveDown()  { moveBy(0, 1); }
export function moveLeft()  { moveBy(-1, 0); }
export function moveRight() { moveBy(1, 0); }

function moveBy(dx, dy) {
    if (!hasCurrentPosition()) {
        console.error("Movimiento ilegal: no hay posición actual");
        return;
    }

    const newCol = currentCol + dx;
    const newRow = currentRow + dy;

    if (isValidPosition(newCol, newRow)) {
        drawBoard();
        currentCol = newCol;
        currentRow = newRow;
        highlightCurrentCell();
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

export function isCurrentCellPainted() {
    if (!isValidPosition(currentCol, currentRow)) return false;
    return board[currentRow][currentCol] != EMPTY_CELL_COLOR;
}

export function getCurrentRow() {
    return currentRow;
}

export function getCurrentColumn() {
    return currentCol;
}
