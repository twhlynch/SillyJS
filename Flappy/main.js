const renderer = document.getElementById('renderer');
const ctx = renderer.getContext('2d');
renderer.width = window.innerWidth;
renderer.height = window.innerHeight;

let position = {
    x: renderer.width / 4,
    y: renderer.height / 4
};
let vy = 0;
let pipes = [];
let speed;
let multiplier = 1;
let score = 0;

class Pipe {
    used = false;

    constructor(x, gapy) {
        this.x = x;
        this.gapy = gapy;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.gapy, 10, window.innerHeight);
        ctx.fillRect(this.x, this.gapy - window.innerHeight - 100, 10, window.innerHeight);
    }
}

class Speed {
    used = false;

    constructor(x) {
        this.x = x;
    }

    draw() {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(this.x, 0, 10, window.innerHeight);
    }
}

function isColliding(pipe) {
    if (position.x + 10 > pipe.x && position.x < pipe.x + 10 ||
        position.x < pipe.x + 10 && position.x > pipe.x) {
        if (position.y + 10 > pipe.gapy ||
            position.y < pipe.gapy  - 100) {
            return true;
        } else if (!pipe.used) {
            score++;
            pipe.used = true;
        }
    }
}

function reset() {
    // score = 0;
    multiplier = 1;
    position = {
        x: renderer.width / 4,
        y: renderer.height / 4
    };
    init();
}

function render() {

    // move player
    position.y += vy;
    vy += 0.1;

    // move pipes
    pipes.forEach((p) => {
        p.x -= 1 * multiplier;
        if (p.x < 0) {
            p.x = renderer.width + 100;
            p.gapy = Math.random() * (renderer.height - 200) + 100;
        }
        if (isColliding(p)) {
            reset();
        }
    });

    // check bounds
    if (position.y > renderer.height ||
        position.y < 0 ||
        position.x > renderer.width ||
        position.x < 0) {
        reset();
    }

    // move pipes
    pipes.forEach((p) => {
        p.draw();
    });

    // check bounds
    if (position.y > renderer.height) {
        position.y = 0;
    }
    if (position.y < 0) {
        position.y = renderer.height;
    }
    if (position.x > renderer.width) {
        position.x = 0;
    }

    // move speed
    speed.x -= 1 * multiplier;
    if (speed.x < 0) {
        speed.x = renderer.width + 100;
    }
    if (position.x + 10 > speed.x && position.x < speed.x + 10 ||
        position.x < speed.x + 10 && position.x > speed.x) {
        speed.used = true;
        multiplier += 0.02;
    }

    ctx.clearRect(0, 0, renderer.width, renderer.height);

    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, renderer.width, renderer.height);

    // draw score
    ctx.fillStyle = 'grey';
    ctx.font = '200px Arial';
    ctx.fillText(score, renderer.width / 2 - 50 - 50 * (score.toString().length - 1), renderer.height / 2 + 50);

    // draw pipes
    pipes.forEach((pipe) => {
        pipe.draw();
    });

    // draw speed
    speed.draw();

    // draw player
    ctx.fillStyle = 'black';
    ctx.fillRect(position.x, position.y, 10, 10);

    requestAnimationFrame(render);
}

function init() {
    pipes = [];
    for (let i = 0; i < renderer.width / 200; i++) {
        pipes.push(new Pipe(renderer.width / 2 + i * 200, Math.random() * (renderer.height - 200) + 100));
    }
    speed = new Speed(renderer.width / 2 + renderer.width + renderer.width / 100);
}

function jump() {
    vy = Math.min(-3, vy-1);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
        jump();
    }
});

document.addEventListener('click', jump);
init();
render();