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
        this.reward = 100;
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
        this.fireRate = 5; // 1 per 5 seconds
        this.firePower = 5;
        this.projectileCount = 2000;
        this.type = "pulse";
    }
}
class RailgunTurret extends Turret {
    constructor() {
        super();
        this.fireRate = 5; // 1 per 5 seconds
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
class UIElement extends Object {
    constructor() {
        super();
    }
}
class Button extends UIElement {
    constructor(text) {
        super();
        this.sx = 50;
        this.sy = 50;
        this.text = text;
        this.top = "";
        this.bottom = "";
        this.callback = () => {};
        this.off = () => {};
    }
    click() {
        this.callback();
    }
    unclick() {
        this.off();
    }
    isClicked(x, y) {
        if (x > this.x && x < this.x + this.sx && y > this.y && y < this.y + this.sy) {
            return true;
        }
        return false;
    }
    draw() {
        ctx.fillStyle = "#999999";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.sx, this.sy, [4]);
        ctx.fill();

        ctx.font = `bold ${this.sx / 2}px sans-serif`;
        ctx.fillStyle = 'black';
        ctx.fillText(this.text, this.x + this.sx / 3, this.y + this.sy / 1.5);

        ctx.font = "12px sans-serif";
        ctx.fillText(this.top, this.x, this.y - 4);
        ctx.fillText(this.bottom, this.x, this.y + this.sy + 12);
    }
}
class IconButton extends Button {
    constructor(icon) {
        super();
        this.sprite = new Image();
        this.sprite.src = icon;
    }
    draw() {
        ctx.fillStyle = "#999999";
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
        ctx.drawImage(this.sprite, this.x, this.y, this.sx, this.sy);
    }
}
class Icon extends UIElement {
    constructor(icon) {
        super();
        this.sprite = new Image();
        this.sprite.src = icon;
    }
    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.sx, this.sy);
    }
}
class StatBar extends UIElement {
    constructor(max, current) {
        super();
        this.maxValue = max;
        this.value = current;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.value / this.maxValue * this.sx, this.sy);
        ctx.font = `${this.sy * 1.5}px Arial`;
        ctx.fillStyle = 'black';
        ctx.fillText(this.value, this.x, this.y - this.sy/2);
    }
}
class Fighter extends Enemy {
    constructor() {
        super();
        this.sy *= 1.5;
        this.maxHealth *= 2;
        this.health *= 2;
    }
}


const canvas = document.getElementById('renderer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.imageSmoothingEnabled = false;
const ctx = canvas.getContext('2d');
let viewport = {"x": 0, "y": 0};

let enemies = [];
let fighters = [];
let healthPacks = [];
let projectiles = [];
let turrets = [];
let currency = 10;
let kills = 0;

function createNewEnemy() {
    let enemy = new Enemy();
    let rate = Math.round(Math.sqrt(Math.pow(viewport.x, 2) + Math.pow(viewport.y, 2)) / 1000) + 1;
    let rand = Math.random() * rate;
    if (rand > 1) {
        enemy.speed += rate / 10;
        enemy.health += enemy.health * rate / 10;
        enemy.maxHealth = enemy.health;
        enemy.sx += Math.min(100, enemy.sx * rate / 10);
        enemy.sy += Math.min(100, enemy.sy * rate / 10);
        enemy.reward += enemy.reward * rate / 10;
    }

    if (Math.random() < 1/(10 * enemies.length) && rate > 5) {
        enemy = new Boss();
        enemy.health *= rate;
        enemy.maxHealth *= rate;
        enemy.reward *= rate;
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
function createTurret(num) {
    if (num == 2) {
        if (currency >= 100) {
            let turret = new ShotgunTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 100;
        }
    } else if (num == 1) {
        if (currency >= 50) {
            let turret = new Turret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 50;
        }
    } else if (num == 3) {
        if (currency >= 150) {
            let turret = new CannonTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 150;
        }
    } else if (num == 4) {
        if (currency >= 500) {
            let turret = new SpamTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 500;
        }
    } else if (num == 5) {
        if (currency >= 800) {
            let turret = new SpiderTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 800;
        }
    } else if (num == 6) {
        if (currency >= 1500) {
            let turret = new PulseTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 1500;
        }
    } else if (num == 7) {
        if (currency >= 1500) {
            let turret = new RailgunTurret();
            turret.x = player.x + player.sx/2 - turret.sx/2;
            turret.y = player.y + player.sy/2 - turret.sy/2;

            turrets.push(turret);
            currency -= 1500;
        }
    }
}
function buyEnemy() {
    if (currency >= 20) {
        let enemy = createNewEnemy();
        enemies.push(enemy);
        currency -= 20;
    }
}
function shoot() {
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
}

let player = new Player();
player.x = canvas.width / 2;
player.y = canvas.height / 2;
player.sx = 10;
player.sy = 20;
player.speed = 5;

let playerHealthBar = new StatBar(player.maxHealth, player.health);
playerHealthBar.x = 50;
playerHealthBar.y = canvas.height - 270;
playerHealthBar.sx = 100;
playerHealthBar.sy = 10;

let mousePosition = {"x": 0, "y": 0};

let playerVelocity = {"left": 0, "up":0, "right":0, "down":0};

let lastRender = performance.now();
let frameCount = 0;
let fps = 0;

let currencySprite = new Icon("sprites/currency.png");
let enemySprite = new Icon("sprites/enemy.png");
let turretSprite = new Icon("sprites/turret.png");
currencySprite.x = 50;
currencySprite.y = canvas.height - 160;
currencySprite.sx = 30;
currencySprite.sy = 30;
enemySprite.x = 50;
enemySprite.y = canvas.height - 200;
enemySprite.sx = 30;
enemySprite.sy = 30;
turretSprite.x = 50;
turretSprite.y = canvas.height - 240;
turretSprite.sx = 30;
turretSprite.sy = 30;

let menuButtons = [];
for (i = 0; i < 8; i++) {
    let menuButton = new Button((i+1).toString());
    if (i == 7) {
        menuButton.text = "+";
        menuButton.callback = () => {
            buyEnemy();
        }
    } else {
        menuButton.callback = (function(index) {
            return function() {
                createTurret(index + 1);
            }
        })(i);
    }
    menuButton.x = 50 + i * 60;
    menuButton.y = canvas.height - 100;
    menuButtons.push(menuButton);
}
menuButtons[0].top = "Turret";
menuButtons[1].top = "Shotgun";
menuButtons[2].top = "Cannon";
menuButtons[3].top = "Spam";
menuButtons[4].top = "Spider";
menuButtons[5].top = "Pulse";
menuButtons[6].top = "Railgun";
menuButtons[7].top = "Spawn";
menuButtons[0].bottom = "$50";
menuButtons[1].bottom = "$100";
menuButtons[2].bottom = "$150";
menuButtons[3].bottom = "$500";
menuButtons[4].bottom = "$800";
menuButtons[5].bottom = "$1500";
menuButtons[6].bottom = "$1500";
menuButtons[7].bottom = "$20";

// if on mobile
let mobileButtons = [];
if (( 'ontouchstart' in window ) || 
    ( navigator.maxTouchPoints > 0 ) || 
    ( navigator.msMaxTouchPoints > 0 )) {
    // mobile UI
    const upButton = new Button("^");
    const downButton = new Button("v");
    const leftButton = new Button("<");
    const rightButton = new Button(">");
    const stopButton = new Button("x");
    mobileButtons = [upButton, downButton, leftButton, rightButton, stopButton];
    for (let i = 0; i < mobileButtons.length; i++) {
        mobileButtons[i].y = canvas.height - 160;
    }
    upButton.x = canvas.width - 160;
    upButton.y -= 60;
    downButton.y += 60;
    downButton.x = canvas.width - 160;
    leftButton.x = canvas.width - 220;
    rightButton.x = canvas.width - 100;
    stopButton.x = canvas.width - 160;

    upButton.callback = () => {
        playerVelocity.up = player.speed;
        playerVelocity.down = 0;
    };
    upButton.off = () => {
        playerVelocity.up = 0;
    };
    downButton.callback = () => {
        playerVelocity.down = player.speed;
        playerVelocity.up = 0;
    };
    downButton.off = () => {
        playerVelocity.down = 0;
    };
    leftButton.callback = () => {
        playerVelocity.left = player.speed;
        playerVelocity.right = 0;
    };
    leftButton.off = () => {
        playerVelocity.left = 0;
    };
    rightButton.callback = () => {
        playerVelocity.right = player.speed;
        playerVelocity.left = 0;
    };
    rightButton.off = () => {
        playerVelocity.right = 0;
    };
    stopButton.callback = () => {
        playerVelocity.left = 0;
        playerVelocity.right = 0;
        playerVelocity.up = 0;
        playerVelocity.down = 0;
    };
}

for (let i = 0; i < 5; i++) {
    let enemy = createNewEnemy();
    enemies.push(enemy);
}

for (let i = 0; i < 5; i++) {
    let healthPack = new Entity();
    healthPack.x = Math.random() * canvas.width + viewport.x;
    healthPack.y = Math.random() * canvas.height + viewport.y;
    healthPack.sx = 15;
    healthPack.sy = 15;
    healthPacks.push(healthPack);
}

function setMousePosition(e) {
    mousePosition.x = e.clientX + viewport.x;
    mousePosition.y = e.clientY + viewport.y;
}
function handleClick(e) {
    let clickedButton = false;
    for (let i = 0; i < menuButtons.length; i++) {
        const button = menuButtons[i];
        if (button.isClicked(e.clientX, e.clientY)) {
            button.click();
            clickedButton = true;
            break;
        }
    }
    for (let i = 0; i < mobileButtons.length; i++) {
        const button = mobileButtons[i];
        if (button.isClicked(e.clientX, e.clientY)) {
            button.click();
            clickedButton = true;
            break;
        }
    }
    if (!clickedButton) {
        shoot();
    }
}
document.addEventListener("mousemove",  (e) => {
    setMousePosition(e);
});
document.addEventListener("touchmove",  (e) => {
    setMousePosition(e);
});
document.addEventListener("mousedown", (e) => {
    setMousePosition(e);
    handleClick(e);
});
document.addEventListener("touchstart", (e) => {
    setMousePosition(e);
    handleClick(e);
});
document.addEventListener("touchend", function(e) {
    for (let i = 0; i < mobileButtons.length; i++) {
        if (mobileButtons[i].isClicked(e.changedTouches[0].clientX, e.changedTouches[0].clientY)) {
            mobileButtons[i].unclick();
        }
    }
});

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
    if (event.key == '=' || event.key == '+') {
        buyEnemy();
    } else if (event.key == ']') {
        localStorage.setItem('data', JSON.stringify({
            "enemies": enemies,
            "healthPacks": healthPacks,
            "projectiles": projectiles,
            "turrets": turrets,
            "player": player,
            "viewport": viewport,
            "mousePosition": mousePosition,
            "playerVelocity": playerVelocity,
            "currency": currency,
            "kills": kills,
            "fighters": fighters
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

        fighters = [];
        for (let i = 0; i < data.fighters.length; i++) {
            let newFighter = new Fighter();
            newFighter.x = data.fighters[i].x;
            newFighter.y = data.fighters[i].y;
            newFighter.health = data.fighters[i].health;
            newFighter.maxHealth = data.fighters[i].maxHealth;
            newFighter.speed = data.fighters[i].speed;
            newFighter.sx = data.fighters[i].sx;
            newFighter.sy = data.fighters[i].sy;
            newFighter.projectileCount = data.fighters[i].projectileCount;
            fighters.push(newFighter);
        }

        kills = data.kills;
        currency = data.currency;
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

    } else if (['1', '2', '3', '4', '5', '6', '7'].includes(event.key)) {
        createTurret(parseInt(event.key));
    }
});

function drawScene() {
    let chunkSize = 20;
    let chunkCountX = canvas.width / chunkSize;
    let chunkCountY = canvas.height / chunkSize;
    for (let x = 0; x < chunkCountX; x++) {
        for (let y = 0; y < chunkCountY; y++) {
            let chunkPositionX = chunkSize * x + viewport.x;
            let chunkPositionY = chunkSize * y + viewport.y;

            let distanceFromCenter = Math.sqrt(Math.pow(chunkPositionX - canvas.width / 2, 2) + Math.pow(chunkPositionY - canvas.height / 2, 2)) / 20;

            const white = [255, 255, 255];
            const red = [255, 20, 20];
            const black = [0, 0, 0];

            let t = Math.min(distanceFromCenter / (canvas.width / 2), 1);

            let r = white[0] * (1 - t) + red[0] * t;
            let g = white[1] * (1 - t) + red[1] * t;
            let b = white[2] * (1 - t) + red[2] * t;

            if (distanceFromCenter > canvas.width / 2) {
                t = Math.min((distanceFromCenter - canvas.width / 2) / (canvas.width / 2), 1);
                r = red[0] * (1 - t) + black[0] * t;
                g = red[1] * (1 - t) + black[1] * t;
                b = red[2] * (1 - t) + black[2] * t;
            }

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(chunkPositionX - viewport.x, chunkPositionY - viewport.y, chunkSize, chunkSize);
        }
    }
}

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
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);

    menuButtons.forEach((button) => {
        button.draw();
    });
    mobileButtons.forEach((button) => {
        button.draw();
    });
    currencySprite.draw();
    enemySprite.draw();
    turretSprite.draw();
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(currency, 90, canvas.height - 138);
    ctx.fillText(`${enemies.length} & ${fighters.length}  (${kills} kills)`, 90, canvas.height - 178);
    ctx.fillText(turrets.length, 90, canvas.height - 218);
    
    playerHealthBar.value = player.health;
    playerHealthBar.maxValue = player.maxHealth;
    playerHealthBar.draw();
}

function render() {
    // move entities towards player
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].moveTowards(player.x, player.y);
    }
    for (let i = 0; i < fighters.length; i++) {
        // find closest turret
        let closestTurret = null;
        let closestDistance = Infinity;
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            let distance = Math.sqrt(Math.pow(turret.x - fighters[i].x, 2) + Math.pow(turret.y - fighters[i].y, 2));
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTurret = turret;
            }
        }
        if (closestTurret) {
            fighters[i].moveTowards(closestTurret.x, closestTurret.y);
        }
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
        // if in viewport
        if (turret.x > viewport.x - 20 && turret.x < viewport.x + canvas.width + 40 &&
            turret.y > viewport.y - 20 && turret.y < viewport.y + canvas.height + 40) {

            // check turret fireRate and increment LastFire
            let now = performance.now();
            if (now - turret.lastFire >= turret.fireRate * 1000) {

                let closestEnemy = null;
                let closestDistance = Infinity;
                if (turret.type == "spider" || turret.type == "pulse") {
                    closestEnemy = new Enemy(turret.x, turret.y);
                } else if (turret.type == "spam") {
                    for (let j = 0; j < enemies.length; j++) {
                        let enemy = enemies[j];
                        let distance = Math.sqrt(Math.pow(enemy.x - turret.x, 2) + Math.pow(enemy.y - turret.y, 2));
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                } else {
                    for (let j = 0; j < enemies.length; j++) {
                        let enemy = enemies[j];
                        let distance = Math.sqrt(Math.pow(enemy.x - turret.x, 2) + Math.pow(enemy.y - turret.y, 2));
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                }
                
                if (closestEnemy != null) {
                    let projectileList = turret.shootAt(closestEnemy.x, closestEnemy.y);
                    for (let j = 0; j < projectileList.length; j++) {
                        projectiles.push(projectileList[j]);
                    }
                    turret.lastFire = now;
                    // maybe make fighters
                    if (Math.random() < 1/200) {
                        let fighter = new Fighter();
                        let newEnemy = createNewEnemy();
                        fighter.x = newEnemy.x;
                        fighter.y = newEnemy.y;
                        fighters.push(fighter);
                    }
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
    for (let i = 0; i < fighters.length; i++) {
        let fighter = fighters[i];
        if (player.isColliding(fighter)) {
            player.damage(fighter.reward);
            fighters.splice(i, 1);
        }
        for (let j = 0; j < turrets.length; j++) {
            let turret = turrets[j];
            if (fighter.isColliding(turret)) {
                turret.damage(fighter.health);
                fighter.damage(turret.maxHealth);
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
        for (let j = 0; j < fighters.length; j++) {
            let fighter = fighters[j];
            if (projectile.isColliding(fighter)) {
                projectile.damage(fighter.health);
                fighter.damage(projectile.maxHealth);
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
            kills++;
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
    
    for (let i = 0; i < fighters.length; i++) {
        let fighter = fighters[i];
        if (fighter.isDestroyed()) {
            fighters.splice(i, 1);
            kills++;
        } else if (fighter.x < viewport.x - 20) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        } else if (fighter.x > canvas.width + viewport.x + 40) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        }
        if (fighter.y < viewport.y - 20) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        } else if (fighter.y > canvas.height + viewport.y + 40) {
            let newEnemy = createNewEnemy();
            fighter.x = newEnemy.x;
            fighter.y = newEnemy.y;
        }
    }

    // draw entities
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw scene
    drawScene();

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
    for (let i = 0; i < fighters.length; i++) {
        ctx.fillRect(fighters[i].x - viewport.x, fighters[i].y - viewport.y, fighters[i].sx, fighters[i].sy);
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
        let healthBar = new StatBar(enemy.maxHealth, enemy.health);
        healthBar.x = enemy.x - viewport.x;
        healthBar.y = enemy.y - viewport.y - 10;
        healthBar.sx = enemy.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    for (let i = 0; i < fighters.length; i++) {
        let enemy = fighters[i];
        let healthBar = new StatBar(enemy.maxHealth, enemy.health);
        healthBar.x = enemy.x - viewport.x;
        healthBar.y = enemy.y - viewport.y - 10;
        healthBar.sx = enemy.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    for (let i = 0; i < turrets.length; i++) {
        let turret = turrets[i];
        let healthBar = new StatBar(turret.maxHealth, turret.health);
        healthBar.x = turret.x - viewport.x;
        healthBar.y = turret.y - viewport.y - 10;
        healthBar.sx = turret.sx;
        healthBar.sy = 5;
        healthBar.draw();
    }

    drawUI();
    requestAnimationFrame(render);
}
render();