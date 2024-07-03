let renderer, time, width, height, tiles, mines, enableFlags, primaryColor, secondaryColor, startTime, firstClick, tileElements, minesLeft, mineCountElement, colorMap;

class Tile {
    constructor() {
        this.isMine = false;
        this.neighboringMines = 0;
        this.isCleared = false;
        this.isFlagged = false;

        this.w = 0;
        this.h = 0;
    }
};

function init() {
    renderer = document.getElementById('renderer');
    tiles = [];
    time = 0;
    width = 16;
    height = 16;
    mines = 40;
    minesLeft = 0;
    startTime = performance.now();
    enableFlags = false;
    secondaryColor = [40, 40, 40];
    primaryColor = [160, 160, 160];
    firstClick = true;
    tileElements = [];
    mineCountElement = document.getElementById('mines');
    colorMap = [
        "#0000",
        "#007",
        "#070",
        "#700",
        "#003",
        "#730",
        "#077",
        "000",
        "777"
    ];

    let timerElement = document.getElementById('time');
    setInterval(() => {
        timerElement.innerText = Math.floor((performance.now() - startTime) / 1000);
    }, 100);

    let flagsElement = document.getElementById('flags');
    flagsElement.addEventListener('click', () => {
        enableFlags = !enableFlags;
    });
}

function newGame() {
    tiles = [];
    tileElements = [];
    renderer.innerHTML = '';
    firstClick = true;
    minesLeft = mines;
    mineCountElement.innerText = minesLeft;

    for (let w = 0; w < width; w++) {
        for (let h = 0; h < height; h++) {
            let tile = new Tile();
            tile.w = w;
            tile.h = h;
            tiles.push(tile);
        }
    }

    for (let i = 0; i < mines; i++) {
        let randomTile = Math.floor(Math.random() * tiles.length);
        while (tiles[randomTile].isMine != false) {
            randomTile = Math.floor(Math.random() * tiles.length);
        }
        tiles[randomTile].isMine = true;
    }

    for (let w = 0; w < width; w++) {
        for (let h = 0; h < height; h++) {
            let currentTile = w + h * width;
            
            let neighboringMines = [
                w != 0 ? currentTile - width - 1 : -1,
                currentTile - width,
                w != width - 1 ? currentTile - width + 1 : -1,

                w != 0 ? currentTile - 1 : -1,

                w != width - 1 ? currentTile + 1 : -1,

                w != 0 ? currentTile + width - 1 : -1,
                currentTile + width,
                w != width - 1 ? currentTile + width + 1 : -1
            ].filter((t) => {
                return t >= 0 && t < width * height && tiles[t].isMine
            }).length;

            tiles[currentTile].neighboringMines = neighboringMines;

        }
    }

    startTime = performance.now();

    renderer.style.gridTemplateColumns = "repeat(" + width + ", 1fr)";
    renderer.style.gridTemplateRows = "repeat(" + height + ", 1fr)";
    renderer.style.width = width * 50 + "px";
    renderer.style.height = height * 50 + "px";

    for (let tile of tiles) {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");
        if (tile.isMine) {
            tileElement.classList.add("isMine");
        }
        if (tile.isCleared) {
            tileElement.classList.add("isCleared");
            tileElement.innerText = tile.neighboringMines;
            tileElement.style.color = colorMap[tile.neighboringMines];
            setRadius();
        }
        if (tile.isFlagged) {
            tileElement.classList.add("isFlagged");
        }
        tileElement.setAttribute("data-w", tile.w);
        tileElement.setAttribute("data-h", tile.h);
        renderer.appendChild(tileElement);
        tileElements.push(tileElement);

        tileElement.addEventListener('click', () => {
            if (enableFlags) {
                if (!tile.isCleared) {
                    tile.isFlagged = !tile.isFlagged;
                    if (tile.isFlagged) {
                        tileElement.classList.add("isFlagged");
                        minesLeft--;
                    } else {
                        tileElement.classList.remove("isFlagged");
                        minesLeft++;
                    }
                    mineCountElement.innerText = minesLeft;
                }
            } else {
                if (!tile.isFlagged) {
                    if (tile.isMine) {
                        if (firstClick) {
                            let randomTile = Math.floor(Math.random() * tiles.length);
                            while (tiles[randomTile].isMine != false) {
                                randomTile = Math.floor(Math.random() * tiles.length);
                            }
                            tiles[randomTile].isMine = true;
                            tileElements[randomTile].classList.add("isMine");

                            tile.isMine = false;
                            tileElement.classList.remove("isMine");
                            tile.isCleared = true;
                            tileElement.classList.add("isCleared");
                            tileElement.innerText = tile.neighboringMines;
                            tileElement.style.color = colorMap[tile.neighboringMines];
                            if (tile.neighboringMines == 0) {
                                expandFrom(tile);
                            }

                            setRadius();
                        } else {
                            newGame();
                        }
                    } else {
                        tile.isCleared = true;
                        tileElement.classList.add("isCleared");
                        tileElement.innerText = tile.neighboringMines;
                        tileElement.style.color = colorMap[tile.neighboringMines];

                        if (tile.neighboringMines == 0) {
                            expandFrom(tile);
                        }

                        setRadius();
                    }
                }
            }
            firstClick = false;
        });
    }
}

function setRadius() {
    for (let w = 0; w < width; w++) {
        for (let h = 0; h < height; h++) {
            let currentTile = w + h * width;
            let e = tileElements[currentTile];
            
            let n = [
                currentTile - width,

                w != 0 ? currentTile - 1 : -1,
                
                w != width - 1 ? currentTile + 1 : -1,

                currentTile + width
            ].map((t) => {
                return (t >= 0 && t < width * height && tiles[t].isCleared) ? t : -1
            });

            if (n[0] > -1) {
                e.style.borderTopLeftRadius = 0;
                e.style.borderTopRightRadius = 0;
            }
            if (n[1] > -1) {
                e.style.borderTopLeftRadius = 0;
                e.style.borderBottomLeftRadius = 0;
            }
            if (n[2] > -1) {
                e.style.borderTopRightRadius = 0;
                e.style.borderBottomRightRadius = 0;
            }
            if (n[3] > -1) {
                e.style.borderBottomLeftRadius = 0;
                e.style.borderBottomRightRadius = 0;
            }

        }
    }
}

function expandFrom(tile) {
    tile.isCleared = true;
    let tileElement = tileElements[tile.h + tile.w * width];
    tileElement.classList.add("isCleared");
    tileElement.innerText = tile.neighboringMines;
    tileElement.style.color = colorMap[tile.neighboringMines];
    if (tile.neighboringMines == 0) {
        let w = tile.w;
        currentTile = tile.h + tile.w * width;
        let n = [
            w != 0 ? currentTile - width - 1 : -1,
            currentTile - width,
            w != width - 1 ? currentTile - width + 1 : -1,

            w != 0 ? currentTile - 1 : -1,

            w != width - 1 ? currentTile + 1 : -1,

            w != 0 ? currentTile + width - 1 : -1,
            currentTile + width,
            w != width - 1 ? currentTile + width + 1 : -1
        ].filter((t) => {
            return t >= 0 && t < width * height && !tiles[t].isCleared && !tiles[t].isFlagged
        });

        for (let i = 0; i < n.length; i++) {
            expandFrom(tiles[n[i]]);
        }
    }
}

init();
newGame();