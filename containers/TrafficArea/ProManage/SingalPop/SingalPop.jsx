import React from 'react'
import classNames from 'classnames'
import { TimePicker, message, Icon } from 'antd'
import moment from 'moment'
import styles from './SingalPop.scss'

import DrawCanalization from '../../../../utlis/drawCanalization'
import AddPlanList from '../../../../components/AddPlanList/AddPlanList'
import InterSingal from '../../../AreaPlan/AreaSingal/InterSingal/InterSingal'
import getResponseData from '../../../../utlis/getResponseData'

const format = 'HH:mm'
class SingalPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaSingal: false,
      checked: false,
      startTime: '07:00',
      endTime: '08:00',
      interPoint: null,
      areaName: null,
      planIndex: 0,
      planList: null,
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.singalPlanUrl = '/simulation/area/sim/signal/list'
    this.addPlanUrl = '/simulation/area/sim/signal/add/info/by/flow'
    this.deleteUrl = '/simulation/area/sim/signal/delete/info'
    this.pointerParams = {
      width: '',
      height: '',
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
    this.pointerParams.width = this.w
    this.pointerParams.height = this.h
    // if (areaMsg.planMsg) {
    //   this.areaGeometryId = areaMsg.planMsg.geometryId
    //   this.areaFlowId = areaMsg.planMsg.flowId
    //   this.designerId = areaMsg.planMsg.designerId
    //   this.stpId = areaMsg.planMsg.stpId
    //   this.setState({ planRowId: this.areaFlowId })
    // }
    this.getAreaInterPoints()
    this.getSingalPlanList()
  }
  // 信号方案列表
  getSingalPlanList = () => {
    getResponseData('get', `${this.singalPlanUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        const { areaStpId, areaGeometryId, startHour, endHour } = content[0]
        this.stpId = areaStpId
        this.setState({
          planList: content,
          planRowId: areaStpId,
          startTime: startHour,
          endTime: endHour,
        })
        this.areaGeometryId = areaGeometryId
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
    // console.log(interId)
    this.setState({
      areaSingal: true,
      interId,
    })
  }
  getareaSingalClose = () => {
    this.setState({ areaSingal: false })
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
  // 切换方案
  handleChangePlan = (e) => {
    this.areaStpId = Number(e.target.getAttribute('stpid'))
    const index = Number(e.target.getAttribute('index'))
    this.setState({ planIndex: index })
    this.getInterFlowMsg()
  }
  handleDeletePlan = (e) => {
    e.stopPropagation()
    const areaGeometryId = e.currentTarget.getAttribute('geometryid')
    const areaStpId = e.currentTarget.getAttribute('stpid')
    const rowId = e.currentTarget.getAttribute('rowid')
    getResponseData('delete', `${this.deleteUrl}/${this.areaId}/${areaGeometryId}/${areaStpId}/${rowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getSingalPlanList()
        this.props.isDelete()
      }
      message.info(content)
    })
  }
  // 获取选中的路口信号方案
  getInterSingalPlan = (id) => {
    this.interSingalPlanId = id
  }
  render() {
    const { areaSingal } = this.state
    return (
      <div className={styles.canalizWrapper}>
        <div className={styles.canalizBox}>
          <div className={styles.modeBox}>
            <div className={styles.modeBtn}>
              <span className={styles.name}> 信号时段: </span>
              <TimePicker placeholder="请选择 时间" format={format} disabled defaultValue={moment(this.state.startTime, format)} />
               至
              <TimePicker placeholder="请选择时间" format={format} disabled defaultValue={moment(this.state.endTime, format)} />
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
                    key={item.areaStpId}
                    stpid={item.areaStpId}
                    index={index}
                    onClick={this.handleChangePlan}
                  >
                    {item.stpTitle}
                    <span className={styles.delPlanIcon} geometryid={item.areaGeometryId} stpid={item.areaStpId} rowid={item.rowId} onClick={this.handleDeletePlan}>
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
                  <div className={styles.title}>{this.state.areaName}</div>
                  <div className={styles.main}>
                    <InterSingal
                      nodeId={this.state.interId}
                      areaId={this.areaId}
                      areaGeometryId={this.areaGeometryId}
                      stpId={this.stpId}
                      startTime={this.state.startTime}
                      endTime={this.state.endTime}
                      getInterSingalPlan={this.getInterSingalPlan}
                    />
                  </div>
                  {/* <div className={styles.footer}>
                    <span>保存</span>
                    <span>取消</span>
                  </div> */}
                </div>
              </div>
          }
        </div>

      </div >

    )
  }
}

export default SingalPop
