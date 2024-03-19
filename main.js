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
        this.health = 10000;
        this.maxHealth = 10000;
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
            if (this.type == "railgun") {
                projectile.sx = 10;
                projectile.sy = 10;
            }
            
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
class SpiderTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 1; // 1 per second
        this.projectileCount = 79;
        this.type = "spider";
    }
}
class PulseTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 5; // 1 per second
        this.firePower = 5;
        this.projectileCount = 2000;
        this.type = "pulse";
    }
}
class RailgunTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 5; // 1 per second
        this.firePower = 1000;
        this.projectileCount = 1;
        this.type = "railgun";
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


const canvas = document.getElementById('renderer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let viewport = {"x": 0, "y": 0};

function createNewEnemy() {
    let enemy = new Enemy();
    let rate = Math.round(((Math.abs(viewport.x) / canvas.width) + (Math.abs(viewport.y) / canvas.height)) / 2) + 1;

    for (let index = 0; index < 5; index++) {
        if (Math.random() > 0.8) {
            enemy.speed = 3 + rate/10;
            enemy.health = Math.round(Math.min(1000, enemy.health * 2) * (rate+1));
            enemy.maxHealth = Math.round(Math.min(1000, enemy.maxHealth * 2) * (rate+1));
            enemy.sx = Math.min(100, enemy.sx * 2);
            enemy.sy = Math.min(100, enemy.sy * 2);
            enemy.reward *= 2 + Math.round(rate*30);
        } else {
            break;
        }
    }

    if (Math.random() > 0.995 - rate / 100) {
        enemy = new Boss();
        enemy.health *= rate;
        enemy.maxHealth *= rate;
        enemy.reward *= Math.max(1, rate / 2);
    }

    let choice = Math.floor(Math.random() * 4);
    if (choice == 0) {
        enemy.x = Math.random() * canvas.width + viewport.x;
        enemy.y = canvas.height + viewport.y + enemy.sy * 2;
    } else if (choice == 1) {
        enemy.x = Math.random() * canvas.width + viewport.x;
        enemy.y = -enemy.sy * 2;
    } else if (choice == 2) {
        enemy.x = canvas.width + viewport.x + enemy.sx * 2;
        enemy.y = Math.random() * canvas.height + viewport.y;
    } else if (choice == 3) {
        enemy.x = -enemy.sx * 2;
        enemy.y = Math.random() * canvas.height + viewport.y;
    }

    return enemy;
}

let player = new Player();
player.x = canvas.width / 2;
player.y = canvas.height / 2;
player.sx = 10;
player.sy = 20;
player.speed = 5;

let enemies = [];
for (let i = 0; i < 5; i++) {
    let enemy = createNewEnemy();
    enemies.push(enemy);
}

let healthPacks = [];
for (let i = 0; i < 5; i++) {
    let healthPack = new Entity();
    healthPack.x = Math.random() * canvas.width + viewport.x;
    healthPack.y = Math.random() * canvas.height + viewport.y;
    healthPack.sx = 15;
    healthPack.sy = 15;
    healthPacks.push(healthPack);
}

let projectiles = [];
let turrets = [];

let mousePosition = {"x": 0, "y": 0};
document.addEventListener("mousemove",  (e) => {
    mousePosition.x = e.clientX + viewport.x;
    mousePosition.y = e.clientY + viewport.y;
});
let playerVelocity = {"left": 0, "up":0, "right":0, "down":0};
// moving keys
document.addEventListener('keydown', function(event) {
    if (event.key == 'ArrowLeft') {
        playerVelocity.left = player.speed;
    } else if (event.key == 'ArrowRight') {
        playerVelocity.right = player.speed;
    } else if (event.key == 'ArrowUp') {
        playerVelocity.up = player.speed;
    } else if (event.key == 'ArrowDown') {
        playerVelocity.down = player.speed;
    } else if (event.key == 'w') {
        playerVelocity.up = player.speed;
    } else if (event.key == 'a') {
        playerVelocity.left = player.speed;
    } else if (event.key =='s') {
        playerVelocity.down = player.speed;
    } else if (event.key == 'd') {
        playerVelocity.right = player.speed;
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

document.addEventListener('keydown', function(event) {
    if (event.key == ' ') {
        if (currency >= 1) {
            let projectile = new Projectile();
            projectile.x = player.x + player.sx/2;
            projectile.y = player.y + player.sy/2;
            projectile.sx = 2;
            projectile.sy = 2;
            
            let angle = Math.atan2(mousePosition.y - player.y, mousePosition.x - player.x);
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
    } else if (event.key == ']') {
        localStorage.setItem('data', JSON.stringify({
            "enemies": enemies,
            "healthPacks": healthPacks,
            "projectiles": projectiles,
            "turrets": turrets,
            "player": player,
            "viewport": viewport,
            "mousePosition": mousePosition,
            "playerVelocity": playerVelocity
        }));
    } else if (event.key == '[') {
        let data = localStorage.getItem('data');
        data = JSON.parse(data);
        enemies = [];
        for (let i = 0; i < data.enemies.length; i++) {
            let newEnemy = new Enemy();
            newEnemy.x = data.enemies[i].x;
            newEnemy.y = data.enemies[i].y;
            newEnemy.health = data.enemies[i].health;
            newEnemy.maxHealth = data.enemies[i].maxHealth;
            newEnemy.reward = data.enemies[i].reward;
            newEnemy.speed = data.enemies[i].speed;
            newEnemy.sx = data.enemies[i].sx;
            newEnemy.sy = data.enemies[i].sy;
            enemies.push(newEnemy);
        }
        healthPacks = [];
        for (let i = 0; i < data.healthPacks.length; i++) {
            let newHealthPack = new Entity();
            newHealthPack.x = data.healthPacks[i].x;
            newHealthPack.y = data.healthPacks[i].y;
            newHealthPack.sx = data.healthPacks[i].sx;
            newHealthPack.sy = data.healthPacks[i].sy;
            healthPacks.push(newHealthPack);
        }
        projectiles = [];
        for (let i = 0; i < data.projectiles.length; i++) {
            let newProjectile = new Projectile();
            newProjectile.x = data.projectiles[i].x;
            newProjectile.y = data.projectiles[i].y;
            newProjectile.sx = data.projectiles[i].sx;
            newProjectile.sy = data.projectiles[i].sy;
            newProjectile.vx = data.projectiles[i].vx;
            newProjectile.vy = data.projectiles[i].vy;
            newProjectile.health = data.projectiles[i].health;
            newProjectile.maxHealth = data.projectiles[i].maxHealth;
            newProjectile.speed = data.projectiles[i].speed;
            projectiles.push(newProjectile);
        }
        turrets = [];
        for (let i = 0; i < data.turrets.length; i++) {
            let newTurret;
            if (data.turrets[i].type == "turret") {
                newTurret = new Turret();
            } else if (data.turrets[i].type == "shotgun") {
                newTurret = new ShotgunTurret();
            } else if (data.turrets[i].type == "cannon") {
                newTurret = new CannonTurret();
            } else if (data.turrets[i].type == "spam") {
                newTurret = new SpamTurret();
            } else if (data.turrets[i].type == "spider") {
                newTurret = new SpiderTurret();
            } else if (data.turrets[i].type == "pulse") {
                newTurret = new PulseTurret();
            } else if (data.turrets[i].type == "railgun") {
                newTurret = new RailgunTurret();
            }
            newTurret.x = data.turrets[i].x;
            newTurret.y = data.turrets[i].y;
            newTurret.health = data.turrets[i].health;
            newTurret.maxHealth = data.turrets[i].maxHealth;
            newTurret.firePower = data.turrets[i].firePower;
            newTurret.fireRate = data.turrets[i].fireRate;
            newTurret.lastFire = data.turrets[i].lastFire;
            newTurret.projectileCount = data.turrets[i].projectileCount;
            turrets.push(newTurret);
        }

        viewport.x = data.viewport.x;
        viewport.y = data.viewport.y;
        viewport.width = data.viewport.width;
        viewport.height = data.viewport.height;
        mousePosition.x = data.mousePosition.x;
        mousePosition.y = data.mousePosition.y;
        playerVelocity = data.playerVelocity;
        player.x = data.player.x;
        player.y = data.player.y;
        player.sx = data.player.sx;
        player.sy = data.player.sy;
        player.health = data.player.health;
        player.maxHealth = data.player.maxHealth;
        player.speed = data.player.speed;

    } else if (event.key == '2') {
        if (currency >= 100) {
            let turret = new ShotgunTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 100;
        }
    } else if (event.key == '1') {
        if (currency >= 50) {
            let turret = new Turret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 50;
        }
    } else if (event.key == '3') {
        if (currency >= 150) {
            let turret = new CannonTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 150;
        }
    } else if (event.key == '4') {
        if (currency >= 500) {
            let turret = new SpamTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 500;
        }
    } else if (event.key == '5') {
        if (currency >= 800) {
            let turret = new SpiderTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 800;
        }
    } else if (event.key == '6') {
        if (currency >= 1500) {
            let turret = new PulseTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 1500;
        }
    } else if (event.key == '7') {
        if (currency >= 1500) {
            let turret = new RailgunTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 1500;
        }
    
    }
});

let currency = 10;
let lastRender = performance.now();
let frameCount = 0;
let fps = 0;
function drawUI() {
    // ctx.strokeStyle = 'black';
    // ctx.strokeRect(viewport.x, viewport.y, canvas.width + viewport.x, canvas.height + viewport.y);
    // ctx.strokeStyle = 'green';
    // ctx.strokeRect(viewport.x + 100, viewport.y + 100, canvas.width + viewport.x - 200, canvas.height + viewport.y - 200);
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
    
    ctx.fillText("[Space] Fire Bullet ($1)", 10, 110);
    ctx.fillText("[+/=] Spawn Enemy ($20)", 10, 125);
    ctx.fillText("[1] Place Turret ($50)", 10, 140);
    ctx.fillText("[2] Place Shotgun Turret ($100)", 10, 155);
    ctx.fillText("[3] Place Cannon Turret ($150)", 10, 170);
    ctx.fillText("[4] Place Spam Turret ($500)", 10, 185);
    ctx.fillText("[5] Place Spider Turret ($800)", 10, 200);
    ctx.fillText("[6] Place Pulse Turret ($1500)", 10, 215);
    ctx.fillText("[7] Place Railgun Turret ($1500)", 10, 230);
}

function render() {
    // move entities towards player
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].moveTowards(player.x, player.y);
    }

    // move player
    player.x += playerVelocity.right - playerVelocity.left;
    player.y += playerVelocity.down - playerVelocity.up;

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
        let projectile = projectiles[i];
        projectile.x += projectile.vx * projectile.speed;
        projectile.y += projectile.vy * projectile.speed;
    }

    // shoot closest enemy with turrets
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        let closestEnemy;
        // if in viewport
        if (turret.x > viewport.x - 20 && turret.x < viewport.x + canvas.width + 40 &&
            turret.y > viewport.y - 20 && turret.y < viewport.y + canvas.height + 40) {
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
            healthPack.x = Math.random() * canvas.width + viewport.x;
            healthPack.y = Math.random() * canvas.height + viewport.y;
        }
    }

    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        for (let j = 0; j < enemies.length; j++) {
            let enemy = enemies[j];
            if (projectile.isColliding(enemy)) {
                projectile.damage(enemy.health);
                enemy.damage(projectile.maxHealth);
            }
        }
    }

    // check deaths
    if (player.isDestroyed()) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.health = player.maxHealth;
        currency = 0;
        viewport = {"x": 0, "y": 0};
    }

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (enemy.isDestroyed()) {
            currency += enemy.reward;
            enemies.splice(i, 1);
            let newEnemy = createNewEnemy();
            enemies.push(newEnemy);
        }
        if (enemies[i].x < viewport.x - 20) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        } else if (enemies[i].x > canvas.width + viewport.x + 40) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        }
        if (enemies[i].y < viewport.y - 20) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        } else if (enemies[i].y > canvas.height + viewport.y + 40) {
            let newEnemy = createNewEnemy();
            enemies[i].x = newEnemy.x;
            enemies[i].y = newEnemy.y;
        }
    }

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

    for (let i = 0; i < healthPacks.length; i++) {
        let healthPack = healthPacks[i];
        if (healthPack.x < viewport.x - healthPack.sx || healthPack.x > viewport.x + canvas.width || 
            healthPack.y < viewport.y - healthPack.sy || healthPack.y > viewport.y + canvas.height) {
            healthPack.x = Math.random() * canvas.width + viewport.x;
            healthPack.y = Math.random() * canvas.height + viewport.y;
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
    ctx.fillRect(player.x - viewport.x, player.y - viewport.y, player.sx, player.sy);

    ctx.fillStyle = 'green';
    for (let i = 0; i < healthPacks.length; i++) {
        ctx.fillRect(healthPacks[i].x - viewport.x, healthPacks[i].y - viewport.y, healthPacks[i].sx, healthPacks[i].sy);
    }

    ctx.fillStyle = 'red';
    for (let i = 0; i < enemies.length; i++) {
        ctx.fillRect(enemies[i].x - viewport.x, enemies[i].y - viewport.y, enemies[i].sx, enemies[i].sy);
    }

    ctx.fillStyle = 'black';
    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        ctx.fillRect(turret.x - viewport.x, turret.y - viewport.y, turret.sx, turret.sy);
    }

    // draw projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let projectile = projectiles[i];
        ctx.fillStyle ='red';
        ctx.fillRect(projectile.x - viewport.x, projectile.y - viewport.y, projectile.sx, projectile.sy);
    }

    // draw health bars
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x - viewport.x, enemy.y - viewport.y - 10, enemy.sx, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x - viewport.x, enemy.y - viewport.y - 10, enemy.health / enemy.maxHealth * enemy.sx, 5);
        ctx.font = '8px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(enemy.health, enemy.x - viewport.x, enemy.y - viewport.y - 12);
    }
    
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - viewport.x, player.y - viewport.y - 10, player.sx, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x - viewport.x, player.y - viewport.y - 10, player.health / player.maxHealth * player.sx, 5);

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        ctx.fillStyle ='red';
        ctx.fillRect(turret.x - viewport.x, turret.y - viewport.y - 10, turret.sx, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(turret.x - viewport.x, turret.y - viewport.y - 10, turret.health / turret.maxHealth * turret.sx, 5);
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