import React from 'react'
import $ from 'jquery'
import { Modal, Icon, DatePicker, TimePicker, Select, Tree, message, Upload } from 'antd'
import moment from 'moment'
import 'moment/locale/zh-cn'
import classNames from 'classnames'
import styles from './Projectmana.scss'
import Navigation from '../Navigation/Navigation'
import Nav from '../../Nav/Nav'
import TrafficVideo from '../../../components/TrafficVideo/TrafficVideo'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import getResponseDatas from '../../../utlis/getResponseData'
import mapStyles from '../../../utlis/styles_2301'

moment.locale('zh-cn')
const format = 'HH:mm'
const { Option } = Select
const { TreeNode, DirectoryTree } = Tree
const { confirm } = Modal
/* 交通组织方案管理 */
class Projectmana extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      markerDom: null, // 点弹窗四个按钮
      banksfigure: false, // 渠化图弹框
      flow: false, // 流量
      signalList: false, // 信号
      listItemList: false, // 组织方案管理
      signalPhase: null,
      precept: [1, 2],
      areaAndNodeList: null,
      geometryBg: null,
      nodeId: null,
      proGetgfpt: '',
      carTypeList: null, // 车辆类型列表
      flowDay: null,
      timeArr: [], // 时间轴数组
      planNameArr: [], // 方案名字
      crossingRoadDatas: [], // 路口
      crossingCvsData: [], // 插件数据
      dirCvsData: [], // 路口名称
      vehicleType: '1', // 选中的车辆类型
      carTypeList: [], // 车辆类型列表
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
      flowStartHour: '', // 开始时间
      flowEndHour: '', // 结束时间
      geometryIndex: 0,
      nodeName: '',
      signalFile: {},
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
          color: 'yellow'
        },
        {
          modelState: 2,
          nodeName: '已建模',
          color: '#00E500'
        }],
      videoSrc: null,
    }
    this.areaAndNode = {
      cityId: '1',
      searchKey: '',
    }
    this.markers = []
    this.cityId = '1'
    this.crossingUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' //获取路口道路方向（前端画路口地图形状）
    this.areaAndNodeUrl = '/simulation/district/list/districtAndNode/' + this.cityId // 根据城市ID获取业务区域和区域下的路口'
    this.planUrl = '/simulation/node/list/to/map/' + this.cityId // {cityId} 根据城市ID获取地图上所有路口的点（点颜色根据modelState属性来判断：0 灰色、1 黄色、2 绿色）
    this.infoUrl = '/simulation/node/plan/manage/get/flow/info/' // 根据路口ID，查询流量详情（集合）
    this.imgUrl = '/simulation/node/plan/manage/get/geometry/img/' // 根据路口ID查询渠化图片以及渠化基本信息
    this.timingUrl = '/simulation/node/plan/manage/get/signal/timing/' // 根据路口ID，获取信号方案
    this.phaseUrl = '/simulation/node/plan/manage/get/signal/phase/' // 根据配时方案号，查询配时方案中的所有相位
    this.getgfpt = '/simulation/node/plan/manage/get/g/f/p/t/' // {nodeId} 点击点位事件，获取渠化编号集合、流量编号集合、方案编号集合和仿真任务主键集合'
    this.geometryUrl = '/simulation/node/plan/manage/get/geometry/img/' // 根据路口ID查询渠化图片以及渠化基本信息
    this.deleteUrl = '/simulation/geometry/delete/' // {nodeId}/{geometryId}/{rowId} 根据ID，删除渠化'
    this.carTypeUrl = '/simulation/code/list/codeInfo/13'// 车辆类型ID 13
    this.flowUrl = '/simulation/node/plan/manage/get/flow/info/'// 根据路口ID，查询流量详情（路口点位点击仿真方案回显接口）
    this.numFlowUrl = '/simulation/node/plan/manage/get/flow/info/' // 根据路口编号、渠化编号、流量编号、车辆类型、道路类型查询不通方向的流量
    this.turnUrl = '/simulation/geometry/shape/lane/turn/'// 根据渠化编号，获取渠化道路转向集合
    this.dirUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/'// 根据路口编号查询各个进入路口的道路名称
    this.stpUrl = '/simulation/node/plan/manage/get/signal/phase/'// 根据配时方案号，查询配时方案中的所有相位
    this.flowDelete = '/simulation/node/flow/delete/' // {nodeId}/{flowId}删除流量'
    this.taskgfp = '/simulation/node/plan/manage/get/sim/task/g/f/p/' // {nodeId} 查询仿真信息（交通组织方案管理，点击组织方案接口）'
    this.videoFileUrl = '/simulation/file/sim/video/up/1' // {type}/{simId}/{fileName} 仿真视频上传接口'
    this.taskDeleteUrl = '/simulation/sim/task/delete/' // {targetId}/{taskType}/{rowId} 删除仿真方案'
    this.deletePlanInfoUrl = '/simulation/signal/delete/planInfo/' // {rowId} 删除仿真信号大方案'
    this.videoUrl = '/simulation/sim/task/get/video/by/task/' // {rowId}/{taskType}获取仿真区域视频或仿真路口视频链接1'
  }
  componentDidMount = () => {
    this.renderMineMap()
    // 获取左侧列表
    this.getareaAndNode()
    this.getCarTypeDatas()
  }
  componentWillUnmount = () => {
    /* this.map.remove() */
  }
  // 删除信号方案
  getdeletePlanInfo = (e, item, index) => {
    const { nodeId, signalPhase, signalList, proGetgfpt } = this.state
    const that = this
    confirm({
      title: '确认要删除当前方案?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('delete', that.deletePlanInfoUrl + nodeId + '/' + item.stpId + '/' + item.rowId).then((res) => {
            if (res.data.code === 200) {
              signalList.splice(index, 1)
              signalPhase.splice(index, 1)
              message.success(res.data.content)
              if (signalPhase.length) {
                that.handleStpIdData(signalPhase[0], 0)
              }
              /* proGetgfpt.planTotal -= 1
              console.log(proGetgfpt) */
              that.setState({ signalPhase, signalList, proGetgfpt })
            } else {
              message.error(res.data.content)
            }
            resolve()
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 删除
  gettaskDelete = (rowId, index) => {
    const { nodeId, listItemList, signalFile } = this.state
    const that = this
    confirm({
      title: '确认要删除当前方案?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve, reject) => {
          getResponseDatas('delete', that.taskDeleteUrl + nodeId + '/1' + '/' + rowId).then((res) => {
            if (res.data.code === 200) {
              listItemList.splice(index, 1)
              signalFile.splice(index, 1)
              message.success('删除成功！')
              /*   that.getmarkersState() */
              that.OpenInforWindow(that.openInforE, that.openInforData)
              that.setState({ listItemList, signalFile })
            } else {
              message.error(res.data.content)
            }
            resolve()
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  gettaskgfp = (nodeId) => {
    getResponseDatas('get', this.taskgfp + nodeId).then((resData) => {
      if (resData.data.code === 200) {
        let { signalFile } = this.state
        signalFile = resData.data.content.map((item, index) => {
          const fileName = '' + item.rowId + item.geometryId + item.flowId + item.stpId
          const signalFiles = {
            name: 'file',
            /*  accept: '.xls,.xlsx', */
            showUploadList: false,
            action: this.videoFileUrl + '/' + item.rowId + '/' + fileName,
            headers: {
              authorization: 'authorization-text',
            },
            onChange(info) {
              if (info.file.status !== 'uploading') {
              }
              if (info.file.status === 'done') {
                message.success(`${info.file.name} 上传成功！！`)
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败！！`)
              }
            },
          }
          return signalFiles
        })
        this.setState({ listItemList: resData.data.content, signalFile })
      }
    })
  }

  getPrecept = (e, id, rowId, index) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation();
    const { nodeId, banksfigure } = this.state
    const that = this
    confirm({
      title: '确认要删除当前方案?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve, reject) => {
          getResponseDatas('delete', that.deleteUrl + nodeId + '/' + id + '/' + rowId).then((res) => {
            if (res.data.code === 200) {
              banksfigure.splice(index, 1)
              message.success('删除成功！')
              that.setState({
                banksfigure,
              })
            } else {
              message.error(res.data.content)
            }
            resolve()
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  getCarTypeDatas = () => getResponseDatas('get', this.carTypeUrl).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        carTypeList: res.data.content,
      })
    }
  })
  getScrollTime = (flowDay) => {
    const that = this
    if ($('#timeBox')[0]) {
      $('#timeBox').getScrollTime({
        timeShow: true, // 时间的显示
        nowDate: flowDay.day,
        timeStart: flowDay.startHour, // 开始时间
        timeEnd: flowDay.endHour, // 结束时间
        paddingBoth: 30, // 左右padding 值
        plugStyle: styles, // 样式传入
        timeGap: Number(flowDay.interval), // 间隔时段
        thisDom: that, // this根指向
        // borderL: "1px #333 solid", //绘制线的颜色
        // borderH: "1px blue solid", //高亮线颜色长线
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
  // 流量数据
  getFlowNum = (nodeId, geometryId, flowId, roadType, vehicleType, startHour, endHour) => {
    const urlStr = this.numFlowUrl + nodeId + '/' + geometryId + '/' + flowId + '/' + roadType + '/' + vehicleType
    getResponseDatas('get', urlStr, { startTime: startHour, endTime: endHour }).then((res) => {
      if (res.data.code === 200) {
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
  // 路口道路名称
  getDir = id => getResponseDatas('get', this.dirUrl + '/' + id).then((res) => {
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
  // 路口插件接口
  getTurn = (nodeId, id) => getResponseDatas('get', this.turnUrl + nodeId + '/' + id).then((res) => {
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
  // 路口流量接口
  getFlowId = (id, geometryId, index) => {
    const { nodeId, vehicleType } = this.state
    getResponseDatas('get', this.flowUrl + nodeId + '/' + geometryId + '/' + id).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        const flowDay = res.data.content[0]
        this.setState({
          flowDay,
          geometryIndex: index,
        }, () => {
          this.getFlowNum(nodeId, geometryId, id, 1, vehicleType, flowDay.startHour, flowDay.endHour)
          this.getScrollTime(res.data.content[0])
        })
      }
    })
  }

  // 获取右侧列表
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
  // 获取信号相位
  getSignalPhase = (timePlanId) => {
    getResponseDatas('get', this.phaseUrl + timePlanId).then((res) => {
      if (res.data.code === 200) {
        if (timePlanId === 1) {
          this.setState({ signalPhase: [1, 2, 3, 4] })
        } else {
          this.setState({ signalPhase: [1, 2] })
        }
      }
    })
  }
  // 移除
  getRemove = (e, index) => {
    e.stopPropagation()
    const { signalList } = this.state
    signalList.splice(index, 1)
    this.setState({ signalList }, () => {
      if (signalList.length === 0) {
        this.setState({ signalPhase: [] })
      } else {
        this.getSignalPhase(signalList[index ? index - 1 : index].timePlanId)
      }
    })
  }
  // 关闭按钮
  getClone = () => {
    // 拿到按钮dom
    const domSpan = this.state.markerDom
    // 取消所以按样式
    $(domSpan[0]).removeClass(styles.spanOnclick_one)
    $(domSpan[1]).removeClass(styles.spanOnclick_two)
    $(domSpan[2]).removeClass(styles.spanOnclick_three)
    $(domSpan[3]).removeClass(styles.spanOnclick_four)
    // 关闭所以弹窗
    this.setState({
      banksfigure: false,
      flow: false,
      signalList: false,
      listItemList: false,
      geometryIndex: 0,
      signalPhase: null,
    })
  }
  getOrganization = (item, name) => {
    if (name === '1') {
      this.setState({
        banksfigure: [item],
        flow: false,
        signalList: false,
        listItemList: false,
        geometryIndex: 0,
      }, () => { this.getbanksfigureBg(0, item.geometryId) })
    }
    if (name === '2') {
      this.setState({
        banksfigure: false,
        flow: [item],
        signalList: false,
        listItemList: false,
        geometryIndex: 0,
      }, () => {
        this.handleFlowData(item, 0)
      })
    }
    if (name === '3') {
      this.setState({
        banksfigure: false,
        flow: false,
        signalPhase: [item],
        listItemList: false,
        geometryIndex: 0,
      }, () => {
        this.handleStpIdData(item, 0)
      })
    }
  }
  // 获取渠化信息
  getbanksfigureBg = (index, id) => {
    const { nodeId } = this.state
    getResponseDatas('get', this.geometryUrl + nodeId + '/' + id).then((res) => {
      if (res.data.code === 200 && res.data.content.length > 0) {
        this.setState({
          geometryBg: res.data.content[0].shapeFileName,
          geometryIndex: index,
        })
      } else {
        this.setState({
          geometryBg: '',
          geometryIndex: index,
        })
      }
    })
  }
  // 路口信号接口
  getStpId = (nodeId, geometryId, id, index) => getResponseDatas('get', this.stpUrl + nodeId + '/' + geometryId + '/' + id).then((res) => {
    const timeArr = []
    const planNameArr = []
    if (res.data.code === 200 && res.data.content.length > 0) {
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
      this.setState({
        signalList: [],
        timeArr: [],
        planNameArr: [],
      }, () => this.getProgressTime())
    }
  })
  getProgressTime = () => {
    const _this = this;
    const { flowDay } = this.state
    $('#timeProgressBar').getScrollTime({
      timeShow: true, //时间的显示
      nowDate: '2018-01-01',
      timeStart: _this.state.flowStartHour, //开始时间
      timeEnd: _this.state.flowEndHour, //结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      // timeGap: Number(_this.state.flowInterval.slice(0, -2)), //间隔时段
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
      getTimeArr: true,
      timeArr: _this.state.timeArr, //时间组合
      planNameArr: _this.state.planNameArr, // 方案名字
    })
  }
  // 删除流量
  getflowDelete = (e, item, index) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation()
    const { nodeId, flow } = this.state
    const that = this
    confirm({
      title: '确认要删除当前方案?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('delete', that.flowDelete + nodeId + '/' + item.geometryId + '/' + item.flowId).then((res) => {
            if (res.data.code === 200) {
              flow.splice(index, 1)
              message.success('删除成功！')
              that.setState({ flow })
            } else {
              message.error(res.data.content)
            }
            resolve()
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 修改车辆类型
  carTypeChange = (val) => {
    this.getFlowNum(this.state.nodeId, this.state.flowDay.geometryId, this.state.flowDay.flowId, 1, val, this.state.startHour, this.state.endHour)
    this.setState({
      vehicleType: val,
    }, () => this.getCrossingCvs(0))
  }
  // 获取路口方向
  crossingFn = (nodeId, geometryId) => getResponseDatas('get', this.crossingUrl + nodeId + '/' + geometryId).then((res) => {
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
  OpenInforWindow = (e, item) => {
    this.openInforData = item
    this.openInforE = e
    if (!item) { return }
    if (!!item && this.state.modelState.includes(Number(item.modelState))) {
      window.event ? window.event.cancelBubble = true : e.stopPropagation()
      const { map } = this
      if (item.modelState === 0 || item.modelState == null) {
        message.warning('当前路口无数据!')
        return
      }
      // 删除弹窗
      if (this.popup) {
        this.popup.remove()
        this.popup = null
      }
      const bgColor = item.modelState === 0 ? '#ccc' : item.modelState === 1 ? 'yellow' : item.modelState === 2 ? '#00E500' : '#ccc'
      const el = this[item.nodeId]
      const p = this[item.nodeId + 'p']
      if (this.markerId) {
        document.getElementById(this.markerId).innerHTML = ''
      }
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
      getResponseDatas('get', this.getgfpt + item.nodeId).then((suc) => {
        if (suc.data.code === 200) {
          this.setState({
            proGetgfpt: suc.data.content,
          }, () => {
            // 添加marker
            this.popup = new window.minemap.Popup({ closeOnClick: true, closeButton: false, anchor: 'bottom', offset: [0, -20] }).setLngLat([item.unitLongitude, item.unitLatitude]).setHTML(`<div id="pointMarker" class=${styles.pointMarker}>
    <div class=${styles.poin_number}>路口编号：<span>${item.nodeId}</span></div>
    <div class=${styles.poin_number}>路口名称：<span>${item.nodeName}</span></div>
    <div class=${styles.poin_torus} id="markerIds">
    <div class=${styles.circle_one}><div><span>渠化${this.state.proGetgfpt && this.state.proGetgfpt.geometryTotal}套</span><span></span><span></span></div></div>
    <div class=${styles.circle_two}><div><span>流量${this.state.proGetgfpt && this.state.proGetgfpt.flowTotal}套</span><span></span><span></span></div></div>
    <div class=${styles.circle_three}><div><span key=${this.state.proGetgfpt && this.state.proGetgfpt.planTotal}>信号${this.state.proGetgfpt && this.state.proGetgfpt.planTotal}套</span><span></span><span></span></div></div>
    <div class=${styles.circle_four}><div><span>组织方案${this.state.proGetgfpt && this.state.proGetgfpt.taskTotal}套</span><span></span><span></span></div></div>     
    </div>
    </div>`).addTo(map)
          })
          // 渠化 流量 信号 组织方案
          const domSpan = this.popup._content.children[0].children[2].children
          // 取到dom 后期做关闭处理
          this.state.markerDom = domSpan
          // 点开点弹窗 先清除所以打开的弹窗 跟 弹窗按钮选中样式
          this.getClone()
          // 给四个按钮分别绑定事件
          for (let j = 0; j < domSpan.length; j++) {
            domSpan[j].onclick = () => {
              if (j === 0) {
                if (suc.data.content.geometry.length === 0) {
                  message.warning('当前无渠化方案')
                  return
                }
                // 当前点击按钮赋予样式 取消其余按钮样式
                $(domSpan[0]).addClass(styles.spanOnclick_one)
                $(domSpan[1]).removeClass(styles.spanOnclick_two)
                $(domSpan[2]).removeClass(styles.spanOnclick_three)
                $(domSpan[3]).removeClass(styles.spanOnclick_four)
                // 当前弹窗开启 其余弹窗关闭 做互斥
                this.setState({
                  banksfigure: suc.data.content.geometry,
                  flow: false,
                  signalList: false,
                  listItemList: false,
                  nodeId: item.nodeId,
                  geometryIndex: 0,
                }, () => { this.getbanksfigureBg(0, suc.data.content.geometry[0].geometryId) })
              }
              if (j === 1) {
                if (suc.data.content.flow.length === 0) {
                  message.warning('当前无流量方案')
                  return
                }
                // 当前点击按钮赋予样式 取消其余按钮样式
                $(domSpan[0]).removeClass(styles.spanOnclick_one)
                $(domSpan[1]).addClass(styles.spanOnclick_two)
                $(domSpan[2]).removeClass(styles.spanOnclick_three)
                $(domSpan[3]).removeClass(styles.spanOnclick_four)
                // 当前弹窗开启 其余弹窗关闭 做互斥
                this.setState({
                  banksfigure: false,
                  flow: suc.data.content.flow,
                  signalList: false,
                  listItemList: false,
                  nodeId: item.nodeId,
                  geometryIndex: 0,
                }, () => {
                  this.getDir(item.nodeId)
                  this.getTurn(item.nodeId, suc.data.content.flow[0].geometryId)
                  /*  this.getFlowNum(item.nodeId, suc.data.content.flow[0].geometryId, suc.data.content.flow[0].flowId, 1, this.state.vehicleType) */
                  this.getFlowId(suc.data.content.flow[0].flowId, suc.data.content.flow[0].geometryId, 0)
                })
              }
              if (j === 2) {
                if (suc.data.content.plan.length === 0) {
                  message.warning('当前无信号方案')
                  return
                }
                // 当前点击按钮赋予样式 取消其余按钮样式
                $(domSpan[0]).removeClass(styles.spanOnclick_one)
                $(domSpan[1]).removeClass(styles.spanOnclick_two)
                $(domSpan[2]).addClass(styles.spanOnclick_three)
                $(domSpan[3]).removeClass(styles.spanOnclick_four)
                // 当前弹窗开启 其余弹窗关闭 做互斥
                this.setState({
                  banksfigure: false,
                  flow: false,
                  signalPhase: suc.data.content.plan,
                  listItemList: false,
                  nodeId: item.nodeId,
                  geometryIndex: 0,
                }, () => {
                  this.crossingFn(item.nodeId, suc.data.content.plan[0].geometryId)
                  this.getStpId(item.nodeId, suc.data.content.plan[0].geometryId, suc.data.content.plan[0].stpId, 0)
                })
              }
              if (j === 3) {
                if (suc.data.content.task.length === 0) {
                  message.warning('当前无组织方案')
                  return
                }
                // 当前点击按钮赋予样式 取消其余按钮样式
                $(domSpan[0]).removeClass(styles.spanOnclick_one)
                $(domSpan[1]).removeClass(styles.spanOnclick_two)
                $(domSpan[2]).removeClass(styles.spanOnclick_three)
                $(domSpan[3]).addClass(styles.spanOnclick_four)
                // 当前弹窗开启 其余弹窗关闭 做互斥
                this.setState({
                  banksfigure: false,
                  flow: false,
                  signalList: false,
                  nodeId: item.nodeId,
                  signalPhase: null,
                  geometryIndex: 0,
                  /* listItemList: suc.data.content.task, */
                }, () => {
                  this.gettaskgfp(item.nodeId)
                })
              }
            }
          }
        }
      })
      map.on('click', () => {
        if (this.markerId) {
          document.getElementById(this.markerId).innerHTML = ''
        }
        this.setState({
          banksfigure: false,
          flow: false,
          signalList: false,
          listItemList: false,
          geometryIndex: 0,
        })
      })
      map.panTo([item.unitLongitude, item.unitLatitude])
    } else {
      message.warning('当前路口已隐藏')
    }
  }
  getinterDetails = (value, data) => {
    if (data && data.node.props.item) {
      this.OpenInforWindow(data, data.node.props.item)
    }
  }
  handleFlowData = (item, index) => {
    const { geometryId, flowId } = item
    const { nodeId, vehicleType } = this.state
    this.getDir(nodeId)
    this.getTurn(nodeId, geometryId)
    /* this.getFlowNum(nodeId, geometryId, flowId, 1, vehicleType) */
    this.getFlowId(flowId, geometryId, index)
  }
  handleStpIdData = (item, index) => {
    const { nodeId } = this.state
    const { geometryId, stpId } = item
    this.crossingFn(nodeId, geometryId)
    /* $('.Projectmana_signal_listbox__2SmVV').remove() */
    this.getStpId(nodeId, geometryId, stpId, index)
  }
  getmodelState = (modelState) => {
    this.setState({
      modelState,
      banksfigure: false,
      flow: false,
      signalList: false,
      listItemList: false,
      geometryIndex: 0,
    }, () => {
      if (this.popup) {
        this.popup.remove();
        this.popup = null;
      }
      this.getmarkersState()
    })
  }
  handleVideo = (rowId) => {
    if (rowId === null) {
      this.setState({ videoSrc: null })
      return
    }
    getResponseDatas('get', this.videoUrl + rowId + '/1').then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (result.content) {
          this.setState({ videoSrc: result.content })
        } else {
          message.error('当前方案无视频！')
        }
      }
    })
  }
  getmarkersState = () => {
    const map = this.map
    getResponseDatas('get', this.planUrl).then((res) => {
      if (res.data.code === 200) {
        const markerDatas = res.data.content
        if (this.markers.length) {
          for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].remove();
            this.markers[i] = null;
          }
          this.markers = []
        }
        markerDatas.forEach((item, index) => {
          if (this.state.modelState.includes(Number(item.modelState))) {
            const el = document.createElement('div')
            const p = document.createElement('div')
            const title = document.createElement('div')
            const bgColor = item.modelState === 0 ? '#ccc' : item.modelState === 1 ? '#CCFF00' : item.modelState === 2 ? '#00E500' : '#ccc'
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
            /* if (index === 0) {
              this.map.panTo([item.unitLongitude, item.unitLatitude])
            } */
            this.map.panTo([106.706278, 26.590897])
            const marker = new window.minemap.Marker(el, { offset: [-3, -20] }).setLngLat([item.unitLongitude, item.unitLatitude]).addTo(map)
            el.addEventListener('click', (e) => {
              this.setState({ nodeName: item.nodeName })
              this.OpenInforWindow(e, item)
            })
            this.markers.push(marker)
          }
        })
      }
    })
  }
  // mineData
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
  }

  render() {
    const {
      banksfigure, flow, videoSrc, signalList, listItemList, nodeName, signalFile, flowDay, modelState, geometryIndex, interColor, geometryBg, carTypeList, areaAndNodeList, signalPhase
    } = this.state
    return (
      <div className={styles.Content}>
        {/* 地图 */}
        <div id="mapContainer" className={styles.mapContainer} />
        <Nav getSearch={this.getSearch} OpenInforWindow={this.OpenInforWindow} modelState={modelState} interColor={interColor} getmodelState={this.getmodelState} />
        <Navigation {...this.props} />
        {/* 右侧弹框 */}
        <div className={styles.poin_area}>
          <div className={styles.titleBox}>
            <div className={styles.titleName}>区域</div>
          </div>
          <div className={styles.pro_Button}>
            {
              areaAndNodeList ? areaAndNodeList.map((item, index) => {
                return (
                  <DirectoryTree key={item.districtId} defaultExpandedKeys={[index === 0 ? item.districtId + '' : '0']} multiple={false} showIcon={false} switcherIcon={<Icon type="down" />} onSelect={this.getinterDetails} >
                    <TreeNode title={item.districtName} key={item.districtId}>
                      {!!item.node && item.node.map((items, indexs) => {
                        return <TreeNode title={items.nodeName} key={'tree' + items.nodeId} item={items} />
                      })}
                    </TreeNode>
                  </DirectoryTree>
                )
              }) : null
            }
          </div>
        </div>
        {/* 渠化弹窗 */}
        {banksfigure ?
          <div className={styles.canalization}>
            <div className={styles.cana_title}>{nodeName}渠化方案管理</div>
            <span className={styles.clone} onClick={this.getClone} />
            {/* <span className={styles.cana_close} /> */}
            <div className={styles.cana_centent}>
              <span className={styles.compass} />
              <img src={geometryBg} key={geometryBg} alt="加载中" style={{ width: '90%' }} />
              <div className={styles.precept}>
                {banksfigure.map((item, index) => {
                  return <span key={item.geometryTitle + index} className={classNames({ [styles.planBtnChecked]: geometryIndex === index })} title={item.geometryTitle} onClick={() => { this.getbanksfigureBg(index, item.geometryId, item.rowId) }}><span>{item.geometryTitle}</span><i onClick={(e) => { this.getPrecept(e, item.geometryId, item.rowId, index) }} /></span>
                })}
              </div>
            </div>
          </div> : null
        }
        {/* 流量 */}
        {
          flow ?
            <div className={styles.flow}>
              <div className={styles.flow_title}>{nodeName}流量</div>
              <span className={styles.clone} onClick={this.getClone} />
              <div className={classNames({ [styles.flow_box]: true, [styles.scrollBox]: true })}>
                <div className={styles.roadtraffic_data}>流量采集日期 : {flowDay ? <DatePicker id="datepicker" defaultValue={moment(flowDay && flowDay.day, 'YYYY-MM-DD')} className={styles.datepicker} disabled /> : null}</div>
                {flowDay ? <div className={styles.timePicker}>流量采集时段 :  <TimePicker className={styles.timePicker_time} defaultValue={moment(flowDay && flowDay.startHour, format)} format={format} disabled /> 至 <TimePicker className={styles.timePicker_time} defaultValue={moment(flowDay && flowDay.endHour, format)} format={format} disabled /></div> : null}
                <div className={styles.flowSelect}>时间隔断 : {flowDay ? <Select defaultValue={flowDay && flowDay.interval} disabled><Option value={15}>15分钟</Option><Option value={30}>30分钟</Option></Select> : null}</div>
                <div className={styles.precept}>
                  {!!flow && flow.map((item, index) => {
                    return <span key={item.flowTitle} className={classNames({ [styles.planBtnChecked]: geometryIndex === index })} onClick={() => { this.handleFlowData(item, index) }}><span>{item.flowTitle}</span><i onClick={(e) => { this.getflowDelete(e, item, index) }} /></span>
                  })}
                </div>
                <div className={styles.roadflow} style={{ height: '450px' }}>
                  <div id="container" className={styles.containers} rely-onid="" arrow-data="" people-data="" bike-data="" />
                </div>
                <div className={classNames({ [styles.flowSelect]: true, [styles.flowSelectTwo]: true })}>流量类型 :
                  <Select key="vehicleType" defaultValue={this.state.carTypeList[0].codeName}>
                    {
                      this.state.carTypeList.map((item, i) => {
                        return <Option key={item.dictCode} value={item.codeName} onClick={(e) => { this.carTypeChange(item.dictCode) }}>{item.codeName}</Option>
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
              </div>
            </div> : null
        }
        {/* 信号 */}
        {
          signalList ?
            <div className={classNames(styles.road_signal, 'dragMove')} >
              <span className={styles.clone} onClick={() => { this.getClone('signalList') }} />
              <div className={styles.signal_title}>{nodeName}信号</div>
              <div className={styles.signal_precept} style={{ position: 'absolute' }}>
                {!!signalPhase && signalPhase.map((item, index) => {
                  return <span key={item.stpDes} className={classNames({ [styles.planBtnChecked]: geometryIndex === index })} onClick={() => { this.handleStpIdData(item, index) }}><span>{item.stpDes}</span><i onClick={(e) => { this.getdeletePlanInfo(e, item, index) }} /></span>
                })}
              </div>
              {signalList && signalList.map((item, index) => {
                return (
                  <div id={'phase_box' + index} className={styles.signal_scheme} key={item.timePlanTitle + item.cycleLength}>
                    <div className={styles.signal_precept}>
                      {/* {!!signalPhase && signalPhase.map((item, index) => {
                        return <span key={item.stpDes} className={classNames({ [styles.planBtnChecked]: geometryIndex === index })} onClick={() => { this.handleStpIdData(item, index) }}><span>{item.stpDes}</span><i onClick={(e) => { this.getdeletePlanInfo(e, item, index) }} /></span>
                      })} */}
                    </div>
                    {
                      item.timePlans.map((planItem, playIndex) => {
                        return (
                          <div className={styles.signal_listbox} key={'signa' + playIndex}>
                            <div id={'plan_' + index + 'phase_' + playIndex} crossing-width="6" className={styles.signal_lists} />
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
            </div> : null
        }
        {/* 组织方案 */}
        {
          listItemList ?
            <div className={styles.organization}>
              <span className={styles.clone} onClick={this.getClone} />
              <div className={styles.organ_title}>{nodeName}组织方案管理</div>
              <div className={styles.organ_list}>
                <div className={styles.listItem} style={{ backgroundColor: '#2B5391' }}>
                  <div className={styles.listTh}>组织方案</div>
                  <div className={styles.listTh}>渠化方案</div>
                  <div className={styles.listTh}>流量方案</div>
                  <div className={styles.listTh}>信号方案</div>
                  <div className={styles.listTh}>操作</div>
                </div>
                {!!listItemList && listItemList.map((item, index) => {
                  return (
                    <div className={styles.listItem} key={"infor" + index}>
                      <div className={styles.listTh}>
                        {item.programTitle}
                      </div>
                      <div className={styles.listTh}>
                        <span onClick={() => { this.getOrganization(item, '1') }}>{item.geometryTitle}</span>
                      </div>
                      <div className={styles.listTh}>
                        <span onClick={() => { this.getOrganization(item, '2') }}>{item.flowTitle}</span>
                      </div>
                      <div className={styles.listTh}>
                        <span onClick={() => { this.getOrganization(item, '3') }}>{item.stpDes}</span>
                      </div> {/* onClick={() => { this.getvideoFile(item) }} */}
                      <div className={styles.listTh}><span onClick={() => { this.handleVideo(item.rowId) }} >{/* <Upload key={signalFile[index].action} {...signalFile[index]}><Icon type="upload" />上传视频</Upload> */}观看视频 </span><span onClick={() => { this.gettaskDelete(item.rowId, index) }}><i />删&nbsp;&nbsp;除</span></div>
                    </div>)
                })}
              </div>
            </div> : null
        }
        {videoSrc ? <TrafficVideo videoSrc={videoSrc} handleVideo={this.handleVideo} /> : null}
      </div>
    )
  }
}

export default Projectmana
