
/* global createCanvas, color, colorMode, background, backgroundColor, RGB
 * stroke, noStroke, strokeWeight, fill
 * ellipse, line, rect, text, textSize, textAlign, CENTER
 * random, int
 * rowStart, rowSpacing, colSpacing, numRows, dotSize, colSpace, rowSpace
 * collideCircleCircle
 * ball, ballSpeed, ballSize
 * width, height
 * tally
 */

/* Todos:
 * - optimize collision detection - compute the collision using cartesian coordinates
 * - multiple balls
 * - add controls to modify globals
 * - figure out why it's not producing a binomial distribution
 */

function setup() {
  createCanvas(500, 500);
  colorMode(RGB);
  backgroundColor = color(190, 190, 190);
  stroke("black");
  fill("black");
  rowStart = 25;
  rowSpacing = 20;
  colSpacing = 25;
  numRows = 11;
  dotSize = 8;
  ballSpeed = 2;
  ballSize = 15;
  ball = new Ball(width / 2, 0);
  tally = new Array(numRows).fill(0);
  for (let col = 1; col <= numRows; col++) {
    tally[col] = 0;
  }
  colSpace = colSpacing + dotSize;
  rowSpace = rowSpacing + dotSize;
}

function draw() {
  background(backgroundColor);
  drawTriangle();
  drawTallyBuckets();
  drawTallyThermometers();
  moveBall();
  tallyBall();
  handleCollision();
}

// Draw the triangle of dots that the ball will have to traverse.
function drawTriangle() {
  fill("black");
  for (let row = 1; row <= numRows; row++) {
    let firstDotPos = (width - (row - 1) * colSpace) / 2;
    for (let col = 0; col < row; col++) {
      ellipse(firstDotPos + col * colSpace, row * rowSpace + rowStart, dotSize);
    }
  }
}

// Draw the lines at the bottom of the triangle.
// These create the buckets that the ball will fall into.
function drawTallyBuckets() {
  let firstDotPos = (width - (numRows - 1) * colSpace) / 2;
  // We want the first column to be to the left of the first dot
  // to catch anything the falls to the left of the first dot.
  // Similarly, we need a column to the right of the last dot.
  for (let col = -1; col < numRows + 1; col++) {
    stroke("red");
    strokeWeight(dotSize + 2);
    let colWidth = col * colSpace;
    line(
      firstDotPos + colWidth - 1,
      numRows * rowSpace + rowStart,
      firstDotPos + colWidth - 1,
      (numRows + 3) * rowSpace + rowStart
    );
    if (col > -1) {
      textSize(18);
      textAlign(CENTER);
      fill("red");
      strokeWeight(1);
      text(
        tally[col],
        firstDotPos - colSpace / 2 + colWidth - dotSize / 2 - 5,
        (numRows + 4) * rowSpace + rowStart
      );
    }
  }
}

// Draw rectangles in each tally column.
// The height of the band is proportional to that column's portion of the sum.
function drawTallyThermometers() {
  let sum = 0;
  for (let col = 0; col < numRows; col++) {
    sum += tally[col];
  }
  // Avoid div by 0 and still show empty thermometers
  if (sum == 0) {
    sum = 1;
  }
  let firstDotPos = (width - (numRows - 1) * colSpace) / 2;
  let colHeight = 3 * rowSpace;
  for (let col = 0; col < numRows + 1; col++) {
    let tallyPercent = tally[col] / sum;
    fill("red");
    rect(
      firstDotPos + (col - 1) * colSpace,
      (numRows + 3) * rowSpace + rowStart,
      colSpace,
      -colHeight * tallyPercent
    );
  }
}

// Compute the next position of the ball.
function moveBall() {
  ball.y += ball.speed;

  // xBump is used to nudge the ball left or right after it hits a dot.
  // It contains a counter for how much we should drift to the left or right.
  if (ball.xBump >= 0) {
    ball.x += ball.xDirection * 2;
    ball.xBump -= 1;
  }
  ball.show();
}

// Figure out which column the ball landed in and increment the counter for that column.
function tallyBall() {
  if (ball.y > (numRows + 3) * rowSpace + rowStart) {
    let firstDotPos = (width - (numRows - 1) * colSpace) / 2;
    let colOffset = ball.x - firstDotPos;
    // The ball drops in the middle of the column.
    // Add 0.5 to nudge this to the left end of the column.
    let col = Math.round(colOffset / colSpace + 0.5);
    tally[col] += 1;
    ball.y = 0;
    ball.x = width / 2;
  }
}

// Figure out of the ball hit a dot.
// If so, update the state in the ball to bounce left (negative x) or right (positive x).
function handleCollision() {
  for (let row = 1; row <= numRows; row++) {
    let firstDotPos = (width - (row - 1) * colSpace) / 2;
    for (let col = 0; col < row; col++) {
      ball.hit = collideCircleCircle(
        firstDotPos + col * colSpace,
        row * rowSpace + rowStart,
        dotSize,
        ball.x,
        ball.y,
        dotSize
      );
      if (ball.hit) {
        ball.xBump = dotSize + 1;
        ball.xDirection = random([-1, 1]);
        return;
      }
    }
  }
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = "red";
    this.speed = ballSpeed;
    this.hit = 0;
    this.xBump = 0;
  }
  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, ballSize);
  }
}
