import p5 from 'p5';

const COLS = 20;
const ROWS = 20;
const CELL_SIZE = 20;

let board = [];
let currentCol = -1;
let currentRow = -1;
let p; // p5 instance

export function setup() {
    if (p) {
        p.remove(); // Remove previous canvas if exists
    }
    p = new p5((sk) => {
        sk.setup = () => {
            sk.createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE).parent('board-container');
            sk.noLoop();
            initBoard();
            drawBoard(sk);
        };
    });
}

function initBoard() {
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = '#ffffff';
        }
    }
}

export function drawBoard(sk = p) {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            sk.fill(board[row][col]);
            sk.stroke(160);
            sk.strokeWeight(0.5);
            sk.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
    highlightCurrentCell(sk);
}


export function setStartingCol(col) {
    if(col >= 0 && col < COLS) {
        currentCol = col;
        drawBoard();
        highlightCurrentCell();
    }
}

export function setStartingRow(row) {
    if(row >= 0 && row < ROWS) {
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
        board[currentRow][currentCol] = "#ffffff";
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
    return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function highlightCurrentCell(sk = p) {
    if (!isValidPosition(currentCol, currentRow)) return;
    sk.noFill();
    sk.stroke('red');
    sk.strokeWeight(2);
    sk.rect(currentCol * CELL_SIZE, currentRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

export function isCurrentCellPainted() {
    if (!isValidPosition(currentCol, currentRow)) return false;
    return board[currentRow][currentCol] != '#ffffff';
}

export function getCurrentRow() {
    return currentRow;
}

export function getCurrentColumn() {
    return currentCol;
}