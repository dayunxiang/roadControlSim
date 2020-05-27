import React from 'react'
import $ from 'jquery'
import 'moment/locale/zh-cn'
import { DatePicker, TimePicker, Select, message, Icon } from 'antd'
import moment from 'moment'
import classNames from 'classnames'
import styles from './Roadtraffic.scss'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import Navigation from '../Navigation/Navigation'
import Nav from '../../Nav/Nav'
import getResponseDatas from '../../../utlis/getResponseData'
import { getDrag } from '../../../utlis/drag' // 实现拖动
/* import { setInterval } from 'timers' */

moment.locale('zh-cn')

/* 交通组织方案设计 */
class Roadtraffic extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      Infowindow: false, // 控制点位弹窗
      infounint: false, // 路口建模弹窗
      signalList: null, // 路口信号
      roadtraffic: false, // 路口流量弹窗
      interPlanMsg: null,
      nowNodeId: null,
      nowFlowId: null,
      nowGeometryId: null,
      nodeSimulation: [0, 0, 0, 0],
      interNum: [0, 0, 0, 0],
      simulationPlanNum: [0, 0, 0, 0],
      flowDay: null,
      flowEndHour: '24:00',
      flowStartHour: '00:00',
      flowInterval: 0,
      geometryBg: '', // 渠化流量图
      vehicleType: '1', // 选中的车辆类型
      carTypeList: [], // 车辆类型列表
      modelState: [0, 1, 2],
      interColor: [
        {
          modelState: 0,
          nodeName: '未建模',
          color: '#ccc'
        },
        {
          modelState: 1,
          nodeName: '建模中',
          color: '#CCFF00'
        },
        {
          modelState: 2,
          nodeName: '已建模',
          color: '#00E500'
        }]
    }
    this.stopIndex = 0,
      this.timeArr = [] // 时间轴数组
    this.planNameArr = [] // 方案名字
    this.crossingRoadDatas = [] // 路口
    this.crossingCvsData = [] // 插件数据
    this.dirCvsData = [] // 路口名称
    this.flowData = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ] // 数据流量
    this.cityid = '1'
    this.markers = []
    this.areaAndNode = {
      cityId: '1',
      searchKey: '',
    }
    this.areaAndNodeUrl = '/simulation/district/list/districtAndNode/' + this.cityid // 根据城市ID获取业务区域和区域下的路口'
    this.crossingUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' //获取路口道路方向（前端画路口地图形状）
    this.markerUrl = '/simulation/node/list/to/map/' + this.cityid // 根据城市ID获取地图上所有路口的点（点颜色根据modelState属性来判断：0 灰色、1 黄色、2 绿色）
    this.interMasurl = '/simulation/node/get/simple/node/simulation/' // 点击路口点位获取路口仿真方案信息
    this.totalAll = '/simulation/node/total/all/' + this.cityid  // 获取3个统计，按顺序'
    this.turnUrl = '/simulation/geometry/shape/lane/turn/'//根据渠化编号，获取渠化道路转向集合
    this.flowUrl = '/simulation/node/plan/manage/get/flow/info/'//根据路口ID，查询流量详情（路口点位点击仿真方案回显接口）
    this.geometryUrl = '/simulation/node/plan/manage/get/geometry/img/'//根据路口ID查询渠化图片以及渠化基本信息
    this.stpUrl = '/simulation/node/plan/manage/get/signal/phase/'//根据配时方案号，查询配时方案中的所有相位
    this.dirUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/'//根据路口编号查询各个进入路口的道路名称
    this.carTypeUrl = '/simulation/code/list/codeInfo/13'//车辆类型ID 13
    this.numFlowUrl = '/simulation/node/plan/manage/get/flow/info/' //根据路口编号、渠化编号、流量编号、车辆类型、道路类型查询不通方向的流量
  }
  componentDidMount = () => {
    sessionStorage.clear() // 防止手敲地址路由，保留上一次访问的信息
    this.renderMineMap()
    // 获取三标题数据接口
    this.getsimulationPlan()
    this.getCarTypeDatas() // 下拉车辆类型
    this.getareaAndNode()
  }
  componentWillUnmount = () => {
    this.map.remove()
    clearInterval(this.timeOne)
    clearInterval(this.timeTwo)
    clearInterval(this.timeThree)
  }
  getCrossingCvs = (num) => {
    const _this = this
    $('#container').crossingCvs({
      flow: true,
      contentId: 'container',
      pathR: $('#container')[0].clientWidth,
      crossingWidth: 0,
      // roadArrowData: [[2,3,4], [], [0], [], [0], [], [0], []], // 路线
      roadArrowData: _this.crossingCvsData, // 路线
      textData: _this.dirCvsData, // 道路名称
      flowData: _this.flowData[num], // 数据流量数据流量
      arrowWidth: 6, // 箭头宽度
      pointerLength: 18, // 箭头尺寸
      pointerWidth: 18, // 箭头尺寸
      peopleRoad: [], // 行人显示对应的图
    })
  }
  getCrossingPhase = (id, data) => {
    const _this = this
    $('#' + id).crossingCvs({
      contentId: id,
      pathR: 250,
      crossingWidth: 4,
      roadArrowData: data.vehicle, // 路线
      bikeArr: [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false]
      ], // 是否有
      bikeSelArr: data.bicycle, // 自行车显示对应的图
      peopleSelRoad: data.pedestrian, // 行人显示对应的图
      dataRoad: _this.crossingRoadDatas, // 8方向是否有
      arrowWidth: 4, //箭头宽度 
      pointerLength: 6, //箭头尺寸
      pointerWidth: 6, //箭头尺寸
    })
  }
  getScrollTime = () => {
    const _this = this;
    $('#timeBox').getScrollTime({
      timeShow: true, //时间的显示
      nowDate: _this.state.flowDay,
      timeStart: _this.state.flowStartHour, //开始时间
      timeEnd: _this.state.flowEndHour, //结束时间
      paddingBoth: 30, //左右padding 值
      plugStyle: styles, //样式传入
      timeGap: Number(_this.state.flowInterval.slice(0, -2)), //间隔时段
      thisDom: _this, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
    })
  }
  getProgressTime = () => {
    const _this = this;
    $('#timeProgressBar').getScrollTime({
      timeShow: true, //时间的显示
      nowDate: _this.state.flowDay,
      timeStart: _this.state.flowStartHour, //开始时间
      timeEnd: _this.state.flowEndHour, //结束时间
      paddingBoth: 30, //左右padding 值
      plugStyle: styles, //样式传入
      // timeGap: Number(_this.state.flowInterval.slice(0, -2)), //间隔时段
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
      getTimeArr: true,
      timeArr: _this.timeArr, //时间组合
      planNameArr: _this.planNameArr, // 方案名字
    })
  }
  getsimulationPlan = () => {
    getResponseDatas('get', this.totalAll).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) { /* res.data.content */
        let num = 0
        let numTwo = 0
        let numThree = 0
        this.timeOne = setInterval(() => {
          if (num >= res.data.content[1]) { clearInterval(this.timeOne) }
          const nodeSimulation = ('000' + num).slice(-4).split('')
          this.setState({ nodeSimulation }, () => {
            num += 1
          })
        }, 0)
        this.timeTwo = setInterval(() => {
          if (numTwo >= res.data.content[0]) { clearInterval(this.timeTwo) }
          const interNum = ('000' + numTwo).slice(-4).split('')
          this.setState({ interNum }, () => {
            numTwo += 1
          })
        }, 0)
        this.timeThree = setInterval(() => {
          if (numThree >= res.data.content[2]) { clearInterval(this.timeThree) }
          const simulationPlanNum = ('000' + numThree).slice(-4).split('')
          this.setState({ simulationPlanNum }, () => {
            numThree += 1
          })
        }, 0)
      }
    })
  }
  // 关闭某个弹窗
  getClone = (name) => {
    if (name === 'infounint') {
      this.setState({
        infounint: false,
      })
    }
    if (name === 'signalList') {
      this.setState({
        signalList: false,
      })
    }
    if (name === 'roadtraffic') {
      this.setState({
        roadtraffic: false,
      })
    }
  }

  // 路口流量接口
  getFlowId = (nodeId, geometryId, id) => getResponseDatas('get', this.flowUrl + nodeId + '/' + geometryId + '/' + id).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      const { day, endHour, startHour, interval } = res.data.content[0]
      this.startTime = startHour
      this.endTime = endHour
      this.setState({
        flowDay: day,
        flowEndHour: endHour,
        flowStartHour: startHour,
        flowInterval: interval + '分钟',
      }, () => {
        this.getScrollTime()
        this.getFlowNum(nodeId, geometryId, id, 1, this.state.vehicleType)
      })
    }
  })
  // 路口插件接口
  getTurn = (nodeId, id) => getResponseDatas('get', this.turnUrl + nodeId + '/' + id).then((res) => {
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
      res.data.content.map((item, i) => {
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
  // 路口渠化接口
  getGeometryId = (nodeId, id) => getResponseDatas('get', this.geometryUrl + nodeId + '/' + id).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({ geometryBg: res.data.content[0].shapeFileName })
    } else {
      this.setState({ geometryBg: '' })
    }
  })
  // 路口信号接口
  getStpId = (nodeId, geometryId, id) => getResponseDatas('get', this.stpUrl + nodeId + '/' + geometryId + '/' + id).then((res) => {
    const timeArr = []
    const planNameArr = []
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        signalList: res.data.content,
      }, () => {
        this.state.signalList.map((signalItem, signalIndex) => {
          planNameArr.push(signalItem.timePlanTitle)
          if ((res.data.content.length - 1) === signalIndex) {
            timeArr.push(signalItem.minStartTime)
            timeArr.push(signalItem.minEndTime)
          } else {
            timeArr.push(signalItem.minStartTime)
          }
          signalItem.timePlans.map((planItem, planIndex) => {
            this.getCrossingPhase('plan_' + signalIndex + 'phase_' + planIndex, planItem.phases)
          })
        })
      })
      this.timeArr = timeArr
      this.planNameArr = planNameArr
      this.getProgressTime()
    } else {
      this.planNameArr = []
      this.timeArr = []
      this.getProgressTime()
    }
  })
  // 打开路口建模弹窗
  getinfoumint = (nodeId, flowId, geometryId, stpId) => {
    const _this = this;
    this.setState((Infowindow, props) => {
      // 流量插件数据
      this.getTurn(nodeId, geometryId) //svg 图形
      this.getDir(nodeId) // svg 道路名称

      // 路口流量方法
      this.getFlowId(nodeId, geometryId, flowId) // 采集日期时间段
      // 路口信号方法 
      this.getStpId(nodeId, geometryId, stpId)
      return {
        infounint: true,
        roadtraffic: true,
        nowNodeId: nodeId,
        nowFlowId: flowId,
        nowGeometryId: geometryId,
      }
    }, () => {
      setTimeout(() => {
        this.dragMoveFn()
      }, 3000)
    })
  }
  getCarTypeDatas = () => getResponseDatas('get', this.carTypeUrl).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        carTypeList: res.data.content,
        vehicleType: res.data.content[0].dictCode,
      })
    }
  })
  getMarkerDatas = () => getResponseDatas('get', this.markerUrl).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      return res.data.content
    }
    return []
  })
  OpenInforWindow = (e, item) => {
    if (this.state.modelState.includes(Number(item.modelState))) {
      window.event ? window.event.cancelBubble = true : e.stopPropagation()
      this.map.panTo([item.unitLongitude, item.unitLatitude])
      if (this.markerId) {
        document.getElementById(this.markerId).innerHTML = ''
      }
      const el = this[item.nodeId]
      const p = this[item.nodeId + 'p']
      const bgColor = item.modelState === 0 ? '#ccc' : item.modelState === 1 ? 'yellow' : '#00E500'
      /* this.markerId = e.target.getAttribute('id') */
      this.markerId = this[item.nodeId].children[1].id
      const p1 = document.createElement('div')
      const p2 = document.createElement('div')
      const p3 = document.createElement('div')
      const p4 = document.createElement('div')
      p2.style['background-color'] = bgColor
      p3.style['background-color'] = bgColor
      p4.style['background-color'] = bgColor
      p1.className = styles.inner
      p2.className = styles.avatar
      p3.className = classNames(styles.container, styles.inner)
      p4.className = classNames(styles.outter, styles.inner)

      p.appendChild(p1)
      p.appendChild(p2)
      p.appendChild(p3)
      p.appendChild(p4)
      el.appendChild(p)
      this.setState({
        Infowindow: true,
        infounint: false,
        signalList: null,
        roadtraffic: false,
      })
      getResponseDatas('get', this.interMasurl + item.nodeId).then((resData) => {
        if (resData.data.code === 200) {
          const interData = resData.data.content[0]
          let tasks = [], length = 0
          length = interData.tasks.length
          for (var i = 0; i < interData.tasks.length; i += 3) {
            tasks.push(interData.tasks.slice(i, i + 3));
          }
          interData.lengths = length
          interData.tasks = tasks
          this.setState({ interPlanMsg: interData })
        }
      })
    } else {
      message.warning('当前路口已隐藏')
    }

  }
  getareaAndNode = (callback) => {
    getResponseDatas('get', this.areaAndNodeUrl, this.areaAndNode).then((resData) => {
      if (resData.data.code === 200) {
        if (callback) {
          let content = []
          resData.data.content.forEach((item) => {
            item.node.forEach(items => {
              content.push(items)
            })
          })
          callback(content)
        } else {
          this.setState({ areaAndNodeList: resData.data.content })
        }
      }
    })
  }
  // 查询
  getSearch = (value, callback) => {
    this.areaAndNode.searchKey = value
    this.getareaAndNode(callback)
  }
  getmodelState = (modelState) => {
    this.setState({
      modelState,
      Infowindow: false,
      infounint: false,
      signalList: null,
      roadtraffic: false,
    }, () => {
      this.getmarkersState()
    })
  }
  // 获取点位
  getmarkersState = () => {
    getResponseDatas('get', this.markerUrl).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        const markerDatas = res.data.content
        if (this.markers.length) {
          for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].remove();
            this.markers[i] = null;
          }
          this.markers = []
        }
        markerDatas.forEach((item, index) => {
          const el = document.createElement('div')
          const p = document.createElement('div')
          const title = document.createElement('div')
          if (this.state.modelState.includes(Number(item.modelState))) {
            const bgColor = item.modelState === 0 ? '#ccc' : item.modelState === 1 ? '#CCFF00' : '#00E500'
            el.style.zIndex = 120000
            p.className = styles.drawCircle
            p.style['background-color'] = bgColor
            p.style['box-shadow'] = '0 0 20px ' + bgColor
            p.id = 'markerWrapper' + index
            title.innerHTML = item.nodeName
            title.className = 'MarkerTitle'
            el.appendChild(title)
            el.appendChild(p)
            this[item.nodeId] = el
            this[item.nodeId + 'p'] = p
            const marker = new window.minemap.Marker(el, { offset: [-10, -30] })
            /* if (index === 0) {
              this.map.panTo([item.unitLongitude, item.unitLatitude])
            } */
            this.map.panTo([106.706278, 26.590897])
            marker.setLngLat([item.unitLongitude, item.unitLatitude]).setPopup().addTo(this.map)
            this.markers.push(marker)
            el.addEventListener('click', (e) => {
              this.OpenInforWindow(e, item)
            })
          }

        })
      }
    })
  }
  // 流量数据
  getFlowNum = (nodeId, geometryId, flowId, roadType, vehicleType) => {
    const urlStr = this.numFlowUrl + nodeId + '/' + geometryId + '/' + flowId + '/' + roadType + '/' + vehicleType + '?startTime=' + this.startTime + '&endTime=' + this.endTime
    getResponseDatas('get', urlStr).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.flowData = res.data.content
        this.getCrossingCvs(0)
      } else {
        this.flowData = [
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
  // 拖动浮层
  dragMoveFn = () => {
    const dragMoves = $('.dragMove')
    $.each(dragMoves, (index, item) => {
      getDrag(item, (x, y) => {
        // console.log(x, y)
      })
    })
  }
  // 获取路口方向
  crossingFn = (nodeId, geometryId) => getResponseDatas('get', this.crossingUrl + nodeId + '/' + geometryId).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.crossingRoadDatas = res.data.content
    } else {
      this.crossingRoadDatas = [false, false, false, false, false, false, false, false]
    }
  })
  // 修改车辆类型
  carTypeChange = (val) => {
    this.getFlowNum(this.state.nowNodeId, this.state.nowGeometryId, this.state.nowFlowId, 1, val)
    this.setState({
      vehicleType: val,
    }, () => this.getCrossingCvs(0))
  }
  handleGoSetting = (nodeId, nodeName, planMsg) => {
    // this.props.history.push('/canalization')
    if (planMsg) {
      window.InterPlanMsg = `{"nodeId": ${nodeId}, "interName": ${JSON.stringify(nodeName)}, "planMsg": ${JSON.stringify(planMsg)}}`
    } else {
      window.InterPlanMsg = `{"nodeId": ${nodeId}, "interName": ${JSON.stringify(nodeName)}}`
    }
    window.open('#/canalization')
  }
  getArrowLeft = () => {
    const { interPlanMsg } = this.state
    if (this.stopIndex == 0) {
      this.wrapper.style.left = -(interPlanMsg.tasks.length - 1) * 335 + 'px'
      this.stopIndex = interPlanMsg.tasks.length - 1
    } else {
      this.stopIndex--
      this.wrapper.style.left = -this.stopIndex * 335 + 'px'
    }
  }
  getArrowRight = () => {
    const { interPlanMsg } = this.state
    if (this.stopIndex >= interPlanMsg.tasks.length - 1) {
      this.wrapper.style.left = 0
      this.stopIndex = 0
    } else {
      this.stopIndex++
      this.wrapper.style.left = -this.stopIndex * 335 + 'px'
    }
  }
  // mineData
  renderMineMap = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      style: '//minedata.cn/service/solu/style/id/2301',
      center: [106.706278, 26.590897],
      zoom: 13.8,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    // 获取地图点位
    this.getmarkersState()
    map.on('click', (e) => {
      const p = e.lngLat
      const inmainMap = [p.lng.toFixed(6), p.lat.toFixed(6)]
      this.setState({
        Infowindow: false,
        infounint: false,
        signalList: null,
        roadtraffic: false,
      })
    })
  }
  render() {
    const timestamp = new Date().getTime()
    const format = 'HH:mm'
    const { Option } = Select
    const {
      infounint, Infowindow, signalList, roadtraffic, geometryBg, interColor, flowDay, flowEndHour, modelState, flowStartHour, flowInterval,
    } = this.state
    return (
      <div className={styles.Roadtcontent}>
        {/* 地图 */}
        <div id="mapContainer" className={styles.mapContainer} />
        <Nav getSearch={this.getSearch} OpenInforWindow={this.OpenInforWindow} interColor={interColor} modelState={modelState} getmodelState={this.getmodelState} />
        <Navigation {...this.props} />
        {Infowindow ?
          <div className={styles.Infowindow}>
            <p className={styles.info_py}>路口编号:<span>{this.state.interPlanMsg ? this.state.interPlanMsg.nodeId : '--'}</span></p>
            <p className={styles.info_py}>路口名称:<span>{this.state.interPlanMsg ? this.state.interPlanMsg.nodeName : '--'}</span></p>
            <p className={styles.info_ps}>建模方案:<span>{this.state.interPlanMsg ? this.state.interPlanMsg.lengths : '--'}套</span></p>
            {this.state.interPlanMsg && this.state.interPlanMsg.tasks.length > 1 ?
              [<span className={styles.interLeft} onClick={this.getArrowLeft}><Icon type="left" /></span>,
              <span className={styles.interRight} onClick={this.getArrowRight}><Icon type="right" /></span>] : null}
            <div className={styles.beginBox}>
              <div className={styles.begins} ref={(e) => { this.wrapper = e }} style={{ width: 335 * (this.state.interPlanMsg && this.state.interPlanMsg.tasks.length) }}>
                {
                  this.state.interPlanMsg &&
                  this.state.interPlanMsg.tasks.map((items, indexs) => (
                    <div className={styles.info_box} key={'inTers' + indexs} >
                      {items.map((item, index) => {
                        return (
                          <div className="infow"
                            title={item.programTitle}
                            key={'roWId' + item.rowId}
                          >
                            <span>
                              <i
                                onClick={() => {
                                  this.crossingFn(this.state.interPlanMsg.nodeId, item.geometryId)
                                  this.getGeometryId(this.state.interPlanMsg.nodeId, item.geometryId)
                                  this.getinfoumint(this.state.interPlanMsg.nodeId, item.flowId, item.geometryId, item.stpId)
                                  // 路口渠化方法
                                  // this.getFlowNum(this.state.interPlanMsg.nodeId, item.geometryId, item.flowId,  1, this.state.vehicleType)
                                }}
                                title="查看"
                              />
                              <i onClick={() => { this.handleGoSetting(this.state.interPlanMsg.nodeId, this.state.interPlanMsg.nodeName, item) }} title="编辑" />
                              <em>{item.programTitle}</em>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))
                }

              </div>
            </div>


            <div className={styles.info_unint} onClick={() => { this.handleGoSetting(this.state.interPlanMsg.nodeId, this.state.interPlanMsg.nodeName) }}>路口建模</div>
          </div> : null}
        {infounint ?
          <div className={classNames(styles.road_phase, 'dragMove')}>
            <span className={styles.clone} onClick={() => { this.getClone('infounint') }} />
            <div className={styles.road_phase_top}>{this.state.interPlanMsg ? this.state.interPlanMsg.nodeName : '--'}路口渠化结构</div>
            <div className={styles.road_phase_bottom} style={{ backgroundImage: "url(" + geometryBg + ")" }} />
          </div> : null}
        {signalList ?
          <div className={classNames(styles.road_signal, 'dragMove')} >
            <span className={styles.clone} onClick={() => { this.getClone('signalList') }} />
            <div className={styles.signal_title}>{this.state.interPlanMsg ? this.state.interPlanMsg.nodeName : '--'}路口信号</div>
            {signalList && signalList.map((item, index) => {
              return (
                <div id={'phase_box' + index} className={styles.signal_scheme} key={'scheme' + item.timePlanTitle}>
                  <div className={styles.signal_precept}><span>{item.timePlanTitle + "的阶段"}</span></div>
                  {
                    item.timePlans.map((planItem, playIndex) => {
                      return (
                        <div className={styles.signal_listbox} key={'signas' + playIndex}>
                          <div id={'plan_' + index + 'phase_' + playIndex} className={styles.signal_lists} />
                          <div className={styles.phaseTitle}>
                            {"阶段" + planItem.phaseSeq}
                            <span>{planItem.greenTime + "s"}</span>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>)
            })}
            <div id="timeProgressBar" className={classNames(styles.progress, styles.timeBox)} />
          </div> : null}
        {roadtraffic ?
          <div className={classNames(styles.roadtraffic)}>
            <span className={styles.clone} onClick={() => { this.getClone('roadtraffic') }} />
            <div className={styles.roadtraffic_title}>{this.state.interPlanMsg ? this.state.interPlanMsg.nodeName : '--'}路口流量</div>
            <div className={styles.roadtraffic_data}>流量采集日期:<DatePicker id="datepicker" key={flowDay} defaultValue={flowDay ? moment(flowDay, 'YYYY-MM-DD') : null} className={styles.datepicker} allowClear={false} disabled /></div>
            <div className={styles.timePicker}>流量采集时段:<TimePicker className={styles.timePicker_time} key={flowStartHour} defaultValue={flowStartHour ? moment(flowStartHour, format) : null} format={format} allowClear={false} disabled />至<TimePicker className={styles.timePicker_time} key={flowEndHour} defaultValue={moment(flowEndHour, format)} format={format} allowClear={false} disabled /></div>
            <div className={styles.flowSelect}>时间隔断 : <Select label="时段" key={flowInterval} defaultValue={flowInterval} disabled><Option value="5">5分钟</Option><Option value="15">15分钟</Option><Option value="30">30分钟</Option></Select></div>
            <div className={styles.roadtraffic_florw} >
              <div id="container" className={styles.container} rely-onid="" arrow-data="" people-data="" bike-data="" />
            </div>
            <div className={classNames({ [styles.flowSelect]: true, [styles.flowSelectTwo]: true })}>流量类型 :
              <Select key="vehicleType" defaultValue={this.state.carTypeList[0].codeName}>
                {
                  this.state.carTypeList.map((item, i) => {
                    return <Option key={'carTypeList' + item.dictCode} value={item.codeName} onClick={() => { this.carTypeChange(item.dictCode) }}>{item.codeName}</Option>
                  })
                }
              </Select>
            </div>
            <div className={styles.timerShaft}>
              <div id="timeBox" className={styles.timeBox}>
                <mark>播放<i /></mark>
                <em><i /></em>
              </div>
            </div>
          </div> : null}

        <div className={styles.road_show}>
          <div className={classNames(styles.road_show_item, styles.buling)}>
            <div><span>路口点位</span></div>
            <div>
              {this.state.interNum.map((item, index) => <span key={'traf' + item + index}>{item}</span>)}
            </div><div>处</div>
          </div>
          <div className={classNames(styles.road_show_item, styles.buling)}>
            <div><span>仿真</span><span>建模路口</span></div>
            <div>
              {this.state.nodeSimulation.map((item, index) => <span key={'trar' + item + index}>{item}</span>)}
            </div><div>处</div>
          </div>
          <div className={classNames(styles.road_show_item, styles.buling)}>
            <div><span>仿真方案</span></div>
            <div>
              {this.state.simulationPlanNum.map((item, index) => <span key={'trag' + item + index}>{item}</span>)}
            </div><div>个</div>
          </div>
        </div>
      </div >
    )
  }
}

export default Roadtraffic
