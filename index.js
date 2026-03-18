const FPS = 30;
const DT_STEP = 0.01;
const config = {
scale_x: 10,
scale_y: 10,
};

const canvas = document.getElementById("box");
const ctx = canvas.getContext("2d");

function box_size() {
	return Math.min(window.innerWidth, window.innerHeight) - 50;
}

function resizeCanvas() {
const size = box_size();
canvas.width = size;
canvas.height = size;
clearBackground();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function clearBackground() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==================== Mouse Interaction ====================
let mouse = undefined;           // { point: Vec2, index: number } of hovered control point
let mouseDown = false;

canvas.addEventListener("mousedown", () => {
		mouseDown = true;
});
canvas.addEventListener("mouseup", () => {
	mouseDown = false;
});

canvas.addEventListener("mousemove", (e) => {
	const rect = canvas.getBoundingClientRect();
	const canvasX = e.clientX - rect.left;
	const canvasY = e.clientY - rect.top;

	const worldPos = Vec2.fromCanvas({ x: canvasX, y: canvasY });

	const hovered = start_points
		.map((pt, idx) => ({ point: pt, index: idx }))
		.filter(item => worldPos.distance_to(item.point) < 0.4)
		.at(0);

	mouse = hovered ? { ...hovered, worldPos } : undefined;
});

// ==================== Control Points & State ====================
const HALF_SPAN = 8;
let start_points = [
new Vec2({ x: -HALF_SPAN, y:  HALF_SPAN }),
new Vec2({ x: -HALF_SPAN, y: -HALF_SPAN }),
new Vec2({ x:  HALF_SPAN, y: -HALF_SPAN }),
new Vec2({ x:  HALF_SPAN, y:  HALF_SPAN }),
];

let dt = 0;                       // current interpolation parameter [0,1]
let curvePoints = [];             // accumulated curve points (red line)

// ==================== De Casteljau ====================
// Returns an array of levels: [level0, level1, ..., lastLevel]
function deCasteljauLevels(points, t, levels = []) {
	if (points.length === 0) return levels;
	if (levels.length === 0) levels.push(points); // store original as level 0
	
	if (points.length === 1) return levels; // reached the curve point
	
	const nextLevel = [];
	for (let i = 0; i < points.length - 1; i++) {
		nextLevel.push(points[i].lerp(points[i + 1], t));
	}
	levels.push(nextLevel);
	return deCasteljauLevels(nextLevel, t, levels);
}

// ==================== Drawing Helpers ====================
function drawConstruction(levels) {
	for (let i = 0; i < levels.length; i++) {
		const level = levels[i];
		for (let j = 0; j < level.length; j++) {
			// Draw control points (level 0) in green, except hovered one in red
			if (i === 0) {
				const isHovered = mouse && mouse.index === j;
				level[j].draw(isHovered ? 12 : 8, isHovered ? "red" : "#00FF00");
			}
			// Draw lines between consecutive points in this level
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

function mainLoop() {
	clearBackground();

	if (start_points.length > 0) {
		const levels = deCasteljauLevels(start_points, dt);
		drawConstruction(levels);
	
		if (dt < 1) {
			dt = Math.min(dt + DT_STEP, 1); // clamp to 1
			const lastLevel = levels[levels.length - 1];
			if (lastLevel.length === 1) {
				curvePoints.push(lastLevel[0]); // the point on the curve
			}
		}
	
		drawCurveStrip(curvePoints, "red", 3);
	
		if (mouseDown && mouse) {
			start_points[mouse.index] = mouse.worldPos;
		  dt = 0;
		  curvePoints = [];
		}
	}
	
	setTimeout(mainLoop, 1000 / FPS);
}
mainLoop();

function replay() {
	dt = 0;
	curvePoints = [];
}

REPLAY.addEventListener("click", replay);
	
POP.addEventListener("click", () => {
	if (start_points.length > 0) {
		start_points.pop();
		replay()
	}
});

PUSH.addEventListener("click", () => {
  start_points.push(new Vec2({ x: 0, y: 0 }));
	replay()
});
