
const game = document.getElementById('game');
const progress = document.getElementById('progress');
let current = null;

// create squares
const squares = [];
for (let i = 0; i < 9 * 9; i++) {
    const square = document.createElement('div');
    square.innerText = " ";
    let col = i % 9 + 1;
    let row = Math.floor(i / 9) + 1;
    square.setAttribute('data-row', row);
    square.setAttribute('data-col', col);
    square.classList.add('square');
    squares.push(square);
    game.appendChild(square);
}

// create progress squares
const progressSquares = [];
for (let i = 0; i < 9; i++) {
    const progressSquare = document.createElement('div');
    progressSquare.innerText = i + 1;
    progressSquare.classList.add('progress-square');
    progressSquares.push(progressSquare);
    progress.appendChild(progressSquare);
}

// click events
squares.forEach(square => {
    square.addEventListener('click', (e) => {

        squares.forEach(square => {
            square.classList.remove('square-not');
            square.classList.remove('square-selected');
        });

        const row = e.target.getAttribute('data-row');
        const col = e.target.getAttribute('data-col');
        const value = e.target.innerText;

        e.target.classList.add('square-selected');
        e.target.classList.add('square-not');
        current = e.target;

        if (value !== " " && value !== "") {
            
            squares.forEach(square => {
                if (square.getAttribute('data-row') == row || square.getAttribute('data-col') == col) {
                    square.classList.add('square-not');
                }
                if (square.innerText == value) {
                    square.classList.add('square-selected');
                }
            });

        }
    });
});

function updateProgress() {
    let usedDigits = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 9 * 9; i++) {
        const value = squares[i].innerText;
        if (value !== " " && value !== "") {
            usedDigits[value - 1]++;
        }
    }
    for (let i = 0; i < usedDigits.length; i++) {
        if (usedDigits[i] == 9) {
            progressSquares[i].classList.add('progress-square-done');
        } else {
            progressSquares[i].classList.remove('progress-square-done');
        }
    }
}

//key events space and 1 through 9
document.addEventListener('keydown', (e) => {
    if (current !== null && !current.classList.contains("square-given")) {
        if (e.key === " ") {
            current.innerText = " ";
        } else if (e.key >= 1 && e.key <= 9) {
            if (!progressSquares[parseInt(e.key) - 1].classList.contains('progress-square-done')) {
                current.innerText = e.key;
            }
        }
        updateProgress();
        current.click();
    }
});

// arrow key movements
document.addEventListener('keydown', (e) => {
    if (current !== null) {
        let row = parseInt(current.getAttribute('data-row'));
        let col = parseInt(current.getAttribute('data-col'));
        // 1 - 9
        if (e.key === "ArrowUp") {
            row -= 1;
        } else if (e.key === "ArrowDown") {
            row += 1;
        } else if (e.key === "ArrowLeft") {
            col -= 1;
        } else if (e.key === "ArrowRight") {
            col += 1;
        }
        if (row == 0) {
            row = 9;
        }
        if (col == 0) {
            col = 9;
        }
        if (row == 10) {
            row = 1;
        }
        if (col == 10) {
            col = 1;
        }
        squares.forEach(square => {
            if (square.getAttribute('data-row') == row && square.getAttribute('data-col') == col) {
                square.click();
            }
        });
    }
});

function generateSudoku() {
    const numSquares = 9*9;
    const givenSquares = 9*9/2;
    const sudoku = [];
    for (let i = 0; i < numSquares; i++) {
        sudoku[i] = " ";
    }
    let usedDigits = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let usedSquares = [];
    for (let i = 0; i < givenSquares; i++) {
        let square = Math.floor(Math.random() * numSquares);
        let digit = Math.floor(Math.random() * 9) + 1;
        while (usedSquares.includes(square)) {
            square = Math.floor(Math.random() * numSquares);
        }
        while (usedDigits[digit - 1] >= 9) {
            digit = Math.floor(Math.random() * 9) + 1;
        }
        usedDigits[digit - 1]++;
        usedSquares.push(square);
        sudoku[square] = digit;
    }
    for (let i = 0; i < numSquares; i++) {
        squares[i].innerText = sudoku[i];
        if (sudoku[i] !== " ") {
            squares[i].classList.add('square-given');
        }
    }
    for (let i = 0; i < 9; i++) {
        if (usedDigits[i] == 9) {
            progressSquares[i].classList.add('progress-square-done');
        }
    }
}

generateSudoku();