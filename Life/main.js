const renderer = document.getElementById('renderer');

let tiles = [];
let is = [];
let was = [];
let gridSize = 30

let isPlaying = false;

for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        const div = document.createElement('div');
        div.className = 'tile';
        div.id = 'tile-' + x + '-' + y;
        renderer.appendChild(div);
        tiles.push(div);
        is.push(false);
        was.push(false);
    }
}

document.addEventListener('click', e => {
    const id = e.target.getAttribute('id');
    const x = parseInt(id.split('-')[1]);
    const y = parseInt(id.split('-')[2]);
    const i = x * gridSize + y;
    console.log(x, y, i);
    is[i] = !is[i];
    was[i] = is[i];
});

document.addEventListener('keydown', e => {
    if (e.key === ' ') {
        isPlaying = !isPlaying;
        console.log(isPlaying);
    }
});

function render() {

    if (isPlaying) {
        tiles.forEach((tile, i) => {
            const neighbors = [
                i - gridSize + 1, i - gridSize, i - gridSize - 1,
                i - 1, i + 1,
                i + gridSize - 1, i + gridSize, i + gridSize + 1
            ];
            const activeNeighbors = neighbors.filter(n => was[n]).length;
            
            if (activeNeighbors < 2) {
                is[i] = false;
            } else if (activeNeighbors < 3) {
                is[i] = was[i];
            }  else if (activeNeighbors < 4) {
                is[i] = true;
            } else {
                is[i] = false;
            }

            if (is[i]) {
                tile.classList.add('tile-active');
                tile.classList.add('was');
                tile.classList.add('is');
            } else {
                tile.classList.remove('tile-active');
                tile.classList.remove('was');
                tile.classList.remove('is');
            }
        });
        tiles.forEach((tile, i) => {
            was[i] = is[i];
        });
    } else {
        tiles.forEach((tile, i) => {
            if (is[i]) {
                tile.classList.add('tile-active');
                tile.classList.add('is');
            } else {
                tile.classList.remove('tile-active');
                tile.classList.remove('is');
            }
        });
    }

    setTimeout(() => {
        requestAnimationFrame(render);
    }, 1000 / 5);
}

render();