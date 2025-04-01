//#region classes
class Ball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.scale = 20;
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

        if (!rings.length) return;
        let ring = rings[0];
        let distance = Math.sqrt(Math.pow(canvas.width / 2 - this.x, 2) + Math.pow(canvas.height / 2 - this.y, 2));
        if (distance + this.scale / 2 >= ring.radius) {
            const angle = Math.atan2(
                this.y - canvas.height / 2,
                this.x - canvas.width / 2
            );
            const ringEndAngle = 1.8 * Math.PI + ring.rotation;
            let gapStartAngle = ringEndAngle % (Math.PI * 2);
            let gapEndAngle = (2 * Math.PI + ring.rotation) % (Math.PI * 2);
            const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);

            if (
                (gapStartAngle < gapEndAngle &&
                normalizedAngle > gapStartAngle &&
                normalizedAngle < gapEndAngle) ||
                (gapStartAngle > gapEndAngle &&
                (normalizedAngle > gapStartAngle || normalizedAngle < gapEndAngle))
            ) {
                rings = rings.filter((r) => r != ring);
                texts.push(new Text(
                    `+${1}`,
                    this.x,
                    this.y - this.scale / 2
                ));
                score++;
            } else {
                let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = Math.cos(angle) * speed * -1;
                this.vy = Math.sin(angle) * speed * -1;
            }
        }
    }
}
class Ring {
    constructor(radius) {
        this.radius = radius;
        this.rotation = 0;
        this.rotationSpeed = 0.01;
        this.shrinkSpeed = 0.5;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            this.radius,
            this.rotation,
            1.8 * Math.PI + this.rotation
        );
        ctx.strokeStyle = '#900';
        ctx.stroke();
        ctx.closePath();
    }
    update() {
        this.radius = Math.max(1, this.radius - this.shrinkSpeed);
        this.rotation += this.rotationSpeed;
        this.rotation %= Math.PI * 2;
    }
}

class Text {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.scale = 20;
        this.color = 'red';
        this.font = '20px Arial';
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

//#region runtime
let balls, rings, texts, canvas, ctx, score;

function init() {
    rings = [];
    balls = [];
    texts = [];
    score = 0;
    canvas = document.getElementById('renderer');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    for (let i = 0; i < 10000; i++) {
        rings.push(new Ring(300 + 20 * i));
    }

    canvas.addEventListener('click', (e) => {
        balls.push(new Ball(e.clientX * 2, e.clientY * 2, 0, 0));
    });
}

function update() {
    for (let i = 0; i < balls.length; i++) {
        balls[i].update();
        for (let j = i + 1; j < balls.length; j++) {
            let dx = balls[i].x - balls[j].x;
            let dy = balls[i].y - balls[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < balls[i].scale / 2 + balls[j].scale / 2) {
                let angle = Math.atan2(dy, dx);
                let speed1 = Math.sqrt(balls[i].vx * balls[i].vx + balls[i].vy * balls[i].vy);
                let speed2 = Math.sqrt(balls[j].vx * balls[j].vx + balls[j].vy * balls[j].vy);

                let direction1 = Math.atan2(balls[i].vy, balls[i].vx);
                let direction2 = Math.atan2(balls[j].vy, balls[j].vx);

                let new_vx_i = speed2 * Math.cos(direction2 - angle);
                let new_vy_i = speed2 * Math.sin(direction2 - angle);
                let new_vx_j = speed1 * Math.cos(direction1 - angle);
                let new_vy_j = speed1 * Math.sin(direction1 - angle);

                balls[i].vx = new_vx_i * Math.cos(angle) - new_vy_i * Math.sin(angle);
                balls[i].vy = new_vx_i * Math.sin(angle) + new_vy_i * Math.cos(angle);
                balls[j].vx = new_vx_j * Math.cos(angle) - new_vy_j * Math.sin(angle);
                balls[j].vy = new_vx_j * Math.sin(angle) + new_vy_j * Math.cos(angle);
            }
        }
    }
    if (rings.length && rings[0].radius > Math.min(canvas.width, canvas.height) / 4) {
        rings.forEach(r => r.shrinkSpeed += rings[0].radius / Math.min(canvas.width, canvas.height) / 4);
        rings.forEach(r => r.rotationSpeed *= 1.01);
    } else {
        rings.forEach(r => r.shrinkSpeed = 0.5);
        rings.forEach(r => r.rotationSpeed = 0.01);
    }
    rings.forEach(r => r.update());
    texts.forEach(t => t.update());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '100px Arial';
    ctx.fillStyle = 'grey';
    let text = `${score} / 10000`;
    ctx.fillText(text, canvas.width / 2 - 25 * (text.length - 1), canvas.height / 2 + 50);

    balls.forEach(b => b.draw());
    rings.forEach(r => r.draw());
    texts.forEach(t => t.draw());

    requestAnimationFrame(update);
}

init();
update();
