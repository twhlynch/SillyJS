const renderer = document.getElementById('renderer');
const ctx = renderer.getContext('2d');
renderer.width = window.innerWidth;
renderer.height = window.innerHeight;

let progress = 0;
let position = {
    x: renderer.width / 4,
    y: renderer.height / 2
};
let changeIntervals = [
    110, 200
];
let speed;
let multiplier = 1;
let score = 0;
let isHolding = false;

class Speed {
    used = false;

    constructor(x) {
        this.x = x;
    }

    draw() {
        ctx.fillStyle = '#06f';
        ctx.fillRect(this.x, 0, 10, window.innerHeight);
    }
}

function reset() {
    score = 0;
    multiplier = 1;
    position = {
        x: renderer.width / 4,
        y: renderer.height / 2
    };
    progress = 0;
    init();
}

function render() {

    // move player
    position.y += isHolding ? -1 * multiplier : 1 * multiplier;

    // check bounds
    if (position.y > renderer.height ||
        position.y < 0 ||
        position.x > renderer.width ||
        position.x < 0) {
        reset();
    }

    // move speed
    speed.x -= 1 * multiplier;
    if (speed.x < 0) {
        speed.x = renderer.width + 100;
        speed.used = false;
    }
    if ((position.x + 10 > speed.x && position.x < speed.x + 10 ||
        position.x < speed.x + 10 && position.x > speed.x) && !speed.used) {
        speed.used = true;
        multiplier *= 1.1;
        score++;
    }

    ctx.clearRect(0, 0, renderer.width, renderer.height);

    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, renderer.width, renderer.height);

    // draw speed
    speed.draw();

    // draw path
    ctx.fillStyle = 'red';
    ctx.beginPath();
    let direction = 1;
    let lastY = 200;
    let lastX = 0;
    ctx.moveTo(0, 0);
    ctx.lineTo(lastX, lastY);
    for (let x = 0; x < window.innerWidth + 1000 + progress; x++) {
        // screen width
        let actualX = x - progress;
        for (let i = 0; i < changeIntervals.length; i++) {
            if (x % changeIntervals[i] === 0) {
                lastY += direction * (lastX - x);
                ctx.lineTo(actualX, lastY);
                lastX = x;
                direction *= -1;
            }
        }
    }
    ctx.lineTo(window.innerWidth, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    direction = 1;
    lastY = window.innerHeight - changeIntervals[0];
    lastX = 0;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX, lastY);
    for (let x = 0; x < window.innerWidth + 1000 + progress; x++) {
        // screen width
        let actualX = x - progress;
        for (let i = 0; i < changeIntervals.length; i++) {
            if (x % changeIntervals[i] === 0) {
                lastY += direction * (lastX - x);
                ctx.lineTo(actualX, lastY);
                lastX = x;
                direction *= -1;
            }
        }
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);
    ctx.closePath();
    ctx.fill();

    // draw score
    ctx.fillStyle = '#0003';
    ctx.font = '200px Arial';
    ctx.fillText(score, renderer.width / 2 - 50 - 50 * (score.toString().length - 1), renderer.height / 2 + 50);

    // check death
    for (let x = position.x; x < position.x + 10; x++) {
        for (let y = position.y; y < position.y + 10; y++) {
            let pixelColor = ctx.getImageData(x, y, 1, 1).data;
            // if red
            if (pixelColor[0] === 255 && pixelColor[1] === 0 && pixelColor[2] === 0) {
                reset();
            }
        }
    }

    // draw player
    ctx.fillStyle = 'black';
    ctx.fillRect(position.x, position.y, 10, 10);

    progress += multiplier;

    requestAnimationFrame(render);
}

function init() {
    speed = new Speed(renderer.width / 2 + renderer.width + renderer.width / 100);
}


document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
        isHolding = true;
    }
    if (e.key === '`') {
        changeIntervals.push(Math.floor(Math.random() * 1000));
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
        isHolding = false;
    }
});

document.addEventListener('mousedown', () => {
    isHolding = true;
});

document.addEventListener('mouseup', () => {
    isHolding = false;
});

init();
render();