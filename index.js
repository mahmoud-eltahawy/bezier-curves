const FPS = 30
const DDT = 0.01
const point_move_speed = 0.05;
const ctx = box.getContext("2d")

const config = {
	scale_x : 10,
	scale_y : 10,
}

function box_size() {
	return Math.min(window.innerWidth,window.innerHeight) - 50
}

function resize() {
	const size = box_size()
	box.width = size
	box.height = size
	clear_background()
}
resize()

addEventListener("resize",resize)

function clear_background() {
	const size = box_size()
	ctx.fillStyle = "#000000"
	ctx.fillRect(0,0,size,size)
}
clear_background()

function draw_point({x,y},size = 10) {
	ctx.fillStyle = "#00FF00"
	ctx.fillRect(x,y,size,size)
}


let dt = 0;
const dis = 8
const start_points = [
	new Vec2({x : -dis,y : dis}),
	new Vec2({x : -dis,y : -dis}),
	new Vec2({x : dis,y : -dis}),
	new Vec2({x : dis,y : dis}),
]

let points = []

function linestrip(points,width = 2,color = "#FFFFFF") {
	for (let i=0; i< points.length -1; i++) {
		let first = points[i]
		let second = points[i+1]
		first.draw_line_to(second,width,color)
	}
}

let move_point = null

function all_levels_points(points,t,acc = [start_points]) {
	if (points.length <= 1) {
		return [points]
	}
	const res = []
	for (let i = 0; i<points.length -1; i++) {
		const p = points[i].lerp(points[i + 1],t) 
		res.push(p)
	}
	acc.push(res)
	if (res.length === 1) {
		return acc
	} else {
		return all_levels_points(res,t,acc)
	}
}

function main_loop() {
	clear_background()

	const alp = all_levels_points(start_points,dt)

	for (let i = 0;i <alp.length;i++) {
		const level = alp[i]
		for (let j = 0;j<level.length;j++) {
			level[j].draw()
			if (level.at(j+1)) {
				level[j].draw_line_to(level[j + 1])
			}
		}
	}


	if (dt < 1) {
		dt += DDT
		points.push(alp.at(-1).at(-1))
	}
	linestrip(points,2,"red")



	if (move_point) {
		const sp = start_points[target_point]
		switch (move_point.direction) {
			case 0:
				sp.y += point_move_speed
				break;
			case 1: 
				sp.x -= point_move_speed
				break;
			case 2: 
				sp.x += point_move_speed
				break;
			case 3:
				sp.y -= point_move_speed
				break;
			default:
				throw "unexpected direction"
				break;
		}
		resume_draw()
	}

	setTimeout(main_loop,1000/FPS)
}
main_loop()

function resume_draw() {
	clear_background()

	const new_points = []
	for (t = 0; t <dt; t+=DDT) {
		const alp = all_levels_points(start_points,t)
		const level_one = alp[0] 
		for (let i = 0;i < level_one.length;i++) {
			level_one[i].draw()
		}
		const p = alp.at(-1).at(-1)
		new_points.push(p)
	}
	points = new_points
	linestrip(points,2,"red")

}

REPLAY.addEventListener("click",() => {
	dt = 0
	points = []
})

let target_point = 0

for (let i = 0; i < start_points.length; i++) {
	const button = document.getElementById(`D${i}`)
	button.addEventListener("mousedown",() => {
		move_point = {
			direction : i,
		}
	})
	button.addEventListener("mouseup",() => {
		move_point = null
	})
}

function point_id(i) {
	return `POINT_${i}_ID`
}

function reset_points_options() {
	const options = []
	for (let i = 0; i< start_points.length;i++) {
		options.push(`<option id="${point_id(i)}" value="${i}">${i + 1}</option>`)
	}
	SELECTOR.innerHTML = options.join("") 

	for (let i = 0; i< start_points.length;i++) {
		const el = document.getElementById(point_id(i))
		el.addEventListener("click",() => {
			target_point = i
		})
	}

}
reset_points_options()


POP.addEventListener("click",() => {
	start_points.pop()
	reset_points_options()
})
