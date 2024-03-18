class Object {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.sx = 0;
        this.sy = 0;
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
}
class Entity extends Object {
    constructor() {
        super();
        this.health = 0;
        this.maxHealth = 0;
        this.speed = 0;
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
    moveTowards(x, y) {
        let dx = this.x - x;
        let dy = this.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        if (distance > 0) {
            this.x -= Math.cos(angle) * this.speed;
            this.y -= Math.sin(angle) * this.speed;
        }
    }
}
class Player extends Entity {
    constructor() {
        super();
        this.health = 100;
        this.maxHealth = 100;
    }
}
class Enemy extends Entity {
    constructor() {
        super();
        this.health = 50;
        this.maxHealth = 50;
        this.reward = 10;
        this.sx = 10;
        this.sy = 20;
        this.speed = 0.5;
    }
}
class Boss extends Enemy {
    constructor() {
        super();
        this.health = 5000;
        this.maxHealth = 5000;
        this.reward = 1000;
        this.sx = 150;
        this.sy = 200;
        this.speed = 0.1;
    }
}
class Projectile extends Entity {
    constructor() {
        super();
        this.health = 10;
        this.maxHealth = 10;
        this.speed = 10;
        this.vx = 0;
        this.vy = 0;
    }
}
class Turret extends Entity {
    constructor() {
        super();
        this.sx = 20;
        this.sy = 20;
        this.health = 200;
        this.maxHealth = 200;
        this.firePower = 10;
        this.fireRate = 0.5;
        this.lastFire = 0.00;
        this.projectileCount = 1;
        this.type = "turret";
    }
    shootAt(x, y) {
        let projectiles = [];
        for (let i = 0; i < this.projectileCount; i++) {
            let projectile = new Projectile();
            projectile.maxHealth = this.firePower;
            projectile.health = projectile.firePower;

            projectile.x = this.x + this.sx/2;
            projectile.y = this.y + this.sy/2;
            projectile.sx = this.firePower/5;
            projectile.sy = this.firePower/5;
            
            let angle = Math.atan2(y - this.y, x - this.x) + i / Math.PI / 4;
            projectile.vx = Math.cos(angle);
            projectile.vy = Math.sin(angle);

            projectiles.push(projectile);
        }
        return projectiles;
    }
}
class ShotgunTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 1; // 1 per second
        this.projectileCount = 3;
        this.type = "shotgun";
    }
}
class CannonTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 3; // 1 per 3 seconds
        this.firePower = 100;
        this.type = "cannon";
    }
}
class SpamTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 0.01; // 10 per second
        this.type = "spam";
    }

}

function createNewEnemy() {
    let enemy = new Enemy();

    for (let index = 0; index < 5; index++) {
        if (Math.random() > 0.8) {
            enemy.speed = 3;
            enemy.health = Math.min(1000, enemy.health * 2);
            enemy.maxHealth = Math.min(1000, enemy.maxHealth * 2);
            enemy.sx = Math.min(100, enemy.sx * 2);
            enemy.sy = Math.min(100, enemy.sy * 2);
            enemy.reward *= 2;
        } else {
            break;
        }
    }

    if (Math.random() > 0.995) {
        enemy = new Boss();
    }

    let choice = Math.floor(Math.random() * 4);
    if (choice == 0) {
        enemy.x = Math.random() * canvas.width;
        enemy.y = canvas.height + enemy.sy * 2;
    } else if (choice == 1) {
        enemy.x = Math.random() * canvas.width;
        enemy.y = -enemy.sy * 2;
    } else if (choice == 2) {
        enemy.x = canvas.width + enemy.sx * 2;
        enemy.y = Math.random() * canvas.height;
    } else if (choice == 3) {
        enemy.x = -enemy.sx * 2;
        enemy.y = Math.random() * canvas.height;
    }

    return enemy;
}

const canvas = document.getElementById('renderer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const player = new Player();
player.x = canvas.width / 2;
player.y = canvas.height / 2;
player.sx = 10;
player.sy = 20;
player.speed = 5;

const enemies = [];
for (let i = 0; i < 5; i++) {
    let enemy = createNewEnemy();
    enemies.push(enemy);
}

const healthPacks = [];
for (let i = 0; i < 5; i++) {
    let healthPack = new Entity();
    healthPack.x = Math.random() * canvas.width;
    healthPack.y = Math.random() * canvas.height;
    healthPack.sx = 15;
    healthPack.sy = 15;
    healthPacks.push(healthPack);
}

const projectiles = [];
const turrets = [];

let movingTo = {"isMoving": false, "x": player.x, "y":player.y};
document.addEventListener('mousedown', function(event) {
    movingTo.isMoving = true;
    movingTo.x = event.clientX;
    movingTo.y = event.clientY;
});

document.addEventListener('mousemove', function(event) {
    movingTo.x = event.clientX;
    movingTo.y = event.clientY;
});

document.addEventListener('mouseup', function(event) {
    movingTo.isMoving = false;
    movingTo.x = player.x;
    movingTo.y = player.y;
});

document.addEventListener('keydown', function(event) {
    if (event.key == ' ') {
        if (currency >= 1) {
            let projectile = new Projectile();
            projectile.x = player.x + player.sx/2;
            projectile.y = player.y + player.sy/2;
            projectile.sx = 2;
            projectile.sy = 2;
            
            let angle = Math.atan2(movingTo.y - player.y, movingTo.x - player.x);
            projectile.vx = Math.cos(angle);
            projectile.vy = Math.sin(angle);
    
            projectiles.push(projectile);
            currency -= 1;
        }
    } else if (event.key == '=' || event.key == '+') {
        if (currency >= 20) {
            let enemy = createNewEnemy();
            enemies.push(enemy);
            currency -= 20;
        }
    } else if (event.key == '2') {
        if (currency >= 100) {
            let turret = new ShotgunTurret();
            turret.x = player.x + player.sx/2;
            turret.y = player.y + player.sy/2;

            turrets.push(turret);
            currency -= 100;
        }
    } else if (event.key == '1') {
        if (currency >= 50) {
            let turret = new Turret();
            turret.x = player.x + player.sx/2;
            turret.y = player.y + player.sy/2;

            turrets.push(turret);
            currency -= 50;
        }
    } else if (event.key == '3') {
        if (currency >= 150) {
            let turret = new CannonTurret();
            turret.x = player.x + player.sx/2;
            turret.y = player.y + player.sy/2;

            turrets.push(turret);
            currency -= 150;
        }
    } else if (event.key == '4') {
        if (currency >= 500) {
            let turret = new SpamTurret();
            turret.x = player.x + player.sx/2;
            turret.y = player.y + player.sy/2;

            turrets.push(turret);
            currency -= 500;
        }
    } 
});

let currency = 10;
let lastRender = performance.now();
let frameCount = 0;
let fps = 0;
function drawUI() {
    const now = performance.now();
    const delta = now - lastRender;
    frameCount++;
    if (delta >= 1000) {
        fps = frameCount * (1000 / delta);
        frameCount = 0;
        lastRender = now;
    }
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Coins: ${Math.round(currency*100)/100}`, 10, 80);
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 35);
    ctx.fillText(`Turrets: ${turrets.length}`, 10, 50);
    ctx.fillText(`Projectiles: ${projectiles.length}`, 10, 65);

    ctx.fillText("[1] Place Turret ($50)", 10, 110);
    ctx.fillText("[2] Place Shotgun Turret ($100)", 10, 125);
    ctx.fillText("[3] Place Cannon Turret ($150)", 10, 140);
    ctx.fillText("[4] Place Spam Turret ($500)", 10, 155);
    ctx.fillText("[Space] Fire Bullet ($1)", 10, 170);
    ctx.fillText("[+/=] Spawn Enemy ($20)", 10, 185);

    ctx.fillText("Kill = +$10", 10, 215);
    ctx.fillText("Bigger enemy, bigger reward", 10, 230);
}

function render() {
    // move entities towards player
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].moveTowards(player.x, player.y);
    }

    // move player
    if (movingTo.isMoving) {
        player.moveTowards(movingTo.x, movingTo.y);
    }

    // move projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        projectile.x += projectile.vx * projectile.speed;
        projectile.y += projectile.vy * projectile.speed;
    }

    // shoot closest enemy with turrets
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        let closestEnemy;
        for (let j = 0; j < enemies.length; j++) {
            closestEnemy = enemies[j];
            let distance = Math.sqrt(Math.pow(closestEnemy.x - turret.x, 2) + Math.pow(closestEnemy.y - turret.y, 2));
            for (let k = 0; k < enemies.length; k++) {
                let enemy = enemies[k];
                let newDistance = Math.sqrt(Math.pow(enemy.x - turret.x, 2) + Math.pow(enemy.y - turret.y, 2));
                if (newDistance < distance) {
                    closestEnemy = enemy;
                    distance = newDistance;
                }
            }
        }
        if (closestEnemy) {
            // check turret fireRate and increment LastFire
            let now = performance.now();
            if (now - turret.lastFire >= turret.fireRate * 1000) {
                let projectileList = turret.shootAt(closestEnemy.x, closestEnemy.y);
                for (let j = 0; j < projectileList.length; j++) {
                    projectiles.push(projectileList[j]);
                }
                turret.lastFire = now;
            }
        }
    }

    // check collisions
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (player.isColliding(enemy)) {
            player.damage(enemy.reward);
            enemies[i] = createNewEnemy();
        }
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            if (enemy.isColliding(turret)) {
                turret.damage(enemy.health);
                enemy.damage(turret.maxHealth);
            }
        }
    }

    for (let i = 0; i < healthPacks.length; i++) {
        let healthPack = healthPacks[i];
        if (player.isColliding(healthPack)) {
            player.heal(10);
            currency += 5;
            healthPack.x = Math.random() * canvas.width;
            healthPack.y = Math.random() * canvas.height;
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        for (let j = 0; j < enemies.length; j++) {
            let enemy = enemies[j];
            if (projectile.isColliding(enemy)) {
                enemy.damage(projectile.maxHealth);
                projectile.damage(enemy.health);
            }
        }
    }

    // check deaths
    if (player.isDestroyed()) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.health = player.maxHealth;
        movingTo.isMoving = false;
        currency = 0;
    }

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (enemy.isDestroyed()) {
            currency += enemy.reward;
            enemies.splice(i, 1);
            let newEnemy = createNewEnemy();
            enemies.push(newEnemy);
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        if (projectile.isDestroyed()) {
            projectiles.splice(i, 1);
        }
        if (projectile.x < 0 - projectile.sx || projectile.x > canvas.width || 
            projectile.y < 0 - projectile.sy || projectile.y > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        if (turret.isDestroyed()) {
            turrets.splice(i, 1);
        }
    }

    // draw entities
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.sx, player.sy);

    ctx.fillStyle = 'green';
    for (let i = 0; i < healthPacks.length; i++) {
        ctx.fillRect(healthPacks[i].x, healthPacks[i].y, healthPacks[i].sx, healthPacks[i].sy);
    }

    ctx.fillStyle = 'red';
    for (let i = 0; i < enemies.length; i++) {
        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].sx, enemies[i].sy);
    }

    ctx.fillStyle = 'black';
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        ctx.fillRect(turret.x, turret.y, turret.sx, turret.sy);
    }

    // draw projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        ctx.fillStyle ='red';
        ctx.fillRect(projectile.x, projectile.y, projectile.sx, projectile.sy);
    }

    // draw health bars
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.sx, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.health / enemy.maxHealth * enemy.sx, 5);
        ctx.font = '8px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(enemy.health, enemy.x, enemy.y - 12);
    }
    
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, player.sx, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y - 10, player.health / player.maxHealth * player.sx, 5);

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        ctx.fillStyle ='red';
        ctx.fillRect(turret.x, turret.y - 10, turret.sx, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(turret.x, turret.y - 10, turret.health / turret.maxHealth * turret.sx, 5);
    }

    // main health bar
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, player.health / player.maxHealth * canvas.width, 5);
    ctx.fillStyle ='red';
    ctx.fillRect(0, 0, player.health / player.maxHealth * canvas.width, 5);

    drawUI();
    requestAnimationFrame(render);
}
render();