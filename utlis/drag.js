export function getDrag(oDiv, func, bool) {
  function dragMove(e) { // 移动时
    // 设置移动后盒子的位置

    // 获取当前父级盒子大小
    const parent = this.offsetParent
    const winH = parent.offsetHeight - this.offsetHeight
    const winW = parent.offsetWidth - this.offsetWidth
    // 设置当前拖拽范围
    if (this.XX + (e.clientX - this.mx) < 0 || this.YY + (e.clientY - this.my) < 0 || this.XX + (e.clientX - this.mx) > winW || this.YY + (e.clientY - this.my) > winH) { return }

    // 设置当前拖拽位置
    this.style.left = this.XX + (e.clientX - this.mx) + 'px'
    this.style.top = this.YY + (e.clientY - this.my) + 'px'
  }
  function dragUp(e) { // 松开时
    if (this.releaseCapture) {
      // console.log(dragMove);
      this.releaseCapture()
      this.removeEventListener('mousemove', dragMove, false)
      this.removeEventListener('mouseup', dragUp, false)
    } else {
      // console.log(this);
      this.removeEventListener('mousemove', dragMove, false)
      this.removeEventListener('mouseup', dragUp, false)
      this.removeEventListener('mousemove', this.MOVE, false)
      this.removeEventListener('mouseup', this.UP, false)
      document.removeEventListener('mousemove', this.MOVE, false)
      document.removeEventListener('mouseup', this.UP, false)
      document.removeEventListener('mousemove', dragMove, false)
      document.removeEventListener('mouseup', dragUp, false)
    }
    if (func) {
      func(this.XX + (e.clientX - this.mx), this.YY + (e.clientY - this.my))
    }
  }
  function dragDown(e) { // 按下时
    // console.log(this,e, this.offsetLeft,oDiv);
    
    e = e || window.event
    this.XX = this.offsetLeft // 盒子初始的位置
    this.YY = this.offsetTop
    this.mx = e.clientX // 按下时鼠标的坐标
    this.my = e.clientY
    if (this.setCapture) { // IE和火狐的方式
      this.setCapture()
      this.addEventListener('mousemove', dragMove, false)
      this.addEventListener('mouseup', dragUp, false)
    } else { // 谷歌浏览器
      // 绑定时move方法改变this关键字后返回的小函数
      // 需要给绑定的小函数起个名字，方便解绑时找到绑定的元素
      this.MOVE = dragMove.bind(this)
      this.UP = dragUp.bind(this)
      document.addEventListener('mousemove', this.MOVE, false)
      document.addEventListener('mouseup', this.UP, false)
    }
  }
  oDiv.addEventListener('mousedown', dragDown, false)
}
export default getDrag

