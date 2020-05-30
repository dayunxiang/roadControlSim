// 渠化设计
import React from 'react'
import { message, Icon } from 'antd'
import classNames from 'classnames'
import AddPlanList from '../../../../components/AddPlanList/AddPlanList'
import styles from './CanalizationPop.scss'

import DrawCanalization from '../../../../utlis/drawCanalization'
import getResponseData from '../../../../utlis/getResponseData'

class CanalizationPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      banksfigure: false, // 渠化图弹窗
      planList: null,
      interPoint: null,
      planRowId: null,
      interName: null,
      interPlanList: null,
      imgUrl: null,
      nodePlanChecked: null,
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.planListUrl = '/simulation/area/sim/geometry/get'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.deleteUrl = '/simulation/area/sim/geometry/delete'
    this.addPlanUrl = '/simulation/area/sim/geometry/add/info'
    this.planNameUrl = '/simulation/area/sim/geometry/update/info'
    this.nodegeoUrl = '/simulation/area/sim/geometry/get/node/geometry'
    this.interList = '/simulation/geometry/get/info'
    this.addGeometry = '/simulation/area/sim/geometry/add'
    this.pointerParams = {
      width: '',
      height: '',
    }
    this.addPlanParams = {
      areaGeometryId: null,
      areaId: 0,
      designerId: 1,
      geometryDes: 'string',
      geometryTitle: 'string',
      rowId: null,
    }
    this.addGeometryParams = {
      areaGeometryId: 0,
      areaId: 0,
      nodeGeometryId: 0,
      nodeId: 0,
    }
  }
  componentDidMount = () => {
    const { areaId } = this.props
    this.w = this.centerWrapper.offsetWidth - 10
    this.h = this.centerWrapper.offsetHeight - 10
    this.defaultW = this.w
    this.defaultH = this.h
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
    this.areaId = areaId
    this.addPlanParams.areaId = this.areaId
    this.addGeometryParams.areaId = this.areaId
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    this.getAreaInterPoints()
    this.getPlanList()
  }
  // 当前区域渠化 获取路口渠化方案
  getBanksfigure = (e) => {
    const interName = e.target.getAttribute('intername')
    const interId = e.target.getAttribute('interid')
    this.addGeometryParams.nodeId = interId
    getResponseData('get', `${this.interList}/${interId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.setState({ interPlanList: content }, () => {
          getResponseData('get', `${this.nodegeoUrl}/${this.areaId}/${this.areaGeometryId}/${interId}`).then((result) => {
            if (result.data.code === 200 && result.data.content) {
              const planItem = this.state.interPlanList.filter(item => item.geometryId === result.data.content)
              this.setState({
                nodePlanChecked: result.data.content,
                imgUrl: planItem[0].shapeFileName,
              })
            } else {
              this.setState({
                nodePlanChecked: content[0].geometryId,
                imgUrl: content[0].shapeFileName,
              })
            }
          })
        })
      }
    })
    this.setState({
      banksfigure: true,
      interName,
    })
  }
  getClose = () => {
    this.setState({
      banksfigure: false,
    })
  }
  // 获取路口点 位置
  getAreaInterPoints = () => {
    getResponseData('get', `${this.pointUrl}/${this.areaId}`, this.pointerParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.InterPoint = content
          this.setState({ interPoint: content })
          this.getNodeRelation()
        } else {
          message.info('暂无数据！')
        }
      }
    })
  }
  // 获取方案列表
  getPlanList = () => {
    getResponseData('get', `${this.planListUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.areaGeometryId = content[0].areaGeometryId
        this.setState({
          planList: content,
          planRowId: this.areaGeometryId,
        })
      } else {
        this.setState({ planList: [] })
      }
    })
  }
  // 获取各路口对应关系
  getNodeRelation = () => {
    getResponseData('get', `${this.relationUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        content.forEach((item) => {
          const fromPoint = (this.InterPoint.filter(items => items.nodeId === item.fromNodeId))[0]
          const toPoint = (this.InterPoint.filter(items => items.nodeId === item.toNodeId))[0]
          const x1 = fromPoint.unitLongitude
          const y1 = fromPoint.unitLatitude
          const x2 = toPoint.unitLongitude
          const y2 = toPoint.unitLatitude
          this.newCanvas.getDistanceXy(x1, y1, x2, y2, item.double)
        })
      }
    })
  }
  getCanvasRefresh = () => {
    this.centerMoveBox.style.width = this.w + 'px'
    this.centerMoveBox.style.height = this.h + 'px'
    if (this.w <= this.defaultW) {
      this.centerMoveBox.style.left = 0
      this.centerMoveBox.style.top = 0
    } else {
      // const OFFSET = 260
      // this.centerMoveBox.style.left = -(this.scrollNum * OFFSET) + 'px'
      // this.centerMoveBox.style.top = -(this.scrollNum * OFFSET) + 'px'
    }
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    this.getAreaInterPoints()
  }
  // 切换路口渠化方案
  handlePlanShape = (e) => {
    const imgUrl = e.target.getAttribute('imgsrc')
    const geometryId = parseInt(e.target.getAttribute('geometryid'), 0)
    this.setState({
      imgUrl,
      nodePlanChecked: geometryId,
    })
  }
  // 放大
  handleBlowUpBox = () => {
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w + 500, this.h + 500)
    this.pointerParams.width = this.w + 500
    this.pointerParams.height = this.h + 500
    this.getAreaInterPoints()
  }
  // 鼠标按下 获取拖动前鼠标的位置
  handleMoveMouseDown = (e) => {
    this.isDrag = true
    this.defaultX = e.clientX
    this.defaultY = e.clientY
    this.centerMoveBox.style.cursor = 'move'
    this.moveBoxLeft = Math.abs(parseInt(this.centerMoveBox.style.left, 0))
    this.moveBoxTop = Math.abs(parseInt(this.centerMoveBox.style.top, 0))
  }
  // 鼠标移动 未加边界判断
  handleMoveMouseMove = (e) => {
    if (this.isDrag) {
      const x = e.clientX
      const y = e.clientY
      const moveX = this.defaultX - x
      const moveY = this.defaultY - y
      const offsetX = this.moveBoxLeft + moveX < 0 ? 0 : this.moveBoxLeft + moveX
      const offsetY = this.moveBoxTop + moveY < 0 ? 0 : this.moveBoxTop + moveY
      this.centerMoveBox.style.left = -offsetX + 'px'
      this.centerMoveBox.style.top = -offsetY + 'px'
    }
  }
  handleMoveMouseUp = () => {
    this.isDrag = false
    this.centerMoveBox.style.cursor = 'default'
  }
  // 滚轮放大 缩小
  handleMoveBoxScroll = (e) => {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }
    if (e.nativeEvent.wheelDelta > 0) {
      this.scrollTimer = setTimeout(() => {
        this.w += 500
        this.h += 500
        this.scrollNum += 1
        this.getCanvasRefresh()
      }, 1000)
    } else {
      this.scrollTimer = setTimeout(() => {
        this.w -= 500
        this.h -= 500
        this.scrollNum -= 1
        this.getCanvasRefresh()
      }, 1000)
    }
  }
  handleAreaGeometry = (e) => {
    this.areaGeometryId = Number(e.target.getAttribute('geometryid'))
    this.setState({ planRowId: this.areaGeometryId })
  }
  handleDelPlan = (e) => {
    const areaGeometryId = e.currentTarget.getAttribute('geometryid')
    const rowId = e.currentTarget.getAttribute('rowid')
    getResponseData('delete', `${this.deleteUrl}/${this.areaId}/${areaGeometryId}/${rowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getPlanList()
        this.props.isDelete()
      }
      message.info(content)
    })
  }
  render() {
    const { banksfigure } = this.state
    return (
      <div className={styles.canalizWrapper}>
        <div className={styles.canalizBox}>
          <div className={styles.planListBox}>
            {
              this.state.planList &&
              this.state.planList.map((item, index) => {
                return (
                  <div
                    className={classNames({
                      [styles.planBtn]: true,
                      [styles.planChecked]: item.areaGeometryId === this.state.planRowId,
                    })}
                    key={item.rowId}
                    geometryid={item.areaGeometryId}
                    onClick={this.handleAreaGeometry}
                  >
                    {item.geometryTitle}
                    <span className={styles.delPlanIcon} geometryid={item.areaGeometryId} rowid={item.rowId} onClick={this.handleDelPlan}>
                      <Icon type="close" />
                    </span>
                  </div>
                )
              })
            }
          </div>
          <div className={styles.centerWrapper} ref={(input) => { this.centerWrapper = input }}>
            <div
              style={{ top: 0, left: 0 }}
              className={styles.centerMoveBox}
              ref={(input) => { this.centerMoveBox = input }}
              onMouseDown={this.handleMoveMouseDown}
              onMouseMove={this.handleMoveMouseMove}
              onMouseUp={this.handleMoveMouseUp}
              onWheel={this.handleMoveBoxScroll}
            >
              <div className={styles.canvasBox} ref={(input) => { this.canvasBox = input }} />
              {
                this.state.interPoint &&
                this.state.interPoint.map(item => (
                  <div
                    className={styles.interPointBox}
                    key={item.nodeId}
                    lng={item.unitLongitude}
                    lat={item.unitLatitude}
                    interid={item.nodeId}
                    intername={item.nodeName}
                    style={{ left: item.unitLongitude - 20, top: item.unitLatitude - 20 }}
                    onClick={this.getBanksfigure}
                    title={item.nodeName}
                  />
                ))
              }
            </div>
          </div>
          <div className={styles.examine_top}>
            <span><i />路口中心点</span>
            <span><i />道路单行线</span>
          </div>
          {/* <div className={styles.examine_right}>
            <span onClick={this.handleBlowUpBox}><i />放大</span>
            <span onClick={this.handleShrinkBox}><i />缩小</span>
            <span><i />全局</span>
            <span><i />平移</span>
          </div> */}
          {banksfigure ?
            <div className={styles.canalization}>
              <div className={styles.cana_title} title={this.state.interName + '路口渠化方案管理'}>{this.state.interName}路口渠化方案管理</div>
              <span className={styles.close} onClick={this.getClose} />
              {/* <span className={styles.cana_close} /> */}
              <div className={styles.cana_centent}>
                <span className={styles.compass} />
                {
                  this.state.imgUrl &&
                  <img src={this.state.imgUrl} alt="" />
                }
                <div className={styles.precept}>
                  {
                    this.state.interPlanList &&
                    this.state.interPlanList.map(item => (item.geometryId === this.state.nodePlanChecked ?
                      <span
                        key={item.rowId + item.geometryId}
                        className={styles.nodeChecked}
                        geometryid={item.geometryId}
                        imgsrc={item.shapeFileName}
                        onClick={this.handlePlanShape}
                      >{item.geometryTitle}
                      </span> : null
                    ))
                  }
                </div>
              </div>
            </div> : null}
        </div>

      </div>

    )
  }
}

export default CanalizationPop
