// 流量设计
import React from 'react'
import classNames from 'classnames'
import moment from 'moment'
import { Checkbox, DatePicker, TimePicker, message, Icon } from 'antd'
import styles from './FlowPop.scss'

import AreaInterFlow from '../../../AreaPlan/AreaFlow/AreaInterFlow/AreaInterFlow'
import DrawCanalization from '../../../../utlis/drawCanalization'
import getResponseDatas from '../../../../utlis/getResponseData'

class FlowPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      banksfigure: false, // 渠化图弹窗
      planList: null,
      defaultDate: this.getNowFormatDate(),
      startTime: '07:00',
      endTime: '08:00',
      interName: null,
      interId: null,
      interBasicRate: null,
      planIndex: 0,
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.planListUrl = '/simulation/area/sim/flow/list'
    this.addPlanUrl = '/simulation/area/sim/flow/add/info'
    this.interFlowUrl = '/simulation/area/sim/flow/list'
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.saveUrl = '/simulation/area/sim/flow/add'
    this.deleteUrl = '/simulation/area/sim/flow/delete/info'
    this.pointerParams = {
      width: '',
      height: '',
    }
    this.saveParams = {
      areaFlowId: 0,
      areaId: 0,
      basicRate: 100,
      nodeFlowId: 0,
      nodeId: 0,
    }
  }
  componentDidMount = () => {
    const { areaId } = this.props
    this.w = this.centerWrapper.offsetWidth - 10
    this.h = this.centerWrapper.offsetHeight - 10
    this.defaultW = this.w
    this.defaultH = this.h
    this.areaId = areaId
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
    this.getFlowPlanList()
    this.getAreaInterPoints()
  }
  getBanksfigure = (e) => {
    const interName = e.target.getAttribute('intername')
    const interId = e.target.getAttribute('interid')
    this.setState({
      banksfigure: true,
      interName,
      interId,
    })
  }
  getClose = () => {
    this.setState({
      banksfigure: false,
    })
  }
  // 方案列表
  getFlowPlanList = () => {
    getResponseDatas('get', `${this.planListUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.areaFlowId = content[0].areaFlowId
        this.areaGeometryId = content[0].areaGeometryId
        this.setState({
          planRowId: this.areaFlowId,
          planList: content,
        })
        this.getInterFlowMsg()
      } else {
        this.setState({ planList: [] })
      }
    })
  }
  //
  getInterFlowMsg = () => {
    getResponseDatas('get', `${this.interFlowUrl}/${this.areaId}/${this.areaGeometryId}/${this.areaFlowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.setState({ interBasicRate: content })
      } else {
        this.setState({ interBasicRate: [] })
      }
    })
  }
  // 获取路口点 位置
  getAreaInterPoints = () => {
    getResponseDatas('get', `${this.pointUrl}/${this.areaId}`, this.pointerParams).then((res) => {
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
  // 获取各路口对应关系
  getNodeRelation = () => {
    getResponseDatas('get', `${this.relationUrl}/${this.areaId}`).then((res) => {
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
  getNowFormatDate = () => {
    const dates = new Date()
    const years = dates.getFullYear()
    let month = dates.getMonth() + 1
    let days = dates.getDate()
    month = month <= 9 ? '0' + month : month
    days = days <= 9 ? '0' + days : days
    return years + '-' + month + '-' + days
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
  // 获取选中的路口流量方案
  getInterFlowPlan = (id) => {
    this.interFlowPlanId = id
  }
  // 切换方案
  handleChangePlan = (e) => {
    const flowId = Number(e.target.getAttribute('flowid'))
    const index = Number(e.target.getAttribute('index'))
    this.areaFlowId = flowId
    this.setState({ planIndex: index })
    this.getInterFlowMsg()
  }
  handleDeletePlan = (e) => {
    e.stopPropagation()
    const areaGeometryId = e.currentTarget.getAttribute('geometryid')
    const areaFlowId = e.currentTarget.getAttribute('flowid')
    const rowId = e.currentTarget.getAttribute('rowid')
    // console.log(areaFlowId, areaGeometryId, rowId)
    getResponseDatas('delete', `${this.deleteUrl}/${this.areaId}/${areaGeometryId}/${areaFlowId}/${rowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getFlowPlanList()
        this.props.isDelete()
      }
      message.info(content)
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
  handleDateChange = (moments, value) => {
    this.setState({ defaultDate: value })
  }
  handleStartTimeChange = (moments, value) => {
    this.setState({ startTime: value })
  }
  handleEndTimeChange = (moments, value) => {
    this.setState({ endTime: value })
  }
  render() {
    const { banksfigure } = this.state
    return (
      <div className={styles.canalizWrapper}>
        <div className={styles.canalizBox}>
          <div className={styles.modeBox}>
            <div className={styles.modeBtn}>
              <span className={styles.name}>流量采集日期: </span>
              <DatePicker key={this.state.defaultDate} placeholder="请选择日期" defaultValue={moment(this.state.defaultDate, 'YYYY-MM-DD')} onChange={this.handleDateChange} />
            </div>
            <div className={styles.modeBtn}>
              <span className={styles.name}>流量采集时段: </span>
              <TimePicker key={this.state.startTime} timestap="startTime" placeholder="请选择时间" defaultValue={moment(this.state.startTime, 'hh:mm')} format="HH:mm" onChange={this.handleStartTimeChange} />
              至
              <TimePicker key={this.state.endTime} timestap="endTime" placeholder="请选择时间" defaultValue={moment(this.state.endTime, 'hh:mm')} format="HH:mm" onChange={this.handleEndTimeChange} />
            </div>
          </div>
          <div className={styles.planListBox}>
            {
              this.state.planList &&
              this.state.planList.map((item, index) => {
                return (
                  <div
                    className={classNames({
                      [styles.planBtn]: true,
                      [styles.planChecked]: this.state.planIndex === index,
                    })}
                    key={item.areaFlowId}
                    flowid={item.areaFlowId}
                    index={index}
                    onClick={this.handleChangePlan}
                  >
                    {item.flowTitle}
                    <span className={styles.delPlanIcon} geometryid={item.areaGeometryId} flowid={item.areaFlowId} rowid={item.rowId} onClick={this.handleDeletePlan}>
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

            <div className={styles.examine_top}>
              <span><i />路口中心点</span>
              <span><i />道路单行线</span>
            </div>
          </div>

          <div className={styles.rightDrawAgain}>
            <div className={styles.title}><span className={styles.item}>路口名称</span><span className={styles.item}><Checkbox />浮动(%)</span></div>
            {
              this.state.interBasicRate &&
              <div className={styles.content}>
                {
                  this.state.interBasicRate.map((item, index) => {
                    return (<div className={styles.line} key={item.nodeId}><span className={styles.item}>{item.nodeName}</span><span className={styles.item}>{item.basicRate}</span></div>)
                  })
                }
              </div>
            }
          </div>
        </div>
        {banksfigure ?
          <div className={styles.flowBoxMoudle}>
            <div className={styles.flowBox}>
              <span className={styles.close} onClick={this.getClose} />
              <div className={styles.title}>{this.state.interName}</div>
              <AreaInterFlow
                areaId={this.areaId}
                geometryId={this.areaGeometryId}
                nodeId={this.state.interId}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
                day={this.state.defaultDate}
                getInterFlowPlan={this.getInterFlowPlan}
                readOnly={this.props.readOnly}
              />
            </div>
          </div> : null}

      </div>

    )
  }
}

export default FlowPop
