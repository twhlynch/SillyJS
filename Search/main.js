const canvas = document.getElementById('renderer');
canvas.width = 50;
canvas.height = 50;
const ctx = canvas.getContext('2d');

let grid = [];
// 0 = space
// 1 = start
// 2 = walk
// 3 = walk 2
// 8 = wall
// 9 = objective

let currentSearch = "none";
let state = {};


//#region Setup

// setup ui
const buttonBFS = document.getElementById('BFS');
const buttonDFS = document.getElementById('DFS');
const buttonAStar = document.getElementById('AStar');
const buttonReset = document.getElementById('reset');

[buttonBFS, buttonDFS, buttonAStar].forEach(button => {
    button.addEventListener('click', () => {
        currentState = {};
        currentSearch = button.id;
    });
});

buttonReset.addEventListener('click', () => {
    init();
});

// for init or reset
function init() {
    currentSearch = "none";
    state = {};
    grid = [];
    for (let i = 0; i < 50; i++) {
        grid.push([]);
        for (let j = 0; j < 50; j++) {
            grid[i].push(0);
        }
    }
    let objectivex = Math.floor(Math.random() * 50);
    let objectivey = Math.floor(Math.random() * 50);
    grid[objectivex][objectivey] = 9;
    let startx = Math.floor(Math.random() * 50);
    let starty = Math.floor(Math.random() * 50);
    grid[startx][starty] = 1;
    for (let i = 0; i < 500; i++) {
        let x = Math.floor(Math.random() * 50);
        let y = Math.floor(Math.random() * 50);
        if(grid[x][y] == 0)grid[x][y] = 8;
    }
}

//#region Loop
function render() {
    // Draw Scene
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw grid
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            switch (grid[i][j]) {
                case 0:
                    ctx.fillStyle = '#fff';
                    break;
                case 1:
                    ctx.fillStyle = '#0f0';
                    break;
                case 2:
                    ctx.fillStyle = '#00f';
                    break;
                case 3:
                    ctx.fillStyle = '#009';
                    break;
                case 8:
                    ctx.fillStyle = '#000';
                    break;
                case 9:
                    ctx.fillStyle = '#f00';
                    break;
                default:
                    ctx.fillStyle = grid[i][j];
            }
            ctx.fillRect(i, j, 1, 1);
        }
    }

    if (currentSearch == "BFS") {
        console.log(stepBFS());
    } else if (currentSearch == "DFS") {
        console.log(stepDFS());
    } else if (currentSearch == "AStar") {
        console.log(stepAStar());
    }

    requestAnimationFrame(render);
}

init();
requestAnimationFrame(render);

//#region Util
function getNeighbors(node) {
    let neighbors = [];
    if (node[0] > 0 && grid[node[0] - 1][node[1]] != 8) {
        neighbors.push([node[0] - 1, node[1]]);
    }
    if (node[1] > 0 && grid[node[0]][node[1] - 1] != 8) {
        neighbors.push([node[0], node[1] - 1]);
    }
    if (node[0] < 49 && grid[node[0] + 1][node[1]] != 8) {
        neighbors.push([node[0] + 1, node[1]]);
    }
    if (node[1] < 49 && grid[node[0]][node[1] + 1] != 8) {
        neighbors.push([node[0], node[1] + 1]);
    }
    return neighbors;
}

//#region BFS
function stepBFS() {
    if (!state.queue) {
        state.queue = [];
        // find start
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (grid[i][j] == 1) {
                    state.queue.push([i, j]);
                }
            }
        }
        state.traversal = [];
    }

    if (state.queue.length) {
        let node = state.queue.shift();
        if (grid[node[0]][node[1]] != 2) {
            state.traversal.push(node);
            if (grid[node[0]][node[1]] == 9) {
                currentSearch = "none";
                return state.traversal;
            }
            if (grid[node[0]][node[1]] != 1) grid[node[0]][node[1]] = 2;
            let neighbors = getNeighbors(node);
            for (let neighbor of neighbors) {
                if (grid[neighbor[0]][neighbor[1]] != 2 && grid[neighbor[0]][neighbor[1]] != 1) {
                    state.queue.push(neighbor);
                }
            }
        }
        return state.traversal;
    }
}

//#region DFS
function stepDFS() {
    if (!state.stack) {
        state.stack = [];
        // find start
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (grid[i][j] == 1) {
                    state.stack.push([i, j]);
                }
            }
        }
        state.traversal = [];
    }

    if (state.stack.length) {
        let node = state.stack.pop();
        if (grid[node[0]][node[1]] != 3) {
            state.traversal.push(node);
            if (grid[node[0]][node[1]] == 9) {
                currentSearch = "none";
                return state.traversal;
            }
            if(grid[node[0]][node[1]] != 1) grid[node[0]][node[1]] = 3;
            let neighbors = getNeighbors(node).reverse();
            for (let neighbor of neighbors) {
                if (grid[neighbor[0]][neighbor[1]] != 3 && grid[neighbor[0]][neighbor[1]] != 1) {
                    state.stack.push(neighbor);
                }
            }
        }
        return state.traversal;
    }
}

//#region A*
// A* by GPT-4o
function stepAStar() {
    if (!state.openSet) {
        state.openSet = [];
        state.cameFrom = {};
        state.gScore = {};
        state.fScore = {};
        // find start
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (grid[i][j] == 1) {
                    state.start = [i, j];
                    state.openSet.push(state.start);
                    state.gScore[state.start] = 0;
                    state.fScore[state.start] = heuristic(state.start);
                }
            }
        }
    }

    if (state.openSet.length) {
        let current = state.openSet.reduce((a, b) => (state.fScore[a] < state.fScore[b] ? a : b));
        if (grid[current[0]][current[1]] == 9) {
            currentSearch = "none";
            return "";
        }

        state.openSet = state.openSet.filter(node => node !== current);

        let neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            let tentative_gScore = state.gScore[current] + 1;
            if (tentative_gScore < (state.gScore[neighbor] || Infinity)) {
                state.cameFrom[neighbor] = current;
                state.gScore[neighbor] = tentative_gScore;
                state.fScore[neighbor] = state.gScore[neighbor] + heuristic(neighbor);
                if (!state.openSet.includes(neighbor)) {
                    state.openSet.push(neighbor);
                }
            }
        }
        return state.openSet;
    }
}

function heuristic(node) {
    let objective;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (grid[i][j] == 9) {
                objective = [i, j];
                break;
            }
        }
    }
    let distance = Math.abs(node[0] - objective[0]) + Math.abs(node[1] - objective[1]);
    let maxDistance = 50;
    let blueValue = Math.floor((distance / maxDistance) * 155 + 100);
    if (grid[node[0]][node[1]] != 1 && grid[node[0]][node[1]] != 9) grid[node[0]][node[1]] = `rgb(0, 0, ${blueValue})`;
    return distance;
}

function reconstructPath(cameFrom, current) {
    let totalPath = [current];
    while (current in cameFrom) {
        current = cameFrom[current];
        totalPath.push(current);
    }
    return totalPath.reverse();
}