import React from 'react'
import classNames from 'classnames'
import { DatePicker, TimePicker, Select, Spin, message, Checkbox, Input } from 'antd'

import $ from 'jquery'
import moment from 'moment'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import styles from './Flow.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import Header from '../../Header/Header'
import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import InputLabel from '../Allocation/InputLabel/InputLabel'

class Flow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hiddenSave: true,
      directionList: null,
      roadName: null,
      excelName: null,
      flowPlanList: null,
      InterPlanMsg: null,
      activeBtn: 0,
      nowDate: '0000-00-00',
      startHour: '07:00',
      endHour: '08:00',
      interval: 15,
      flowData: null,
      carTypeData: null,
      isDisabled: true,
      checkedBaseRate: false,
      defaultBaseRate: 0,
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
    this.dirCvsData = [] // road name
    this.crossingCvsData = [] // 插件数据
    this.flowInfo = '/simulation/node/flow/get/info'
    this.directionUrl = '/simulation/geometry/shape/get/dropList'
    this.roadNameUrl = '/simulation/geometry/shape/get/road/name'
    this.uploadExcel = '/simulation/file/sim/flow/import'
    this.codeTypeUrl = '/simulation/code/list/codeInfo/12'
    this.calculateUrl = '/simulation/node/flow/calculate'
    this.addFlowUrl = '/simulation/node/flow/add/info'
    this.deleteFlowUrl = '/simulation/node/flow/delete'
    this.dirUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' // 根据路口编号查询各个进入路口的道路名称
    this.carTypeUrl = '/simulation/code/list/codeInfo/13' // 车辆类型ID 13
    this.numFlowUrl = '/simulation/node/plan/manage/get/flow/info/' // 根据路口编号、渠化编号、流量编号、车辆类型、道路类型查询不通方向的流量
    this.turnUrl = '/simulation/geometry/shape/lane/turn/' // 根据渠化编号，获取渠化道路转向集合
    this.flowListUrl = '/simulation/node/flow/get/table'
    this.putPlanName = '/simulation/node/flow/update/flow/name'
    this.updateFLowUrl = '/simulation/node/flow/update/info'

    this.dirParams = {
      geometryId: '',
      nodeId: '',
    }
    this.excelParams = {
      designerId: '1',
      endTime: '',
      file: '',
      flowId: '',
      flowTitle: '',
      geometryId: '',
      nodeId: '',
      nowDate: '',
      roadType: '',
      startTime: '',
    }
    this.calculateParams = {
      data: '',
      endTime: '08:00',
      floatPercentage: '100',
      interval: 15,
      startTime: '07:00',
    }
    this.addFlowParams = {
      basicRate: '100',
      day: 0,
      designerId: 1,
      endHour: '08:00',
      flowTitle: '',
      geometryId: 0,
      interval: 15,
      nodeId: 0,
      startHour: '07:00',
      roadType: '',
      dir: '',
    }
    this.updateFlow = {
      basicFlowId: 0,
      basicRate: 0,
      day: 0,
      designerId: 1,
      dir: 0,
      endHour: '',
      flowDes: '',
      flowId: 0,
      flowTitle: '',
      flows: [],
      geometryId: 0,
      interval: 0,
      nodeId: 0,
      roadType: 0,
      rowId: 0,
      startHour: '',
    }
    this.getFlow = {

    }
  }
  componentDidMount = () => {
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('interPlanMsg'))
    const { nodeId } = this.InterPlanMsg
    const { geometryId } = this.InterPlanMsg.planMsg ? this.InterPlanMsg.planMsg : {}
    if (nodeId && geometryId) {
      this.setState({ InterPlanMsg: this.InterPlanMsg })
      this.dirParams.geometryId = geometryId
      this.dirParams.nodeId = nodeId
      this.addFlowParams.geometryId = geometryId
      this.addFlowParams.nodeId = nodeId
      this.getFlowInfoList(nodeId, geometryId)
    }
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
  getNowFormatDate = () => {
    const dates = new Date()
    const years = dates.getFullYear()
    let month = dates.getMonth() + 1
    let days = dates.getDate()
    month = month <= 9 ? '0' + month : month
    days = days <= 9 ? '0' + days : days
    return years + '-' + month + '-' + days
  }
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
  // 计算流量
  getCalculateFlow = () => {
    const { startTime, endTime, interval, floatPercentage } = this.calculateParams // ${endTime}
    const url = `${this.calculateUrl}/${this.calculateParams.interval}?startTime=${startTime}&endTime=${endTime}&interval=${interval}&floatPercentage=${floatPercentage}`
    getResponseDatas('put', url, this.flowDataList).then((res) => {
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
  // 流量方案接口 方案列表
  getFlowInfoList = (nodeId, geometryId) => {
    getResponseDatas('get', `${this.flowInfo}/${nodeId}/${geometryId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ flowPlanList: content })
          const { flowId } = this.InterPlanMsg.planMsg
          const firstFlowId = flowId || content[0].flowId
          this.handleChangePlan('', firstFlowId)
        } else {
          this.setState({ flowPlanList: [], nowDate: this.getNowFormatDate() })
          this.addFlowParams.day = new Date(this.getNowFormatDate()).getTime() / 1000
        }
      }
    })
  }
  // 根据方案获取所有数据信息
  getAllFlowMsg = (flowPlan) => {
    // const { nodeId, geometryId, rowId, day, designerId, endHour, startHour, flowId, flowTitle, interval, basicFlowId, basicRate } = flowPlan
    this.excelParams.designerId = flowPlan.designerId
    this.excelParams.endTime = flowPlan.endHour
    this.excelParams.flowId = flowPlan.flowId
    this.excelParams.flowTitle = flowPlan.flowTitle
    this.excelParams.geometryId = flowPlan.geometryId
    this.excelParams.nodeId = flowPlan.nodeId
    this.excelParams.nowDate = flowPlan.day
    this.excelParams.startTime = flowPlan.startHour
    this.calculateParams.startTime = flowPlan.startHour
    this.calculateParams.endTime = flowPlan.endHour
    this.calculateParams.interval = flowPlan.interval
    this.calculateParams.data = flowPlan.day
    this.addFlowParams.day = flowPlan.day
    this.addFlowParams.startHour = flowPlan.startHour
    this.addFlowParams.endHour = flowPlan.endHour
    this.addFlowParams.interval = flowPlan.interval
    this.updateFlow.basicFlowId = flowPlan.basicFlowId
    this.updateFlow.basicRate = flowPlan.basicRate
    this.updateFlow.day = flowPlan.day
    this.updateFlow.endHour = flowPlan.endHour
    this.updateFlow.flowId = flowPlan.flowId
    this.updateFlow.flowTitle = flowPlan.flowTitle
    this.updateFlow.interval = flowPlan.interval
    this.updateFlow.nodeId = flowPlan.nodeId
    this.updateFlow.startHour = flowPlan.startHour
    this.updateFlow.rowId = flowPlan.rowId
    this.updateFlow.geometryId = flowPlan.geometryId
    this.setDefaultItems(flowPlan.day, flowPlan.startHour, flowPlan.endHour, flowPlan.interval)
    this.getCarTypeData(flowPlan.nodeId, flowPlan.geometryId, flowPlan.flowId, 1, flowPlan.startHour, flowPlan.endHour)
    this.getScrollTime(this.timestampToTime(flowPlan.day), flowPlan.startHour, flowPlan.endHour, flowPlan.interval)
    this.getRoadType(flowPlan.nodeId, flowPlan.geometryId, flowPlan.flowId)
  }
  // 首次获取流量列表数据
  getFlowListData = (nodeId, geometryId, flowId, interval) => {
    const obj = {
      startTime: this.excelParams.startTime,
      endTime: this.excelParams.endTime,
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
  // 设置默认显示日期 时间 间隔
  setDefaultItems = (day, startHour, endHour, interval) => {
    this.setState({
      nowDate: this.timestampToTime(day),
      startHour,
      endHour,
      interval,
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
          this.getRoadName(nodeId, geometryId, this.direction)
        }
      }
    }).then(() => {
      this.getFlowListData(nodeId, geometryId, flowId, this.calculateParams.interval)
    })
  }
  // 道路名称
  getRoadName = (nodeId, geometryId, dirId) => {
    getResponseDatas('get', `${this.roadNameUrl}/${nodeId}/${geometryId}/${dirId}`).then((response) => {
      const { code, content } = response.data
      if (code === 200) {
        this.setState({ roadName: content })
      }
    })
  }
  // 道路类型
  getRoadType = (nodeId, geometryId, flowId) => {
    getResponseDatas('get', this.codeTypeUrl).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ RoadTypeList: content })
        const { dictCode } = content[0]
        this.excelParams.roadType = dictCode
        this.roadType = dictCode
      }
    }).then(() => {
      this.getDirectionList(nodeId, geometryId, flowId)
    })
  }
  // 添加方案
  getNewPlanName = (planName) => {
    this.addFlowParams.flowTitle = planName
    this.addFlowParams.dir = this.direction
    this.addFlowParams.roadType = this.roadType
    getResponseDatas('post', this.addFlowUrl, this.addFlowParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        const { nodeId } = this.InterPlanMsg
        const { geometryId } = this.InterPlanMsg.planMsg
        this.getFlowInfoList(nodeId, geometryId)
        // getResponseDatas('get', `${this.flowInfo}/${nodeId}/${geometryId}`).then((result) => {
        //   if (result.data.code === 200) {
        //     if (result.data.content.length > 0) {
        //       this.setState({ flowPlanList: result.data.content })
        //     }
        //   }
        // })
      }
      message.info(content)
    })
  }
  // 获取车辆类型
  getCarTypeData = (nodeId, geometryId, flowId, roadType = 1, startTime, endTime) => {
    getResponseDatas('get', this.carTypeUrl).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ carTypeData: content })
          this.getTurn(nodeId, geometryId)
          this.getDir(nodeId)
          this.getFlowNum(nodeId, geometryId, flowId, roadType, content[0].dictCode, startTime, endTime)
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
  getFlowNum = (nodeId, geometryId, flowId, roadType, vehicleType, startTime, endTime) => {
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
  // 修改所属方向
  handleDirChange = (value, options) => {
    const valueId = options.key
    const { nodeId, geometryId, flowId, interval } = this.updateFlow
    this.direction = valueId
    this.getRoadName(nodeId, geometryId, valueId)
    this.getFlowListData(nodeId, geometryId, flowId, interval)
  }
  // 浏览excel文件
  handleUploadExcel = () => {
    const excelMsg = this.uploadExcelInput.files[0]
    this.setState({ excelName: excelMsg.name })
  }
  // 导入excel文件
  handleExcelUpload = () => {
    const formData = new FormData()
    formData.append('file', this.uploadExcelInput.files[0])
    formData.append('designerId', this.excelParams.designerId)
    formData.append('endTime', this.excelParams.endTime)
    formData.append('flowTitle', this.excelParams.flowTitle)
    formData.append('nowDate', this.excelParams.nowDate)
    formData.append('roadType', this.excelParams.roadType)
    formData.append('startTime', this.excelParams.startTime)
    const { nodeId } = this.InterPlanMsg
    const { geometryId } = this.dirParams
    const { flowId } = this.excelParams
    getResponseDatas('post', `${this.uploadExcel}/${nodeId}/${geometryId}/${flowId}`, formData).then((res) => {
      const { code, content } = res.data
      message.info(content)
      if (code === 200) {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    })
  }
  // 修改 道路类型
  handleRoadChange = (roadType, index) => {
    this.setState({ activeBtn: index })
    this.excelParams.roadType = roadType
    this.roadType = roadType
    const { nodeId, geometryId, flowId, interval } = this.updateFlow
    this.getFlowListData(nodeId, geometryId, flowId, interval)
  }
  // 修改流量采集日期
  handleChangeDate = (moments, value) => {
    const timeDate = new Date(value).getTime() / 1000
    this.calculateParams.nowDate = timeDate
    this.addFlowParams.day = timeDate
    this.updateFlow.day = timeDate
    this.setState({ hiddenSave: false })
  }
  // 修改starttime
  handleChangeStartTime = (moments, value) => {
    if (value > this.calculateParams.endTime) {
      message.warning('请保证开始时间小于结束时间')
    } else {
      this.setState({ hiddenSave: false })
      this.calculateParams.startTime = value
      this.updateFlow.startHour = value
      this.excelParams.startTime = value
      this.addFlowParams.startHour = value
      // const { data, startTime, endTime, interval } = this.calculateParams
      // this.getCalculateFlow()
      // this.getScrollTime(this.timestampToTime(data), startTime, endTime, interval)
    }
  }
  // 修改 endTime
  handleChangeEndTime = (moments, value) => {
    if (value < this.calculateParams.startTime) {
      message.info('请保证开始时间小于结束时间')
    } else {
      this.setState({ hiddenSave: false })
      this.calculateParams.endTime = value
      this.updateFlow.endHour = value
      this.excelParams.endTime = value
      this.addFlowParams.endHour = value
      // const { data, startTime, endTime, interval } = this.calculateParams
      // this.getCalculateFlow()
      // this.getScrollTime(this.timestampToTime(data), startTime, endTime, interval)
    }
  }
  // 修改时间间隔
  handleChnageInterval = (value, options) => {
    const interval = parseInt(options.key)
    this.calculateParams.interval = interval
    this.updateFlow.interval = interval
    this.excelParams.interval = interval
    this.addFlowParams.interval = interval
    this.setState({ interval })
  }
  // 删除方案
  handleDeletePlan = (geometryId, nodeId, id) => {
    getResponseDatas('delete', `${this.deleteFlowUrl}/${nodeId}/${geometryId}/${id}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getFlowInfoList(nodeId, geometryId)
      }
      message.info(content)
    })
  }
  // 切换方案
  handleChangePlan = (geometryId, flowId) => {
    const planItems = (this.state.flowPlanList.filter(item => item.flowId === flowId))[0] || this.state.flowPlanList[0]
    const { editable, checked, basicRate, day } = planItems
    if (editable) {
      this.setState({ isDisabled: false, checkedBaseRate: checked, defaultBaseRate: basicRate, nowDate: this.timestampToTime(day) })
    } else {
      this.setState({ isDisabled: true, checkedBaseRate: checked, defaultBaseRate: basicRate, nowDate: this.timestampToTime(day) })
    }
    if (this.InterPlanMsg.planMsg) {
      Object.keys(planItems).forEach((item) => {
        this.InterPlanMsg.planMsg[item] = planItems[item]
      })
      sessionStorage.setItem('interPlanMsg', JSON.stringify(this.InterPlanMsg))
    }
    this.getAllFlowMsg(planItems)
  }
  timestampToTime = (timestamp) => {
    const date = new Date(timestamp * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = date.getDate()
    return Y + M + D
  }
  // 修改车辆类型
  handleCayTypeChange = (value, options) => {
    const carType = options.key
    const { nodeId, geometryId, flowId, startTime, endTime } = this.excelParams
    this.getFlowNum(nodeId, geometryId, flowId, this.roadType, carType, startTime, endTime)
  }
  // 统一保存修改
  handleUpdateFlowInfo = () => {
    this.updateFlow.roadType = this.roadType
    this.updateFlow.dir = this.direction
    this.updateFlow.flows = this.flowDataList
    if (!this.state.checkedBaseRate) {
      this.updateFlow.basicRate = 0
    }
    getResponseDatas('put', this.updateFLowUrl, this.updateFlow).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ hiddenSave: true }, () => {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        })
      }
      message.info(content)
    })
  }
  // 修改方案名称
  handleChangePlanName = (value, flowId) => {
    const { nodeId, geometryId } = this.updateFlow
    getResponseDatas('put', `${this.putPlanName}/${nodeId}/${geometryId}/${flowId}?flowName=${value}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getFlowInfoList(nodeId, geometryId)
      }
      message.info(content)
    })
  }
  // 修改流量信息
  handleFlowValueChange = (e) => {
    this.setState({ hiddenSave: false })
    const newFlowValue = e.target.innerText
    const flowTime = e.target.getAttribute('flowtime')
    const typeName = e.target.getAttribute('typename')
    const flowDir = e.target.getAttribute('flowdir')
    const flowDataItem = (this.flowDataList.filter(item => item.vehicleTypeName === typeName))[0]
    const oldFlowValue = flowDataItem[flowDir][flowTime] ? flowDataItem[flowDir][flowTime] : 0
    const changeFlowValue = oldFlowValue - newFlowValue
    const oldTotalValue = flowDataItem.total[flowTime]
    flowDataItem[flowDir][flowTime] = newFlowValue
    flowDataItem.total[flowTime] = oldTotalValue - changeFlowValue
    this.setState({ flowData: this.flowDataList })
  }
  handleCheckBaseRate = () => {
    this.setState({ checkedBaseRate: !this.state.checkedBaseRate }, () => {
      this.setState({ hiddenSave: false })
    })
  }
  handleChangeBaseRate = (e) => {
    // console.log(this.updateFlow)
    const baseRate = e.target.value
    if (this.baseRateTimer) {
      clearTimeout(this.baseRateTimer)
      this.baseRateTimer = null
    }
    this.baseRateTimer = setTimeout(() => {
      if (isNaN(baseRate)) {
        message.info('请输入有效数字')
      } else {
        this.updateFlow.basicRate = baseRate
        this.setState({ hiddenSave: false })
      }
    }, 1000)
  }
  render() {
    const { Option } = Select
    const { InterPlanMsg } = this.state
    return (
      <div className={styles.flowWrapper}>
        {
          !!InterPlanMsg &&
          <Header InterName={InterPlanMsg.interName} hiddenSave={this.state.hiddenSave} handleSavePlan={this.handleUpdateFlowInfo} />
        }
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
        {/* <div id="crossing" className={styles.crossingItem} rely-onid="container" crossing-width="1" arrow-width="1" pointer-arrow="5" /> */}
        <div id="container" className={styles.container} rely-onid="crossing" arrow-data="" people-data="" bike-data="" />
        <div className={styles.flowBox}>
          <div className={styles.flowGetDate}>
            <span>流量采集日期: </span>
            <span>
              <DatePicker
                allowClear={false}
                placeholder="请选择时间"
                key={this.state.nowDate}
                format="YYYY-MM-DD"
                defaultValue={moment(this.state.nowDate, 'YYYY-MM-DD')}
                onChange={this.handleChangeDate}
              />
            </span>
            <span style={{ marginLeft: '20px' }}>流量采集时段: </span>
            <span className={styles.flowGetTime}>
              <TimePicker
                allowClear={false}
                placeholder="请选择时间"
                key={this.state.startHour}
                style={{ minWidth: '130px' }}
                format="HH:mm"
                showTime
                defaultValue={moment(this.state.startHour, 'HH:mm')}
                minuteStep={this.state.interval}
                paramsname="startTime"
                disabled={this.state.isDisabled}
                onChange={this.handleChangeStartTime}
              />
            </span>
            <span style={{ padding: '0 5px' }}>至</span>
            <span className={styles.flowGetTime}>
              <TimePicker
                allowClear={false}
                placeholder="请选择时间"
                key={this.state.endHour}
                style={{ minWidth: '130px' }}
                format="HH:mm"
                showTime
                defaultValue={moment(this.state.endHour, 'HH:mm')}
                minuteStep={this.state.interval}
                paramsname="endTime"
                disabled={this.state.isDisabled}
                onChange={this.handleChangeEndTime}
              />
            </span>
            <span style={{ marginLeft: '20px' }}>时间隔断: </span>
            <Select defaultValue={this.state.interval + '分钟'} key={this.state.interval} onChange={this.handleChnageInterval}>
              <Option value="5分钟" key={5} disabled>5分钟</Option>
              <Option value="10分钟" key={10} disabled>10分钟</Option>
              <Option value="15分钟" key={15}>15分钟</Option>
            </Select>
          </div>
          <div className={styles.planListBox}>
            {
              !!this.state.flowPlanList &&
              <AddPlanList
                typeId="flowId"
                planList={this.state.flowPlanList}
                getNewPlanName={this.getNewPlanName}
                handleDeletePlan={this.handleDeletePlan}
                planRowId={this.InterPlanMsg.planMsg.flowId || (this.state.flowPlanList.length > 0 && this.state.flowPlanList[0].flowId) || null}
                changePlan={this.handleChangePlan}
                changePlanName={this.handleChangePlanName}
              />
            }
          </div>
          <div className={styles.roadFlowWrapper}>
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
              <div className={styles.checkedBaseRate}>
                <Checkbox key={this.state.checkedBaseRate} defaultChecked={this.state.checkedBaseRate} onChange={this.handleCheckBaseRate} />
                <span style={{ marginLeft: '5px' }}>限牌限号政策整体流量浮动</span>
                <Input
                  key={this.state.defaultBaseRate}
                  className={styles.baseRateInput}
                  disabled={!this.state.checkedBaseRate}
                  onChange={this.handleChangeBaseRate}
                  defaultValue={this.state.defaultBaseRate}
                />%
              </div>
            </div>
            <div className={styles.exportFlowBox}>
              <div className={styles.roadMsg}>
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
                <div className={styles.roadName}>
                  <span className={styles.name}>道路名：</span>
                  <span className={styles.nameText}>{this.state.roadName}</span>
                </div>
              </div>
              <div className={styles.flowExport}>
                <div className={styles.exportText}>流量导出</div>
                <div className={styles.exportWay}>
                  <div className={styles.systemAutoBox}>
                    <span>系统自动：</span>
                    <div className={styles.systemAuto}>通过接入采集平台导入</div>
                  </div>
                  <div className={styles.temExport}>
                    <span>模版导入：</span>
                    <div className={styles.templateSel} title={this.state.excelName}>
                      {this.state.excelName}
                      <span className={styles.importText} onClick={this.handleExcelUpload}>导入</span>
                      <span className={styles.browseText}>
                        <input type="file" accept=".xls,.xlsx" className={styles.uploadExcel} ref={(input) => { this.uploadExcelInput = input }} onChange={this.handleUploadExcel} />
                        浏览
                      </span>
                    </div>
                  </div>
                </div>
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
                                        <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="straight" color="#22f4ad" handleBlur={this.handleFlowValueChange} />
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
                                        <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="left" color="#22f4ad" handleBlur={this.handleFlowValueChange} />
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
                                        <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="right" color="#22f4ad" handleBlur={this.handleFlowValueChange} />
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
                                        <InputLabel value={value} flowTime={items} typeName={item.vehicleTypeName} flowDir="turn" color="#22f4ad" handleBlur={this.handleFlowValueChange} />
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
      </div>
    )
  }
}

export default Flow
