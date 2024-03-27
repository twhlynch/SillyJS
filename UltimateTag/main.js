class Object {
    constructor(x, y, sx, sy) {
        this.x = x;
        this.y = y;
        this.sx = sx;
        this.sy = sy;
    }
    isColliding(object) {
        if (this.x < object.x + object.sx && this.x + this.sx > object.x &&
            this.y < object.y + object.sy && this.y + this.sy > object.y) {
            return true;
        } else {
            let topRightX = object.x + object.sx;
            let bottomRightX = object.x + object.sx;
            let bottomLeftX = object.x;
            let topLeftX = object.x;
            let topRightY = object.y + object.sy;
            let bottomRightY = object.y + object.sy;
            let bottomLeftY = object.y;
            let topLeftY = object.y;
            if (this.x < topRightX && this.x + this.sx > topRightX &&
                this.y < topRightY && this.y + this.sy > topRightY) {
                return true;
            }
            if (this.x < bottomRightX && this.x + this.sx > bottomRightX &&
                this.y < bottomRightY && this.y + this.sy > bottomRightY) {
                return true;
            }
            if (this.x < bottomLeftX && this.x + this.sx > bottomLeftX &&
                this.y < bottomLeftY && this.y + this.sy > bottomLeftY) {
                return true;
            }
            if (this.x < topLeftX && this.x + this.sx > topLeftX &&
                this.y < topLeftY && this.y + this.sy > topLeftY) {
                return true;
            }
            return false;
        }
    }
}
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
class Wall extends Object {
    constructor(x, y, sx, sy) {
        super(x, y, sx, sy);
    }
    draw() {
        ctx.fillStyle = 'black';
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
        this.lastX = this.x;
        this.lastY = this.y;
        this.speed = speed;
        this.initialSpeed = speed;
        this.boost = 0;
        this.maxBoost = 60;
        this.isBoosting = false;
        this.color = color;
        this.isTagged = false;
        this.wasTagged = 500;
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
        return this.isTagged && performance.now() - this.wasTagged > 500;
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
        this.lastX = this.x;
        this.lastY = this.y;

        const vx = this.vx - this.nvx;
        const vy = this.vy - this.nvy;
        const speed = Math.sqrt(vx * vx + vy * vy);
        let boost = 1;
        let tag = 1;
        if (this.isBoosting && this.boost > 0) {
            this.boost--;
            boost = 1.5;
            if (this.boost == 0) {
                this.isBoosting = false;
            }
        }
        if (this.isTagged && performance.now() - this.wasTagged <= 500) {
            tag = 0.05;
        }
        if (speed > 0) {
            this.x += vx / speed * this.speed * boost * tag;
            this.y += vy / speed * this.speed * boost * tag;
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

let walls = [];
const mapChoice = Math.floor(Math.random() * 3);
if (mapChoice === 0) {
    // random map
    for (let i = 0; i < 15; i++) {
        // long horizontal wall
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 150, 10));
        // vertical wall
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 10, 100));
        // square wall
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 70, 70));
        // thick vertical wall
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 30, 100));
        // thick horizontal wall
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 100, 30));
        // stair
        let stairX = Math.random() * canvas.width;
        let stairY = Math.random() * canvas.height;
        walls.push(new Wall(stairX, stairY, 10, 30));
        walls.push(new Wall(stairX, stairY, 30, 10));
        // stair rotated
        stairX = Math.random() * canvas.width;
        stairY = Math.random() * canvas.height;
        walls.push(new Wall(stairX + 20, stairY, 10, 30));
        walls.push(new Wall(stairX, stairY, 30, 10));
    }
    for (let i = 0; i < walls.length; i++) {
        if (walls[i].isColliding(player1) || walls[i].isColliding(player2)) {
            walls.splice(i, 1);
            i--;
        }
    }
} else if (mapChoice === 1) {
    // grid map
    function newGridMap() {
        walls = [];
        for (let x = 0; x < 9; x++) {
            let oneSkipped = false;
            for (let y = 0; y < 9; y++) {
                if (Math.random() < 0.5 || (!oneSkipped && y == 8)) {
                    walls.push(new Wall(canvas.width / 9 * x, canvas.height / 9 * y, 10, canvas.height / 9));
                } else {
                    oneSkipped = true;
                }
            }
        }
        for (let y = 0; y < 9; y++) {
            let oneSkipped = false;
            for (let x = 0; x < 9; x++) {
                if (Math.random() < 0.5 || (!oneSkipped && x == 8)) {
                    walls.push(new Wall(canvas.width / 9 * x, canvas.height / 9 * y, canvas.width / 9, 10));
                } else {
                    oneSkipped = true;
                }
            }
        }
        for (let i = 0; i < walls.length; i++) {
            if (walls[i].isColliding(player1) || walls[i].isColliding(player2)) {
                walls.splice(i, 1);
                i--;
            }
        }
    }
    newGridMap();
    setInterval(() => {
        newGridMap();
    }, 10000);
} else if (mapChoice === 2) {
    // maze map
    for (let i = 0; i < 1000; i++) {
        walls.push(new Wall(Math.random() * canvas.width, Math.random() * canvas.height, 10, 10));
    }
    for (let i = 0; i < walls.length; i++) {
        if (walls[i].isColliding(player1) || walls[i].isColliding(player2)) {
            walls.splice(i, 1);
            i--;
        }
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

    walls.forEach(wall => {
        if (wall.isColliding(player1)) {
            let tempX = player1.x;
            let tempY = player1.y;
            let xCollides = false;
            let yCollides = false;
            player1.x = player1.lastX;
            if (wall.isColliding(player1)) {
                yCollides = true;
            }
            player1.x = tempX;
            player1.y = player1.lastY;
            if (wall.isColliding(player1)) {
                xCollides = true;
            }
            player1.y = tempY;
            if (xCollides) {
                player1.x = player1.lastX;
            }
            if (yCollides) {
                player1.y = player1.lastY;
            }
            if (wall.isColliding(player1)) {
                player1.x = player1.lastX;
                player1.y = player1.lastY;
            }
        }
        if (wall.isColliding(player2)) {
            let tempX = player2.x;
            let tempY = player2.y;
            let xCollides = false;
            let yCollides = false;
            player2.x = player2.lastX;
            if (wall.isColliding(player2)) {
                yCollides = true;
            }
            player2.x = tempX;
            player2.y = player2.lastY;
            if (wall.isColliding(player2)) {
                xCollides = true;
            }
            player2.y = tempY;
            if (xCollides) {
                player2.x = player2.lastX;
            }
            if (yCollides) {
                player2.y = player2.lastY;
            }
            if (wall.isColliding(player2)) {
                player2.x = player2.lastX;
                player2.y = player2.lastY;
            }
        }
    });

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

    walls.forEach(wall => {
        wall.draw();
    });

    player1.draw();
    player2.draw();

    // Update UI
    updateUI();

    requestAnimationFrame(render);
}
render();