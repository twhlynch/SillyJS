const game = document.getElementById('game');
const restartButton = document.getElementById('restart');
const endText = document.getElementById('endText');
const endContainer = document.getElementById('end');
const scoreValue = document.getElementById('scoreValue');
const highValue = document.getElementById('highValue');
const squares = [];

function init() {
    highValue.innerText = localStorage.getItem('high2048') || 0;
    for (let i = 0; i < 16; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        game.appendChild(square);
        squares.push(square);
    }
    addNumber();
    updateStyles();
}

function checkState() {
    let lost = true;
    for (let i = 0; i < 16; i++) {
        if (squares[i].innerText === '2048') {
            endContainer.style.display = 'flex';
            endText.innerText = 'You won!';
        }
        if (squares[i].innerText === '') {
            lost = false;
        }
    }
    if (lost) {
        endContainer.style.display = 'flex';
        endText.innerText = 'You lost!';
    }
}

function updateScore(add) {
    add = parseInt(add);
    scoreValue.innerText = parseInt(scoreValue.innerText) + add;
    if (parseInt(scoreValue.innerText) > parseInt(highValue.innerText)) {
        highValue.innerText = scoreValue.innerText;
        localStorage.setItem('high2048', highValue.innerText);
    }
}

function updateStyles() {
    for (let i = 0; i < 16; i++) {
        switch (squares[i].innerText) {
            case '2':
                squares[i].style.backgroundColor = '#eee4da';
                squares[i].style.color = '#776e65';
                break;
            case '4':
                squares[i].style.backgroundColor = '#ede0c8';
                squares[i].style.color = '#776e65';
                break;
            case '8':
                squares[i].style.backgroundColor = '#f2b179';
                squares[i].style.color = '#f9f6f2';
                break;
            case '16':
                squares[i].style.backgroundColor = '#f59563';
                squares[i].style.color = '#f9f6f2';
                break;
            case '32':
                squares[i].style.backgroundColor = '#f67c5f';
                squares[i].style.color = '#f9f6f2';
                break;
            case '64':
                squares[i].style.backgroundColor = '#f65e3b';
                squares[i].style.color = '#f9f6f2';
                break;
            case '128':
                squares[i].style.backgroundColor = '#edcf72';
                squares[i].style.color = '#f9f6f2';
                break;
            case '256':
                squares[i].style.backgroundColor = '#edcc61';
                squares[i].style.color = '#f9f6f2';
                break;
            case '512':
                squares[i].style.backgroundColor = '#edc850';
                squares[i].style.color = '#f9f6f2';
                break;
            case '1024':
                squares[i].style.backgroundColor = '#edc53f';
                squares[i].style.color = '#f9f6f2';
                break;
            case '2048':
                squares[i].style.backgroundColor = '#edc22e';
                squares[i].style.color = '#f9f6f2';
                break;
            default:
                squares[i].style.backgroundColor = '#cdc1b4';
                squares[i].style.color = '#776e65';
                break;
        }
    }
}

function addNumber() {
    let square;
    do {
        square = Math.floor(Math.random() * 16);
    } while (squares[square].innerText !== '');

    let number = 2;
    if (Math.random() < 0.1) {
        number = 4;
    }

    squares[square].innerText = number;
}

function moveUp() {
    for (let i = 4; i < 16; ++i) {
        if (squares[i].innerText) {
            let j = i;
            while (j - 4 >= 0) {
                if (!squares[j - 4].innerText) {
                    squares[j - 4].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    j -= 4;
                }
                else if (squares[j - 4].innerText === squares[j].innerText) {
                    squares[j - 4].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j - 4].innerText);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }
}

function moveDown() {
    for (let i = 11; i >= 0; --i) {
        if (squares[i].innerText) {
            let j = i;
            while (j + 4 < 16) {
                if (!squares[j + 4].innerText) {
                    squares[j + 4].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    j += 4;
                }
                else if (squares[j + 4].innerText === squares[j].innerText) {
                    squares[j + 4].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j + 4].innerText);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }
}
function moveLeft() {
    for (let i = 1; i < 16; ++i) {
        if (squares[i].innerText) {
            let j = i;
            while (j % 4 !== 0) {
                if (!squares[j - 1].innerText) {
                    squares[j - 1].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    --j;
                }
                else if (squares[j - 1].innerText === squares[j].innerText) {
                    squares[j - 1].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j - 1].innerText);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }
}

function moveRight() {
    for (let i = 14; i >= 0; --i) {
        if (squares[i].innerText) {
            let j = i;
            while (j % 4 !== 3) {
                if (!squares[j + 1].innerText) {
                    squares[j + 1].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    ++j;
                }
                else if (squares[j + 1].innerText === squares[j].innerText) {
                    squares[j + 1].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j + 1].innerText);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }
}

init();

document.addEventListener('keydown', (event) => {
    let moved = false;
    let currentState = squares.map(square => ":"+square.innerText+":").toString()
    if (event.key === 'ArrowUp') {
        moveUp();
        moved = true;
    } else if (event.key === 'ArrowDown') {
        moveDown();
        moved = true;
    } else if (event.key === 'ArrowLeft') {
        moveLeft();
        moved = true;
    } else if (event.key === 'ArrowRight') {
        moveRight();
        moved = true;
    }
    if (moved) {
        checkState();
        if (currentState !== squares.map(square => ":"+square.innerText+":").toString()) {
            addNumber();
            updateStyles();
        }
    }
});

const start = {x:0,y:0};

document.addEventListener('touchstart', (event) => {
    start.x = event.clientX;
    start.y = event.clientY;
});

document.addEventListener('touchend', (event) => {
    let x = event.clientX;
    let y = event.clientY;

    let right = x - start.x;
    let left = start.x - x;
    let up = start.y - y;
    let down = y - start.y;

    console.log(right, left, up, down);
    currentState = squares.map(square => ":"+square.innerText+":").toString();

    if (right > left && right > up && right > down) {
        moveRight();
    } else if (left > right && left > up && left > down) {
        moveLeft();
    } else if (up > right && up > left && up > down) {
        moveUp();
    } else if (down > right && down > left && down > up) {
        moveDown();
    }

    checkState();
    if (currentState !== squares.map(square => ":"+square.innerText+":").toString()) {
        addNumber();
        updateStyles();
    }
});

restartButton.addEventListener('click', () => {
    for (let i = 0; i < 16; i++) {
        squares[i].innerText = '';
    }
    endContainer.style.display = 'none';
    addNumber();
    updateStyles();
    scoreValue.innerText = '0';
})