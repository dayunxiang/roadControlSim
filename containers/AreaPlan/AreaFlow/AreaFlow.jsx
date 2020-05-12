// 流量设计
import React from 'react'
import moment from 'moment'
import { Checkbox, DatePicker, TimePicker, Select, message } from 'antd'
import Header from '../../Header/AreaHeader'
import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import styles from './AreaFlow.scss'

import AreaInterFlow from './AreaInterFlow/AreaInterFlow'
import DrawCanalization from '../../../utlis/drawCanalization'
import getResponseDatas from '../../../utlis/getResponseData'

class AreaFlow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      banksfigure: false, // 渠化图弹窗
      areaName: null,
      planRowId: null,
      planList: null,
      defaultDate: null,
      startTime: '07:00',
      endTime: '08:00',
      interName: null,
      interId: null,
      interBasicRate: null,
      hiddenSave: true,
      interFlowId: null,
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.planListUrl = '/simulation/area/sim/flow/list'
    this.addPlanUrl = '/simulation/area/sim/flow/add/info'
    this.interFlowUrl = '/simulation/area/sim/flow/list'
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.saveUrl = '/simulation/area/sim/flow/add'
    this.deleteUrl = '/simulation/area/sim/flow/delete/info'
    this.updateInfo = '/simulation/area/sim/flow/update/info'
    this.nodeFlowPlanUrl = '/simulation/area/sim/flow/get/nodeFlowId/rate/'
    this.addFlowParams = {
      areaId: 0,
      day: 0,
      designerId: 0,
      endHour: '',
      flowDes: '',
      flowTitle: '',
      startHour: '',
      areaGeometryId: '',
    }
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
    const areaMsg = JSON.parse(sessionStorage.getItem('areaPlanMsg'))
    const { areaId, areaName, planMsg } = areaMsg
    this.areaMsg = areaMsg
    this.areaGeometryId = planMsg.areaGeometryId
    this.addFlowParams.areaGeometryId = this.areaGeometryId
    this.w = this.centerWrapper.offsetWidth - 10
    this.h = this.centerWrapper.offsetHeight - 10
    this.defaultW = this.w
    this.defaultH = this.h
    this.areaId = areaId
    this.addFlowParams.areaId = this.areaId
    this.saveParams.areaId = this.areaId
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
    this.setState({ areaName })
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
    }, () => {
      this.getDefaultNodePlan()
    })
  }
  getDefaultNodePlan = () => {
    getResponseDatas('get', `${this.nodeFlowPlanUrl}/${this.areaId}/${this.areaGeometryId}/${this.areaFlowId}/${this.state.interId}`).then((res) => {
      // console.log(res)
      const { code, content } = res.data
      if (code === 200 && content) {
        this.setState({ interFlowId: content.nodeFlowId })
      }
    })
  }
  // 方案列表
  getFlowPlanList = () => {
    getResponseDatas('get', `${this.planListUrl}/${this.areaId}/${this.areaGeometryId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        const { planMsg } = this.areaMsg
        this.areaFlowId = planMsg.flowId ? planMsg.flowId : content[0].areaFlowId
        // console.log('应该选中的flowId：：：：', this.areaFlowId)
        this.setState({
          planList: content,
          planRowId: this.areaFlowId,
        }, () => {
          this.handleChangePlan('', this.areaFlowId)
        })
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
        this.interBasicRate = content
        this.setState({ interBasicRate: content })
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
  handleChangePlan = (...args) => {
    const [, id] = args
    this.areaFlowId = id
    this.areaMsg.planMsg.flowId = id
    const planItems = (this.state.planList.filter(item => item.areaFlowId === id))[0] || this.state.planList[0]
    const { rowId, day, startHour, endHour } = planItems
    this.rowId = rowId
    this.setState({
      defaultDate: day > 0 ? this.timestampToTime(day) : this.getNowFormatDate(),
      startTime: startHour,
      endTime: endHour,
    }, () => {
      // console.log(this.state.defaultDate, 'chakantime::::::')
    })
    this.areaMsg.planMsg.startTime = startHour
    this.areaMsg.planMsg.endTime = endHour
    sessionStorage.setItem('areaPlanMsg', JSON.stringify(this.areaMsg))
    this.getInterFlowMsg()
  }
  handleAddPlan = (name) => {
    this.addFlowParams.flowTitle = name
    this.addFlowParams.day = new Date(this.state.defaultDate).getTime()
    this.addFlowParams.startHour = this.state.startTime
    this.addFlowParams.endHour = this.state.endTime
    getResponseDatas('post', this.addPlanUrl, this.addFlowParams).then((res) => {
      // console.log(res)
      const { code, content } = res.data
      if (code === 200) {
        this.getFlowPlanList()
      }
      message.info(content)
    })
  }
  handleDeletePlan = (...args) => {
    const [, , areaFlowId, rowId] = args
    getResponseDatas('delete', `${this.deleteUrl}/${this.areaId}/${this.areaGeometryId}/${areaFlowId}/${rowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getFlowPlanList()
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
    this.setState({
      defaultDate: value,
      hiddenSave: false,
    })
  }
  handleStartTimeChange = (moments, value) => {
    this.setState({
      startTime: value,
      hiddenSave: false,
    })
  }
  handleEndTimeChange = (moments, value) => {
    this.setState({
      endTime: value,
      hiddenSave: false,
    })
  }
  handleSaveInterFlowUse = () => {
    this.saveParams.areaFlowId = this.areaFlowId
    this.saveParams.nodeId = this.state.interId
    this.saveParams.nodeFlowId = this.interFlowPlanId
    if (this.interBasicRate.length > 0) {
      const interItems = this.interBasicRate.filter(item => item.nodeId == this.state.interId)
      if (interItems.length > 0) {
        const { basicRate } = interItems[0]
        this.saveParams.basicRate = basicRate
      } else {
        this.saveParams.basicRate = 0
      }
    }
    getResponseDatas('post', this.saveUrl, this.saveParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ banksfigure: false })
      }
      message.info(content)
    })
  }
  handleCancelSave = () => {
    this.setState({ banksfigure: false })
  }
  timestampToTime = (timestamp) => {
    const date = new Date(timestamp) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = date.getDate()
    // console.log(Y, M, D)
    return Y + M + D
  }
  handleSavePlanTime = () => {
    const params = {
      rowId: this.rowId,
      day: this.state.defaultDate ? new Date(this.state.defaultDate).getTime() : new Date().getTime(),
      startHour: this.state.startTime,
      endHour: this.state.endTime,
    }
    getResponseDatas('put', this.updateInfo, params).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ hiddenSave: true })
        this.getFlowPlanList()
      }
      message.info(content)
    })
  }
  handleBasicRate = (e) => {
    const { value } = e.target
    if (isNaN(value)) {
      if (this.rateTimer) {
        clearTimeout(this.rateTimer)
        this.rateTimer = null
      }
      this.rateTimer = setTimeout(() => {
        message.info('请输入有效数字')
      }, 1000)
    } else {
      const interId = e.target.getAttribute('interid')
      const interPlan = this.interBasicRate.filter(item => item.nodeId == interId)
      interPlan[0].basicRate = value
    }
  }
  // 修改方案名称
  handleChangePlanName = (value, id) => {
    const planItems = (this.state.planList.filter(item => item.areaFlowId == id))[0]
    const params = {
      rowId: planItems.rowId,
      flowTitle: value,
      areaGeometryId: planItems.areaGeometryId,
      areaFlowId: id,
    }
    getResponseDatas('put', this.updateInfo, params).then((res) => {
      const { code, content } = res.data
      message.info(content)
    })
  }
  render() {
    const { banksfigure } = this.state
    return (
      <div className={styles.canalizWrapper}>
        <Header areaName={this.state.areaName} {...this.props} hiddenSave={this.state.hiddenSave} handleSavePlan={this.handleSavePlanTime} />
        <div className={styles.canalizBox}>
          <div className={styles.modeBox}>
            <div className={styles.modeBtn}>
              <span className={styles.name}>流量采集日期: </span>
              <DatePicker key={this.state.defaultDate} placeholder="请选择日期" defaultValue={moment(this.state.defaultDate || this.getNowFormatDate(), 'YYYY-MM-DD')} onChange={this.handleDateChange} />
            </div>
            <div className={styles.modeBtn}>
              <span className={styles.name}>流量采集时段: </span>
              <TimePicker key={this.state.startTime} minuteStep={15} placeholder="请选择时间" defaultValue={moment(this.state.startTime, 'hh:mm')} format="HH:mm" onChange={this.handleStartTimeChange} />
              至
              <TimePicker key={this.state.endTime} minuteStep={15} placeholder="请选择时间" defaultValue={moment(this.state.endTime, 'hh:mm')} format="HH:mm" onChange={this.handleEndTimeChange} />
            </div>
            {/* <div className={styles.modeBtn}><span className={styles.name}>时间隔断: </span>
              <Select defaultValue="15">
                <Option value="15">15分钟</Option>
                <Option value="30">30分钟</Option>
                <Option value="45">45分钟</Option>
                <Option value="1">1时</Option>
              </Select>
            </div> */}
          </div>
          <div className={styles.planListBox}>
            {
              this.state.planList &&
              <AddPlanList
                key={this.state.planRowId}
                typeId="areaFlowId"
                planRowId={this.state.planRowId}
                planList={this.state.planList}
                getNewPlanName={this.handleAddPlan}
                handleDeletePlan={this.handleDeletePlan}
                changePlan={this.handleChangePlan}
                changePlanName={this.handleChangePlanName}
              />
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
            <div className={styles.title}><span className={styles.item}>路口名称</span><span className={styles.item}>浮动(%)</span></div>
            <div className={styles.content}>
              {
                this.state.interBasicRate &&
                this.state.interBasicRate.map((item, index) => {
                  return (
                    <div className={styles.line} key={item.nodeId}>
                      <span className={styles.item}>{item.nodeName}</span>
                      <input interid={item.nodeId} className={styles.item} defaultValue={item.basicRate} onChange={this.handleBasicRate} />
                    </div>)
                })
              }
            </div>
          </div>
        </div>
        {banksfigure ?
          <div className={styles.flowBoxMoudle}>
            <div className={styles.flowBox}>
              <span className={styles.close} onClick={this.handleCancelSave} />
              <div className={styles.title}>{this.state.interName}</div>
              <AreaInterFlow
                areaId={this.areaId}
                geometryId={this.areaGeometryId}
                nodeId={this.state.interId}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
                day={this.state.defaultDate || this.getNowFormatDate()}
                interFlowId={this.state.interFlowId}
                getInterFlowPlan={this.getInterFlowPlan}
              />
              <div className={styles.footer}>
                <span onClick={this.handleSaveInterFlowUse}>保存</span>
                <span onClick={this.handleCancelSave}>取消</span>
              </div>
            </div>
          </div> : null}

      </div>

    )
  }
}

export default AreaFlow
