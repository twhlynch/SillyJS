const game = document.getElementById('game');
const restartButton = document.getElementById('restart');
const endText = document.getElementById('endText');
const endContainer = document.getElementById('end');
const scoreValue = document.getElementById('scoreValue');
const highValue = document.getElementById('highValue');
const autoplay = document.getElementById('autoplay');
const squares = [];
let isAutoPlaying = false;
let autoplayInterval = undefined;

function init() {
    highValue.innerText = localStorage.getItem('high') || 0;
    for (let i = 0; i < 100; i++) {
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
    for (let i = 0; i < 100; i++) {
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
        localStorage.setItem('high', highValue.innerText);
    }
}

function updateStyles() {
    for (let i = 0; i < 100; i++) {
        switch (squares[i].innerText.trim()) {
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
            case '':
                squares[i].style.backgroundColor = '#cdc1b4';
                squares[i].style.color = '#776e65';
                break;
            default:
                const x = Math.log2(parseInt(squares[i].innerText));
                const c1 = [0, 0, 0];
                const c2 = [0, 0, 255];
                const c3 = [255, 0, 0];

                let t = Math.min((x - 11) / 10, 1);
                let r = c1[0] * (1 - t) + c2[0] * t;
                let g = c1[1] * (1 - t) + c2[1] * t;
                let b = c1[2] * (1 - t) + c2[2] * t;

                if (t == 1) {
                    t = Math.min((x - 21) / 40, 1);
                    r = c2[0] * (1 - t) + c3[0] * t;
                    g = c2[1] * (1 - t) + c3[1] * t;
                    b = c2[2] * (1 - t) + c3[2] * t;
                }

                squares[i].style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                squares[i].style.color = '#fff';
                break;
        }
    }
}

function addNumber() {
    let square;
    do {
        square = Math.floor(Math.random() * 100);
    } while (squares[square].innerText !== '');

    let number = 2;
    if (Math.random() < 0.1) {
        number = 4;
    }

    squares[square].innerText = number;
}

function moveUp() {
    for (let i = 10; i < 100; ++i) {
        if (squares[i].innerText) {
            let j = i;
            while (j - 10 >= 0) {
                if (!squares[j - 10].innerText) {
                    squares[j - 10].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    j -= 10;
                }
                else if (squares[j - 10].innerText.trim() === squares[j].innerText.trim()) {
                    squares[j - 10].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j - 10].innerText);
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
    for (let i = 90; i >= 0; --i) {
        if (squares[i].innerText) {
            let j = i;
            while (j + 10 < 100) {
                if (!squares[j + 10].innerText) {
                    squares[j + 10].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    j += 10;
                }
                else if (squares[j + 10].innerText.trim() === squares[j].innerText.trim()) {
                    squares[j + 10].innerText *= 2;
                    squares[j].innerText = '';
                    updateScore(squares[j + 10].innerText);
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
    for (let i = 1; i < 100; ++i) {
        if (squares[i].innerText) {
            let j = i;
            while (j % 10 !== 0) {
                if (!squares[j - 1].innerText) {
                    squares[j - 1].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    --j;
                }
                else if (squares[j - 1].innerText.trim() === squares[j].innerText.trim()) {
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
    for (let i = 99; i >= 0; --i) {
        if (squares[i].innerText) {
            let j = i;
            while (j % 10 !== 9) {
                if (!squares[j + 1].innerText) {
                    squares[j + 1].innerText = squares[j].innerText;
                    squares[j].innerText = '';
                    ++j;
                }
                else if (squares[j + 1].innerText.trim() === squares[j].innerText.trim()) {
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
    if (event.key === 'ArrowUp' || event.key === 'w') {
        moveUp();
        moved = true;
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        moveDown();
        moved = true;
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveLeft();
        moved = true;
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        moveRight();
        moved = true;
    } else if (event.key === '`') {
        for (let i = 0; i < 100; i++) {
            if (squares[i].innerText !== '') {
                squares[i].innerText = squares[i].innerText*2;
            }
        }
        updateStyles();
    }
    if (moved) {
        checkState();
        if (currentState !== squares.map(square => ":"+square.innerText+":").toString()) {
            addNumber();
            updateStyles();
        }
    }
});

autoplay.addEventListener('click', () => {
    if (isAutoPlaying) {
        isAutoPlaying = false;
        clearInterval(autoplayInterval);
        autoplay.innerText = 'Autoplay';
    } else {
        autoplayInterval = setInterval(() => {
            let currentState = squares.map(square => ":"+square.innerText+":").toString()
            let direction = Math.floor(Math.random() * 4);
            if (direction === 0) {
                moveUp();
            } else if (direction === 1) {
                moveDown();
            } else if (direction === 2) {
                moveLeft();
            } else if (direction === 3) {
                moveRight();
            }
            checkState();
            if (currentState !== squares.map(square => ":"+square.innerText+":").toString()) {
                addNumber();
                updateStyles();
            }
        }, 1);
        isAutoPlaying = true;
        autoplay.innerText = 'Stop';
    }
});

game.addEventListener('click', (event) => {
    let x = event.clientX;
    let y = event.clientY;
    
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;

    const right = x - midX;
    const left = midX - x;
    const down = y - midY;
    const up = midY - y;

    let currentState = squares.map(square => ":"+square.innerText+":").toString()

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
    for (let i = 0; i < 100; i++) {
        squares[i].innerText = '';
    }
    endContainer.style.display = 'none';
    addNumber();
    updateStyles();
    scoreValue.innerText = '0';
})