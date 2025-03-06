//#region classes
class Player {
    constructor() {
        this.x = window.innerWidth / 2;
        this.y = 0;
        this.scale = 150;
        this.angle = 0;
        this.loaded = 1;
        this.sprite = new Image();
        this.sprite.src = 'sprites/player.png';
    }
    draw() {
        this.drawAim();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(this.sprite, -this.scale / 2, -this.scale / 2, this.scale, this.scale);
        ctx.restore();

        if (this.loaded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.fillStyle = '#090';
            ctx.fill();
            ctx.closePath();
        }
    }
    fire() {
        if (!this.loaded) return;
        this.loaded--;
        let vx = Math.cos(this.angle * Math.PI / 180) * 15;
        let vy = Math.sin(this.angle * Math.PI / 180) * 15;
        balls.push(new Ball(this.x, this.y, vx, vy));

        if (location.href.includes('cheats')) {
            for (let i = 0; i < 20; i++) {
                this.angle++;
                let vx = Math.cos(this.angle * Math.PI / 180) * 15;
                let vy = Math.sin(this.angle * Math.PI / 180) * 15;
                balls.push(new Ball(this.x, this.y, vx, vy));
            }
            this.angle -= 20;
        }
    }
    drawAim() {
        let vx = Math.cos(this.angle * Math.PI / 180) * 15;
        let vy = Math.sin(this.angle * Math.PI / 180) * 15;
        let x = this.x;
        let y = this.y;
        ctx.strokeStyle = '#f009';
        for (let i = 0; i < 20; i++) {
            ctx.lineWidth = 5 * (10 / i);
            ctx.beginPath();
            ctx.moveTo(x, y);
            x += vx;
            y += vy;
            vy += 0.3;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        }
    }
}

class Ball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.scale = 20;
        this.hits = [];
        this.invincible = false;
        this.multiplier = 1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.scale / 2 - 5, 0, Math.PI * 2);
        ctx.fillStyle = '#555';
        ctx.strokeStyle = '#000';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;

        // walls
        if (this.x + this.scale / 2 >= window.innerWidth) {
            this.x = window.innerWidth - this.scale /  2;
            this.vx = -this.vx;
        }
        if (this.x - this.scale / 2 <= 0) {
            this.x = this.scale / 2;
            this.vx = -this.vx;
        }
        if (this.y + this.scale / 2 >= window.innerHeight) {
            if (goal.isTouching(this)) {
                texts.push(new Text(
                    `+${this.multiplier * 500 * this.hits.length}`,
                    this.x,
                    this.y - this.scale / 2 - 15
                ));
                score += this.multiplier * 500 * this.hits.length;
                player.loaded++;
            }

            if (this.invincible) {
                this.y = window.innerHeight - this.scale / 2
                this.vy = -this.vy;
            } else {
                balls = balls.filter(b => b !== this);
                pegs = pegs.filter(
                    peg => !this.hits.includes(peg)
                );
                return;
            }
        }
        if (this.y - this.scale / 2 <= 0) {
            this.y = this.scale / 2;
            this.vy = -this.vy;
        }

        // pegs
        for (let peg of pegs) {
            if (
                Math.abs(this.x - peg.x) < this.scale / 2 &&
                Math.abs(this.y - peg.y) < this.scale / 2
            ) {
                const distance = Math.abs(
                    Math.sqrt(
                        Math.pow(this.x - peg.x, 2) +
                        Math.pow(this.y - peg.y, 2)
                    )
                );
                if (distance < peg.scale / 2 + this.scale / 2) {
                    const angle = Math.atan2(
                        this.y - peg.y,
                        this.x - peg.x
                    ) * 180 / Math.PI;
                    this.vx = Math.cos(angle * Math.PI / 180) * 10;
                    this.vy = Math.sin(angle * Math.PI / 180) * 10;
                }

                if (!peg.active) {
                    peg.activate(this);
                    this.hits.push(peg);
                    texts.push(new Text(
                        `+${this.multiplier * 100 * this.hits.length}`,
                        this.x,
                        this.y - this.scale / 2 - 15
                    ));
                    score += this.multiplier * 100 * this.hits.length;
                }
                break;
            }
        }
    }
}

const specials = {
    'clone': ['#099', '#0ff'],
    'ball': ['#090', '#0f0'],
    'explode': ['#950', '#f90'],
    'boost': ['#509', '#90f'],
    'big': ['#050', '#090'],
    'score': ['#990', '#ff0'],
    'invincible': ['#999', '#fff']
};
class Peg {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = false;
        this.scale = 30;
        this.special = undefined;
        if (Math.random() < 0.25) {
            this.special = Object.keys(specials)[Math.floor(Math.random() * Object.keys(specials).length)];
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.scale / 2 - 5, 0, Math.PI * 2);
        ctx.fillStyle = (this.special ? specials[this.special] : ['#555', '#999'])[this.active ? 1 : 0];
        ctx.strokeStyle = '#000';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    activate(ball) {
        if (this.active) return;
        this.active = true;
        if (this.special) texts.push(new Text(
            `${this.special}!`,
            this.x,
            this.y - this.scale / 2
        ));
        switch (this.special) {
            case 'clone':
                balls.push(new Ball(this.x, this.y, Math.random() * 2 - 1, Math.random() * 2 - 1));
                break;
            case 'ball':
                player.loaded++;
                break;
            case 'explode':
                pegs.forEach(peg => {
                    if (peg == this) return;
                    const distance = Math.abs(
                        Math.sqrt(
                            Math.pow(this.x - peg.x, 2) +
                            Math.pow(this.y - peg.y, 2)
                        )
                    );
                    if (distance < 100) {
                        peg.activate(ball);
                    }
                });
                break;
            case 'boost':
                ball.vx *= 10;
                ball.vy *= 10;
                break;
            case 'big':
                ball.scale = 40;
                break;
            case 'score':
                ball.multiplier *= 10;
                break;
            case 'invincible':
                ball.invincible = true;
                setTimeout(() => {
                    ball ? ball.invincible = false : {};
                }, 10000);
                break;
            default:
                break;
        }
    }
}

class Text {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.scale = 20;
        this.color = 'red';
        this.font = '10px Arial';
        this.frames = 60;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y);
    }
    update() {
        this.frames--;
        if (this.frames <= 0) {
            texts = texts.filter(text => text!== this);
        }
    }
}

class Goal {
    constructor() {
        this.x = 0;
        this.y = window.innerHeight;
        this.direction = 1;
    }
    update() {
        this.x += this.direction * 5;
        if (this.x < 0) {
            this.direction = 1;
        } else if (this.x > window.innerWidth) {
            this.direction = -1;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y - 20, 300, 20);
        ctx.fillStyle = '#0b0';
        ctx.fill();
        ctx.closePath();
    }
    isTouching(ball) {
        return (
            ball.x + ball.scale / 2 >= this.x &&
            ball.x - ball.scale / 2 <= this.x + 300 &&
            ball.y + ball.scale / 2 >= this.y - 20 &&
            ball.y - ball.scale / 2 <= this.y
        );
    }
}

//#region runtime
let player, balls, pegs, canvas, ctx, score, goal;

function init() {
    pegs = [];
    texts = [];
    balls = [];
    score = 0;
    goal = new Goal();
    player = new Player();
    canvas = document.getElementById('renderer');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gridSize = 65;
    // for (let i = 0; i < 1000; i++) {
    //     let peg = new Peg(
    //         Math.random() * (canvas.width - 20) + 10,
    //         Math.random() * (canvas.height - gridSize * 2) + gridSize
    //     );
    //     pegs.push(peg);
    // }
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height - gridSize * 2; y += gridSize) {
            let peg = new Peg(x + gridSize / 2, y + gridSize / 2);
            pegs.push(peg);
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;
        player.angle = Math.atan2(y - player.y, x - player.x) * 180 / Math.PI;
    });

    canvas.addEventListener('mousedown', (e) => {
        player.fire();
    });
}

function update() {
    if (balls.length == 0) {
        pegs = pegs.filter(p => !p.active);
    }
    if (balls.length == 0 && !player.loaded) {
        alert(`Game over! Your final score: ${score}.`);
        init();
    }
    balls.forEach(b => b.update());
    texts.forEach(t => t.update());
    goal.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pegs.forEach(p => p.draw());
    balls.forEach(b => b.draw());
    texts.forEach(t => t.draw());
    player.draw();
    goal.draw();

    // UI
    ctx.fillStyle = '#000';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(update);
}

init();
update();