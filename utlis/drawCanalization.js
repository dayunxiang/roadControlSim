import Konva from 'konva'

class DrawCanalizaiton {
  constructor(ele, w, h) {
    this.stage = new Konva.Stage({
      container: ele,
      width: w,
      height: h,
    })
    this.layer = new Konva.Layer()
  }
  drawKonvaArrow = (fromX, fromY, toX, toY) => {
    const arrow = new Konva.Arrow({
      x: 0,
      y: 0,
      points: [fromX, fromY, toX, toY],
      pointerLength: 6,
      pointerWidth: 8,
      fill: '#004cc3',
      stroke: '#004cc3',
      strokeWidth: 6,
    })
    this.layer.add(arrow)
    this.stage.add(this.layer)
  }
  getDistanceXy = (x0, y0, x1, y1, isDouble) => {
    const d = (Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2))) - 23
    let x2 = 0
    let y2 = 0
    if (x0 === x1) {
      x2 = x0
      y2 = y0 - (((y0 - y1) / Math.abs(y0 - y1)) * d)
    } else {
      const k = (y1 - y0) / (x1 - x0)
      x2 = x0 + (d / Math.sqrt((1 + Math.pow(k, 2)))) * ((x1 - x0) / Math.abs(x1 - x0))
      y2 = y0 + ((d * k) / Math.sqrt((1 + Math.pow(k, 2)))) * ((x1 - x0) / Math.abs(x1 - x0))
    }
    this.calculateXy(x0, y0, x2, y2, isDouble)
  }
  calculateXy = (fromX, fromY, toX, toY, isDouble) => {
    const l = 14
    const x1 = fromX
    const y1 = fromY
    const x2 = toX
    const y2 = toY
    let x3 = 0
    let y3 = 0
    let x4 = 0
    let y4 = 0
    let x5 = 0
    let y5 = 0
    let x6 = 0
    let y6 = 0
    if (x2 - x1 === 0) {
      x3 = x1 - (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y3 = y1
      x4 = x1 + (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y4 = y1
      x5 = x2 - (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y5 = y2
      x6 = x2 + (((y2 - y1)/Math.abs(y2 - y1)) * (l / 2))
      y6 = y2
    } else {
      const k = (y2 - y1) / (x2 - x1)
      const s1 = (l / 2) * (1 / Math.sqrt(1 + Math.pow(k, 2))) * ((x2 - x1) / Math.abs(x2 - x1))
      const sk = (l / 2) * (k / Math.sqrt(1 + Math.pow(k, 2))) * ((x2 - x1) / Math.abs(x2 - x1))
      x3 = x1 + sk
      y3 = y1 - s1
      x4 = x1 - sk
      y4 = y1 + s1
      x5 = x2 + sk
      y5 = y2 - s1
      x6 = x2 - sk
      y6 = y2 + s1
    }
    // console.log(x3, y3, x4, y4, x5, y5, x6, y6)
    // this.drawKonvaArrow(x3, y3, x5, y5)
    if (isDouble) {
      this.drawKonvaArrow(x4, y4, x6, y6) // 如果是双向的 将剪头做偏移
    } else {
      this.drawKonvaArrow(fromX, fromY, toX, toY)
    }
  }
}

export default DrawCanalizaiton
