
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
    let section = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
    square.setAttribute('data-section', section);
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
    progressSquare.addEventListener('click', () => {
        if (!progressSquare.classList.contains('progress-square-done')) {
            if (current) {
                current.innerText = i + 1;
                updateWrongs();
                updateProgress();
                current.click();
            }
        }
    });
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
        const section = e.target.getAttribute('data-section');
        const value = e.target.innerText;

        e.target.classList.add('square-selected');
        e.target.classList.add('square-not');
        current = e.target;

        squares.forEach(square => {
            if (square.getAttribute('data-row') == row || square.getAttribute('data-col') == col || square.getAttribute('data-section') == section){
                square.classList.add('square-not');
            }
            if (square.innerText == value && value !== " " && value !== "") {
                square.classList.add('square-selected');
            }
        });

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
    let win = true;
    for (let i = 0; i < usedDigits.length; i++) {
        if (usedDigits[i] == 9) {
            progressSquares[i].classList.add('progress-square-done');
        } else {
            win = false;
            progressSquares[i].classList.remove('progress-square-done');
        }
    }
    if (win) {
        let success = true;
        squares.forEach(square => {
            if (square.classList.contains('square-wrong')) {
                success = false;
            }
        });
        if (success) {
            alert('Winner!');
            let sudoku = generateSudoku(81);
            for (let i = 0; i < 81; i++) {
                squares[i].innerText = sudoku[i];
                if (sudoku[i] !== " ") {
                    squares[i].classList.add('square-given');
                }
            }
            updateProgress();
            updateWrongs();
        }
    }
}

function updateWrongs() {
    squares.forEach(square => {
        square.classList.remove('square-wrong');
    });
    squares.forEach(square => {
        const row = square.getAttribute('data-row');
        const col = square.getAttribute('data-col');
        const section = square.getAttribute('data-section');
        const value = square.innerText;
        squares.forEach(square2 => {
            const row2 = square2.getAttribute('data-row');
            const col2 = square2.getAttribute('data-col');
            const section2 = square2.getAttribute('data-section');
            const value2 = square2.innerText;
            if (row == row2 || col == col2 || section == section2) {
                if (value == value2 && value !== "" && value !== " " && square !== square2) {
                    square.classList.add('square-wrong');
                    square2.classList.add('square-wrong');
                }
            }
        });
    });
}

//key events space and 1 through 9
document.addEventListener('keydown', (e) => {
    if (current !== null && !current.classList.contains("square-given")) {
        if (e.key === " ") {
            current.innerText = " ";
            updateWrongs();
        } else if (e.key >= 1 && e.key <= 9) {
            if (!progressSquares[parseInt(e.key) - 1].classList.contains('progress-square-done')) {
                current.innerText = e.key;
            }
            updateWrongs();
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

function draw(sudoku) {
    // remove given
    squares.forEach(square => {
        square.classList.remove('square-given');
    });
    for (let i = 0; i < 81; i++) {
        squares[i].innerText = sudoku[i];
        if (sudoku[i] !== " ") {
            squares[i].classList.add('square-given');
        }
    }
}

function validatePosition(sudoku, x, y) {
    let section = Math.floor(y / 3) * 3 + Math.floor(x / 3) + 1;
    let value = sudoku[y * 9 + x];

    if (value == " ") {

        // check possibilities
        let possibilities = [1,2,3,4,5,6,7,8,9];
        
        for (let row = 0; row < 9; row++) {
            let location = row * 9 + x;
            if (sudoku[location] in possibilities) {
                possibilities.splice(possibilities.indexOf(sudoku[location]), 1);
            }
        }

        for (let col = 0; col < 9; col++) {
            let location = y * 9 + col;
            if (sudoku[location] in possibilities) {
                possibilities.splice(possibilities.indexOf(sudoku[location]), 1);
            }
        }

        for (let section2 = 0; section2 < 9; section2++) {
            let location = Math.floor(section2 / 3) * 3 + Math.floor(section2 % 3) + 1;
            if (sudoku[location] in possibilities) {
                possibilities.splice(possibilities.indexOf(sudoku[location]), 1);
            }
        }

        return possibilities.length >= 1;
    }
    
    // for every box
    for (let i = 0; i < 81; i++) {
        let row = Math.floor(i / 9);
        let col = i % 9;
        let section2 = Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1;
        let value2 = sudoku[i];

        if (i == y * 9 + x) {
            continue;
        }

        if (value == value2) {
            if (row == y || col == x || section == section2) {
                return false;
            }
        }
        
    }
    // no overlaps
    return true;
}

function validateSudoku(sudoku) {
    for (let i = 0; i < 81; i++) {
        if (!validatePosition(sudoku, i % 9, Math.floor(i / 9))) {
            return false;
        }
    }
    return true;
}

function isComplete(sudoku, total) {
    let given = 0;
    for (let i = 0; i < 81; i++) {
        if (sudoku[i] !== " ") {
            given++;
        }
    }
    return given == total;
}

// check every possibility with the already set values
function isSolvable(sudoku) {
    let testSudoku = [];
    for (let i = 0; i < 81; i++) {
        testSudoku.push(sudoku[i]);
    }

    return validateSudoku(testSudoku);
}

async function generateSudoku(givenSquares) {
    let sudoku = [];
    let usedDigits = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 81; i++) {
        sudoku.push(" ");
    }

    // while not full
    while (!isComplete(sudoku, givenSquares)) {
        draw(sudoku);

        let x, y;
        x = Math.floor(Math.random() * 9);
        y = Math.floor(Math.random() * 9);
        let randomPos = y * 9 + x;
        // must be an available square
        while (sudoku[randomPos] != " ") {
            x = Math.floor(Math.random() * 9);
            y = Math.floor(Math.random() * 9);
            randomPos = y * 9 + x;
        }
        let randomDigit = Math.floor(Math.random() * 9) + 1;
        // must be an available digit
        while (usedDigits[randomDigit - 1] == 9) {
            randomDigit = Math.floor(Math.random() * 9) + 1;
        }
        usedDigits[randomDigit - 1]++;
        let tempSudoku = [];
        for (let i = 0; i < 81; i++) {
            tempSudoku.push(sudoku[i]);
        }
        tempSudoku[randomPos] = randomDigit;
        draw(tempSudoku);
        updateWrongs();
        await new Promise((resolve, reject) => setTimeout(resolve, 1));
        // check if valid
        if (isSolvable(tempSudoku)) {
            sudoku[randomPos] = randomDigit;
        } else {
            usedDigits[randomDigit - 1]--;
        }
    }

    return sudoku;
}

let sudoku;
(async () => {
sudoku = await generateSudoku(Math.floor(81 / 2));
})();
draw(sudoku);
updateProgress();
updateWrongs();