/**
 * @file tetris.js
 * @description A basic implementation of the Tetris game using JavaScript and HTML5 Canvas.
 */

/** @constant {number} BOARD_WIDTH - The width of the game board in blocks. */
const BOARD_WIDTH = 10;
/** @constant {number} BOARD_HEIGHT - The height of the game board in blocks. */
const BOARD_HEIGHT = 20;
/** @constant {number} BLOCK_SIZE - The size of each block in pixels. */
const BLOCK_SIZE = 20;

// Create and set up the canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = BOARD_WIDTH * BLOCK_SIZE;
canvas.height = BOARD_HEIGHT * BLOCK_SIZE;
document.getElementById('game-board').appendChild(canvas);

/** @type {number[][]} board - The game board represented as a 2D array. */
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
/** @type {number} score - The player's current score. */
let score = 0;

/**
 * @constant {number[][][]} SHAPES - Array of all possible Tetromino shapes.
 * Each shape is represented as a 2D array where 1 indicates a filled block.
 */
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

/** @type {number[][]} currentPiece - The current active Tetromino. */
let currentPiece = null;
/** @type {number} currentX - The current X position of the active Tetromino. */
let currentX = 0;
/** @type {number} currentY - The current Y position of the active Tetromino. */
let currentY = 0;

/**
 * Creates a new random Tetromino and positions it at the top of the board.
 * If the new piece can't be placed, triggers game over.
 */
function newPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    currentPiece = shape;
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2);
    currentY = 0;

    if (!isValidMove(0, 0)) {
        gameOver();
    }
}

/**
 * Checks if a move is valid (within bounds and not overlapping other pieces).
 * @param {number} offsetX - The X offset to check.
 * @param {number} offsetY - The Y offset to check.
 * @param {number[][]} [newPiece=currentPiece] - The piece to check (defaults to current piece).
 * @returns {boolean} True if the move is valid, false otherwise.
 */
function isValidMove(offsetX, offsetY, newPiece = currentPiece) {
    for (let y = 0; y < newPiece.length; y++) {
        for (let x = 0; x < newPiece[y].length; x++) {
            if (newPiece[y][x]) {
                const newX = currentX + x + offsetX;
                const newY = currentY + y + offsetY;
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * Merges the current piece into the game board.
 */
function mergePiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                board[currentY + y][currentX + x] = 1;
            }
        }
    }
}

/**
 * Checks for and clears any full lines on the board.
 * Updates the score accordingly.
 */
function clearLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
    }
}

/**
 * Draws the current state of the game (board and active piece) on the canvas.
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    
    // Draw current piece
    ctx.fillStyle = 'red';
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                ctx.fillRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

/**
 * The main game loop. Moves the current piece down, checks for collisions,
 * merges the piece if needed, clears lines, and spawns a new piece.
 */
function gameLoop() {
    if (isValidMove(0, 1)) {
        currentY++;
    } else {
        mergePiece();
        clearLines();
        newPiece();
    }
    draw();
}

/**
 * Attempts to rotate the current piece clockwise.
 */
function rotate() {
    const rotated = currentPiece[0].map((_, i) => currentPiece.map(row => row[i]).reverse());
    if (isValidMove(0, 0, rotated)) {
        currentPiece = rotated;
    }
}

/**
 * Handles the game over state. Displays the final score and resets the game.
 */
function gameOver() {
    alert('Game Over! Your score: ' + score);
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;
    newPiece();
}

// Event listener for keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(-1, 0)) currentX--;
            break;
        case 'ArrowRight':
            if (isValidMove(1, 0)) currentX++;
            break;
        case 'ArrowDown':
            if (isValidMove(0, 1)) currentY++;
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            while (isValidMove(0, 1)) currentY++;
            break;
    }
    draw();
});

// Start the game
newPiece();
setInterval(gameLoop, 500);
