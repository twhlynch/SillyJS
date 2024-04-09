const guesses = document.getElementById('guesses');
const restartButton = document.getElementById('restart');
const resetText = document.getElementById('resetText');
const resetContainer = document.getElementById('reset');
const enter = document.getElementById('enter');
const backspace = document.getElementById('delete');
let guessCount = 0;
let currentGuess = [];
let answer = ['H','E','L','L','O'];
let wordList = [];

async function init() {
    let request = await fetch('wordList.txt');
    wordList = await request.json();

    let randomWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    answer = [];
    for (let i = 0; i < 5; i++) {
        answer.push(randomWord[i]);
    }

    for (let i = 0; i < 6; i++) {
        const guess = document.createElement('div');
        guess.className = 'guess';
        guesses.appendChild(guess);
        for (let j = 0; j < 5; j++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            guess.appendChild(letter);
        }
    }
}

function reset() {
    let randomWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    answer = [];
    for (let i = 0; i < 5; i++) {
        answer.push(randomWord[i]);
    }
    guessCount = 0;
    currentGuess = [];
    for (let i = 0; i < 5; i++) {
        for(let j = 0; j < 6; j++) {
            guesses.children[j].children[i].textContent = '';
            guesses.children[j].children[i].style.backgroundColor = 'white';
        }
    }
    document.querySelectorAll('.key').forEach((key) => {
        key.classList.remove('found');
        key.classList.remove('maybe');
        key.classList.remove('wrong');
    });
}

function win() {
    resetContainer.style.display = 'flex';
    resetText.innerText = 'You Win!';
}

function lose() {
    resetContainer.style.display = 'flex';
    resetText.innerText = 'You Lose!';
}

function updateGuess() {
    for (let i = 0; i < 5; i++) {
        guesses.children[guessCount].children[i].textContent = '';
    }
    for (let i = 0; i < currentGuess.length; i++) {
        guesses.children[guessCount].children[i].textContent = currentGuess[i];
    }
}

function colorGuess() {
    for (let i = 0; i < 5; i++) {
        guesses.children[guessCount].children[i].style.backgroundColor = 'white';
    }
    for (let i = 0; i < currentGuess.length; i++) {
        if (currentGuess[i] === answer[i]) {
            guesses.children[guessCount].children[i].style.backgroundColor = 'green';
            document.getElementById('key-' + currentGuess[i]).classList.add('found');
        } else if (answer.includes(currentGuess[i])) {
            guesses.children[guessCount].children[i].style.backgroundColor = 'yellow';
            document.getElementById('key-' + currentGuess[i]).classList.add('maybe');
        } else {
            guesses.children[guessCount].children[i].style.backgroundColor = '#777';
            document.getElementById('key-' + currentGuess[i]).classList.add('wrong');
        }
    }
}

function checkGuess() {
    if (wordList.includes(currentGuess.join('').toLowerCase())) {
        colorGuess();
        if (currentGuess.toString() === answer.toString()) {
            win();
        } else if (guessCount === 5) {
            lose();
        } else {
            guessCount++;
            currentGuess = [];
        }
    }
}

function addLetter(letter) {
    if (currentGuess.length < 5) {
        currentGuess.push(letter);
        updateGuess();
    }
}

(async () => {
    await init();

    restartButton.addEventListener('click', () => {
        reset();
        resetContainer.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        const id = e.target.id;
        if (id.includes('key-')) {
            const key = id.split('-')[1];
            addLetter(key);
        }
    });

    enter.addEventListener('click', () => {
        if (currentGuess.length === 5) {
            checkGuess();
        }
    });

    backspace.addEventListener('click', () => {
        currentGuess.pop();
        updateGuess();
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= 'A' && key <= 'Z') {
            addLetter(key);
        }
        if (currentGuess.length === 5 && key === 'ENTER') {
            checkGuess();
        }
        if (key === 'BACKSPACE') {
            currentGuess.pop();
            updateGuess();
        }
    });
})();