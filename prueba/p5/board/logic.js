//p5 usa un enfoque basado en funciones globales i ciclos automáticos
const COLS = 20;
const ROWS = 20;
const CELL_SIZE = 20; //in pixels
let board = [];

current_column = -1;
current_row = -1;

function setup() { // función que p5.js ejecuta automáticamente una vez al principio
    let canvas = createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE);//crea el lienzo donde se va a dibujar. 20cells × 20 px = 400 px
    canvas.parent('board-container');  
    noLoop(); //le dice a p5 que no repita continuamente la función draw().
    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLS; j++) {
            board[i][j] = color(255);
        }
    }
    drawBoard();
} //Por defecto, p5 llama a draw() 60 veces por segundo, pero para un tablero estático no es necesario.

function paint(color) {
    board[current_row][current_column] = color
    drawBoard();
}
function drawBoard() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      fill(board[i][j]); //función de p5 que define el color de relleno de las figuras que vas a dibujar después
      stroke(160);  // Gris suave
      strokeWeight(0.5); // Grosor del borde más fino
      rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}
function mousePressed() {
    let x = Math.floor(mouseX / CELL_SIZE);
    let y = Math.floor(mouseY / CELL_SIZE);
    //Verificamos que el clic esté dentro del canvas
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
        if(current_column == -1 || current_row == -1) { // si todavía no cambiamos el punto de salida:
            current_column = x;
            current_row = y;

            let title = document.querySelector("h1");
            title.textContent = `Punto de partida: (${current_row}, ${current_column})`; 

            updatePosition();

        }
    }
}
function updatePosition() {
    noFill();          // Sin relleno
    stroke('red');     // Color del borde
    strokeWeight(2);   // Grosor del borde
    rect(current_column * CELL_SIZE, current_row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function moveUp() { move(0, -1); }
function moveDown() { move(0, 1); }
function moveLeft() { move(-1, 0); }
function moveRight() { move(1, 0); }

function move(dx, dy) {
    if (current_column === -1 || current_row === -1) {
        console.error("Illegal move");
        return;
    }

    const newCol = current_column + dx;
    const newRow = current_row + dy;
    if (newCol >= 0 && newCol < COLS && newRow >= 0 && newRow < ROWS) {
        let h1 = document.querySelector("h1");
        h1.textContent = `Posición actual: (${current_row}, ${current_column})`; 
        clearCurrentPosition();
        current_column = newCol;
        current_row = newRow;
        updatePosition();
    }
}

function clearCurrentPosition() {
    noFill();
    stroke(160);
    strokeWeight(0.5);
    rect(current_column * CELL_SIZE, current_row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    drawBoard();
}