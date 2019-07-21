let height = 0;
let width = 0;
let time = 0;
const cell_size = 20;

let selectedT = null;

let want_to_log = false;

function drawTerminos() {
  terminos.forEach(t => drawT(t));
}

let Iarea = [];

class termino {
  constructor(grid, w, h, pos, col = "#ABCDEF") {
    this.w = w;
    this.h = h;
    this.grid = grid;
    this.position = pos;
    this.col = col;
    this.selected = false;
  }

  tIntersect(t2, stop) {
    let crossorigin = {
      x: this.position.x - t2.position.x,
      y: this.position.y - t2.position.y
    };

    let crossoffset = { x: max(0, -crossorigin.x), y: max(0, -crossorigin.y) };

    crossorigin.x = max(0, crossorigin.x);
    crossorigin.y = max(0, crossorigin.y);

    let intersect = {
      w: min(t2.w - crossorigin.x, this.w - crossoffset.x),
      h: min(t2.h - crossorigin.y, this.h - crossoffset.y)
    };

    for (let i = crossoffset.x; i < crossoffset.x + intersect.w; i++) {
      for (let j = crossoffset.y; j < crossoffset.y + intersect.h; j++) {
        drawC(this.position.x + i, this.position.y + j);
        if (
          this.grid[i][j] *
          t2.grid[crossorigin.x + i - crossoffset.x][
            crossorigin.y + j - crossoffset.y
          ]
        ) {
          Iarea.push({ x: this.position.x + i, y: this.position.y + j });
          if (stop) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

function spawnOmegalul() {
  terminos.push(new termino());
}

let terminos = [
  new termino([[1, 0], [1, 1], [1, 0]], 3, 2, { x: 7, y: 5 }, "#022FAA")
];

function drawI(area) {
  noStroke();
  let col = color("#FF0000");
  col.setAlpha(200);
  fill(col);
  rect(area.x * cell_size, area.y * cell_size, cell_size, cell_size);
}

function drawC(x, y) {
  noStroke();
  let col = color("#000000");
  col.setAlpha(20);
  fill(col);
  rect(x * cell_size, y * cell_size, cell_size, cell_size);
}

function drawT(t) {
  let col = color(t.col);
  col.setAlpha(130);
  fill(col);
  t.selected ? stroke(255) : stroke(0);

  for (let x = 0; x < t.w; x++) {
    for (let y = 0; y < t.h; y++) {
      if (t.grid[x][y]) {
        rect(
          (x + t.position.x) * cell_size,
          (y + t.position.y) * cell_size,
          cell_size,
          cell_size
        );
      }
    }
  }
}

const winHeight = () => {
  return document.getElementById("holder").clientHeight;
};

const winWidth = () => document.getElementById("holder").clientWidth;

function rndTermino() {
  let i = floor(random(0, possibleterminos.length));
  let pos = {
    x: round(random(3, width / cell_size - 5)),
    y: round(random(3, height / cell_size - 5))
  };
  let rnd = new termino(
    possibleterminos[i],
    possibleterminos[i].length,
    possibleterminos[i][0].length,
    pos,
    rndColor()
  );
  return rnd;
}

function rndColor() {
  let r = round(random(40, 255)).toString(16);
  let g = round(random(40, 255)).toString(16);
  let b = round(random(110, 230)).toString(16);
  return `#${r}${g}${b}`;
}

function setup() {
  width = winWidth();
  height = winHeight();
  var canv = createCanvas(width, height);
  canv.parent("holder");
  frameRate(30);

  document.getElementById("spn").onclick = function() {
    terminos.push(rndTermino());
  };

  document.getElementById("slv").onclick = function() {
    solve();
  };

  terminos[0].selected = true;
  selectedT = terminos[0];
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    selectedT.position.x -= 1;
  }
  if (keyCode === RIGHT_ARROW) {
    selectedT.position.x += 1;
  }
  if (keyCode === DOWN_ARROW) {
    selectedT.position.y += 1;
  }
  if (keyCode === UP_ARROW) {
    selectedT.position.y -= 1;
  }
  if (keyCode === 32) {
    want_to_log = true;
  }
}

function mouseClicked() {
  let xx = floor(mouseX / cell_size);
  let yy = floor(mouseY / cell_size);

  terminos.forEach(t => {
    if (
      xx >= t.position.x &&
      xx < t.position.x + t.w &&
      yy >= t.position.y &&
      yy < t.position.y + t.h
    ) {
      if (t.grid[xx - t.position.x][yy - t.position.y]) {
        selectedT.selected = false;
        selectedT = t;
        t.selected = true;
      }
    }
  });
}

function windowResized() {
  width = winWidth();
  height = winHeight();
  resizeCanvas(width, height);
}

function draw() {
  background("#AACCCC");
  time += 0.01;
  drawTerminos();
  globalIntersect();
}

function globalIntersect() {
  Iarea = [];
  for (let i = 0; i < terminos.length; i++) {
    for (let j = i + 1; j < terminos.length; j++) {
      terminos[i].tIntersect(terminos[j], false);
    }
  }
  Iarea.forEach(area => drawI(area));
}

function localIntersect(piece, arr) {
  for (i = 0; i < arr.length; i++) {
    if (piece.tIntersect(arr[i], true)) {
      return true;
    }
  }
  return false;
}

function solve() {
  let solution = [];
  piece = terminos.pop();
  let bound = { w: max(piece.w, piece.h), h: max(piece.w, piece.h) };
  //console.log("SUKA EBANAYA: ", piece);
  remaining = terminos;

  while (!solver(piece, remaining, bound, solution)) {
    piece = remaining.pop();
    bound.w += 1;
    bound.h += 1;
  }

  console.log("SUCCESS");
  terminos = solution;
}

function solver(piece, remaining, bound, solution) {
  for (let i = 0; i < bound.w - piece.w; i++) {
    for (let j = 0; j < bound.h - piece.h; j++) {
      piece.position.x = i;
      piece.position.y = j;
      if (!localIntersect(piece, solution)) {
        solution.push(piece);
        if (remaining.length > 0) {
          if (solver(remaining.pop(), remaining, bound, solution)) return true;
        } else {
          return true;
        }
      }
    }
  }
  solution.pop(piece);
  remaining.push(piece);
  return false;
}
