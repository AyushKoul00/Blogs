class Grid {
	constructor(x, y, w, h, cellSize, borderSize, isRand = true) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.cellSize = cellSize;
		this.borderSize = borderSize;

		//Calculate Number of Rows and Columns
		this.nRow = int((h - borderSize) / (borderSize + cellSize));
		this.nCol = int((w - borderSize) / (borderSize + cellSize));

		this.sizeX = this.nCol * (borderSize + cellSize) + borderSize;
		this.sizeY = this.nRow * (borderSize + cellSize) + borderSize;

		//Center the Grid
		let extraX = w - this.nCol * (borderSize + cellSize);
		let extraY = h - this.nRow * (borderSize + cellSize);
		this.x += int((extraX + borderSize) / 2.0 - borderSize);
		this.y += int((extraY + borderSize) / 2.0 - borderSize);

		this.grid = new Array(this.nRow);
		for (let i = 0; i < this.nRow; ++i) {
			this.grid[i] = new Array(this.nCol);
			for (let j = 0; j < this.nCol; ++j)
				this.grid[i][j] = isRand ? random([0, 1]) : 0;
		}
	}

	show() {
		let startX = this.x + this.borderSize;
		let startY = this.y + this.borderSize;
		// console.log(startX, startY, this.cellSize);
		for (let i = 0; i < this.nRow; ++i) {
			for (let j = 0; j < this.nCol; ++j) {
				noStroke();
				this.grid[i][j] ? fill(20) : fill(255);
				let x = startX + j * (this.cellSize + this.borderSize);
				let y = startY + i * (this.cellSize + this.borderSize);
				// console.log(x, y)
				rect(x, y, this.cellSize, this.cellSize);
			}
		}
	}

	copy() {
		let copy = new Array(this.nRow);
		for (let i = 0; i < this.nRow; ++i) {
			copy[i] = new Array(this.nCol);
			for (let j = 0; j < this.nCol; ++j) copy[i][j] = this.grid[i][j];
		}
		return copy;
	}

	getNeighborSum(i, j, wrap = false) {
		if (!wrap) {
			if (i == 0) {
				if (j == 0) {
					return (
						this.grid[i + 1][j + 1] +
						this.grid[i][j + 1] +
						this.grid[i + 1][j]
					); //dells with the top left corner
				} else if (j == this.nCol - 1) {
					return (
						this.grid[i + 1][j - 1] +
						this.grid[i][j - 1] +
						this.grid[i + 1][j]
					); //dells with the top right corner
				} else {
					return (
						this.grid[i][j - 1] +
						this.grid[i][j + 1] +
						this.grid[i + 1][j + 1] +
						this.grid[i + 1][j - 1] +
						this.grid[i + 1][j]
					); //top middles
				}
			} else if (i == this.nRow - 1) {
				if (j == 0) {
					return (
						this.grid[i - 1][j] +
						this.grid[i - 1][j + 1] +
						this.grid[i][j + 1]
					); //dells with the bottom left corner
				} else if (j == this.nCol - 1) {
					return (
						this.grid[i - 1][j] +
						this.grid[i][j - 1] +
						this.grid[i - 1][j - 1]
					); //dells with the bottom right corner
				} else {
					return (
						this.grid[i - 1][j] +
						this.grid[i - 1][j - 1] +
						this.grid[i - 1][j + 1] +
						this.grid[i][j + 1] +
						this.grid[i][j - 1]
					); //dells with the bottom middles
				}
			} else if (j == 0) {
				//first column
				if (i != 0 && i != this.nRow - 1)
					return (
						this.grid[i - 1][j] +
						this.grid[i + 1][j] +
						this.grid[i + 1][j + 1] +
						this.grid[i - 1][j + 1] +
						this.grid[i][j + 1]
					); //dells with the left middles
			} else if (j == this.nCol - 1) {
				//last column
				if (i != 0 && i != this.nRow - 1)
					return (
						this.grid[i - 1][j] +
						this.grid[i + 1][j] +
						this.grid[i - 1][j - 1] +
						this.grid[i][j - 1] +
						this.grid[i + 1][j - 1]
					); //dells with the right  middles
			} else {
				return (
					this.grid[i][j - 1] +
					this.grid[i][j + 1] +
					this.grid[i + 1][j] +
					this.grid[i + 1][j - 1] +
					this.grid[i + 1][j + 1] +
					this.grid[i - 1][j] +
					this.grid[i - 1][j - 1] +
					this.grid[i - 1][j + 1]
				); //dells with the all the rest
			}
		} else {
			let pi = i == 0 ? this.nRow - 1 : i - 1;
			let pj = j == 0 ? this.nCol - 1 : j - 1;
			let ni = i == this.nRow - 1 ? 0 : i + 1;
			let nj = j == this.nCol - 1 ? 0 : j + 1;
			return (
				this.grid[pi][j] +
				this.grid[ni][j] +
				this.grid[i][nj] +
				this.grid[i][pj] +
				this.grid[pi][pj] +
				this.grid[pi][nj] +
				this.grid[ni][pj] +
				this.grid[ni][nj]
			);
		}
	}

	getCell(px, py) {
		if (
			px < 0 ||
			py < 0 ||
			px > this.sizeX - this.borderSize ||
			py > this.sizeY - this.borderSize
		)
			return null;
		let startX = this.cellSize + this.borderSize;
		let startY = this.cellSize + this.borderSize;
		return [int(py / startY), int(px / startX)];
	}
}

let grid;
let curr, next;
let cWidth = 1202,
	cHeight = 602;
let pauseBtn,
	paused = true;
let resetBtn;
let gridProps = {
	x: 0,
	y: 0,
	width: cWidth,
	height: cHeight,
	cellSize: 13,
	borderSize: 2,
};
var cnv;
function setup() {
	cnv = createCanvas(cWidth, cHeight);
	cnv.parent('canvasContainer')


	background(50);
	grid = new Grid(...Object.values(gridProps), false);
	frameRate(10);
	grid.show();
	curr = grid.grid;
	next = grid.copy();

	pauseBtn = createButton("Play").class('Btn');
	pauseBtn.parent('canvasContainer');
	pauseBtn.mousePressed(pausedClicked);

	resetBtn = createButton("Reset").class('Btn');
	resetBtn.parent('canvasContainer');
	resetBtn.mousePressed(() => {
		for (let i = 0; i < grid.nRow; ++i)
			for (let j = 0; j < grid.nCol; ++j) curr[i][j] = next[i][j] = 0;
		paused = false;
		pausedClicked();
	});
}

function pausedClicked() {
	paused = !paused;
	pauseBtn.html(paused ? "Play" : "Pause");
}

function draw() {
	background(50);
	// frameRate(4);
	grid.show();
	if (paused) return;
	for (let i = 0; i < grid.nRow; ++i) {
		for (let j = 0; j < grid.nCol; ++j) {
			let sum = grid.getNeighborSum(i, j, true);
			if (curr[i][j] == 0) next[i][j] = sum == 3 ? 1 : 0;
			else next[i][j] = sum < 2 || sum > 3 ? 0 : 1;
		}
	}

	// for (let i = 0; i < grid.nRow; ++i) curr[i] = [...next[i]];
	let isDiff = false;
	for (let i = 0; i < grid.nRow; ++i) {
		for (let j = 0; j < grid.nCol; ++j) {
			if(isDiff || curr[i][j] != next[i][j]) isDiff = true;
			curr[i][j] = next[i][j];
		}
	}
	if (!isDiff) {
		paused = false;
		pausedClicked();
	}
}


function mouseClicked() {
	if (!paused) return;
	let res = grid.getCell(mouseX - grid.x, mouseY - grid.y);
	if (res == null) return;
	let [i, j] = [...res];
	curr[i][j] = 1 - curr[i][j];
	// console.log(i, j);
	grid.show();
}
