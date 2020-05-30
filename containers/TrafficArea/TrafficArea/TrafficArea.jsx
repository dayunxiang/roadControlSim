import React from 'react'
import { Icon, Select, Tree, message } from 'antd'
import $ from 'jquery'
import classNames from 'classnames'
import getResponseDatas from '../../../utlis/getResponseData'
import Nav from '../../Nav/Nav'
import DrawCanalization from '../../../utlis/drawCanalization'
import roadStyles from '../../InterPlan/Roadtraffic/Roadtraffic.scss'
import style from './TrafficArea.scss'
import mapStyles from '../../../utlis/styles_2301'
import Prostyles from '../../InterPlan/Projectmana/Projectmana.scss'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import AreaNavgation from '../AreaNavgation/AreaNavgation'

const { Option } = Select
const { TreeNode, DirectoryTree } = Tree

class TrafficArea extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      examine: false, // 查看弹窗
      signalList: false, // 信号弹窗
      popShow: null,
      hash: window.location.hash,
      areaAndNodeList: null,
      nodeSimulation: [0, 0, 0, 0],
      interNum: [0, 0, 0, 0],
      popShownodeId: null,
      simulationPlanNum: [0, 0, 0, 0],
      modelState: [0, 2],
      interColor: [
        {
          modelState: 0,
          nodeName: '未选择',
          color: '#ccc',
        },
        {
          modelState: 2,
          nodeName: '已选择',
          color: '#00E500',
        },
      ],
      popOpacity: null,
      interPoint: null,
      showMessage: null,
      interPlanInfo: null,
      showExamnieData: null,
      areaNodeIde: null,
      areaNodename: null,
      geometryImg: null,
      vehicleType: '1',
      flowStartHour: '', // 开始时间
      flowEndHour: '', // 结束时间
      crossingCvsData: [], // 插件数据
      dirCvsData: [], // 路口名称
      crossingRoadDatas: [], // 路口
      flowData: [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ], // 数据流量
    }
    this.stopIndex = 0
    this.cityId = '1'
    this.parameters = {
      cityId: '1',
      searchKey: '',
    }
    this.showNodeData = {
      geometryId: '',
      flowId: '',
      stpId: '',
    }
    this.scrollNum = 0 // 记录滚轮放大缩小的次数
    this.markers = []
    this.stpUrl = '/simulation/node/plan/manage/get/signal/phase/'// 根据配时方案号，查询配时方案中的所有相位
    this.crossingUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' //获取路口道路方向（前端画路口地图形状）
    this.flowUrlss = '/simulation/node/plan/manage/get/flow/info/'// 根据路口ID，查询流量详情（路口点位点击仿真方案回显接口）
    this.numFlowUrl = '/simulation/node/plan/manage/get/flow/info/' // 根据路口编号、渠化编号、流量编号、车辆类型、道路类型查询不通方向的流量
    this.turnUrl = '/simulation/geometry/shape/lane/turn/'// 根据渠化编号，获取渠化道路转向集合
    this.dirUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/'// 根据路口编号查询各个进入路口的道路名称
    this.carTypeUrl = '/simulation/code/list/codeInfo/13'//车辆类型ID 13
    this.areaAndNodeUrl = '/simulation/area/sim/manage/get/areaAndNode/' + this.cityId // {cityId} 根据城市ID获取业务区域和区域下的路口'
    this.mapUrl = '/simulation/node/list/to/map/' + this.cityId // {cityId} 根据城市ID获取地图上所有路口的点'
    this.totalAll = '/simulation/sim/task/get/area/statistics' // 查询区域首页统计三组数字
    this.listUrl = '/simulation/sim/task/list/' // {targetId}/{taskType}查询路口所有仿真方案'
    this.pointUrl = '/simulation/area/sim/geometry/get/map/to/plane'
    this.relationUrl = '/simulation/area/sim/geometry/get/node/relation'
    this.nodegeoUrl = '/simulation//node/plan/manage/get/geometry/img/' // {nodeId}/{geometryId}根据路口ID查询渠化图片以及渠化基本信息'
    this.geometryUrl = '/simulation/area/sim/geometry/get/node/geometry/' // {areaId}/{geometryId}/{nodeId} 根据区域渠化查询路口渠化'
    this.rateUrl = '/simulation/area/sim/flow/get/nodeFlowId/rate/' // {areaId}/{areaGeometryId}/{areaFlowId}/{nodeId}根据业务区域ID、区域渠化、区域流量查询路口浮动比例'
    this.flowUrl = '/simulation/area/sim/signal/get/node/flow/' // {areaId}/{areaGeometryId}/{areaStpId}/{nodeId} 查询区域信号中路口默认选中的路口信号'
    this.pointerParams = {
      width: '',
      height: '',
    }
  }
  componentDidMount = () => {
    sessionStorage.clear() // 防止手敲地址路由，保留上一次访问的信息
    // 加载地图
    this.renderMineMap()
    // 获取左侧列表
    this.getareaAndNode()
    // 获取标题图栏点位集合
    this.getsimulationPlan()
    // 获取流量下拉
    this.getCarTypeDatas()
  }
  // 获取路口点 位置
  getAreaInterPoints = () => {
    getResponseDatas('get', `${this.pointUrl}/${this.areaId}`, this.pointerParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.InterPoint = content
          this.setState({
            interPoint: content,
            showMessage: new Array(content.length).fill(false),
          })
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
  getRoadtraffic = (link) => {
    window.location.href = `#/${link}`
  }
  // 获取标题点位集合
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
  // 获取左侧列表
  getareaAndNode = () => {
    getResponseDatas('get', this.areaAndNodeUrl, this.parameters).then((resData) => {
      if (resData.data.code === 200) {
        // console.log(resData.data.content)
        this.setState({ areaAndNodeList: resData.data.content, /* popShownodeId: resData.data.content[0] */ }, () => {
          this.getmarkersState()
        })
        /*  this.bindPopClick({ expanded: true }, resData.data.content[0]) */
      } else {
        message.error('网络错误!')
      }
    })
  }
  // 获取方案
  geteareList = (e, data) => {
    this.areaId = data.areaId
    getResponseDatas('get', this.listUrl + data.areaId + '/2').then((resData) => {
      const { code, content } = resData.data
      if (code === 200) {
        const interList = []
        for (let i = 0; i < content.length; i += 3) {
          interList.push(content.slice(i, i + 3));
        }
        // console.log(interList, '========1111');

        this.setState({
          popShow: interList,
          popShownodeId: data,
        }, () => {
          this.getmarkersState()
        })
      }
    })
  }
  // 渲染点
  getmarkersState = () => {
    const map = this.map
    const { popShownodeId } = this.state
    getResponseDatas('get', this.mapUrl).then((res) => {
      const markerDatas = res.data.content
      if (this.markers.length) {
        this.markers.forEach((item) => {
          item.remove()
        })
        this.markers = []
      }
      const nodeIds = popShownodeId && popShownodeId.nodes.map((item, index) => {
        return item.nodeId
      })
      markerDatas.forEach((item, index) => {
        const el = document.createElement('div')
        const p = document.createElement('div')
        const title = document.createElement('div')
        const bgColor = nodeIds && nodeIds.includes(item.nodeId) ? '#00E500' : '#ccc'
        el.style.zIndex = 120000
        p.className = roadStyles.drawCircle
        p.style['background-color'] = bgColor
        p.style['box-shadow'] = '0 0 20px ' + bgColor
        p.id = 'markerWrapper' + index
        title.innerHTML = item.nodeName
        title.className = 'MarkerTitle'
        el.appendChild(title)
        el.appendChild(p)
        // 添加选中样式
        if (nodeIds && nodeIds.includes(item.nodeId)) {
          /* this.map.panTo([item.unitLongitude, item.unitLatitude])  */
          const p1 = document.createElement('div')
          const p2 = document.createElement('div')
          const p3 = document.createElement('div')
          const p4 = document.createElement('div')
          p2.style['background-color'] = bgColor
          p3.style['background-color'] = bgColor
          p4.style['background-color'] = bgColor
          p1.className = roadStyles.inner
          p2.className = roadStyles.avatar
          p3.className = classNames(roadStyles.container, roadStyles.inner)
          p4.className = classNames(roadStyles.outter, roadStyles.inner)
          p.appendChild(p1)
          p.appendChild(p2)
          p.appendChild(p3)
          p.appendChild(p4)
          el.appendChild(p)
        }
        // 添加marker
        const marker = new window.minemap.Marker(el, { offset: [-10, -30] }).setLngLat([item.unitLongitude, item.unitLatitude]).setPopup().addTo(map)
        this.markers.push(marker)
        el.addEventListener('click', (e) => {
          message.warning('操作区域请点击区域名称')
        })
      })
    })
  }
  // 放大缩小后 重新渲染路口点位置
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
  bindPopClick = (e, data) => {
    // 刷新地图点位
    this.getmarkersState()
  }
  handleGoSetting = (data) => {
    const { popShownodeId } = this.state
    const interPlanMsg = {
      areaId: popShownodeId.areaId,
      areaName: popShownodeId.areaName,
      planMsg: data || null,
    }
    // sessionStorage.setItem('interPlanMsg', JSON.stringify(interPlanMsg))
    window.areaPlanMsg = JSON.stringify(interPlanMsg)
    window.open('#/AreaCanalization')
  }
  handleShowExamnie = (e, item) => {
    e.stopPropagation()
    this.setState({ examine: true }, () => {
      this.w = this.centerWrapper.offsetWidth - 10
      this.h = this.centerWrapper.offsetHeight - 10
      this.defaultW = this.w
      this.defaultH = this.h
      this.pointerParams.width = this.w
      this.pointerParams.height = this.h
      this.newCanvas = new DrawCanalization(this.canvasBox, this.w, this.h)
      this.getAreaInterPoints()
      this.setState({ showExamnieData: item })
    })

  }
  handlePopShowIcon = (e) => {
    const opacityIndex = Number(e.currentTarget.getAttribute('indexs'))
    if (opacityIndex === this.opacityIndex) {
      this.setState({ popOpacity: null })
      this.opacityIndex = null
    } else {
      this.opacityIndex = opacityIndex
      this.setState({ popOpacity: opacityIndex })
    }
  }
  handleCloseExaminePop = () => {
    this.showNodeData = {
      geometryId: '',
      flowId: '',
      stpId: '',
    }
    this.setState({ examine: false })
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
  getCarTypeDatas = () => {
    getResponseDatas('get', this.carTypeUrl).then((res) => {
      if (res.data.code === 200) {
        this.setState({
          carTypeList: res.data.content,
        })
      }
    })
  }
  getCrossingPhase = (id, data) => {
    const _this = this
    if ($('#' + id)[0]) {
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
        bikeSelArr: data.bicycle, //自行车显示对应的图
        peopleSelRoad: data.pedestrian, //行人显示对应的图
        dataRoad: _this.state.crossingRoadDatas, //8方向是否有
        arrowWidth: 4, //箭头宽度 
        pointerLength: 6, //箭头尺寸
        pointerWidth: 6, //箭头尺寸
      })
    }
  }
  getCrossingCvs = (num) => {
    const _this = this
    if ($('#container')[0]) {
      $('#container').crossingCvs({
        flow: true,
        contentId: 'container',
        pathR: $('#container')[0].clientWidth,
        crossingWidth: 0,
        // roadArrowData: [[2,3,4], [], [0], [], [0], [], [0], []], // 路线
        roadArrowData: _this.state.crossingCvsData, // 路线
        textData: _this.state.dirCvsData, //道路名称
        flowData: _this.state.flowData[num], //数据流量数据流量
        arrowWidth: 6, //箭头宽度 
        pointerLength: 18, //箭头尺寸
        pointerWidth: 18, //箭头尺寸
        peopleRoad: [], //行人显示对应的图
      })
    }
  }
  getFlowNum = (nodeId, geometryId, flowId, roadType, vehicleType) => {
    const { flowDay } = this.state
    const urlStr = this.numFlowUrl + nodeId + '/' + geometryId + '/' + flowId + '/' + roadType + '/' + vehicleType
    getResponseDatas('get', urlStr, { startTime: flowDay.startHour, endTime: flowDay.endHour }).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.setState({
          flowData: res.data.content,
        }, () => this.getCrossingCvs(0))
      } else {
        this.setState({
          flowData: [
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
          ],
        }, () => this.getCrossingCvs(0))
      }
    })
  }
  getProgressTime = () => {
    const _this = this;
    const { flowDay } = this.state
    $('#timeProgressBar').getScrollTime({
      timeShow: true, //时间的显示
      nowDate: '2018-01-01',
      timeStart: _this.state.flowStartHour, //开始时间
      timeEnd: _this.state.flowEndHour, //结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: style, // 样式传入
      // timeGap: Number(_this.state.flowInterval.slice(0, -2)), //间隔时段
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
      getTimeArr: true,
      timeArr: _this.state.timeArr, //时间组合
      planNameArr: _this.state.planNameArr, // 方案名字
    })
  }
  getScrollTime = (flowDay) => {
    const that = this
    $('#timeBox').getScrollTime({
      timeShow: true, // 时间的显示
      nowDate: flowDay.day,
      timeStart: flowDay.startHour, // 开始时间
      timeEnd: flowDay.endHour, // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: style, // 样式传入
      timeGap: Number(flowDay.interval), // 间隔时段
      thisDom: that, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
    })
  }
  // 路口流量接口
  getFlowId = (id, index, geometryIds) => {
    const { areaNodeIde, carTypeList } = this.state
    const { geometryId, flowId } = this.showNodeData
    getResponseDatas('get', this.flowUrlss + areaNodeIde + '/' + geometryIds + '/' + id).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        const flowDay = res.data.content[0]
        this.setState({
          flowDay,
        }, () => {
          this.getFlowNum(areaNodeIde, geometryId, flowId, 1, carTypeList[0].dictCode)
          this.getScrollTime(res.data.content[0])
        })
      }
    })
  }
  // 路口插件接口
  getTurn = (nodeId, id) => {
    getResponseDatas('get', this.turnUrl + nodeId + '/' + id).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.setState({
          crossingCvsData: res.data.content,
        }, () => this.getCrossingCvs(0))
      } else {
        this.setState({
          crossingCvsData: [],
        }, () => this.getCrossingCvs(0))
      }
    })
  }
  // 获取路口方向
  crossingFn = (nodeId, geometryId) => {
    getResponseDatas('get', this.crossingUrl + nodeId + '/' + geometryId).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.setState({
          crossingRoadDatas: res.data.content,
        })
      } else {
        this.setState({
          crossingRoadDatas: [false, false, false, false, false, false, false, false],
        })
      }
    })
  }
  // 路口道路名称
  getDir = (id) => {
    getResponseDatas('get', this.dirUrl + id).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        let roadArr = []
        res.data.content.map((item, i) => {
          roadArr[item.dir] = item.roadName
        })
        for (let a = 0; a < 8; a++) {
          if (!roadArr[a]) {
            roadArr[a] = ''
          }
        }
        this.setState({
          dirCvsData: roadArr,
        }, () => this.getCrossingCvs(0))
      } else {
        this.setState({
          dirCvsData: [],
        }, () => this.getCrossingCvs(0))
      }
    })
  }
  // 修改车辆类型
  carTypeChange = (val) => {
    this.getFlowNum(this.state.areaNodeIde, this.state.flowDay.geometryId, this.state.flowDay.flowId, 1, val)
    this.setState({
      vehicleType: val,
    }, () => this.getCrossingCvs(0))
  }
  // 点击路口点 查看方案信息
  handleShowInterMessage = (e, Id, nodeName) => {
    const showMessageIndexs = Number(e.currentTarget.getAttribute('indexs'))
    this.setState({ areaNodeIde: Id, areaNodename: nodeName })
    this.setState({ showMessage: showMessageIndexs })
    const areaNodeIde = Id
    const { showExamnieData } = this.state
    const { nodeId, geometryId, flowId, stpId } = showExamnieData
    // console.log(this.showNodeData);
    getResponseDatas('get', this.geometryUrl + `${nodeId}/${geometryId}/${areaNodeIde}`).then((resData) => {
      const { code, content } = resData.data
      if (code === 200) {
        // console.log(content)
        if (content) {
          this.showNodeData.geometryId = content
        } else {
          this.showNodeData.geometryId = ''
        }
      }
    })
    getResponseDatas('get', this.rateUrl + `${nodeId}/${geometryId}/${flowId}/${areaNodeIde}`).then((resData) => {
      const { code, content } = resData.data
      if (code === 200) {
        // console.log(content)
        if (content) {
          this.showNodeData.flowId = content.nodeFlowId
        } else {
          this.showNodeData.flowId = ''
        }
      }
    })
    getResponseDatas('get', this.flowUrl + `${nodeId}/${geometryId}/${stpId}/${areaNodeIde}`).then((resData) => {
      const { code, content } = resData.data
      if (code === 200) {
        // console.log(content)
        if (content) {
          this.showNodeData.stpId = content
        } else {
          this.showNodeData.stpId = ''
        }
      }
    })
  }
  // 获取当前渠化图片
  handlegeometryImg = (geometryId) => {
    const { areaNodeIde } = this.state
    getResponseDatas('get', this.nodegeoUrl + `${areaNodeIde}/${geometryId}`).then((resData) => {
      const { code, content } = resData.data
      if (code === 200) {
        this.setState({ geometryImg: content[0].shapeFileName })
      }
    })
  }
  getArrowLeft = () => {
    const { popShow } = this.state
    this.setState({ popOpacity: null })
    if (this.stopIndex == 0) {
      this.wrapper.style.left = -(popShow.length - 1) * 490 + 'px'
      this.stopIndex = popShow.length - 1
    } else {
      this.stopIndex--
      this.wrapper.style.left = -this.stopIndex * 490 + 'px'
    }
  }
  getArrowRight = () => {
    const { popShow } = this.state
    this.setState({ popOpacity: null })
    if (this.stopIndex >= popShow.length - 1) {
      this.wrapper.style.left = 0
      this.stopIndex = 0
    } else {
      this.stopIndex++
      this.wrapper.style.left = -this.stopIndex * 490 + 'px'
    }
  }
  // 路口信号接口
  getStpId = (nodeId, geometryId, id, index) => {
    getResponseDatas('get', this.stpUrl + nodeId + '/' + geometryId + '/' + id).then((res) => {
      const timeArr = []
      const planNameArr = []
      if (res.data.code === 200) {
        this.setState({
          signalList: res.data.content,
          geometryIndex: index,
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

        this.setState({
          flowEndHour: res.data.content[0].allEndTime,
          flowStartHour: res.data.content[0].allStartTime,
          timeArr: timeArr,
          planNameArr: planNameArr,
        }, () => this.getProgressTime())
      } else {
        message.warning('无信号灯')
        /* this.setState({
          signalList: [],
          timeArr: [],
          planNameArr: [],
        }, () => this.getProgressTime()) */
      }
    })
  }
  handleShowInterInfo = (e) => {
    e.stopPropagation()
    const { showExamnieData, areaNodeIde, vehicleType } = this.state
    const infoName = e.target.getAttribute('infoname')
    const { geometryId, flowId, stpId } = this.showNodeData
    // console.log(this.showNodeData);

    if (infoName === 'canalization') {
      if (geometryId) {
        this.handlegeometryImg(geometryId)
        this.setState({ interPlanInfo: infoName })
      } else {
        message.warning('当前路口无渠化方案')
      }
    }
    if (infoName === 'flow') {
      if (flowId && geometryId) {
        this.getDir(areaNodeIde)
        this.getTurn(areaNodeIde, geometryId)
        /* this.getFlowNum(areaNodeIde, geometryId, flowId, 1, vehicleType) */
        this.getFlowId(flowId, 0, geometryId)
        this.setState({ interPlanInfo: infoName })
      } else {
        message.warning('当前路口无流量方案')
      }
    }
    if (infoName === 'singal') {
      if (stpId) {
        this.crossingFn(areaNodeIde, geometryId)
        this.getStpId(areaNodeIde, geometryId, stpId, 0)
        this.setState({ interPlanInfo: infoName })
      } else {
        message.warning('当前路口无信号方案')
      }
    }
    /* this.setState({ interPlanInfo: infoName }) */
    if (!infoName) {
      this.setState({ showMessage: null })
    }
  }
  hanleCLoseInterInfo = () => {
    this.setState({ interPlanInfo: null, geometryImg: null, signalList: null })
  }
  renderMineMap = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      // style: '//10.11.57.105:60050/service/solu/style/id/4636',
      style: mapStyles,
      center: [106.706278, 26.590897],
      zoom: 13.8,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    this.getmarkersState()
    map.on('click', () => {
      this.setState({
        examine: false, // 关闭查看弹框
        signalList: false, // 信号弹窗
        popShow: false,
        popShownodeId: null,
      }, () => {
        /* this.getmarkersState() */
      })
    })
  }
  handleCloseAreaMessage = () => {
    this.setState({ popShow: false, popOpacity: null, popShownodeId: null }, () => {
      this.getmarkersState()
    })
  }
  render() {
    const { examine, interPlanInfo, geometryIndex, showExamnieData, carTypeList, geometryImg, nodeSimulation, areaNodename, interColor, modelState, interNum, simulationPlanNum, signalList, popShownodeId, popShow, areaAndNodeList } = this.state
    return (
      <div className={roadStyles.Roadtcontent}>
        {/* 地图 */}
        <div id="mapContainer" className={roadStyles.mapContainer} />
        <Nav interColor={interColor} modelState={modelState} />
        {/* 按钮导航 */}
        <AreaNavgation {...this.props} />
        {/* 数据展示 */}
        <div className={roadStyles.road_show}>
          <div className={classNames(roadStyles.road_show_item, style.buling)}>
            <div style={{ display: 'block' }}><span>建模</span><span>路口点位</span></div>
            <div>{interNum.map((item, index) => { return <span key={'tra' + item + index}>{item}</span> })}</div>
            <div>处</div>
          </div>
          <div className={classNames(roadStyles.road_show_item, style.buling)}>
            <div><span>仿真</span><span>建模区域</span></div>
            <div>{nodeSimulation.map((item, index) => { return <span key={'tra' + item + index}>{item}</span> })}</div>
            <div>处</div>
          </div>
          <div className={classNames(roadStyles.road_show_item, style.buling)}>
            <div><span>仿真方案</span></div>
            <div>{simulationPlanNum.map((item, index) => { return <span key={'tra' + item + index}>{item}</span> })}</div>
            <div>处</div>
          </div>
        </div>
        {popShow ?
          <div className={classNames({ [style.pointMarker]: true })} style={{ position: 'absolute' }}>
            <span className={roadStyles.clone} style={{ top: '20px', right: '20px' }} onClick={this.handleCloseAreaMessage} />
            <div className={Prostyles.poin_number}>区域编号:<span>{popShownodeId.areaId}</span></div>
            <div className={Prostyles.poin_name}>区域名称:<span>{popShownodeId.areaName}</span></div>
            {popShow && popShow.length > 1 ?
              [<span className={style.interLeft} onClick={this.getArrowLeft}><Icon type="left" /></span>,
              <span className={style.interRight} onClick={this.getArrowRight}><Icon type="right" /></span>] : null}
            <div className={classNames([style.beginBox])} id="markerIds">
              <div className={style.begins} ref={(e) => { this.wrapper = e }} style={{ width: 490 * popShow.length }}>
                {
                  popShow.length > 0 ?
                    popShow.map((items, index) => {
                      return (
                        <div className={style.beginsItem} key={index}>
                          <div className={style.poin_torus}>
                            {
                              items.map((item, indexs) => {
                                return (
                                  <div key={item.rowId} className={Prostyles.circle_one} >
                                    <div>
                                      <span >{item.programTitle}</span>
                                      <span>
                                        <i style={{ display: 'block', opacity: this.state.popOpacity === index * 3 + indexs ? 1 : 0 }} onClick={(e) => { this.handleShowExamnie(e, item) }} />
                                        <i style={{ display: 'block', opacity: this.state.popOpacity === index * 3 + indexs ? 1 : 0 }} onClick={() => { this.handleGoSetting(item) }} />
                                      </span>
                                      <span title={item.programTitle} style={{ borderRadius: '50%' }} indexs={index * 3 + indexs} onClick={this.handlePopShowIcon} />
                                    </div>
                                  </div>
                                )
                              })
                            }
                            <div className={Prostyles.circle_four} onClick={() => { this.handleGoSetting(false) }}>
                              <div>
                                <span>
                                  <img src={require('../imgs/add.png')} />
                                </span>
                                <span />
                                <span />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }) :
                    <div className={style.beginsItem}>
                      <div className={style.poin_torus}>
                        <div className={Prostyles.circle_four} onClick={() => { this.handleGoSetting(false) }}>
                          <div>
                            <span>
                              <img src={require('../imgs/add.png')} />
                            </span>
                            <span />
                            <span />
                          </div>
                        </div>
                      </div>
                    </div>
                }
              </div>
            </div>
          </div> : null}
        {/* 查看弹框  */}
        {examine ?
          <div className={style.examine}>
            <div className={style.title}>方案名称&nbsp;:&nbsp;{showExamnieData && showExamnieData.programTitle}</div>
            <span className={roadStyles.clone} onClick={this.handleCloseExaminePop} />
            <div className={style.centerWrapper} ref={(input) => { this.centerWrapper = input }}>
              <div
                style={{ top: 0, left: 0 }}
                className={style.centerMoveBox}
                ref={(input) => { this.centerMoveBox = input }}
                onMouseDown={this.handleMoveMouseDown}
                onMouseMove={this.handleMoveMouseMove}
                onMouseUp={this.handleMoveMouseUp}
                onWheel={this.handleMoveBoxScroll}
              >
                <div className={style.canvasBox} ref={(input) => { this.canvasBox = input }} />
                {
                  this.state.interPoint &&
                  this.state.interPoint.map((item, index) => (
                    <div
                      className={style.interPointBox}
                      key={item.nodeName + item.nodeId}
                      lng={item.unitLongitude}
                      lat={item.unitLatitude}
                      interid={item.nodeId}
                      intername={item.nodeName}
                      indexs={index}
                      style={{ left: item.unitLongitude - 20, top: item.unitLatitude - 20 }}
                      onClick={(e) => { this.handleShowInterMessage(e, item.nodeId, item.nodeName) }}
                      title={item.nodeName}
                    >
                      <div
                        className={style.interMessageBox}
                        style={{ display: this.state.showMessage === index ? 'block' : 'none' }}
                        onClick={this.handleShowInterInfo}
                        indexs={index}
                      >
                        <div className={style.interMessage} style={{ top: '-30px', left: '-45px' }} infoname="canalization">渠化</div>
                        <div className={style.interMessage} style={{ top: '-50px', left: 0 }} infoname="flow">流量</div>
                        <div className={style.interMessage} style={{ top: '-30px', left: '45px' }} infoname="singal">信号</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className={style.examine_top}>
              <span><i />路口中心点</span>
              <span><i />道路单行线</span>
            </div>
          </div> : null}

        {/* 渠化图 */}
        {geometryImg ?
          <div className={style.banksFigure}>
            <div className={style.title}>
              {areaNodename}路口渠化结构
              <span className={style.clone} onClick={this.hanleCLoseInterInfo} />
            </div>
            <div className={style.content}>
              <img style={{ width: '100%', height: '100%', padding: '10px' }} src={geometryImg} />
            </div>
          </div> : null}
        {interPlanInfo === 'flow' ?
          <div className={style.trafficFlow}>
            <div className={style.title}>
              {areaNodename}路口流量
              <span className={style.clone} onClick={this.hanleCLoseInterInfo} />
            </div>
            <div className={style.content}>
              <div className={style.roadflow} style={{ height: '375px' }}>
                <div id="container" className={style.containers} rely-onid="" arrow-data="" people-data="" bike-data="" />
              </div>
              <div className={classNames({ [style.flowSelect]: true, [style.flowSelectTwo]: true })}>流量类型 :
                <Select key="vehicleType" defaultValue={this.state.carTypeList[0].dictCode}>
                  {
                    carTypeList.map((item, i) => {
                      return <Option key={item.dictCode} value={item.dictCode} onClick={(e) => { this.carTypeChange(item.dictCode) }}>{item.codeName}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={style.timerShaft}>
                <div id="timeBox" className={style.timeBox}>
                  <mark>播放<i /></mark>
                  <em><i /></em>
                </div>
              </div>
            </div>
          </div> : null}
        {signalList ?
          <div className={style.signalList}>
            <div className={classNames({ [style.title]: true, [style.titleTwo]: true })}>
              {areaNodename}路口信号
              <span className={style.clone} onClick={this.hanleCLoseInterInfo} />
            </div>
            <div className={style.content}>
              <div className={style.bottom}>
                {signalList && signalList.map((item, index) => {
                  return (
                    <div id={'phase_box' + index} className={style.signal_scheme} key={item.timePlanId}>
                      {
                        item.timePlans.map((planItem, playIndex) => {
                          return (
                            <div className={style.signal_listbox} key={'signa' + playIndex}>
                              <div id={'plan_' + index + 'phase_' + playIndex} crossing-width="6" className={style.signal_lists} />
                              <div className={style.phaseTitle}>
                                {"阶段" + planItem.phaseSeq}
                                <span>{planItem.greenTime + "s"}</span>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>)
                })}
              </div>
              <div className={style.top}>
                {/*  <div className={style.signal_precept}><span>方案一<i /></span></div> */}
                <div id="timeProgressBar" className={classNames(style.progress, style.timeBox)} />
              </div>
            </div>
          </div> : null}
        {/* 右侧弹框 */}
        <div className={classNames(Prostyles.poin_area, style.poin_area)}>
          <div className={Prostyles.poin_line} style={{ height: '40px', lineHeight: '40px', paddingLeft: '10px', backgroundColor: 'rgba(13,27,66, .6)' }}>
            <span style={{ width: '150px' }}>建模区域{areaAndNodeList && areaAndNodeList.length}个</span>
          </div>
          <div className={Prostyles.pro_Button}>
            {
              areaAndNodeList ? areaAndNodeList.map((item, index) => {
                return (
                  <DirectoryTree key={item.areaName + item.areaId} defaultExpandedKeys={[index === 0 ? item.areaId + '' : '0']} multiple={false} showIcon={false} switcherIcon={<Icon type="down" />} expandAction={false} onExpand={this.aaa} onSelect={(e, b) => { this.geteareList(b, item) }}>
                    <TreeNode title={item.areaName} key={item.areaId} >
                      {!!item.nodes && item.nodes.map((items, indexs) => {
                        return <TreeNode title={items.nodeName} key={'tree' + items.nodeId} item={items} disabled={true} />
                      })}
                    </TreeNode>
                  </DirectoryTree>
                )
              }) : null
            }
          </div>
        </div>
        {/* 学无止境 */}
        {/* <div className={style.heart}>
          <div className={style.topLeft}></div>
          <div className={style.topRight}></div>
          <div className={style.bottom}></div>
        </div> */}
      </div >
    )
  }
}

export default TrafficArea
