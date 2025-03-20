
const game = document.getElementById('game');
let turn = true;
let bot = false;

// create squares
const squares = [];
for (let i = 0; i < 3 * 3; i++) {
    const square = document.createElement('div');
    let col = i % 9 + 1;
    let row = Math.floor(i / 9) + 1;
    square.setAttribute('data-row', row);
    square.setAttribute('data-col', col);
    square.setAttribute('data-index', i);
    square.classList.add('square');
    squares.push(square);
    game.appendChild(square);
}

// click events
squares.forEach(square => {
    square.addEventListener('click', (e) => {
        if (square.classList.contains('square-filled')) {
            return;
        }
        if (turn) {
            square.classList.add('square-filled');
            square.classList.add('square-x');
        } else {
            square.classList.add('square-filled');
            square.classList.add('square-o');
        }
        turn = !turn;
        check();
        if (bot && !turn) doBotTurn();
    });
});

document.getElementById('reset').addEventListener('click', () => {
    game.style.pointerEvents = 'auto';
    game.classList.remove('win-x');
    game.classList.remove('win-o');
    squares.forEach(square => {
        square.classList.remove('square-filled');
        square.classList.remove('square-x');
        square.classList.remove('square-o');
    });
    turn = true;
});

document.getElementById('bot').addEventListener('click', () => {
    bot = !bot;
});

function check() {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a].classList.contains('square-x') && squares[b].classList.contains('square-x') && squares[c].classList.contains('square-x')) {
            game.classList.add('win-x');
            game.style.pointerEvents = 'none';
            return;
        } else if (squares[a].classList.contains('square-o') && squares[b].classList.contains('square-o') && squares[c].classList.contains('square-o')) {
            game.classList.add('win-o');
            game.style.pointerEvents = 'none';
            return;
        }
    }
}

function doBotTurn() {
    const emptySquares = squares.filter(square => !square.classList.contains('square-filled'));
    let bestMove = null;
    let bestScore = -Infinity;

    emptySquares.forEach(square => {
        square.classList.add('square-filled', 'square-o');
        const score = minimax(squares, 0, false);
        square.classList.remove('square-filled', 'square-o');
        if (score > bestScore) {
            bestScore = score;
            bestMove = square;
        }
    });

    if (bestMove) {
        bestMove.click();
    }
}

function minimax(newSquares, depth, isMaximizing) {
    const scores = {
        'win-o': 10,
        'win-x': -10,
        'tie': 0
    };

    const result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        newSquares.forEach(square => {
            if (!square.classList.contains('square-filled')) {
                square.classList.add('square-filled', 'square-o');
                let score = minimax(newSquares, depth + 1, false);
                square.classList.remove('square-filled', 'square-o');
                bestScore = Math.max(score, bestScore);
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        newSquares.forEach(square => {
            if (!square.classList.contains('square-filled')) {
                square.classList.add('square-filled', 'square-x');
                let score = minimax(newSquares, depth + 1, true);
                square.classList.remove('square-filled', 'square-x');
                bestScore = Math.min(score, bestScore);
            }
        });
        return bestScore;
    }
}

function checkWinner() {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a].classList.contains('square-x') && squares[b].classList.contains('square-x') && squares[c].classList.contains('square-x')) {
            return 'win-x';
        } else if (squares[a].classList.contains('square-o') && squares[b].classList.contains('square-o') && squares[c].classList.contains('square-o')) {
            return 'win-o';
        }
    }

    if (squares.every(square => square.classList.contains('square-filled'))) {
        return 'tie';
    }

    return null;
}