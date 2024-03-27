class Object {
    constructor(x, y, sx, sy) {
        this.x = x;
        this.y = y;
        this.sx = sx;
        this.sy = sy;
    }
    isColliding(object) {
        return this.x < object.x + object.sx && this.x + this.sx > object.x &&
            this.y < object.y + object.sy && this.y + this.sy > object.y;
    }
}
// 5 second recharge
class Booster extends Object {
    constructor(x, y) {
        super(x, y, 10, 10);
        this.value = 60;
        this.wasUsed = 0;
    }
    canUse() {
        return performance.now() - this.wasUsed > 5000;
    }
    use() {
        this.wasUsed = performance.now();
    }
    draw() {
        ctx.fillStyle = 'black';
        if (this.canUse()) {
            ctx.fillStyle = 'orange';
        }
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
}
class Player extends Object {
    constructor(x, y, sx, sy, speed, color, keys) {
        super(x, y, sx, sy);
        this.vx = 0;
        this.vy = 0;
        this.nvx = 0;
        this.nvy = 0;
        this.speed = speed;
        this.initialSpeed = speed;
        this.boost = 0;
        this.maxBoost = 60;
        this.isBoosting = false;
        this.color = color;
        this.isTagged = false;
        this.wasTagged = 100;
        document.addEventListener('keydown', (e) => {
            if (e.key === keys.left) {
                this.nvx = speed;
                this.vx = 0;
            } else if (e.key === keys.right) {
                this.vx = speed;
                this.nvx = 0;
            } else if (e.key === keys.up) {
                this.nvy = speed;
                this.vy = 0;
            } else if (e.key === keys.down) {
                this.vy = speed;
                this.nvy = 0;
            } else if (e.key === keys.activate) {
                // tbd
            } else if (e.key === keys.boost) {
                if (this.boost > 0) {
                    this.isBoosting = true;
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === keys.left) {
                this.nvx = 0;
            } else if (e.key === keys.right) {
                this.vx = 0;
            } else if (e.key === keys.up) {
                this.nvy = 0;
            } else if (e.key === keys.down) {
                this.vy = 0;
            }
        });
    }
    canTag() {
        return this.isTagged && performance.now() - this.wasTagged > 100;
    }
    tag() {
        this.isTagged = true;
        this.wasTagged = performance.now();
        this.speed = this.initialSpeed * 1.2;
    }
    unTag() {
        this.isTagged = false;
        this.speed = this.initialSpeed;
    }
    addBoost(boost) {
        this.boost = Math.min(this.boost + boost, this.maxBoost)
    }
    move() {
        const vx = this.vx - this.nvx;
        const vy = this.vy - this.nvy;
        const speed = Math.sqrt(vx * vx + vy * vy);
        let boost = 1;
        if (this.isBoosting && this.boost > 0) {
            this.boost--;
            boost = 1.5;
            if (this.boost == 0) {
                this.isBoosting = false;
            }
        }
        if (speed > 0) {
            this.x += vx / speed * this.speed * boost;
            this.y += vy / speed * this.speed * boost;
        }

        
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.sx > canvas.width) {
            this.x = canvas.width - this.sx;
            this.vx = 0;
        } 
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        } else if (this.y + this.sy > canvas.height) {
            this.y = canvas.height - this.sy;
            this.vy = 0;
        }
    }
    draw() {
        if (this.isTagged) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 1, this.y - 1, this.sx + 2, this.sy + 2);
        } 
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
}

const fpsElement = document.getElementById('fps');
const canvas = document.getElementById('renderer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const player1 = new Player(canvas.width / 4, canvas.height / 2, 10, 10, 3, 'blue', { left: 'a', right: 'd', up: 'w', down: 's', activate: ' ', boost: 'e' });
const player2 = new Player(canvas.width / 4 * 3, canvas.height / 2, 10, 10, 3, 'green', { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', activate: 'Enter', boost: 'Shift'});
player1.tag();

const boosters = [];
for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
        const thirdX = canvas.width / 3 * x + canvas.width / 6;
        const thirdY = canvas.height / 3 * y + canvas.height / 6;
        boosters.push(new Booster(thirdX, thirdY));
    }
}

let lastRender = performance.now();
let frameCount = 0;
let fps = 0;
function updateUI() {
    const now = performance.now();
    const delta = now - lastRender;
    frameCount++;
    if (delta >= 1000) {
        fps = frameCount * (1000 / delta);
        frameCount = 0;
        lastRender = now;
    }
    fpsElement.innerText = `FPS: ${Math.round(fps)}`;
}

function render() {
    // Move Players
    player1.move();
    player2.move();

    // Compute Collisions
    if (player1.isColliding(player2)) {
        if (player1.canTag()) {
            player2.tag();
            player1.unTag();
        }
        if (player2.canTag()) {
            player1.tag();
            player2.unTag();
        }
    }

    boosters.forEach(booster => {
        if (booster.canUse()) {
            if (booster.isColliding(player1)) {
                booster.use();
                player1.addBoost(booster.value);
            }
            if (booster.isColliding(player2)) {
                booster.use();
                player2.addBoost(booster.value);
            }
        }
    });

    // Draw Scene
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boosters.forEach(booster => {
        booster.draw();
    });

    player1.draw();
    player2.draw();

    // Update UI
    updateUI();

    requestAnimationFrame(render);
}
render();