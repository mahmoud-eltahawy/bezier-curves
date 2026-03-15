
function box_size() {
    return Math.min(
	    window.innerWidth,
	    window.innerHeight
    ) - 10
}

class Vec2 {
	constructor({x,y}) {
		this.x = x
		this.y = y
	}

	transition({x,y}) {
		return new Vec2({
			x : this.x + x,
			y : this.y + y
		})
	}

	scale(scaler) {
		return new Vec2({
			x : this.x * scaler,
			y : this.y * scaler,
		})
	}

	rotate_z(angle) {
		const cos = Math.cos(angle)
		const sin = Math.sin(angle)
		const x = this.x
		const y = this.y
		return new Vec2({
			x : x * cos - y * sin,
			y : x * sin + y * cos,
		})
	}

	normalized() {
		const half_size = box_size() / 2
		return new Vec2({
			x : half_size * (1 + this.x / config.scale_x),
			y : half_size * (1 - this.y / config.scale_y),
		})
	}

	draw_line_to(other,width = 2, color = '#FFFFFF') {
		const t = this.normalized()
		const o = other.normalized()
		ctx.strokeStyle = color
		ctx.fillStyle = color
		ctx.lineWidth = width
		ctx.beginPath()
		ctx.moveTo(t.x, t.y)
		ctx.lineTo(o.x, o.y)
		ctx.stroke()
	}

	draw(size = 10,color = "#00FF00") {
		const {x,y} = this.normalized()
		ctx.fillStyle = color 
		ctx.fillRect(x - size/2,y - size/2,size,size)
	}

	lerp({x,y},t) {
		return new Vec2({
			x : lerp(this.x,x,t),
			y : lerp(this.y,y,t),
		})
	}
}

function lerp(a,b,t) {
	return a + (b - a) * t
}
