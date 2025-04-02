let debug = true;
const COLORS = {
    maxSpeed: '#09f',
    speed: '#f90',
    turn: '#f00',
    stamina: '#00f',
    perception: '#0c0',
    range: '#90f',
};
let detectedDelta = undefined;

const canvas = document.getElementById('renderer');
const ctx = canvas.getContext('2d');

let birds = [];
let food = [];

class Vec2 {
    constructor(x, y = undefined) {
        this.x = x;
        this.y = y ? y : x;
    }
    distance(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
class Entity {
    constructor() {
        this.position = new Vec2(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        );
        this.scale = 20;
        this.color = '#000000';
    }
    update() {}
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            this.scale * 0.8,
            this.scale * 0.8,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}
// #region bird
class Bird extends Entity {
    constructor(parent = undefined) {
        super();
        this.generation = 1;
        this.foodDelay = 0;
        this.velocity = new Vec2(0, 0);
        this.statistics = {
            maxSpeed: 1, // max speed mult
            speed: 1, // speed mult
            turn: 1, // turn speed mult
            stamina: 1, // -0.01 per tick
            perception: 1, // percent of food seen ( calculed / 2 )
            range: 1, // percent of scale eat range
        };
        if (parent) {
            this.position = new Vec2(parent.position.x, parent.position.y);
            for (const key in this.statistics) {
                this.statistics[key] = parent.statistics[key];
            }
            this.generation = parent.generation + 1;
        }
        for (const key in this.statistics) {
            this.statistics[key] *= 1 + (Math.random() * 0.2 - 0.1);
        }
        this.stamina = this.statistics.stamina;
        let bestStat;
        for (const key in this.statistics) {
            if (!bestStat || this.statistics[key] > this.statistics[bestStat]) {
                bestStat = key;
            }
        }
        this.color = COLORS[bestStat];
        this.target = undefined;
    }
    update(delta) {
        if (!this.target || this.target.dead) this.target = this.findFood();

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // bounds
        if (this.position.x < -this.scale) this.velocity.x = this.statistics.speed;
        else if (this.position.x > canvas.width + this.scale) this.velocity.x = -this.statistics.speed;
        if (this.position.y < -this.scale) this.velocity.y = this.statistics.speed;
        else if (this.position.y > canvas.height + this.scale) this.velocity.y = -this.statistics.speed;

        this.stamina -= 0.003 * Math.max(this.statistics.speed, this.statistics.maxSpeed);
        if (delta / detectedDelta > 1.5) this.stamina -= (delta / detectedDelta - 1.5) * this.stamina;
        if (this.stamina <= 0) {
            birds = birds.filter((bird) => bird != this);
        }

        if (!this.target) return;

        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        const foodAngle = Math.atan2(this.target.position.y - this.position.y, this.target.position.x - this.position.x);
        const foodDistance = this.position.distance(this.target.position);
        const angleDiff = Math.abs(foodAngle - angle);

        let nx = this.velocity.x / this.statistics.range + (Math.cos(foodAngle) * this.statistics.turn * this.statistics.speed) / (angleDiff * Math.PI * Math.max(this.statistics.speed, this.statistics.maxSpeed));
        let ny = this.velocity.y / this.statistics.range + (Math.sin(foodAngle) * this.statistics.turn * this.statistics.speed) / (angleDiff * Math.PI * Math.max(this.statistics.speed, this.statistics.maxSpeed));
        const maxSpeedMult = 3;
        if (nx > this.statistics.maxSpeed * maxSpeedMult) {
            nx = this.statistics.maxSpeed * maxSpeedMult;
        } else if (nx < -this.statistics.maxSpeed * maxSpeedMult) {
            nx = -this.statistics.maxSpeed * maxSpeedMult;
        }
        if (ny > this.statistics.maxSpeed * maxSpeedMult) {
            ny = this.statistics.maxSpeed * maxSpeedMult;
        } else if (ny < -this.statistics.maxSpeed * maxSpeedMult) {
            ny = -this.statistics.maxSpeed * maxSpeedMult;
        }
        this.velocity.x = nx;
        this.velocity.y = ny;

        if (foodDistance <= Math.min(3, this.statistics.range) * this.scale + this.target.scale && Math.abs(foodAngle - angle) < 1) {
            this.stamina = this.statistics.stamina;
            this.target.dead = true;
            this.foodDelay = 1;
            food = food.filter((food) => food != this.target);
            this.target = undefined;
            food.push(new Food());
            birds.push(new Bird(this));
        }
    }
    draw() {
        ctx.fillStyle = '#cdc';
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y,
            (this.scale * Math.min(3, this.statistics.range)) / 2,
            (this.scale * Math.min(3, this.statistics.range)) / 2,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();

        if (debug) {
            ctx.strokeStyle = '#eef';
            ctx.beginPath();
            ctx.ellipse(
                this.position.x,
                this.position.y,
                ((this.statistics.perception / this.statistics.range) / this.statistics.range) * Math.min(canvas.width, canvas.height) / 4,
                ((this.statistics.perception / this.statistics.range) / this.statistics.range) * Math.min(canvas.width, canvas.height) / 4,
                0,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -this.scale * Math.sqrt(3) / 3); // top
        ctx.lineTo(-this.scale / 4, this.scale * Math.sqrt(3) / 6); // bottom left
        ctx.lineTo(this.scale / 4, this.scale * Math.sqrt(3) / 6); // bottom right
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();

        if (debug) {
            if (this.target) {
                ctx.strokeStyle = '#f00';
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(this.target.position.x, this.target.position.y);
                ctx.stroke();

                const distance = this.position.distance(this.target.position);
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.fillText(distance.toFixed(2), 
                    (this.target.position.x + this.position.x) / 2 - 30,
                    (this.target.position.y + this.position.y) / 2 - 8,
                );
            }

            let verticalOffset = 0;
            for (const key in this.statistics) {
                ctx.fillStyle = COLORS[key];
                ctx.font = '16px Arial';
                ctx.fillText(this.statistics[key].toFixed(2), 
                    this.position.x + 30,
                    this.position.y + verticalOffset,
                );
                verticalOffset += 18;
            }

            ctx.font = '16px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(((Math.abs(this.velocity.x) + Math.abs(this.velocity.y)) / 2).toFixed(2), 
                this.position.x - 61,
                this.position.y,
            );
            ctx.fillStyle = '#f00';
            ctx.fillText(this.stamina.toFixed(2),
                this.position.x - 61,
                this.position.y + 18,
            );
            ctx.font = '20px Arial';
            ctx.fillText(this.generation, 
                this.position.x - 6,
                this.position.y - 20,
            );
        }
    }
    findFood() {
        if (this.foodDelay > 0) {
            this.foodDelay -= 0.01;
            return undefined;
        }
        let closest = undefined;
        let closestDistance = ((this.statistics.perception / this.statistics.range) / this.statistics.range) * Math.min(canvas.width, canvas.height) / 4;
        food.forEach((food) => {
            if (Math.random() > (this.statistics.perception * this.statistics.range * this.statistics.speed) / frameRate) return;
            const distance = this.position.distance(food.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = food;
            }
        });
        return closest;
    }
    getBest() {
        let best = undefined;
        for (const key in this.statistics) {
            if (!best || this.statistics[key] > this.statistics[best]) {
                best = key;
            }
        }
        return best;
    }
}
class Food extends Entity {
    constructor() {
        super();
        this.dead = false;
        this.scale = 8;
    }
}

//#region Setup
function init() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    birds = [];
    food = [];
    for (let i = 0; i < canvas.height * canvas.width / 200000; i++) {
        birds.push(new Bird());
        food.push(new Food());
    }
}

//#region Loop
let lastFrameTime = 0;
let frameRate = [];
function render(timestamp) {
    // if (timestamp - lastFrameTime >= 1000 / 120) {
    const delta = timestamp - lastFrameTime;
    frameRate.push(1000 / delta);
    frameRate = frameRate.slice(-100);
    lastFrameTime = timestamp;
    if (frameRate.length == 100 && !detectedDelta) detectedDelta = delta;
    draw(delta);
    for (let i = 0; i < 1; i++) {
        update(delta);
    }
    // }
    requestAnimationFrame(render);
    // render();
}
function draw(delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // game
    food.forEach((food) => {
        if(food) food.draw()
    });
    birds.forEach((bird) => {
        if(bird) bird.draw()
    });

    // ui
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    if (delta / detectedDelta > 1.5) ctx.fillStyle = '#f00';
    ctx.fillText(`FPS: ${Math.floor(frameRate.reduce((a, f) => a + f, 0) / frameRate.length)}`, 10, 30);
    ctx.fillStyle = '#000';
    ctx.fillText(`Birds: ${birds.length}`, 10, 60);
    ctx.fillText(`Avg Generation: ${
        Math.floor(birds.reduce((a, b) => a + b.generation, 0) / birds.length)
    }`, 10, 90);

    let verticalOffset = 120;
    for (const key in COLORS) {
        ctx.fillStyle = COLORS[key];
        ctx.fillText(`${
            key
        }: ${
            birds.filter((b) => b.getBest() == key).length
        } Avg: ${
            (birds.reduce((a, b) => a + b.statistics[key], 0) / birds.length).toFixed(2)
        }`, 10, verticalOffset);
        verticalOffset += 30;
    }
}
let paused = false;
document.addEventListener('keydown', (event) => {
    if (event.code == 'Space') {
        paused = !paused;
    } else if (event.code == 'KeyD') {
        debug = !debug;
    }
});
document.getElementById('debug').addEventListener('click', () => {
    debug = !debug;
});
document.getElementById('renderer').addEventListener('click', (e) => {
    let bird = new Bird();
    birds.push(bird);
    bird.position.x = e.clientX * 2;
    bird.position.y = e.clientY * 2;
});
function update(delta) {
    if (paused) return;
    birds.forEach((bird) => {
        if(bird) bird.update(delta)
    });
    food.forEach((food) => {
        if(food) food.update()
    });
}

init();
requestAnimationFrame(render);