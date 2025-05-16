const COLS = 20;
const ROWS = 20;
const CELL_SIZE = 20;

let board = [];
let currentCol = -1;
let currentRow = -1;

function setup() {
    createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE).parent('board-container');
    noLoop();

    initBoard();
    drawBoard();
}

function initBoard() {
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = color(255);
        }
    }
}

function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            fill(board[row][col]);
            stroke(160);
            strokeWeight(0.5);
            rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function paint(color) {
    if (isValidPosition(currentCol, currentRow)) {
        board[currentRow][currentCol] = color;
        drawBoard();
        highlightCurrentCell();
    }
}

function mousePressed() {
    const col = Math.floor(mouseX / CELL_SIZE);
    const row = Math.floor(mouseY / CELL_SIZE);

    if (isValidPosition(col, row) && !hasCurrentPosition()) {
        currentCol = col;
        currentRow = row;
        updateTitle(`Punto de partida: (${currentRow}, ${currentCol})`);
        highlightCurrentCell();
    }
}

function moveUp()    { moveBy(0, -1); }
function moveDown()  { moveBy(0, 1); }
function moveLeft()  { moveBy(-1, 0); }
function moveRight() { moveBy(1, 0); }

function moveBy(dx, dy) {
    if (!hasCurrentPosition()) {
        console.error("Movimiento ilegal: no hay posición actual");
        return;
    }

    const newCol = currentCol + dx;
    const newRow = currentRow + dy;

    if (isValidPosition(newCol, newRow)) {
        updateTitle(`Posición actual: (${currentRow}, ${currentCol})`);
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

function highlightCurrentCell() {
    noFill();
    stroke('red');
    strokeWeight(2);
    rect(currentCol * CELL_SIZE, currentRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function updateTitle(text) {
    const title = document.querySelector("h1");
    if (title) title.textContent = text;
}
