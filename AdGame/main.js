//#region classes
class Object {
    constructor(position) {
        this.position = position;
        this.sprite = new Image();
        this.sprite.src = "assets/error.png";
        this.size = { x: 0, y: 0 };
    }
    isColliding(object) {
        if (this.position.x <= object.position.x + object.size.x &&
            this.position.x + this.size.x >= object.position.x &&
            this.position.y <= object.position.y + object.size.y &&
            this.position.y + this.size.y >= object.position.y) {
            return true;
        }
        return false;
    }
    draw() {
        ctx.drawImage(this.sprite, this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y);
    }
}

class Projectile extends Object {
    constructor(position) {
        super(position);
        this.sprite.src = "assets/projectile.png";
        this.size.x = 15;
        this.size.y = 15;
        this.dy = 3;
        this.dx = 0;
        this.dx += Math.random() * 0.2 - 0.1;
        this.dy += Math.random() * 0.2 - 0.1;
        this.passedGates = [];
    }
    update() {
        this.position.y += this.dy;
        this.position.x += this.dx;
        if (this.position.y > renderer.height) {
            this.position = {...gunner.position}
            this.dy = 0;
            this.dx = 3;
            // this.dx = Math.random() * 2 - 1;
            // this.dy = Math.random() * 2 - 1;
            // this.passedGates = [];
        }
        if (this.position.x > renderer.width * 1.5) { //TODO: change to be instant and separated based on direction
            objects.splice(objects.indexOf(this), 1);
            projectiles.splice(projectiles.indexOf(this), 1);
            ui.points++;
        }
    }
};

class Player extends Object {
    constructor(position) {
        super(position);
        this.sprite.src = "assets/player.png";
        this.size.x = 20;
        this.size.y = 20;
    }
    update() {
        this.position.x = mouse.x
    }
};

class Enemy extends Object {
    constructor(position) {
        super(position);
        this.sprite.src = "assets/enemy.png";
        this.size.x = 15;
        this.size.y = 20;
        this.speed = -0.5;
        this.health = 10;
    }
    hit() {
        this.health -= 1;
        if (this.health <= 0) {
            objects.splice(objects.indexOf(this), 1);
            enemies.splice(enemies.indexOf(this), 1);
            ui.kills++;
        }
    }
    update() {
        this.position.x += this.speed;
    }
};

class Gunner extends Object {
    constructor(position) {
        super(position);
        this.sprite.src = "assets/player.png";
        this.size.x = 20;
        this.size.y = 20;
        this.health = 10;
    }
    hit() {
        this.health -= 1;
        if (this.health <= 0) {
            location.reload(); //TODO:
        }
    }
    update() {
        
    }
};

class Gate extends Object {
    constructor(position) {
        super(position);
        this.multiplier = Math.floor(Math.random() * 8) + 2;
        this.multiplier = this.multiplier % 2 == 0 && Math.random() > 0.5 ? 0 : this.multiplier;
        this.speed = Math.random() * 10;
        this.dx = Math.random() * 0.2 - 0.1;
        this.size.x = 40;
        this.size.y = 12;
    }
    update() {
        this.position.x += this.speed * this.dx;
        if (this.position.x < 0 || this.position.x > renderer.width) {
            this.dx *= -1;
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.multiplier == 0 ? '#f88' : '#8f8';
        ctx.fillRect(this.position.x - this.size.y / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y);
        ctx.fillStyle = '#000';
        ctx.font = `${this.size.y}px Arial`;
        ctx.fillText(this.multiplier == 0 ? ':3' : "x"+this.multiplier, this.position.x + this.size.x / 5, this.position.y + this.size.y / 2 - 1);
    }
};

class UI extends Object {
    constructor(position) {
        super(position);
        this.kills = 0;
        this.points = 0;
        this.shots = 0;
        this.multiplies = 0;
    }
    draw(ctx) {
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(`Kills: ${this.kills}`, 10, 30);
        ctx.fillText(`Points: ${this.points}`, 10, 50);
        ctx.fillText(`Health: ${gunner.health}`, 10, 70);
        ctx.fillText(`Shots: ${this.shots}`, 10, 90);
        ctx.fillText(`Multiplies: ${this.multiplies}`, 10, 110);
    }
}

//#region init
let gates = [];
let enemies = [];
let projectiles = [];
let objects = [];

const HEIGHT = 0.80;

const renderer = document.getElementById('renderer');
const ctx = renderer.getContext('2d');
ctx.imageSmoothingEnabled = false;

renderer.width = window.innerWidth;
renderer.height = window.innerHeight;

let mouse = { x: renderer.width / 2, y: 0 };
let player = new Player({ x: renderer.width / 2, y: renderer.height * (1 - HEIGHT) + 10 });
let gunner = new Gunner({ x: 0.1 * renderer.width, y: renderer.height * (1 - HEIGHT)/2 });
let ui = new UI({ x: 0, y: 0 });

function init() {
    events();
    
    for (let i = 0; i < 15; i++) {
        let position = {
            x: Math.random() * renderer.width,
            y: Math.random() * renderer.height * HEIGHT + (1 - HEIGHT) * renderer.height + 20
        };
        let gate = new Gate(position);
        gates.push(gate);
        objects.push(gate);
    }

    setInterval(()=>{
        let projectile = new Projectile({ x: mouse.x, y: renderer.height * (1 - HEIGHT) + 10 });
        projectiles.push(projectile);
        objects.push(projectile);
        ui.shots++;
    }, 400);
    let enemyDelay = 500;
    setInterval(()=>{
        let enemy = new Enemy({ x: 1.1 * renderer.width, y: renderer.height * (1 - HEIGHT)/2 });
        enemies.push(enemy);
        objects.push(enemy);
        // enemyDelay = Math.max(800, Math.min(enemyDelay + Math.random() * 200 - 100, 1300));
    }, enemyDelay);
}

function events() {
    renderer.addEventListener('mousemove', e=>{
        e.preventDefault();
        setMousePosition(e);
    });
    renderer.addEventListener('touchstart', e=>{
        e.preventDefault();
        setMousePosition(e.touches[0]);
    });
    renderer.addEventListener('touchmove', e=>{
        e.preventDefault();
        setMousePosition(e.changedTouches[0]);
    });
}

//#region update
function update() {
    objects.forEach(e=>{e.update()});
    player.update();
    gunner.update();

    projectiles.forEach(projectile => {
        gates.forEach(gate => {
            if (projectile.isColliding(gate) && !projectile.passedGates.includes(gate)) {
                let multiplier = gate.multiplier - 1;
                if (multiplier == -1) {
                    objects.splice(objects.indexOf(projectile), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                } else {
                    ui.multiplies += multiplier;
                    for (let i = 0; i < multiplier; i++) {
                        let newPosition = {
                            x: projectile.position.x + Math.random() * projectile.size.x - projectile.size.x / 2,
                            y: projectile.position.y + Math.random() * projectile.size.y - projectile.size.y / 2
                        };
                        let newProjectile = new Projectile(newPosition);
                        newProjectile.dx += Math.random() * 0.2 - 0.1;
                        newProjectile.dy += Math.random() * 0.2 - 0.1;
                        projectiles.push(newProjectile);
                        objects.push(newProjectile);
                        projectile.passedGates.push(gate);
                        newProjectile.passedGates = [...projectile.passedGates];
                    }
                }
            }
        });

        if (enemies.length !== 0 && projectile.isColliding(enemies[0])) {
            objects.splice(objects.indexOf(projectile), 1);
            projectiles.splice(projectiles.indexOf(projectile), 1);
            enemies[0].hit();
        }
    });

    if (enemies.length !== 0 && gunner.isColliding(enemies[0])) {
        gunner.hit();
        objects.splice(objects.indexOf(enemies[0]), 1);
        enemies.splice(0, 1);
    }

    ctx.clearRect(0, 0, renderer.width, renderer.height);
    draw();
    requestAnimationFrame(update);
}

function draw() {
    objects.forEach(e=>{e.draw(ctx)});
    player.draw(ctx);
    gunner.draw(ctx);
    ui.draw(ctx);
}

function setMousePosition(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

init();
update();