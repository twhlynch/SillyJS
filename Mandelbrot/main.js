
// renderer
const renderer = document.getElementById('renderer');
const ctx = renderer.getContext('2d');
let scale = parseFloat(document.getElementById('scale').value);
let imageData = new ImageData(renderer.width, renderer.height);

// globals
let zoom = 1;
let panX = 0;
let panY = 0;
let rendering = false;

// #region mandelbrot
let maxIterations = parseInt(document.getElementById('quality').value);
const escapeRadius = 2;
function mandelbrot(x, y) {
	let a = 0;
	let b = 0;
	let iterations = 0;

	while (iterations < maxIterations && a * a + b * b <= escapeRadius * escapeRadius) {
		let a_temp = a * a - b * b + x;
		b = 2 * a * b + y;
		a = a_temp;
		iterations++;
	}

	return iterations;
}

function getRGB(h) {
	let r, g, b;
	let s = 0.75;
	let v = 0.5

	let _i, _f, _p, _q, _t;
	_i = Math.floor(h * 6);
	_f = h * 6 - _i;
	_p = v * (1 - s);
	_q = v * (1 - _f * s);
	_t = v * (1 - (1 - _f) * s);
	switch (_i % 6) {
		case 0: r = v, g = _t, b = _p; break;
		case 1: r = _q, g = v, b = _p; break;
		case 2: r = _p, g = v, b = _t; break;
		case 3: r = _p, g = _q, b = v; break;
		case 4: r = _t, g = _p, b = v; break;
		case 5: r = v, g = _p, b = _q; break;
	}

	return { r: r * 255, g: g * 255, b: b * 255 };
}

function drawMandelbrot() {
	ctx.clearRect(0, 0, renderer.width, renderer.height);
	ctx.putImageData(imageData, 0, 0);

	const x1 = panX - 1.5 / zoom;
	const x2 = panX + 1.5 / zoom;
	const y1 = panY - 1 / zoom;
	const y2 = panY + 1 / zoom;

	const stepX = (x2 - x1) / renderer.width;
	const stepY = (y2 - y1) / renderer.height;

	for (let i = 0; i < renderer.width; i++) {
		for (let j = 0; j < renderer.height; j++) {
			const x = x1 + i * stepX;
			const y = y1 + j * stepY;
			const index = (i + j * renderer.width) * 4;

			const iterations = mandelbrot(x, y);

			if (iterations === maxIterations) {
				imageData.data.set(
					[ 0, 0, 0, 255 ], 
					index
				);
			} else {
				const { r, g, b } = getRGB((iterations / maxIterations) * 255/360);
				imageData.data.set(
					[ r, g, b, 255 ], 
					index
				);
			}
		}
	}
}

function update() {
	if (rendering) return;
	rendering = true;
	drawMandelbrot();
	rendering = false;
}

// #region events
function scroll(e) {
	e.preventDefault();
	const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
	const oldZoom = zoom;
	const mouseX = e.offsetX * scale;
	const mouseY = e.offsetY * scale;

	const fractalX = panX - 1.5 / oldZoom + mouseX / renderer.width * (3 / oldZoom);
	const fractalY = panY - 1 / oldZoom + mouseY / renderer.height * (2 / oldZoom);

	zoom *= zoomFactor;
	panX = fractalX - mouseX / renderer.width * (3 / zoom) + 1.5 / zoom;
	panY = fractalY - mouseY / renderer.height * (2 / zoom) + 1 / zoom;

	update();
}

function move(e) {
	if (e.buttons !== 1) return;
	panX -= (e.movementX / renderer.width) / zoom * 3 * scale;
	panY -= (e.movementY / renderer.height) / zoom * 2 * scale;

	update();
}

function resize() {
	renderer.width = window.innerWidth * scale;
	renderer.height = window.innerHeight * scale;
	imageData = new ImageData(renderer.width, renderer.height);

	update();
	update();
}

document.getElementById('quality').addEventListener('input', (e) => {
	maxIterations = parseInt(e.target.value);
	update();
});
document.getElementById('scale').addEventListener('input', (e) => {
	scale = parseFloat(e.target.value);
	resize();
});
renderer.addEventListener('scroll', scroll);
renderer.addEventListener('wheel', scroll);
renderer.addEventListener('mousemove', move);
window.addEventListener('resize', resize);
resize();