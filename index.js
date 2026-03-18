
function lerp(a,b,t) {
  return a + (b - a) * t
}

class Vec2 {
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
  }

  normalized() {
    const half = box_size() / 2;
    return {
      x: half * (1 + this.x / config.scale_x),
      y: half * (1 - this.y / config.scale_y),
    };
  }

  static fromCanvas({ x, y }) {
    const half = box_size() / 2;
    return new Vec2({
      x: (x / half - 1) * config.scale_x,
      y: (1 - y / half) * config.scale_y,
    });
  }

  distance_to(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  lerp(other, t) {
    return new Vec2({
      x: lerp(this.x,other.x,t),
      y: lerp(this.y,other.y,t),
    });
  }

  draw(size = 10, color = "#00FF00") {
    const { x, y } = this.normalized();
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  draw_line_to(other, width = 2, color = "#FFFFFF") {
    const from = this.normalized();
    const to = other.normalized();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
}

const ANIMATION_DURATION = 3000;
const config = {
  scale_x: 10,
  scale_y: 10,
};

const ctx = box.getContext("2d");

function box_size() {
  const margin = 50
  return Math.min(window.innerWidth, window.innerHeight) - margin;
}

function resizeCanvas() {
  const size = box_size();
  box.width = size;
  box.height = size;
  clearBackground();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function clearBackground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, box.width, box.height);
}

let hoveredPoint = undefined;
let mouseDown = false;

box.addEventListener("mousedown", () => (mouseDown = true));
box.addEventListener("mouseup", () => (mouseDown = false));
box.addEventListener("mousemove", (e) => {
  const rect = box.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;

  const worldPos = Vec2.fromCanvas({ x: canvasX, y: canvasY });

  const hovered = controlPoints
    .map((pt, idx) => ({ point: pt, index: idx }))
    .filter((item) => worldPos.distance_to(item.point) < 0.4)
    .at(0);

  hoveredPoint = hovered ? { index: hovered.index, worldPos } : undefined;
});

const DEFAULT_POINTS = [
  new Vec2({ x: -8, y: 8 }),
  new Vec2({ x: -8, y: -8 }),
  new Vec2({ x: 8, y: -8 }),
  new Vec2({ x: 8, y: 8 }),
];

let controlPoints = [...DEFAULT_POINTS];
let t = 0;
let curvePoints = [];
let animationStart = performance.now();

function deCasteljauLevels(points, tVal, levels = []) {
  if (points.length === 0) return levels;
  if (levels.length === 0) levels.push(points);

  if (points.length === 1) return levels;

  const nextLevel = [];
  for (let i = 0; i < points.length - 1; i++) {
    nextLevel.push(points[i].lerp(points[i + 1], tVal));
  }
  levels.push(nextLevel);
  return deCasteljauLevels(nextLevel, tVal, levels);
}

function drawConstruction(levels) {
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    for (let j = 0; j < level.length; j++) {
      if (i === 0) {
        const isHovered = hoveredPoint && hoveredPoint.index === j;
        level[j].draw(isHovered ? 12 : 8, isHovered ? "red" : "#11FF11");
      }
      if (j < level.length - 1) {
        level[j].draw_line_to(level[j + 1], 2, "#FFFFFF");
      }
    }
  }
}

function drawCurveStrip(points, color = "red", width = 2) {
  for (let i = 0; i < points.length - 1; i++) {
    points[i].draw_line_to(points[i + 1], width, color);
  }
}

function updateTByTime() {
  const now = performance.now();
  const elapsed = now - animationStart;
  t = Math.min(elapsed / ANIMATION_DURATION, 1);
}

function mainLoop() {
  clearBackground();

  if (mouseDown && hoveredPoint) {
    controlPoints[hoveredPoint.index] = hoveredPoint.worldPos;
    t = 0;
    curvePoints = [];
    animationStart = performance.now();
  }

  if (controlPoints.length > 0) {
    if (t < 1) updateTByTime();

    const levels = deCasteljauLevels(controlPoints, t);

    drawConstruction(levels);

    if (t < 1 || curvePoints.length === 0) {
      const lastLevel = levels[levels.length - 1];
      if (lastLevel && lastLevel.length === 1) {
        curvePoints.push(lastLevel[0]);
      }
    }

    drawCurveStrip(curvePoints, "red", 3);
  }

  requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);

function restartAnimation() {
  t = 0;
  curvePoints = [];
  animationStart = performance.now();
  hoveredPoint = undefined;
}

REPLAY.addEventListener("click", restartAnimation);

POP.addEventListener("click", () => {
  if (controlPoints.length > 0) {
    controlPoints.pop();
    restartAnimation();
  }
});

PUSH.addEventListener("click", () => {
  controlPoints.push(new Vec2({ x: 0, y: 0 }));
  restartAnimation();
});

RESET.addEventListener("click", () => {
  controlPoints = DEFAULT_POINTS.map((p) => new Vec2({ x: p.x, y: p.y }));
  restartAnimation();
});
