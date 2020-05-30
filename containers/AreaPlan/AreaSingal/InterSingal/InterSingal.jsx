import React from 'react'
import { Spin, Icon, Upload, Input, InputNumber, message } from 'antd'
import classNames from 'classnames'
import $ from 'jquery'
import styles from './InterSingal.scss'

import Title from '../../../../components/Title/Title'
import SplitLine from '../../../../components/SplitLine/SplitLine'
import '../../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import getResponseDatas from '../../../../utlis/getResponseData'

class InterSingal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planList: null,
      signalList: null,
      addPhaseList: null,
      phaseCvsArr: null,
      currentPlan: 0, // 方案是否选中
      dispatchListArr: null,
      cycleLength: 0, // 周期
      cycleCurrent: 0,
      InterSingalId: null,
      noSignal: null,
    }
    this.timeVerFlag = true // 纵轴标识
    this.crossingRoadDatas = [false, false, false, false, false, false, false, false] // 8个路口是否有  true有 默认没有
    this.interGeoUrl = '/simulation/area/sim/geometry/get/node/geometry'
    this.stpUrl = '/simulation//node/signal/timing/list/'// 查询信号小方案和相位模型
    this.dispatchListUrl = '/simulation/signal/dispatch/get/plan/' // 回显列表 根据路口和渠化ID查询，调度计划和计划包含相位
    this.nodeUrl = '/simulation/node/phase/db/list/by/node/' // 路口相位库集合
    this.planInfoUrl = '/simulation/signal/list/planInfo/' // {nodeId}/{geometryId} 根据路口ID和渠化ID，查询所有大的信号方案'
    this.timingListUrl = '/simulation/node/signal/timing/list/' // {nodeId}/{geometryId} 查询信号小方案和相位模型'
    this.crossingUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' // 获取路口道路方向（前端画路口地图形状）
    this.turnUrl = '/simulation/geometry/shape/lane/turn/'// 根据渠化编号，获取渠化道路转向集合箭头
    this.defaultSingalUrl = '/simulation/area/sim/signal/get/node/flow'
    this.signalYesNo = '/simulation/geometry/get/not/exists/signal/' // 是否有信号
    this.paramerDetail = {
      flowId: '',
      nodeId: '',
      geometryId: '',
      stpId: '',
      stpDes: '',
      startTime: '',
      rowId: '',
      planId: '',
      endTime: '',
      designerId: '',
    }
  }
  componentDidMount = () => {
    this.areaId = this.props.areaId
    this.areaGeometryId = this.props.areaGeometryId
    this.nodeId = Number(this.props.nodeId)
    this.areaStpId = this.props.stpId
    // console.log('查看areaStpId:::::::', this.areaStpId)
    this.getInterGeometry()
  }
  // 获取默认选中的路口方案
  getDefaultSingalPlan = () => {
    return getResponseDatas('get', `${this.defaultSingalUrl}/${this.areaId}/${this.areaGeometryId}/${this.areaStpId}/${this.nodeId}`).then((res) => {
      // console.log(res)
      const { code, content } = res.data
      return code === 200 ? content : false
    })
  }
  // 获取路口的渠化方案
  getInterGeometry = () => {
    getResponseDatas('get', `${this.interGeoUrl}/${this.areaId}/${this.areaGeometryId}/${this.nodeId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.interGeometryId = content // 路口的渠化ID
        this.handlePlanInfo()
        this.getCrossingCvsFn(this.nodeId, this.interGeometryId)
        this.roadCrossingFn(this.nodeId, this.interGeometryId)
        this.signalYesNoFn(this.nodeId, this.interGeometryId)
      }
    })
  }
  // 更新周期时间 绿灯
  getCycleLength = (allPhaseData) => {
    if (allPhaseData && allPhaseData.length > 0) {
      let cycleLength = 0
      allPhaseData.map((item, index) => {
        cycleLength += item.greenTime
      })
      this.setState({ cycleLength: cycleLength }, () => {
        this.state.signalList[this.state.currentPlan].cycleLength = this.state.cycleLength
      })
    } else {
      this.setState({ cycleLength: 0 }, () => {
        this.state.signalList[this.state.currentPlan].cycleLength = 0
      })
    }
  }
  // 流量插件图请求箭头
  getCrossingCvsFn = (nodeId, geometryId) => getResponseDatas('get', `${this.turnUrl}/${nodeId}/${geometryId}`).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({ crossingCvsData: res.data.content }, () => {
        this.getCrossingPhaseFn(nodeId, geometryId, this.stpId) // 相位图请求
      })
    } else {
      this.setState({ crossingCvsData: [] })
    }
  })
  // 相位插件图请求
  getCrossingPhaseFn = (nodeId, geometryId) => getResponseDatas('get', `${this.stpUrl}/${nodeId}/${geometryId}`).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({ signalList: res.data.content }, () => {
        this.setState({
          phaseCvsArr: this.state.signalList[0].webPhases,
        }, () => {
          this.getScrollTime(this.state.phaseCvsArr) // 下方的时间轴
          this.state.phaseCvsArr.map((item, i) => {
            this.state.cycleLength += item.greenTime
            this.getCrossingPhase('container', 'crossing' + i, item)
            if (i === 0) { // 流量图回显第一个
              this.getCrossingCvs('crossing0', this.state.phaseCvsArr[0], 0)
            }
          })
        })
      })
    }
  })
  // 相位插件图
  getCrossingPhase = (relyId, id, data) => {
    const _this = this
    $('#' + id).crossingCvs({
      contentId: id,
      relyOnId: relyId,
      arrowFill: 'white',
      arrowStroke: 'white',
      crossingFill: 'transparent',
      pathR: 300,
      crossingWidth: 6,
      roadArrowData: data.vehicle,
      bikeSelArr: data.bicycle,
      peopleSelRoad: data.pedestrian,
      dataRoad: _this.crossingRoadDatas,
      arrowWidth: 4, // 箭头宽度
      pointerLength: 6, // 箭头尺寸
      pointerWidth: 6, // 箭头尺寸
    })
  }
  // 流量插件图 必须放在相位图方法后调用
  getCrossingCvs = (relyId, data, index, nowId) => {
    const _this = this
    const defaultPeople = []
    const defaultBike = JSON.parse(JSON.stringify(_this.state.crossingCvsData))
    _this.crossingRoadDatas.map((item, i) => {
      if (item) {
        defaultPeople.push(null)
      } else {
        defaultPeople.push(true)
      }
    })
    if (_this.state.crossingCvsData.length > 0) {
      for (let n = 0; n < defaultBike.length; n++) {
        if (defaultBike[n].length > 0) {
          defaultBike[n].map((item, m) => {
            if (defaultBike[n][m] !== null) {
              defaultBike[n][m] = false
            }
          })
        }
      }
    }
    $((nowId ? '#'+nowId : '#container')).attr('arrow-data', JSON.stringify(data.vehicle))
    if (nowId) {
      this.setState({ current: index })
    } else {
      this.setState({ cycleCurrent: index })
    }
    $((nowId ? '#'+nowId : '#container')).crossingCvs({
      flow: true,
      relyOnId: relyId,
      arrowFill: 'white',
      arrowStroke: 'white',
      crossingFill: 'transparent',
      contentId: (nowId ? nowId : 'container'),
      pathR: (nowId ? $('#'+nowId)[0].clientHeight : $('#container')[0].clientWidth),
      crossingWidth: 0,
      roadArrowData: _this.state.crossingCvsData, // 路线
      arrowArrColor: (nowId ? ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'] : ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red']),
      arrowWidth: 8, // 箭头宽度
      pointerLength: 18, // 箭头尺寸
      pointerWidth: 18, // 箭头尺寸
      dataRoad: _this.crossingRoadDatas, // 8方向是否有
      bikeArr: defaultBike,
      peopleRoad: defaultPeople,
      bikeSelArr: data.bicycle, // 自行车显示对应的图
      peopleSelRoad: data.pedestrian,
    })
    $(`<div style="position: absolute;top:0;right:0;bottom:0;left:0;z-index: 99;"></div>`).appendTo($('#container'))
  }
  getScrollTime = (bgData) => {
    this.triggerClick()
    const _this = this;
    $('#timeBox').getScrollTime({
      bgColor: true, // 是否有颜色
      bgData, // 背景数据
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      thisDom: _this, // this根指向
    })
  }
  getScrollRightTime = () => {
    const _this = this;
    // 纵向时间轴
    // console.log('查看调度列表数据：：：：', _this.state.dispatchListArr)
    $('#timeVerBox').getScrollTime({
      timeShow: true, // 时间的显示
      vertical: _this.timeVerFlag,
      nowDate: '2019-12-27',
      timeStart: _this.props.startTime, // 开始时间
      timeEnd: _this.props.endTime, // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      timeGap: 5, // 间隔时段
      thisDom: _this, // this根指向
      dispatchData: _this.state.dispatchListArr, // 调度列表数据
    })
    this.timeVerFlag = false
    // 线的距上面Top值集合
    const timeLines = $('#timeVerBox').find('.Singal_horStepGapBig__1jXzL')
    // 线的时间集合
    const timeLineTimes = $('#timeVerBox .Singal_horStepGapBig__1jXzL').find('time')
    // top值添加到数组中
    this.state.dispatchNumTop = []
    timeLines.map((i, item) => {
      this.state.dispatchNumTop.push(item.getBoundingClientRect().top)
    })
    this.state.relyOnObj = $('#rightPop')[0].getBoundingClientRect()
    // 纵轴的时间节点线
    // 单个对像模板
    if (this.state.dispatchListArr.length > 0) {
      const newObj = JSON.parse(JSON.stringify(this.state.dispatchListArr[0]))
      newObj.endTime = ''
      newObj.startTime = ''
      newObj.timePlanId = null
      newObj.timePlanTitle = ''
      this.setState({ dispatchTemplateArr: JSON.parse(JSON.stringify(new Array(timeLines.length).fill(newObj))) }, () => {
        // 时间节点添加到模板内
        const templateArr = this.state.dispatchTemplateArr
        timeLineTimes.map((i, item) => {
          this.state.dispatchTemplateArr[i].startTime = $(item)[0].childNodes[0].nodeValue
        })
      })
    } else {
      this.timeVerFlag = true
    }
  }
  // 仿真应用调度列表回显
  getDispatchList = (nodeId, geometryId, stpId) => getResponseDatas('get', `${this.dispatchListUrl}/${nodeId}/${geometryId}/${stpId}`).then((res) => {
    if (res.data.content.length > 0) {
      this.setState({ dispatchListArr: res.data.content }, () => {
        this.getScrollRightTime()
      })
    } else {
      this.setState({ dispatchListArr: [] }, () => {
        message.info('暂无数据！')
        this.getScrollRightTime()
      })
    }
  })
  // 切换相位数据
  getPhaseCrossFn = (data, idx) => {
    if (data && data.length > 0) {
      data.map((item, i) => {
        this.setState({
          phaseCvsArr: this.state.signalList[idx].webPhases,
          cycleLength: this.state.signalList[idx].cycleLength,
        }, () => {
          this.getCrossingPhase('container', 'crossing'+i, item)
          this.getCycleLength(this.state.phaseCvsArr)
        })
      })
      this.setState({
        currentPlan: idx,
        phaseCvsArr: this.state.signalList[idx].webPhases,
      })
    }
  }
  // 是否有信号
  signalYesNoFn = (nodeId, geometryId) => getResponseDatas('get', this.signalYesNo + nodeId + '/' + geometryId).then((res) => {
    console.log(res,'是否有信号')
    if (res.data.code === 200) {
      this.setState({
        noSignal: res.data.content,
      })
    }
  })
  // 8个路口是否有
  roadCrossingFn = (nodeId, geometryId) => getResponseDatas('get', this.crossingUrl + nodeId + '/' + geometryId).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.crossingRoadDatas = res.data.content
    } else {
      this.crossingRoadDatas = [false, false, false, false, false, false, false, false]
    }
  })
  // 时间轴开始停止 触发
  triggerClick = () => {
    if ($($('#timeBox').find('mark')[0]).attr('class')) {
      $($('#timeBox').find('mark')[0]).trigger('click')
      $($('#timeBox').parent().find('em')).attr('style', 'left:30px')
    } else {
      $($('#timeBox').parent().find('em')).attr('style', 'left:30px')
    }
  }
  // 获取左侧列表
  handlePlanInfo = () => {
    const _this = this
    let { timePicker } = this.state
    getResponseDatas('get', `${this.planInfoUrl}/${this.nodeId}/${this.interGeometryId}?startTime=${this.props.startTime}&endTime=${this.props.endTime}`).then((res) => {
      const result = res.data
      if (result.code === 200 && result.content.length > 0) {
        this.getDefaultSingalPlan().then((defaultStpId) => {
          this.stpId = defaultStpId || result.content[0].stpId
          timePicker = { startTime: res.data.content[0].startTime, endTime: res.data.content[0].endTime }
          this.setState({
            planList: res.data.content,
            timePicker,
            InterSingalId: this.stpId,
          }, () => {
            this.getDispatchList(this.nodeId, this.interGeometryId, this.stpId)// 仿真应用调度列表
            this.props.getInterSingalPlan(this.stpId)
          })
        })
      } else {
        message.info('暂无数据')
      }
    })
  }
  // 点击左侧列表回调
  handleInterSingalPlan = (e) => {
    const stpId = e.target.getAttribute('stpid')
    this.setState({ InterSingalId: Number(stpId) })
    this.getDispatchList(this.nodeId, this.interGeometryId, stpId)
    this.props.getInterSingalPlan(stpId)
  }
  handleChangeCvs = (index) => {
    this.setState({ cycleCurrent: index })
    this.getCrossingCvs("crossing" + index, this.state.phaseCvsArr[index], index)
  }
  render() {
    const { planList, signalList, addPhaseList, phaseCvsArr, cycleLength, noSignal } = this.state
    if (planList && planList.length === 0) return null
    return (
      <div>
        <div className={styles.planList}>
          {
            this.state.planList &&
            this.state.planList.map((item, index) => (
              <span
                className={this.state.InterSingalId === item.stpId ? styles.flowPlanChecked : ''}
                key={item.stpId}
                stpid={item.stpId}
                onClick={this.handleInterSingalPlan}
              >{item.stpDes}
              </span>
            ))
          }
        </div>
        <div className={styles.singalStage}>
          {/* <div className={styles.stageBox} /> */}
          <s id="stop">停</s>
          <div id="timeBox" className={styles.timeBox}>
            {
              noSignal ? <Spin tip="暂无数据" /> : <Spin tip="加载中..." />
            }
          </div>
          <div className={styles.cycleLengthBox}>{'周期：'+ cycleLength +' s'}</div>
        </div>

        <div id="container" className={styles.container} rely-onid="" arrow-data="" people-data="" bike-data="">
          {
            noSignal ? <Spin tip="暂无数据" /> : <Spin tip="加载中..." />
          }
        </div>
        <div className={styles.rightPopBox}>
          <div className={styles.rightPop}>
            <div className={styles.rightSpan}>
              {signalList && signalList.map((item, i) => {
                return (
                  <span
                    className={i == this.state.currentPlan ? styles.span_select : ''}
                    key={item.timePlanId}
                    title={item.timePlanTitle}
                    onDoubleClick={() => {
                      this.getPhaseCrossFn(item.webPhases, i)
                      this.getScrollTime(item.webPhases)
                    }}
                  >
                    <i className={styles.Ileft} />
                    {item.timePlanTitle}
                  </span>
                )
              })}
              {/* <span title="添加方案" onClick={() => { this.planAdd() }}><Icon type="plus" /></span> */}
            </div>
            {/* <div className={styles.phaseManage} onClick={this.handlePhaseManage}>相位管理</div> */}
            {
              this.state.isAddPhase &&
              <div className={styles.popWarpper}>
                <div className={styles.addPhaseBox}>
                  <div className={styles.titles}>
                    <Icon type="double-right" />
                    <span style={{ marginLeft: '5px' }}>添加相位</span>
                    <span className={styles.closeBox} onClick={this.handleCloseAddPhase}>
                      <Icon type="close" />
                    </span>
                  </div>
                  <div className={styles.phaseList}>
                    {addPhaseList && addPhaseList.map((item, index) =>{
                      return (
                        <div className={styles.stageMsg}>
                          <div className={classNames(styles.phaseBox, index === this.state.currents ? styles.svg_select : '')} onClick={() => { this.addPhaseClick(index) }}>
                            <div id={"crossingAdd" + index} className={styles.crossingItem} rely-onid="" crossing-width="6" arrow-width="5" pointer-arrow="5" />
                          </div>
                          <div className={styles.stageBox}>
                            {item.phaseName}
                            <span className={styles.closeIcon} />
                          </div>
                        </div>
                      )
                    })
                    }
                    <div className={styles.isAddWrapper}>
                      <div className={styles.btnBox}>
                        <div className={styles.isAddBtn} onClick={() => { this.rightPhaseAdd() }}>确定</div>
                        <div className={styles.isAddBtn} style={{ color: '#7e7d7b' }} onClick={this.handleCloseAddPhase}>取消</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            <div className={styles.stageTit}>{'周期：'+ cycleLength +' s'}</div>
            <div className={styles.stageMsgBoxList}>
              {phaseCvsArr && phaseCvsArr.length > 0 ? phaseCvsArr.map((item, i) => {
                return (
                  <div key={"phaseSvg" + i} phase-id={item.phaseId} className={styles.stageMsgBox}>
                    <div className={styles.stageMsg}>
                      <div className={classNames(styles.phaseBox, i === this.state.cycleCurrent ? styles.phaseBoxSelect : '')} onClick={() => { this.handleChangeCvs(i) }}>
                        <div id={'crossing' + i} className={styles.crossingItem} rely-onid="container" crossing-width="6" arrow-width="5" pointer-arrow="5" />
                      </div>
                      <div className={styles.stageBox}>
                        {item.phaseName}
                        <span className={styles.closeIcon}></span>
                      </div>
                      <div className={styles.lightTime}>
                        <div className={styles.lightBox}>
                          红灯:
                          <span>
                            <InputNumber
                              ref='redInput'
                              id={'allRedTime'+i}
                              min={0}
                              disabled={(i == this.state.cycleCurrent ? false : true)}
                              value={item.allRedTime}
                            />s
                            <span
                              input-id={'allRedTime'+i}
                              title="编辑"
                              className={styles.closeIcon}
                            >
                              <Icon type="edit" />
                            </span>
                          </span>
                        </div>
                        <div className={styles.lightBox}>
                          绿灯:
                          <span>
                            <InputNumber
                              ref='greenInput'
                              id={'greenTime'+i}
                              min={1}
                              disabled={(i == this.state.cycleCurrent ? false : true)}
                              value={item.greenTime}
                            />s
                            <span
                              input-id={'greenTime'+i}
                              title="编辑"
                              className={styles.closeIcon}
                            ><Icon type="edit" />
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>)
              }) : noSignal ? <Spin tip="暂无数据" /> : <Spin tip="加载中..." />
              }
            </div>
          </div>
          <div id="rightPop" className={styles.rightPop}>
            <div className={styles.disabledMoudle} />
            <div className={styles.stageTit}>仿真应用调度</div>
            {
              this.state.noSignal ? <Spin tip="无信号灯" /> :
                (this.state.dispatchListArr && this.state.dispatchListArr.length > 0 ?
                  <div id="timeVerBox" className={classNames(styles.timeBox, styles.simulatDispatch, styles.timeVerBox)} /> : <Spin tip="暂无数据" />)
            }
          </div>
        </div>
      </div>
    )
  }
}

export default InterSingal
