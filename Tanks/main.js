class Object {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.sx = 0;
        this.sy = 0;
        this.health = 0;
        this.maxHealth = 0;
        this.angle = 0;
    }
    isColliding(object) {
        let colliding = true;
    
        let thisHalfWidth = this.sx / 2;
        let thisHalfHeight = this.sy / 2;
        let objectHalfWidth = object.sx / 2;
        let objectHalfHeight = object.sy / 2;
    
        let thisCenterX = this.x + thisHalfWidth;
        let thisCenterY = this.y + thisHalfHeight;
        let objectCenterX = object.x + objectHalfWidth;
        let objectCenterY = object.y + objectHalfHeight;
    
        let dx = thisCenterX - objectCenterX;
        let dy = thisCenterY - objectCenterY;

        let combinedHalfWidths = thisHalfWidth + objectHalfWidth;
        let combinedHalfHeights = thisHalfHeight + objectHalfHeight;
    
        if (Math.abs(dx) > combinedHalfWidths) {
            colliding = false;
        }
    
        if (Math.abs(dy) > combinedHalfHeights) {
            colliding = false;
        }
    
        return colliding;
    }
    damage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
    isDestroyed() {
        return this.health <= 0;
    }
    draw() {
        ctx.fillStyle = "green";
        ctx.fillRect(-this.sx / 2, -this.sy / 2, this.sx, this.sy);
    }
    update() {}
}
class Player extends Object {
    constructor() {
        super();
        this.health = 100;
        this.maxHealth = 100;
        this.sx = 20;
        this.sy = 20;
        this.speed = 1;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x - viewport.x + this.sx / 2, this.y - viewport.y + this.sy / 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = "grey";
        ctx.fillRect(-this.sx / 4, -this.sx / 4, this.sx, this.sy / 2);
        ctx.beginPath();
        ctx.arc(0, 0, this.sx / 2, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.sx / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
class Enemy extends Object {
    constructor() {
        super();
        let value = Math.random() * 10 + 10
        this.health = value;
        this.maxHealth = value;
        this.sx = value;
        this.sy = value;
        this.angle = Math.random() * 90;
    }
    damage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        this.sx = this.health;
        this.sy = this.health;
        this.x += amount / 2;
        this.y += amount / 2;
    }
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        this.sx = this.health;
        this.sy = this.health;
        this.x += amount / 2;
        this.y += amount / 2;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x - viewport.x + this.sx / 2, this.y - viewport.y + this.sy / 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = "red";
        ctx.fillRect(-this.sx / 2, -this.sy / 2, this.sx, this.sy);
        ctx.strokeStyle = "darkred";
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.sx / 2, -this.sy / 2, this.sx, this.sy);
        ctx.restore();
    }
}
class Projectile extends Object {
    constructor() {
        super();
        this.sx = 10 * (1 + prestige/10);
        this.sy = 10 * (1 + prestige/10);
        this.vx = 0;
        this.vy = 0;
        this.speed = 2 * (1 + prestige/10);
        this.health = 5 * (1 + prestige/10);
        this.maxHealth = 5 * (1 + prestige/10);
    }
    draw() {
        ctx.save();
        ctx.translate(this.x - viewport.x + this.sx / 2, this.y - viewport.y + this.sy / 2);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.sx / 2, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.sx / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    update() {
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
    }
}

// MARK: globals
let canvas, 
ctx, 
viewport, 
enemies, 
projectiles, 
player, 
xp,
mousePosition,
playerVelocity,
lastRender,
frameCount,
fps,
prestige;

// MARK: canvas init
function init() {
    canvas = document.getElementById('renderer');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    viewport = {"x": 0, "y": 0};
    enemies = [];
    projectiles = [];
    xp = 0;
    // if (location.href.includes('localhost') || location.href.includes('127.0.0.1')) {
    //     xp = 999999;
    // }
    mousePosition = {"x": 0, "y": 0};
    playerVelocity = {"left": 0, "up":0, "right":0, "down":0};
    lastRender = performance.now();
    frameCount = 0;
    fps = 0;
    prestige = 1;

    player = new Player();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    for (let i = 0; i < 500; i++) {
        let enemy = new Enemy();
        enemy.x = Math.random() * canvas.width * 4 - canvas.width * 2;
        enemy.y = Math.random() * canvas.height * 4 - canvas.height * 2;
        enemies.push(enemy);
    }

    document.addEventListener("mousemove",  (e) => {
        setMousePosition(e);
    });
    canvas.addEventListener("mousedown", (e) => {
        setMousePosition(e);
        shoot();
    });
    
    // moving keys
    document.addEventListener('keydown', function(event) {
        let speed = player.speed;
        if (event.shiftKey) speed *= 2;
        if (event.key == 'ArrowLeft') {
            playerVelocity.left = speed;
        } else if (event.key == 'ArrowRight') {
            playerVelocity.right = speed;
        } else if (event.key == 'ArrowUp') {
            playerVelocity.up = speed;
        } else if (event.key == 'ArrowDown') {
            playerVelocity.down = speed;
        } else if (event.key == 'w') {
            playerVelocity.up = speed;
        } else if (event.key == 'a') {
            playerVelocity.left = speed;
        } else if (event.key =='s') {
            playerVelocity.down = speed;
        } else if (event.key == 'd') {
            playerVelocity.right = speed;
        }
    });
    document.addEventListener('keyup', function(event) {
        if (event.key == 'ArrowLeft') {
            playerVelocity.left = 0;
        } else if (event.key == 'ArrowRight') {
            playerVelocity.right = 0;
        } else if (event.key == 'ArrowUp') {
            playerVelocity.up = 0;
        } else if (event.key == 'ArrowDown') {
            playerVelocity.down = 0;
        } else if (event.key == 'w') {
            playerVelocity.up = 0;
        } else if (event.key == 'a') {
            playerVelocity.left = 0;
        } else if (event.key =='s') {
            playerVelocity.down = 0;
        } else if (event.key == 'd') {
            playerVelocity.right = 0;
        }
    });
}

function getLevel(xp) {
    return xp < 50 ? 1 : 1 + Math.floor(Math.log(xp / 50) / Math.log(1.5));
}

function shoot() {
    let level = getLevel(xp);
    console.log(level);

    if (level == 1) {
        let projectile = new Projectile();
        projectile.x = player.x + player.sx/4;
        projectile.y = player.y + player.sy/4;
        
        let angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
        projectile.vx = Math.cos(angle);
        projectile.vy = Math.sin(angle);
    
        projectiles.push(projectile);
    } else {
        for (let i = 0; i < level; i++) {
            let angleOffset = (i - (level - 1) / 2) * (Math.PI / 4) / (level - 1);
            let projectile = new Projectile();
            projectile.x = player.x + player.sx / 4;
            projectile.y = player.y + player.sy / 4;
    
            let angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x) + angleOffset;
            projectile.vx = Math.cos(angle);
            projectile.vy = Math.sin(angle);
    
            projectiles.push(projectile);
        }
    }

}

// MARK: movement
function setMousePosition(e) {
    mousePosition.x = e.clientX + viewport.x;
    mousePosition.y = e.clientY + viewport.y;

    player.angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
}

function updateUI() {
    const now = performance.now();
    const delta = now - lastRender;
    frameCount++;
    if (delta >= 1000) {
        fps = frameCount * (1000 / delta);
        frameCount = 0;
        lastRender = now;
    }
    document.getElementById("fps").innerText = `fps: ${Math.floor(fps)}`;
    document.getElementById("xp").innerText = `xp: ${Math.floor(xp)}`;
    document.getElementById("level").innerText = `level: ${Math.floor(getLevel(xp))}`;
}

// MARK: loop
function render() {
    // move player
    player.x += playerVelocity.right - playerVelocity.left;
    player.y += playerVelocity.down - playerVelocity.up;
    player.x = Math.min(Math.max(player.x, -canvas.width * 2), canvas.width * 2);
    player.y = Math.min(Math.max(player.y, -canvas.height * 2), canvas.height * 2);

    if (player.x < viewport.x + 100) {
        viewport.x = player.x - 101;
    } else if (player.x > canvas.width + viewport.x - 200) {
        viewport.x = player.x + 201 - canvas.width;
    }
    if (player.y < viewport.y + 100) {
        viewport.y = player.y - 101;
    } else if (player.y > canvas.height + viewport.y - 200) {
        viewport.y = player.y + 201 - canvas.height;
    }

    // move projectiles
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
    }

    // projectile - enemy collision
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        for (let j = 0; j < enemies.length; j++) {
            let enemy = enemies[j];
            if (projectile.isColliding(enemy)) {
                projectile.damage(projectile.maxHealth);
                enemy.damage(projectile.maxHealth);
            }
        }
    }

    // enemy death
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (enemy.isDestroyed()) {
            xp += enemy.maxHealth;
            enemies.splice(i, 1);
        }
    }

    // projectile "death"
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        if (projectile.isDestroyed()) {
            projectiles.splice(i, 1);
        }
        if (projectile.x < viewport.x - projectile.sx || projectile.x > viewport.x + canvas.width || 
            projectile.y < viewport.y - projectile.sy || projectile.y > viewport.y + canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    if (getLevel(xp) > 10) {
        xp = 0;
        prestige++;
        for (let i = 0; i < 500; i++) {
            let enemy = new Enemy();
            enemy.x = Math.random() * canvas.width * 4 - canvas.width * 2;
            enemy.y = Math.random() * canvas.height * 4 - canvas.height * 2;
            enemy.sx *= 1 + prestige/10;
            enemy.sy *= 1 + prestige/10;
            enemy.health *= 1 + prestige/10;
            enemy.maxHealth *= 1 + prestige/10;
            enemies.push(enemy);
        }
    }

    // draw entities
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].draw();
    }
    
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }

    player.draw();

    updateUI();
    requestAnimationFrame(render);
}

// MARK: run
init();
render();