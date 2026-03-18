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
		const dx = this.x - other.x;
		const dy = this.y - other.y;
		return Math.hypot(dx, dy);
	}

	lerp(other, t) {
		return new Vec2({
			x: lerp(this.x,other.x,t),
			y: lerp(this.y,other.y,t)
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

function lerp(a,b,t) {
	return a + (b - a) * t
}
