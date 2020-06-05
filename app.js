var cd = document.getElementById("canvas")
var c = document.getElementById("mc")
var cb = document.getElementById("mcb")
var ctx = c.getContext("2d")
var bcg = cb.getContext("2d")

let pw = 128
let ph = 64

c.width = cd.getBoundingClientRect().width - 20

let gw = Math.round(c.getBoundingClientRect().width / pw)
let gh = gw

c.height = ph * gw

cb.width = c.width
cb.height = c.height
var newHeight = ""
newHeight += c.height

let sx = c.getBoundingClientRect().x
let sy = c.getBoundingClientRect().y

var image = []
var tool = "drawCircle"
var writeNow
var currentEntity

ctx.strokeStyle = "black"
bcg.lineWidth = 0.1

function Tool(t) {
	tool = t
}

function setup() {
	cd.style.height += newHeight
	for (x = 0; x < pw * gw; x += gw) {
		for (y = 0; y < ph * gh; y += gh) {
			bcg.strokeRect(x, y, gw, gh)
		}
	}
}

function draw(drawLast) {
	if (!drawLast) {
		ctx.clearRect(0, 0, c.width, c.height)
	}
	for (x = drawLast ? image.length - 1 : 0; x < image.length; x++) {
		var shape = image[x]

		switch (shape.tool) {
			case "drawPixel":
				ctx.fillRect(
					shape.xs * gw,
					shape.ys * gh,
					shape.w * gw,
					shape.h * gh
				)
				break

			case "drawRect":
				ctx.fillRect(shape.xs * gw, shape.ys * gh, shape.w * gw, gh)
				for (xa = 1; xa < shape.h - 1; xa++) {
					ctx.fillRect(shape.xs * gw, shape.ys * gh + xa * gh, gw, gh)
					ctx.fillRect(
						shape.xs * gw + shape.w * gw - gw,
						shape.ys * gh + xa * gh,
						gw,
						gh
					)
				}
				ctx.fillRect(
					shape.xs * gw,
					shape.ys * gh + shape.h * gh - gh,
					shape.w * gw,
					gh
				)
				break
			case "fillRect":
				ctx.fillRect(
					shape.xs * gw,
					shape.ys * gh,
					shape.w * gw,
					shape.h * gh
				)
				break

			case "drawLine":
				var a = shape.h / shape.w
				console.log(shape)

				for (
					i = 0;
					i < Math.max(Math.abs(shape.w), Math.abs(shape.h));
					i++
				) {
					ctx.fillRect(
						shape.xs * gw +
							Math.round(
								i *
									(Math.abs(shape.w) > Math.abs(shape.h)
										? 1
										: 1 / a)
							) *
								gw *
								Math.sign(
									Math.abs(shape.w) > Math.abs(shape.h)
										? shape.w
										: shape.h
								),
						shape.ys * gh +
							Math.round(
								i *
									(Math.abs(shape.w) > Math.abs(shape.h)
										? a
										: 1)
							) *
								gh *
								Math.sign(
									Math.abs(shape.w) > Math.abs(shape.h)
										? shape.w
										: shape.h
								),
						gh,
						gw
					)
				}
				break
			case "drawCircle":
				var r = Math.round(Math.sqrt(shape.w ^ (2 + shape.h) ^ 2))
				for (i = 0; i < r * 2; i++) {
					ctx.fillRect(
						(shape.xs - r) * gw + i * gw,
						shape.ys * gh +
							Math.round(i * Math.sin((Math.PI * i) / (2 * r))) *
								gh,
						gw,
						gh
					)
					ctx.fillRect(
						(shape.xs - r) * gw + i * gw,
						shape.ys * gh -
							Math.round(i * Math.sin((Math.PI * i) / (2 * r))) *
								gh,
						gw,
						gh
					)
				}
				break

			case "text":
				console.log(shape)
				for (l = 0; l < shape.letters.length; l++) {
					for (x2 = 0; x2 < 5; x2++) {
						for (y = 0; y < 8; y++) {
							var toDraw = (shape.letters[l].text[x2] >> y) & 0x01
							if (toDraw)
								ctx.fillRect(
									shape.xs * gw + x2 * gw + l * 6 * gw,
									shape.ys * gh + y * gh,
									gw,
									gh
								)
						}
					}
				}
				break
		}
	}
}

function getKey(e) {
	if (writeNow) {
		var currentText = image.find((e, i, a) => {
			return e.xs == xForKey && e.ys == yForKey
		})
		if (e.key == "Backspace") {
			if (currentText.tool == "text") {
				console.log(currentText.letters[currentText.letters.length - 1])
				currentText.letters.pop()
			}
		} else {
			if (e.keyCode >= 32 && e.keyCode <= 255) {
				currentText.letters.push({
					text: font.filter((ele, i, arr) => {
						if (
							i >= e.key.charCodeAt() * 5 &&
							i <= e.key.charCodeAt() * 5 + 4
						) {
							return arr[i]
						}
					}),
					letter: e.key,
				})
			}
			console.log(image[image.length - 1])
		}
		draw()
	}
}

document.addEventListener("mousedown", (e) => {
	var x = e.clientX - gw / 2
	var xt = Math.round((x - sx) / gw)

	var y = e.clientY - gh / 2
	var yt = Math.round((y - sy) / gh)

	writeNow = false

	if (
		x > sx &&
		x < sx + c.getBoundingClientRect().width + sx &&
		y > sy &&
		y < gh * ph + sy
	) {
		if (tool == "text") {
			image.push({
				tool: "text",
				xs: xt,
				ys: yt,
				letters: [],
			})
			xForKey = xt
			yForKey = yt

			writeNow = true
		} else {
			image.push({
				tool: tool,
				xs: xt,
				ys: yt,
				w: 1,
				h: 1,
			})
		}
	}

	function displayPaint(e) {
		var cx = e.clientX - gw / 2
		var cy = e.clientY - gh / 2
		var cxt = Math.round((cx - sx) / gw)
		var cyt = Math.round((cy - sy) / gh)

		if (
			x > sx &&
			x < sx + c.getBoundingClientRect().width + sx &&
			y > sy &&
			y < gh * ph + sy
		) {
			if (
				image[image.length - 1].tool == "drawLine" ||
				image[image.length - 1].tool == "drawCircle"
			) {
				image[image.length - 1].xs = xt
				image[image.length - 1].ys = yt
				image[image.length - 1].w = cxt - xt
				image[image.length - 1].h = cyt - yt
			} else {
				image[image.length - 1].xs = Math.min(xt, cxt)
				image[image.length - 1].ys = Math.min(yt, cyt)
				image[image.length - 1].w = Math.max(Math.abs(cxt - xt), 1)
				image[image.length - 1].h = Math.max(Math.abs(cyt - yt), 1)
			}
			draw()
		}
	}

	document.addEventListener("mousemove", displayPaint, true)

	document.addEventListener("mouseup", function endtool(e) {
		document.removeEventListener("mousemove", displayPaint, true)
		document.removeEventListener("mouseup", endtool)
	})

	draw()
})

document.addEventListener("keyup", getKey)
var output = document.getElementById("output")
function build() {
	var output = document.getElementById("output")
	console.log(output.innerHTML)
	output.innerHtml = 0
	var sum = ""
	for (i = 0; i < image.length; i++) {
		var outputString = "<br>display."
		switch (image[i].tool) {
			case "fillRect":
			case "drawRect":
				outputString +=
					image[i].tool +
					"(" +
					image[i].xs +
					", " +
					image[i].ys +
					", " +
					image[i].w +
					", " +
					image[i].h +
					", " +
					"1);"
				break
			case "text":
				if (image[i].letters.length == 0) {
					outputString = ""
					break
				}
				outputString +=
					"setCursor(" +
					image[i].xs +
					", " +
					image[i].ys +
					');<br>display.println("'
				for (j = 0; j < image[i].letters.length; j++) {
					outputString += image[i].letters[j].letter
				}
				outputString += '");'
				break
			case "drawPixel":
				outputString +=
					image[i].tool +
					"(" +
					image[i].xs +
					", " +
					image[i].ys +
					");"
				break
			case "drawLine":
				outputString +=
					image[i].tool +
					"(" +
					image[i].xs +
					", " +
					image[i].ys +
					", " +
					(image[i].xs + image[i].w) +
					", " +
					(image[i].ys + image[i].h) +
					");"
				break
		}
		sum += outputString
	}
	output.innerHTML = sum
}
document.addEventListener("mousemove", (e) => {})
