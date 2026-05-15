const slider = document.getElementById('slider');

// Navigation Buttons
const btnAgent = document.getElementById('btn-agent');
const btnMulti = document.getElementById('btn-multi');
const btnChooseX = document.getElementById('btn-choose-x');
const btnChooseO = document.getElementById('btn-choose-o');
const backTo1 = document.getElementById('back-to-1');
const backTo2 = document.getElementById('back-to-2');

// Game UI Elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const gameSubtitle = document.getElementById('game-subtitle');

// Scoreboard Elements
const elScoreX = document.getElementById('score-x');
const elScoreO = document.getElementById('score-o');
const elScoreDraws = document.getElementById('score-draws');
const elScoreLabelX = document.getElementById('score-label-x');
const elScoreLabelO = document.getElementById('score-label-o');

// Game State
let isMultiplayer = false;
let humanPlayer = 'X';
let aiPlayer = 'O';
let currentPlayer = 'X';
let gameActive = true;
let board = ['', '', '', '', '', '', '', '', ''];

// Score State
let scoreX = 0;
let scoreO = 0;
let scoreDraws = 0;

// Navigation Logic
function goToScreen(screenNumber) {
    slider.style.transform = `translateX(-${(screenNumber - 1) * 33.333}%)`;
}

btnAgent.addEventListener('click', () => {
    isMultiplayer = false;
    gameSubtitle.textContent = 'vs AI';
    resetScore();
    updateScoreLabels();
    goToScreen(2);
});

btnMulti.addEventListener('click', () => {
    isMultiplayer = true;
    gameSubtitle.textContent = 'Local Multiplayer';
    resetScore();
    updateScoreLabels();
    startGame();
});

btnChooseX.addEventListener('click', () => {
    humanPlayer = 'X';
    aiPlayer = 'O';
    resetScore();
    updateScoreLabels();
    startGame();
});

btnChooseO.addEventListener('click', () => {
    humanPlayer = 'O';
    aiPlayer = 'X';
    resetScore();
    updateScoreLabels();
    startGame();
});

backTo1.addEventListener('click', () => {
    goToScreen(1);
});

backTo2.addEventListener('click', () => {
    if (isMultiplayer) {
        goToScreen(1);
    } else {
        goToScreen(2);
    }
});

// Score Logic
function updateScoreLabels() {
    if (isMultiplayer) {
        elScoreLabelX.textContent = 'Player X';
        elScoreLabelO.textContent = 'Player O';
    } else {
        if (humanPlayer === 'X') {
            elScoreLabelX.textContent = 'You (X)';
            elScoreLabelO.textContent = 'AI (O)';
        } else {
            elScoreLabelX.textContent = 'AI (X)';
            elScoreLabelO.textContent = 'You (O)';
        }
    }
}

function updateScoreUI() {
    elScoreX.textContent = scoreX;
    elScoreO.textContent = scoreO;
    elScoreDraws.textContent = scoreDraws;
}

function resetScore() {
    scoreX = 0;
    scoreO = 0;
    scoreDraws = 0;
    updateScoreUI();
}

resetScoreBtn.addEventListener('click', resetScore);

// Game Logic
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', startGame);

function startGame() {
    goToScreen(3);
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X'; // X always starts
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    updateStatusText();

    if (!isMultiplayer && aiPlayer === 'X') {
        // AI goes first
        currentPlayer = aiPlayer;
        updateStatusText();
        setTimeout(() => {
            const bestMove = getBestMove(board);
            makeMove(bestMove, aiPlayer);
            currentPlayer = humanPlayer;
            updateStatusText();
        }, 500);
    }
}

function updateStatusText() {
    if (!gameActive) return;
    if (isMultiplayer) {
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
        statusText.style.color = currentPlayer === 'X' ? 'var(--primary-color)' : 'var(--secondary-color)';
    } else {
        if (currentPlayer === humanPlayer) {
            statusText.textContent = `Your Turn (${humanPlayer})`;
            statusText.style.color = humanPlayer === 'X' ? 'var(--primary-color)' : 'var(--secondary-color)';
        } else {
            statusText.textContent = "AI is thinking...";
            statusText.style.color = 'var(--text-color)';
        }
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) {
        return;
    }

    if (isMultiplayer) {
        makeMove(index, currentPlayer);
        if (!checkGameOver()) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatusText();
        }
    } else {
        if (currentPlayer !== humanPlayer) return;
        makeMove(index, humanPlayer);
        if (!checkGameOver()) {
            currentPlayer = aiPlayer;
            updateStatusText();
            setTimeout(() => {
                if (!gameActive) return;
                const bestMove = getBestMove(board);
                makeMove(bestMove, aiPlayer);
                if (!checkGameOver()) {
                    currentPlayer = humanPlayer;
                    updateStatusText();
                }
            }, 400); 
        }
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    cells[index].classList.add('disabled');
}

function checkGameOver() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        const winner = board[winningLine[0]];
        
        if (winner === 'X') scoreX++;
        else if (winner === 'O') scoreO++;
        updateScoreUI();

        if (isMultiplayer) {
            statusText.textContent = `Player ${winner} Wins!`;
        } else {
            statusText.textContent = winner === humanPlayer ? "You Win!" : "AI Wins!";
        }
        statusText.style.color = winner === 'X' ? 'var(--primary-color)' : 'var(--secondary-color)';
        
        winningLine.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
        
        gameActive = false;
        return true;
    }

    if (!board.includes('')) {
        scoreDraws++;
        updateScoreUI();

        statusText.textContent = "It's a Draw!";
        statusText.style.color = 'var(--text-color)';
        gameActive = false;
        return true;
    }

    return false;
}

// Minimax Algorithm
function getBestMove(currentBoard) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
            currentBoard[i] = aiPlayer;
            let score = minimax(currentBoard, 0, false, -Infinity, Infinity);
            currentBoard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function checkWinnerForMinimax(tempBoard) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
            return tempBoard[a];
        }
    }
    if (!tempBoard.includes('')) {
        return 'tie';
    }
    return null;
}

function minimax(tempBoard, depth, isMaximizing, alpha, beta) {
    let result = checkWinnerForMinimax(tempBoard);
    if (result !== null) {
        if (result === aiPlayer) return 10 - depth;
        if (result === humanPlayer) return -10 + depth;
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (tempBoard[i] === '') {
                tempBoard[i] = aiPlayer;
                let score = minimax(tempBoard, depth + 1, false, alpha, beta);
                tempBoard[i] = '';
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (tempBoard[i] === '') {
                tempBoard[i] = humanPlayer;
                let score = minimax(tempBoard, depth + 1, true, alpha, beta);
                tempBoard[i] = '';
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}
