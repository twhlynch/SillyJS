class Chicken {
    constructor(type = 'Chicken') {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.name = type;
        this.isEgg = true;
        this.eggCoolDown = 20 * 1000;
        this.age = 0;
        this.type = type;
        this.sprite = new Image();
        this.eggSprite = new Image();
        this.glow = new Image();
        this.glow.src = 'sprites/glow.png';
        this.sprite.src = 'sprites/' + this.name + '.png';
        this.eggSprite.src = 'sprites/' + this.name + '_egg.png';
        this.sx = 25;
        this.sy = 25;
        this.level = 1;
        this.target = { x: this.x, y: this.y };
    }

    draw(ctx) {
        if (this.isEgg) {
            ctx.drawImage(this.eggSprite, this.x - this.sx / 2, this.y - this.sy / 2, this.sx, this.sy);

            // draw timer
            let timer = Math.floor((10000 - this.age) / 100) / 10;
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText(timer, this.x - this.sx / 2 + 5, this.y - this.sy / 2 - 4);

        } else {
            // glow based on level
            ctx.globalAlpha = -0.1 + (0.1 * this.level);
            ctx.drawImage(this.glow, this.x - this.sx / 2 - (this.sx / 10), this.y - this.sy / 2 - (this.sy / 10), this.sx + (this.sx / 5), this.sy + (this.sy / 5)); 
            ctx.globalAlpha = 1;

            // draw sprite
            ctx.drawImage(this.sprite, this.x - this.sx / 2, this.y - this.sy / 2, this.sx, this.sy);

            // draw level
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText('Lvl ' + this.level, this.x - this.sx / 2 + 5, this.y - this.sy / 2 - 4);
        }
    }

    update(delta) {
        // age
        this.age += delta;
        this.eggCoolDown -= delta;
        if (this.age > 10 * 1000) {
            this.hatch();
        }

        // movement
        if (!this.isEgg && current !== this) {
            this.x += (this.target.x - this.x) * 0.005;
            this.y += (this.target.y - this.y) * 0.005;
            if (Math.abs(this.x - this.target.x) < 10 && Math.abs(this.y - this.target.y) < 10) {
                this.target.x = Math.random() * canvas.width;
                this.target.y = Math.random() * canvas.height;
            }
        }
    }

    layEgg() {
        if (!this.isEgg && this.canLayEgg()) {
            let egg = new Chicken(this.type);
            egg.x = this.x;
            egg.y = this.y;
            chickens.push(egg);
            this.eggCoolDown = 10 * 1000;
        }
    }

    canLayEgg() {
        return this.eggCoolDown <= 0;
    }

    hatch() {
        this.isEgg = false;
    }

    isPointInside(x, y) {
        return this.x - this.sx / 2 < x && x < this.x + this.sx / 2 && this.y - this.sy / 2 < y && y < this.y + this.sy / 2;
    }

    levelUp() {
        this.level++;
        this.sx *= 1 + ((0.1 * this.level) - 0.1);
        this.sy *= 1 + ((0.1 * this.level) - 0.1);
    }
}

function createBasicChicken() {
    chickens.push(new Chicken());
}

let chickens, time, delta, canvas, ctx, current;

function init() {
    chickens = [];
    time = performance.now();
    delta = 0;
    canvas = document.getElementById('renderer');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 10; i++) {
        createBasicChicken();
    }

    let dragging = false;
    canvas.addEventListener('mousemove', (e) => {
        let x = e.clientX - canvas.offsetLeft;
        let y = e.clientY - canvas.offsetTop;

        if (current) {
            current.x = e.clientX - canvas.offsetLeft;
            current.y = e.clientY - canvas.offsetTop;
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        let x = e.clientX - canvas.offsetLeft;
        let y = e.clientY - canvas.offsetTop;
        
        for (let c of chickens) {
            if (c.isPointInside(x, y)) {
                c.layEgg();
                current = c;
                break;
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (current) {
            for (let c of chickens) {
                if (c !== current && c.isPointInside(current.x, current.y) && c.level == current.level && !c.isEgg && !current.isEgg) {
                    current.levelUp();
                    chickens.splice(chickens.indexOf(c), 1);
                    break;
                }
            }
        }
        current = undefined;
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let now = performance.now();
    delta = now - time;
    time = now;

    chickens.forEach((c) => {
        c.draw(ctx);
        c.update(delta);
    });

    requestAnimationFrame(render);
}

init();
render();