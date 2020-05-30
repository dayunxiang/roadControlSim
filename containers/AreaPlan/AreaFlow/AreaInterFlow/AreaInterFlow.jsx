import React from 'react'
import classNames from 'classnames'
import { Select, Spin } from 'antd'
import $ from 'jquery'

import styles from './AreaInterFlow.scss'

import getResponseDatas from '../../../../utlis/getResponseData'
import InputLabel from '../../../InterPlan/Allocation/InputLabel/InputLabel'
import '../../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件

class AreaInterFlow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      flowPlanList: null,
      interFlowId: null,
      directionList: null,
      RoadTypeList: null,
      flowData: null,
      activeBtn: 0,
    }
    this.flowDataCvs = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ] // 数据流量
    this.interGeoUrl = '/simulation/area/sim/geometry/get/node/geometry'
    this.flowInfo = '/simulation/node/flow/get/info'
    this.directionUrl = '/simulation/geometry/shape/get/dropList'
    this.flowListUrl = '/simulation/node/flow/get/table'
    this.codeTypeUrl = '/simulation/code/list/codeInfo/12'
    this.carTypeUrl = '/simulation/code/list/codeInfo/13' // 车辆类型ID 13
    this.turnUrl = '/simulation/geometry/shape/lane/turn/' // 根据渠化编号，获取渠化道路转向集合
    this.dirUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' // 根据路口编号查询各个进入路口的道路名称
    this.numFlowUrl = '/simulation/node/plan/manage/get/flow/info/' // 根据路口编号、渠化编号、流量编号、车辆类型、道路类型查询不通方向的流量
    this.dirParams = {
      geometryId: '',
      nodeId: this.props.nodeId,
    }
  }
  componentDidMount = () => {
    this.areaId = this.props.areaId
    this.geometryId = this.props.geometryId // 区域的渠化ID
    this.nodeId = this.props.nodeId
    this.getInterGeometry()
  }
  // 获取路口的渠化方案
  getInterGeometry = () => {
    getResponseDatas('get', `${this.interGeoUrl}/${this.areaId}/${this.geometryId}/${this.nodeId}`).then((res) => {
      // console.log('获取路口的渠化方案：：：', res)
      const { code, content } = res.data
      if (code === 200) {
        this.dirParams.geometryId = content
        this.interGeometryId = content // 路口的渠化ID
        this.getFlowInfoList(content)
      }
    })
  }
  // 路口流量方案接口
  getFlowInfoList = (geometryId) => {
    getResponseDatas('get', `${this.flowInfo}/${this.nodeId}/${geometryId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.interFlowId = this.props.interFlowId || content[0].flowId
        this.setState({
          flowPlanList: content,
          interFlowId: this.interFlowId,
        })
        this.props.getInterFlowPlan(this.interFlowId)
        this.getRoadType(this.nodeId, geometryId, this.interFlowId)
        this.getScrollTime(this.props.day, this.props.startTime, this.props.endTime, 15)
        this.getCarTypeData(this.nodeId, geometryId, this.interFlowId, 1)
      } else {
        this.setState({ flowPlanList: [] })
      }
    })
  }
  // 所属方向
  getDirectionList = (nodeId, geometryId, flowId) => {
    getResponseDatas('get', this.directionUrl, this.dirParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ directionList: content })
          this.direction = content[0].id
        }
      }
    }).then(() => {
      this.getFlowListData(nodeId, geometryId, flowId, 15)
    })
  }
  // 道路类型
  getRoadType = (nodeId, geometryId, flowId) => {
    getResponseDatas('get', this.codeTypeUrl).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ RoadTypeList: content })
        const { dictCode } = content[0]
        this.roadType = dictCode
      }
    }).then(() => {
      this.getDirectionList(nodeId, geometryId, flowId)
    })
  }
  // 首次获取流量列表数据
  getFlowListData = (nodeId, geometryId, flowId, interval) => {
    const obj = {
      startTime: this.props.startTime,
      endTime: this.props.endTime,
    }
    getResponseDatas('get', `${this.flowListUrl}/${nodeId}/${geometryId}/${flowId}/${this.roadType}/${this.direction}/${interval}`, obj).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ flowData: content })
        this.flowDataList = content
      } else {
        this.setState({ flowData: [] })
        this.flowDataList = []
      }
    })
  }
  getCrossingCvs = (num) => {
    const selfThis = this
    $('#container').crossingCvs({
      flow: true,
      contentId: 'container',
      pathR: $('#container')[0].clientWidth,
      crossingWidth: 0,
      // roadArrowData: [[2,3,4], [], [0], [], [0], [], [0], []], // 路线
      roadArrowData: selfThis.crossingCvsData, // 路线
      textData: selfThis.dirCvsData, // 道路名称
      flowData: selfThis.flowDataCvs[num], // 数据流量数据流量
      arrowWidth: 6, // 箭头宽度
      pointerLength: 18, // 箭头尺寸
      pointerWidth: 18, // 箭头尺寸
      peopleRoad: [], // 行人显示对应的图
    })
  }
  // 时间轴
  getScrollTime = (nowDate, startHour, endHour, interval) => {
    const selfThis = this
    $('#timeBox').getScrollTime({
      timeShow: true, // 时间的显示
      nowDate,
      timeStart: startHour, // 开始时间
      timeEnd: endHour, // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      timeGap: interval, // 间隔时段
      thisDom: selfThis, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
    })
  }
  // 获取车辆类型
  getCarTypeData = (nodeId, geometryId, flowId, roadType = 1) => {
    getResponseDatas('get', this.carTypeUrl).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ carTypeData: content })
          this.getTurn(nodeId, geometryId)
          this.getDir(nodeId)
          this.getFlowNum(nodeId, geometryId, flowId, roadType, content[0].dictCode)
        }
      }
    })
  }
  // 路口插件接口
  getTurn = (nodeId, id) => getResponseDatas('get', `${this.turnUrl}${nodeId}/${id}`).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.crossingCvsData = res.data.content
      this.getCrossingCvs(0)
    } else {
      this.crossingCvsData = []
      this.getCrossingCvs(0)
    }
  })
  // 路口道路名称
  getDir = id => getResponseDatas('get', this.dirUrl + '/' + id).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      const roadArr = []
      res.data.content.forEach((item) => {
        roadArr[item.dir] = item.roadName
      })
      for (let a = 0; a < 8; a++) {
        if (!roadArr[a]) {
          roadArr[a] = ''
        }
      }
      this.dirCvsData = roadArr
      this.getCrossingCvs(0)
    } else {
      this.dirCvsData = []
      this.getCrossingCvs(0)
    }
  })
  // 流量数据
  getFlowNum = (nodeId, geometryId, flowId, roadType, vehicleType) => {
    const { startTime, endTime } = this.props
    const urlStr = `${this.numFlowUrl}${nodeId}/${geometryId}/${flowId}/${roadType}/${vehicleType}?startTime=${startTime}&endTime=${endTime}`
    getResponseDatas('get', urlStr).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.flowDataCvs = res.data.content
        this.getCrossingCvs(0)
      } else {
        this.flowDataCvs = [
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', ''],
        ]
        this.getCrossingCvs(0)
      }
    })
  }
  timestampToTime = (timestamp) => {
    const date = new Date(timestamp * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = date.getDate()
    return Y + M + D
  }
  // 切换所属方向
  handleDirChange = (value, options) => {
    const valueId = options.key
    this.direction = valueId
    this.getFlowListData(this.nodeId, this.interGeometryId, this.interFlowId, 15)
  }
  // 切换 道路类型
  handleRoadChange = (roadType, index) => {
    this.setState({ activeBtn: index })
    this.roadType = roadType
    this.getFlowListData(this.nodeId, this.interGeometryId, this.interFlowId, 15)
  }
  // 切换路口流量方案
  handleInterFlowPlan = (e) => {
    this.interFlowId = parseInt(e.target.getAttribute('interflowid'), 0)
    this.setState({ interFlowId: this.interFlowId })
    this.getRoadType(this.nodeId, this.interGeometryId, this.interFlowId)
    this.getCarTypeData(this.nodeId, this.interGeometryId, this.interFlowId, 1)
    this.props.getInterFlowPlan(this.interFlowId)
  }
  // 修改车辆类型
  handleCayTypeChange = (value, options) => {
    const carType = options.key
    this.getFlowNum(this.nodeId, this.interGeometryId, this.interFlowId, this.roadType, carType)
  }
  render() {
    const { Option } = Select
    return (
      <div>
        <div className={styles.flowPlanList}>
          {
            this.state.flowPlanList &&
            this.state.flowPlanList.map((item, index) => {
              if (this.props.readOnly) {
                return this.state.interFlowId === item.flowId ? <span className={styles.flowPlanChecked} key={item.flowId} interflowid={item.flowId}>{item.flowTitle}</span> : null
              }
              return (
                <span
                  className={this.state.interFlowId === item.flowId ? styles.flowPlanChecked : ''}
                  key={item.flowId}
                  interflowid={item.flowId}
                  onClick={this.handleInterFlowPlan}
                >{item.flowTitle}
                </span>)
            })
          }
        </div>
        <div id="container" className={styles.container} rely-onid="crossing" arrow-data="" people-data="" bike-data="" />
        <div className={styles.getFLowPlay}>
          <div className={styles.flowDate}>
            <span id="testDom">车辆类型：</span>
            {
              !!this.state.carTypeData &&
              <Select defaultValue={this.state.carTypeData[0].codeName} onChange={this.handleCayTypeChange}>
                {
                  this.state.carTypeData.map(item => <Option value={item.codeName} key={item.dictCode}>{item.codeName}</Option>)
                }
              </Select>
            }
          </div>
          <div className={styles.flowTimeBox}>
            <div id="timeBox" className={styles.timeBox}>
              <mark>播放<i /></mark>
              <em><i /></em>
            </div>
          </div>
        </div>
        <div className={styles.roadFlowWrapper}>
          <div className={styles.exportFlowBox}>
            <div className={styles.roadBtnBox}>
              {
                !!this.state.RoadTypeList &&
                this.state.RoadTypeList.map((item, index) => (
                  <div
                    className={classNames({ [styles.roadBtn]: true, [styles.activeBtn]: this.state.activeBtn === index })}
                    key={item.dictCode}
                    onClick={() => { this.handleRoadChange(item.dictCode, index) }}
                  >
                    {item.codeName}
                  </div>
                ))
              }
            </div>
            <div className={styles.roadDetaction}>
              <span>所属方向：</span>
              {
                !!this.state.directionList &&
                <Select defaultValue={this.state.directionList[0].name} onChange={this.handleDirChange}>
                  {
                    this.state.directionList.map(item => (
                      <Option value={item.name} key={item.id}>{item.name}</Option>
                    ))
                  }
                </Select>
              }
            </div>
          </div>
          <div className={styles.importFlowMsg}>
            <div className={styles.title}>进口流量信息</div>
            {
              !!this.state.flowData && this.state.flowData.length > 0 ?
                <div className={styles.roadMsgBox}>
                  <div className={styles.roadMsg} style={{ backgroundColor: '#2B5391' }}>
                    <div className={styles.roadLane} style={{ backgroundColor: '#2B5391' }}>
                      <div className={styles.roadNameBox}>车道</div>
                    </div>
                    <div className={styles.detactionBox}>
                      <div className={styles.heade} style={{ backgroundColor: '#2B5391' }}>
                        <div>类型/时段</div>
                        {
                          this.state.flowData[0].sort.map((item) => {
                            return (
                              <div key={item}>{item}</div>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div>
                  {
                    this.state.flowData.map((item, index) => {
                      return (
                        <div className={styles.roadMsg} key={item.vehicleTypeName}>
                          <div className={styles.roadLane}>
                            <div className={styles.roadNameBox}>{item.vehicleTypeName}</div>
                          </div>
                          <div className={styles.detactionBox}>
                            <div className={styles.heade}>
                              <div>流量 / 15分钟</div>
                              {
                                this.state.flowData[0].sort.map((items) => {
                                  const value = item.total[items]
                                  return (
                                    <div key={item.vehicleTypeName + value + items}>{value}</div>
                                  )
                                })
                              }
                            </div>
                            <div className={styles.heade}>
                              <div className={styles.detaction}>
                                <span className={styles.checkBox} />
                                <span>直行</span>
                                <span className={styles.addLessBtn}>+</span>
                                <span className={styles.addLessBtn}>-</span>
                              </div>
                              {
                                this.state.flowData[0].sort.map((items) => {
                                  const value = item.straight[items]
                                  return (
                                    <div key={item.vehicleTypeName + value + items}>
                                      <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="straight" color="#22f4ad" disabled="true" edit="true" handleBlur={this.handleFlowValueChange} />
                                    </div>
                                  )
                                })
                              }
                            </div>
                            <div className={styles.heade}>
                              <div className={styles.detaction}>
                                <span className={styles.checkBox} />
                                <span>左转</span>
                                <span className={styles.addLessBtn}>+</span>
                                <span className={styles.addLessBtn}>-</span>
                              </div>
                              {
                                this.state.flowData[0].sort.map((items) => {
                                  const value = item.left[items]
                                  return (
                                    <div key={item.vehicleTypeName + value + items}>
                                      <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="left" color="#22f4ad" disabled="true" edit="true" handleBlur={this.handleFlowValueChange} />
                                    </div>
                                  )
                                })
                              }
                            </div>
                            <div className={styles.heade}>
                              <div className={styles.detaction}>
                                <span className={styles.checkBox} />
                                <span>右转</span>
                                <span className={styles.addLessBtn}>+</span>
                                <span className={styles.addLessBtn}>-</span>
                              </div>
                              {
                                this.state.flowData[0].sort.map((items) => {
                                  const value = item.right[items]
                                  return (
                                    <div key={item.vehicleTypeName + value + items}>
                                      <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="right" color="#22f4ad" disabled="true" edit="true" handleBlur={this.handleFlowValueChange} />
                                    </div>
                                  )
                                })
                              }
                            </div>
                            <div className={styles.heade}>
                              <div className={styles.detaction}>
                                <span className={styles.checkBox} />
                                <span>掉头</span>
                                <span className={styles.addLessBtn}>+</span>
                                <span className={styles.addLessBtn}>-</span>
                              </div>
                              {
                                this.state.flowData[0].sort.map((items) => {
                                  const value = item.turn[items]
                                  return (
                                    <div key={item.vehicleTypeName + value + items}>
                                      <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="turn" color="#22f4ad" disabled="true" edit="true" handleBlur={this.handleFlowValueChange} />
                                    </div>
                                  )
                                })
                              }
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div> : <div className={styles.loadingTipBox}><Spin tip="加载中..." /></div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default AreaInterFlow
