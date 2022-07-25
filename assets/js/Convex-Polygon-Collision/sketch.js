//#region Global Variables
let cWidth = 1202,
	cHeight = 602;
let shapes = [],
	points = [];

let insideShape = false,
	selectedShape = -1;

let input = 0,
	rotDir = 0,
	moveDir = 0;
let rotSpeed, moveSpeed;
let mousePoint;

let staticCollision = false;
//#endregion

function setup() {
	createCanvas(cWidth, cHeight);
	stroke("#000");
	noFill();
	rotSpeed = QUARTER_PI / 500;
	moveSpeed = 0.2;
	mousePoint = new Point(0, 0);
	// frameRate(40);
}

function draw() {
	background(80);
	mousePoint.x = mouseX;
	mousePoint.y = mouseY;

	points.forEach((p) => {
		p.draw();
	});
	insideShape = false;

	for (let i = 0; i < shapes.length; ++i) {
		let s = shapes[i];

		s.isColliding = false;

		//Collision Checking
		// for (let j = 0; j < shapes.length; ++j) {
		// 	if (j==i) continue;
		// 	s.isColliding |= Shape.areColliding_DIAG(s, shapes[j]);
		// }

		//Collision Resolving
		if (i != selectedShape) {
			for (let j = i + 1; j < shapes.length; ++j) {
				if (j == selectedShape) continue;
				s.isColliding |= Shape.collisionResolve_DIAG(s, shapes[j]);
			}
		} else {
			for (let j = 0; j < shapes.length; ++j) {
				if (j == i) continue;
				if (staticCollision)
					s.isColliding |= Shape.collisionResolve_DIAG(s, shapes[j]);
				else s.isColliding |= Shape.collisionResolve_DIAG(shapes[j], s);
			}
		}

		if (s.isColliding) s.color = "#f00";
		else s.color = "#000";
		//check if mouse is inside shape
		if (s.contains(mousePoint)) {
			s.color = "#ff0";
			insideShape = true;
			if (mouseIsPressed) selectedShape = i;
		}

		s.draw();
	}

	if (input && selectedShape != -1) {
		if (rotDir != 0)
			shapes[selectedShape].rot(rotSpeed * deltaTime * rotDir);
		if (moveDir != 0) {
			let movement = int(moveSpeed * deltaTime * moveDir);
			shapes[selectedShape].move(movement);
		}
	}

	// if(shapes.length == 2) noLoop()
}

//#region Mouse and Keyboard Inputs
function mousePressed() {
	if (mouseX < cWidth - Point.DIAMETER && mouseY < cHeight - Point.DIAMETER) {
		if (points.length >= 3 && points[0].intersects(mouseX, mouseY)) {
			//close the shape
			sh = new Shape(points);
			if (Shape.isConvex(sh)) shapes.push(sh);
			else console.log("Invalid shape. Shape is Concave");
			points = [];
		} else {
			let add = true;
			//check if point clicked doesn't already exist
			for (let i = 0; add && i < points.length; ++i)
				if (points[i].intersects(mouseX, mouseY)) add = false;

			//check if point clicked is inside a shape
			if (add && !insideShape) points.push(new Point(mouseX, mouseY));
		}
	}
}

function keyPressed() {
	points = [];
	input = true;
	switch (keyCode) {
		case 87: //W
		case UP_ARROW:
			moveDir = 1;
			rotDir = 0;
			break;

		case 65: //A
		case LEFT_ARROW:
			moveDir = 0;
			rotDir = -1;
			break;

		case 83: //S
		case DOWN_ARROW:
			moveDir = -1;
			rotDir = 0;
			break;

		case 68: //D
		case RIGHT_ARROW:
			moveDir = 0;
			rotDir = 1;
			break;
		default:
			input = false;
	}
}

function keyReleased() {
	input = false;
}
//#endregion

//#region Helper Classes
class Point {
	static DIAMETER = 10;
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.sqmag = this.x * this.x + this.y * this.y;
	}

	draw(debug = false) {
		circle(this.x, this.y, Point.DIAMETER);
		if (debug)
			rect(
				this.x - Point.DIAMETER / 2,
				this.y - Point.DIAMETER / 2,
				Point.DIAMETER
			);
	}

	intersects(other, accurate = false) {
		if (accurate)
			return dist(this.x, this.y, other.x, other.y) < Point.DIAMETER;
		else
			return (
				this.x < other.x + Point.DIAMETER &&
				this.x + Point.DIAMETER > other.x &&
				this.y < other.y + Point.DIAMETER &&
				this.y + Point.DIAMETER > other.y
			);
	}

	intersects(x, y, accurate = false) {
		if (accurate) return dist(this.x, this.y, x, y) <= Point.DIAMETER;
		else
			return (
				this.x < x + Point.DIAMETER &&
				this.x + Point.DIAMETER > x &&
				this.y < y + Point.DIAMETER &&
				this.y + Point.DIAMETER > y
			);
	}

	static crossP(p1, p2) {
		return p1.x * p2.y - p1.y * p2.x;
	}

	static sub(p1, p2) {
		return new Point(p1.x - p2.x, p1.y - p2.y);
	}

	static add(p1, p2) {
		return new Point(p1.x + p2.x, p1.y + p2.y);
	}

	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		this.sqmag = this.x * this.x + this.y * this.y;
	}

	add(other) {
		this.x += other.x;
		this.y += other.y;
		this.sqmag = this.x * this.x + this.y * this.y;
	}

	rot(ang) {
		let COS = cos(ang),
			SIN = sin(ang);
		let X = this.x * COS - this.y * SIN;
		let Y = this.y * COS + this.x * SIN;

		(this.x = X), (this.y = Y);
		this.sqmag = this.x * this.x + this.y * this.y;
	}

	unit() {
		let f = INVSQRT(this.sqmag);
		return new Point(this.x * f, this.y * f);
	}

	scale(f) {
		(this.x *= f), (this.y *= f);
		this.sqmag = f * f * this.sqmag;
	}
}

class Line {
	static LSLS_intersect(p, r, q, s, DEBUG = false) {
		//See if Line seg. pr intersects line seg. qs
		//p + tr = q + us
		//t = (q − p) × s / (r × s)
		//u = (p − q) × r / (s × r)
		//NOTE: s × r = − r × s

		s = Point.sub(s, q);
		r = Point.sub(r, p);
		let rXs = Point.crossP(r, s);
		let t = Point.crossP(Point.sub(q, p), s) / rXs;
		let u = Point.crossP(Point.sub(p, q), r) / -rXs;

		let contains = t >= 0 && t <= 1 && u >= 0 && u <= 1;

		if (contains && DEBUG) {
			// push();
			// fill("#0f0");
			let intersection = Point.add(p, new Point(t * r.x, t * r.y));
			circle(intersection.x, intersection.y, 10);
			// pop();
		}
		return [contains, t];
	}

	static RLS_intersect(p, r, q, s, DEBUG = true) {
		//See if Line seg. qs intersects ray with origin p and direction r
		//p + tr = q + us
		//t = (q − p) × s / (r × s)
		//u = (p − q) × r / (s × r)
		//NOTE: s × r = − r × s

		s = Point.sub(s, q);
		let rXs = Point.crossP(r, s);
		let t = Point.crossP(Point.sub(q, p), s) / rXs;
		let u = Point.crossP(Point.sub(p, q), r) / -rXs;

		let contains = t >= 0 && u >= 0 && u <= 1;

		if (contains && DEBUG) {
			// push();
			// fill("#0f0");
			let intersection = Point.add(p, new Point(t * r.x, t * r.y));
			circle(intersection.x, intersection.y, 10);
			// pop();
		}
		return contains;
	}
}

class Shape {
	constructor(points) {
		this.points = points;
		this.boundingBox = {
			bottomLeft: new Point(cWidth, cHeight),
			topRight: new Point(0, 0),
		};
		this.center = new Point(0, 0);
		points.forEach((p) => {
			if (p.x < this.boundingBox.bottomLeft.x)
				this.boundingBox.bottomLeft.x = p.x;
			if (p.x > this.boundingBox.topRight.x)
				this.boundingBox.topRight.x = p.x;
			if (p.y < this.boundingBox.bottomLeft.y)
				this.boundingBox.bottomLeft.y = p.y;
			if (p.y > this.boundingBox.topRight.y)
				this.boundingBox.topRight.y = p.y;
			this.center.add(p);
		});
		this.center.x = int(this.center.x / this.points.length);
		this.center.y = int(this.center.y / this.points.length);

		this.color = "#000";
		this.isColliding = false;
	}

	calculateBB() {
		this.boundingBox.bottomLeft.x = cWidth;
		this.boundingBox.bottomLeft.y = cHeight;
		this.boundingBox.topRight.x = this.boundingBox.topRight.y = 0;
		this.points.forEach((p) => {
			if (p.x < this.boundingBox.bottomLeft.x)
				this.boundingBox.bottomLeft.x = p.x;
			if (p.x > this.boundingBox.topRight.x)
				this.boundingBox.topRight.x = p.x;
			if (p.y < this.boundingBox.bottomLeft.y)
				this.boundingBox.bottomLeft.y = p.y;
			if (p.y > this.boundingBox.topRight.y)
				this.boundingBox.topRight.y = p.y;
		});
	}

	draw(drawPoints = false, drawBB = false) {
		//draw edges
		push();
		stroke(this.color);
		for (let i = 0; i < this.points.length - 1; ++i)
			line(
				this.points[i].x,
				this.points[i].y,
				this.points[i + 1].x,
				this.points[i + 1].y
			);
		line(
			this.points[0].x,
			this.points[0].y,
			this.points[this.points.length - 1].x,
			this.points[this.points.length - 1].y
		);

		//draw Points
		if (drawPoints) {
			this.points.forEach((p) => {
				p.draw();
			});
			this.center.draw();
		}
		if (drawBB) {
			let w = this.boundingBox.topRight.x - this.boundingBox.bottomLeft.x;
			let h = this.boundingBox.topRight.y - this.boundingBox.bottomLeft.y;
			rect(
				this.boundingBox.bottomLeft.x,
				this.boundingBox.bottomLeft.y,
				w,
				h
			);
		}

		line(this.center.x, this.center.y, this.points[0].x, this.points[0].y);
		pop();
	}

	static isConvex(sh) {
		// Stores direction of cross product
		// of previous traversed edges
		let prev = 0;

		// Stores direction of cross product
		// of current traversed edges
		let curr = 0;
		for (let i = 0, n = sh.points.length; i < n; ++i) {
			let x1 = sh.points[(i + 1) % n].x - sh.points[i].x;
			let y1 = sh.points[(i + 1) % n].y - sh.points[i].y;
			let x2 = sh.points[(i + 2) % n].x - sh.points[(i + 1) % n].x;
			let y2 = sh.points[(i + 2) % n].y - sh.points[(i + 1) % n].y;

			curr = x1 * y2 - y1 * x2; //Cross Product

			// If curr is not equal to 0
			if (curr != 0) {
				// If direction of cross product of
				// all adjacent edges are not same
				if (curr * prev < 0) {
					return false;
				} else {
					// Update curr
					prev = curr;
				}
			}
		}
		return true;
	}

	contains(point, DEBUG = false) {
		if (
			point.x < this.boundingBox.bottomLeft.x ||
			point.x > this.boundingBox.topRight.x ||
			point.y < this.boundingBox.bottomLeft.y ||
			point.y > this.boundingBox.topRight.y
		)
			return false;

		let count = 0;
		for (let i = 0, n = this.points.length; i < n; ++i) {
			let p1 = this.points[i];
			let p2 = this.points[(i + 1) % n];

			if (Line.RLS_intersect(point, new Point(1, 0), p1, p2, DEBUG))
				count++;
		}
		return count % 2 != 0;
	}

	rot(ang) {
		let temp = new Point(0, 0);
		for (let i = 0; i < this.points.length; i++) {
			temp = Point.sub(this.points[i], this.center);
			temp.rot(ang);
			this.points[i] = Point.add(temp, this.center);
		}
		//cant rotate BB???
		// temp = Point.sub(this.boundingBox.bottomLeft, this.center);
		// temp.rot(ang);
		// this.boundingBox.bottomLeft = Point.add(temp, this.center);

		// temp = Point.sub(this.boundingBox.topRight, this.center);
		// temp.rot(ang);
		// this.boundingBox.topRight = Point.add(temp, this.center);
		this.calculateBB();
	}

	/**
	 * Moves the shape by amount passed in the direction of point 0 - origin vector
	 * */
	move(movement) {
		let dir = Point.sub(this.points[0], this.center).unit();
		dir.scale(movement);
		for (let i = 0; i < this.points.length; i++) {
			this.points[i].add(dir);
		}
		this.center.add(dir);
		this.boundingBox.topRight.add(dir);
		this.boundingBox.bottomLeft.add(dir);
	}

	/**
	 * Translates the shape based on displacement vector passed in
	 * */
	translate(disp) {
		(disp.x = int(disp.x)), (disp.y = int(disp.y));
		for (let i = 0; i < this.points.length; i++) {
			this.points[i].add(disp);
		}
		this.center.add(disp);
		this.boundingBox.topRight.add(disp);
		this.boundingBox.bottomLeft.add(disp);
	}

	/**
	 * returns true/false based on if the 2 shapes are colliding
	 * */
	static areColliding_SAT(shape1, shape2) {
		let s1 = shape1,
			s2 = shape2;

		for (let i = 0; i < 2; ++i) {
			if (i == 1) (s1 = shape2), (s2 = shape1);
			for (let p = 0; p < s1.points.length; ++p) {
				let a = s1.points[p],
					b = s1.points[(p + 1) % s1.points.length];
				//Perpendicular to the edge ie. the swap x, y coords and make 1 negative
				// let axisProj = new Point(-(b.y - a.y), b.x - a.x).unit();
				let axisProj = new Point(-(b.y - a.y), b.x - a.x);

				//find min, max of s1
				let minS1 = Infinity,
					maxS1 = -Infinity;

				let origin = new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
				for (let v = 0; v < s1.points.length; ++v) {
					let point = Point.sub(s1.points[v], origin);
					let dot = point.x * axisProj.x + point.y * axisProj.y;
					minS1 = min(minS1, dot);
					maxS1 = max(maxS1, dot);
				}

				//find min, max of s2
				let minS2 = Infinity,
					maxS2 = -Infinity;
				for (let v = 0; v < s2.points.length; ++v) {
					let point = Point.sub(s2.points[v], origin);
					let dot = point.x * axisProj.x + point.y * axisProj.y;
					minS2 = min(minS2, dot);
					maxS2 = max(maxS2, dot);
				}

				//see if the 2 ranges overlap -> if they dont, means shapes are not colliding
				if (!(maxS1 >= minS2 && minS1 <= maxS2)) return false;
			}
		}
		return true;
	}

	/**
	 * resolves collision by moving shape1
	 * */
	static collisionResolve_SAT(shape1, shape2) {
		let s1 = shape1,
			s2 = shape2;

		let minOverlap = Infinity;

		for (let i = 0; i < 2; ++i) {
			if (i == 1) (s1 = shape2), (s2 = shape1);
			for (let p = 0; p < s1.points.length; ++p) {
				let a = s1.points[p],
					b = s1.points[(p + 1) % s1.points.length];
				//Perpendicular to the edge ie. the swap x, y coords and make 1 negative
				let axisProj = new Point(-(b.y - a.y), b.x - a.x).unit();
				// let axisProj = new Point(-(b.y - a.y), b.x - a.x);

				//find min, max of s1
				let minS1 = Infinity,
					maxS1 = -Infinity;

				let origin = new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
				for (let v = 0; v < s1.points.length; ++v) {
					let point = Point.sub(s1.points[v], origin);
					let dot = point.x * axisProj.x + point.y * axisProj.y;
					minS1 = min(minS1, dot);
					maxS1 = max(maxS1, dot);
				}

				//find min, max of s2
				let minS2 = Infinity,
					maxS2 = -Infinity;
				for (let v = 0; v < s2.points.length; ++v) {
					let point = Point.sub(s2.points[v], origin);
					let dot = point.x * axisProj.x + point.y * axisProj.y;
					minS2 = min(minS2, dot);
					maxS2 = max(maxS2, dot);
				}

				minOverlap = min(
					minOverlap,
					min(maxS1, maxS2) - max(minS1, minS2)
				);
				//see if the 2 ranges overlap -> if they dont, means shapes are not colliding
				if (minOverlap < 0) return false;
			}
		}
		let d = Point.sub(shape1.center, shape2.center).unit();
		d.scale(minOverlap);
		shape1.translate(d);
		return false;
	}

	/**
	 * returns true/false based on if the 2 shapes are colliding
	 * */
	static areColliding_DIAG(shape1, shape2) {
		let s1 = shape1,
			s2 = shape2;

		for (let i = 0; i < 2; ++i) {
			if (i == 1) (s1 = shape2), (s2 = shape1);
			for (let p = 0; p < s1.points.length; ++p) {
				//check if diag intersects with any of the other shape's edges
				for (let v = 0; v < s2.points.length; ++v) {
					if (
						Line.LSLS_intersect(
							s1.center,
							s1.points[p],
							s2.points[v],
							s2.points[(v + 1) % s2.points.length]
						)
					)
						return true;
				}
			}
		}
		return false;
	}

	/**
	 * resolves collision by moving shape1
	 * */
	static collisionResolve_DIAG(shape1, shape2) {
		let s1 = shape1,
			s2 = shape2;

		for (let i = 0; i < 2; ++i) {
			if (i == 1) (s1 = shape2), (s2 = shape1);
			let disp = new Point(0, 0);

			//check if diag intersects with any of the other shape's edges
			for (let p = 0; p < s1.points.length; ++p) {
				for (let v = 0; v < s2.points.length; ++v) {
					let [contains, t] = Line.LSLS_intersect(
						s1.center,
						s1.points[p],
						s2.points[v],
						s2.points[(v + 1) % s2.points.length]
					);
					if (contains) {
						let temp = Point.sub(s1.points[p], s1.center);
						temp.scale(1 - t);
						disp.add(temp);
					}
				}
			}
			if (i == 0) disp.scale(-1);
			shape1.translate(disp);
		}
		return false;
	}
}
//#endregion

function INVSQRT(number) {
	//This is the fast inverse square root algo which I used to get a vector's unit vector
	var i;
	var x2, y;
	const threehalfs = 1.5;

	x2 = number * 0.5;
	y = number;
	var buf = new ArrayBuffer(4);
	new Float32Array(buf)[0] = number;
	i = new Uint32Array(buf)[0];
	i = 0x5f3759df - (i >> 1);
	new Uint32Array(buf)[0] = i;
	y = new Float32Array(buf)[0];
	y = y * (threehalfs - x2 * y * y); // 1st iteration
	//  y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

	return y;
}
