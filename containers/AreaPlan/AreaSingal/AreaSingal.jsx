import React from 'react'
import { TimePicker, message } from 'antd'
import moment from 'moment'
import styles from './AreaSingal.scss'

import DrawCanalization from '../../../utlis/drawCanalization'
import Header from '../../Header/AreaHeader'
import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import InterSingal from './InterSingal/InterSingal'
import getResponseData from '../../../utlis/getResponseData'

const format = 'HH:mm'
class AreaSingal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaSingal: false,
      checked: false,
      startTime: '07:00',
      endTime: '08:00',
      interPoint: null,
      areaName: null,
      interName: null,
      hasFlowTime: true,
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.singalPlanUrl = '/simulation/area/sim/signal/list'
    this.addPlanUrl = '/simulation/area/sim/signal/add/info'
    this.chageNameUrl = '/simulation/area/sim/signal/update/info'
    this.deleteUrl = '/simulation/area/sim/signal/delete/info'
    this.saveUrl = '/simulation/area/sim/signal/add'
    this.pointerParams = {
      width: '',
      height: '',
    }
    this.changeNameP = {
      stpTitle: '',
      rowId: '',
    }
    this.saveParams = {
      areaId: '',
      areaStpId: '',
      endTime: '',
      nodeId: '',
      offset: '',
      phaseId: '',
      rowId: '',
      startTime: '',
      stpId: '',
    }
  }
  componentDidMount = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const areaMsg = JSON.parse(sessionStorage.getItem('areaPlanMsg'))
    const { areaId, areaName, planMsg } = areaMsg
    this.designerId = userInfo.id
    this.areaMsg = areaMsg
    this.areaGeometryId = planMsg.areaGeometryId
    this.areaFlowId = planMsg.flowId
    this.saveParams.areaId = areaId
    this.startHour = planMsg.startTime
    this.endHour = planMsg.endTime
    this.w = this.centerWrapper.offsetWidth - 10
    this.h = this.centerWrapper.offsetHeight - 10
    this.defaultW = this.w
    this.defaultH = this.h
    this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
    this.areaId = areaId
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    this.setState({ areaName })
    this.getAreaInterPoints()
    this.getSingalPlanList()
  }
  // 信号方案列表
  getSingalPlanList = () => {
    getResponseData('get', `${this.singalPlanUrl}/${this.areaId}/${this.areaGeometryId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        const { planMsg } = this.areaMsg
        const { startTime, endTime } = planMsg
        this.areaStpId = planMsg.stpId ? planMsg.stpId : content[0].areaStpId
        if (startTime && endTime) {
          this.hasFlowTime = true
        } else {
          this.hasFlowTime = false
        }
        this.setState({
          planList: content,
          planRowId: this.areaStpId,
          hasFlowTime: this.hasFlowTime,
        }, () => {
          this.handleChangePlan('', this.areaStpId)
        })
      } else {
        this.setState({ planList: [] })
      }
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
  getareaSingal = (e) => {
    const interId = e.target.getAttribute('interid')
    const interName = e.target.getAttribute('intername')
    this.setState({
      areaSingal: true,
      interId,
      interName,
    })
  }
  getareaSingalClose = () => {
    this.setState({ areaSingal: false })
  }
  // 时间转时间戳
  getTimeStemp = (time) => {
    const hour = time.split(':')[0]
    const min = time.split(':')[1]
    return Number(hour * 3600) + Number(min * 60)
  }
  // 获取选中的路口信号方案
  getInterSingalPlan = (id) => {
    this.interSingalPlanId = id
  }
  toggleChecked = () => {
    this.setState({ checked: !this.state.checked })
  }
  checkboxChange = (e) => {
    this.setState({
      checked: e.target.checked,
    })
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
  handleAddPlan = (name) => {
    const addParams = {
      areaId: this.areaId,
      areaGeometryId: this.areaGeometryId,
      areaFlowId: this.areaFlowId,
      designerId: this.designerId,
      stpTitle: name,
      startHour: this.startHour,
      endHour: this.endHour,
    }
    getResponseData('post', this.addPlanUrl, addParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getSingalPlanList()
      }
      message.info(content)
    })
  }
  handleDeletePlan = (...args) => {
    const [, , areaStpId, rowId] = args
    getResponseData('delete', `${this.deleteUrl}/${this.areaId}/${this.areaGeometryId}/${areaStpId}/${rowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getSingalPlanList()
      }
      message.info(content)
    })
  }
  handleChangePlanName = (...args) => {
    const [value, , rowId] = args
    this.changeNameP.stpTitle = value
    this.changeNameP.rowId = rowId
    if (this.nameTimer) {
      clearTimeout(this.nameTimer)
      this.nameTimer = null
    }
    this.nameTimer = setTimeout(() => {
      getResponseData('put', this.chageNameUrl, this.changeNameP).then((res) => {
        const { content } = res.data
        message.info(content)
      })
    }, 1000)
  }
  // 切换方案
  handleChangePlan = (...args) => {
    const [, areaStpId] = args
    this.areaStpId = areaStpId
    this.areaMsg.planMsg.stpId = areaStpId
    const planItems = (this.state.planList.filter(item => item.areaStpId == areaStpId))[0] || this.state.planList[0]
    // console.log(planItems)
    const { startHour, endHour } = planItems
    if (!this.hasFlowTime) {
      this.areaMsg.planMsg.startTime = startHour
      this.areaMsg.planMsg.endTime = endHour
      this.setState({
        startTime: startHour,
        endTime: endHour,
      })
    } else {
      const { startTime, endTime } = this.areaMsg.planMsg
      this.setState({
        startTime,
        endTime,
      })
    }
    sessionStorage.setItem('areaPlanMsg', JSON.stringify(this.areaMsg))
  }
  // 保存
  handleSaveInterSingal = () => {
    this.saveParams.areaStpId = this.areaStpId
    this.saveParams.startTime = this.state.startTime
    this.saveParams.endTime = this.state.endTime
    this.saveParams.stpId = this.interSingalPlanId
    this.saveParams.nodeId = this.state.interId
    getResponseData('post', this.saveUrl, this.saveParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ areaSingal: false })
      }
      message.info(content)
    })
  }
  handleStartTime = (moments, value) => {
    this.setState({ startTime: value })
  }
  handleEndTime = (moments, value) => {
    this.setState({ endTime: value })
  }
  render() {
    const { areaSingal } = this.state
    return (
      <div className={styles.canalizWrapper}>
        <Header areaName={this.state.areaName} {...this.props} hiddenSave="true" />
        <div className={styles.canalizBox}>
          <div className={styles.modeBox}>
            <div className={styles.modeBtn}>
              <span className={styles.name}>信号时段: </span>
              <TimePicker minuteStep={15} key={this.state.startTime} placeholder="请选择 时间" format={format} disabled={this.state.hasFlowTime} defaultValue={moment(this.state.startTime, format)} onChange={this.handleStartTime} />
               至
              <TimePicker minuteStep={15} key={this.state.endTime} placeholder="请选择时间" format={format} disabled={this.state.hasFlowTime} defaultValue={moment(this.state.endTime, format)} onChange={this.handleEndTime} />
            </div>
          </div>
          <div className={styles.planListBox}>
            {
              this.state.planList &&
                <AddPlanList
                  typeId="areaStpId"
                  planRowId={this.state.planRowId}
                  planList={this.state.planList}
                  handleDeletePlan={this.handleDeletePlan}
                  getNewPlanName={this.handleAddPlan}
                  changePlanName={this.handleChangePlanName}
                  changePlan={this.handleChangePlan}
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
                    onClick={this.getareaSingal}
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
          {
            areaSingal &&
              <div className={styles.flowBoxMoudle}>
                <div className={styles.flowBox}>
                  <span className={styles.close} onClick={this.getareaSingalClose} />
                  <div className={styles.title}>{this.state.interName}</div>
                  <div className={styles.main}>
                    <InterSingal
                      nodeId={this.state.interId}
                      areaId={this.areaId}
                      areaGeometryId={this.areaGeometryId}
                      stpId={this.areaStpId}
                      startTime={this.state.startTime}
                      endTime={this.state.endTime}
                      getInterSingalPlan={this.getInterSingalPlan}
                    />
                  </div>
                  <div className={styles.footer}>
                    <span onClick={this.handleSaveInterSingal}>保存</span>
                    <span onClick={this.getareaSingalClose}>取消</span>
                  </div>
                </div>
              </div>
          }
        </div>

      </div >

    )
  }
}

export default AreaSingal
