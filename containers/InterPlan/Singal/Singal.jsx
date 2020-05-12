import React from 'react'
import $ from 'jquery'
import { DatePicker, Select, Icon, TimePicker, Upload, message, Modal, Input, Spin, InputNumber } from 'antd'
import moment from 'moment'
import classNames from 'classnames'
import styles from './Singal.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import Header from '../../Header/Header'
import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import Title from '../../../components/Title/Title'
import SplitLine from '../../../components/SplitLine/SplitLine'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件


const format = 'HH:mm'

class Singal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hiddenSave: true,
      showPopSave: false, // 显示保存浮层
      showPhaseManage: false,
      isAddPhase: false,
      planList: null,
      TimingList: null,
      flowDay: '2020-01-01',
      timePicker: { startTime: '07:00', endTime: '08:00' },
      crossingRoadDatas: [false, false, false, false, false, false, false, false], //8个路口是否有  true有 默认没有
      crossingCvsData: null, //流量箭头
      signalList: null,
      phaseCvsArr: null,
      phaseCvsArrFlag: true,
      phaseCvsArrDefault: null,
      timeArr: null,
      planNameArr: null,
      dispatchListArr: [], //时间调度列表
      allPhaseList: [], // 路口相位库集合
      addPhaseList: null, // 添加路口相位库集合
      cycleCurrent: undefined,  // 周期下方相位是否选中
      current: 0,  // 相位管理中相位是否选中
      currents: 0,  // 添加相位是否选中
      currentPlan: 0,  // 方案是否选中
      clickFlag: false, // 是否点击
      cycleLength: 0, // 周期
      nowCycleLength: 0, // 当前时间周期
      timeVerFlag: true, // 纵轴标识
      dispatchTemplateArr: [], // 时间调度模板数组
      dispatchNumTop: [], // 时间调度top值集合
      relyOnObj: null, // 拖动时依赖的参考对象
      newDom: null, // 拖动的对象
      downClickFlag: false, // 是否是单击
      messageTips: '保存中，请稍等...',
      moduleOneFlag: null, // 保存的模块
      moduleTwoFlag: null, // 保存的模块
      moduleThreeFlag: null, // 保存的模块
      moduleFail: true, // 有模块失败时显示关闭
      thisIndex: null, // 计算当前的阶段个数
      hasFlowTime: true,
      stpId: null,
      noSignal: false, // 是否有信号
    }
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('interPlanMsg'))
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
    // 仿真信号
    this.planUpdateUrl = '/simulation/signal/update/planInfo' // 修改仿真信号大方案
    this.planInfoUrl = '/simulation/signal/list/planInfo/' // {nodeId}/{geometryId} 根据路口ID和渠化ID，查询所有大的信号方案'
    this.timingListUrl = '/simulation/node/signal/timing/list/' // {nodeId}/{geometryId} 查询信号小方案和相位模型'
    this.delInfoUrl = '/simulation/signal/delete/planInfo/' // {rowId}删除仿真信号大方案'
    this.addPlanInfoUrl = '/simulation/signal/add/planInfo' // 新增仿真信号大方案'
    this.crossingUrl = '/simulation/node/plan/manage/get/sim/toNode/dir/' // 获取路口道路方向（前端画路口地图形状）
    this.turnUrl = '/simulation/geometry/shape/lane/turn/'// 根据渠化编号，获取渠化道路转向集合箭头
    this.stpUrl = '/simulation//node/signal/timing/list/'// 查询信号小方案和相位模型
    // this.stpUrl = '/simulation/node/plan/manage/get/signal/phase/'// 根据配时方案号，查询配时方案中的所有相位
    this.signalFileUrl = '/simulation/file/sim/signal/import' // {nodeId}/{geometryId}/{designerId} 仿真信号方案导入'
    this.nodeUrl = '/simulation/node/phase/db/list/by/node/' // 路口相位库集合
    // 相位管理
    this.phaseManageAddUrl = '/simulation/node/phase/db/add' // 新增
    this.phaseManageUpdateUrl = '/simulation/node/phase/db/update' // 修改
    this.phaseManageDelUrl = '/simulation/node/phase/db/delete/by/' // 删除
    // 时间方案
    this.timeAddPlanUrl = '/simulation/node/signal/timing/add/' // 新增时间方案
    this.timeDelPlanUrl = '/simulation/node/signal/timing/delete/' // 删除时间方案
    this.timeUpdatePlanUrl = '/simulation/node/signal/timing/update/' //    修改时间方案
    // 仿真应用调度
    this.dispatchAddUrl = '/simulation/signal/dispatch/add/plan/' // 新增仿真信号方案调度计划
    this.dispatchListUrl = '/simulation/signal/dispatch/get/plan/' // 回显列表 根据路口和渠化ID查询，调度计划和计划包含相位
    this.dispatchUpdateUrl = '/simulation/signal/dispatch/update/' // 修改

    this.putPlanName = '/simulation/signal/update/planInfo' // 修改名字

    this.signalYesNo = '/simulation/geometry/get/not/exists/signal/' // 是否有信号
  }
  componentDidMount = () => {
    if (this.InterPlanMsg.nodeId) {
      this.paramerDetail.nodeId = this.InterPlanMsg.nodeId
      this.paramerDetail.geometryId = this.InterPlanMsg.planMsg.geometryId
      this.paramerDetail.flowId = this.InterPlanMsg.planMsg.flowId
      this.paramerDetail.stpId = this.InterPlanMsg.planMsg.stpId
      this.paramerDetail.startTime = this.InterPlanMsg.planMsg.startTime
      this.paramerDetail.endTime = this.InterPlanMsg.planMsg.endTime
      this.paramerDetail.rowId = this.InterPlanMsg.planMsg.rowId
    }
    // debugger
    /* "endTime": "string", // this.paramerDetail.endTime
      "planId": 0, // this.paramerDetail.planId
      "rowId": 0, // this.paramerDetail.rowId
      "startTime": "string", // this.paramerDetail.startTime
       */
    // console.log(this.paramerDetail.stpId, '信号ID')
    // console.log(this.paramerDetail.flowId, '流量ID')
    // 是否有信号
    this.signalYesNoFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId)
    // 获取左侧列表
    this.handlePlanInfo()
    // 配时方案
    this.handleTimingList()
    this.roadCrossingFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId) //查询出路口
    this.getCrossingCvsFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId) //查询出箭头
    const tokens = JSON.parse(localStorage.getItem('userInfo')).token
    // 上传
    this.signalFile = {
      name: 'file',
      accept: '.xls,.xlsx',
      showUploadList: false,
      action: 'http://39.100.128.220:20199' + this.signalFileUrl + '/' + this.paramerDetail.nodeId + '/' + this.paramerDetail.geometryId + '/' + this.paramerDetail.stpId + '/' + this.paramerDetail.designerId,
      headers: {
        Authorization: tokens,
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList)
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功！！`)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败！！`)
        }
      },
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
  // 仿真应用调度列表回显
  getDispatchList = (nodeId, geometryId, stpId) => getResponseDatas('get', this.dispatchListUrl + nodeId + '/' + geometryId + '/' + stpId).then((res) => {
    if (res.data.content.length > 0) {
      this.setState({
        dispatchListArr: res.data.content,
      }, () => {
        this.getScrollRightTime()
      })
    } else {
      this.setState({
        dispatchListArr: [],
      }, () => {
        message.info('暂无数据！')
        this.getScrollRightTime()
      })
    }
  })
  // 仿真应用调度新增
  getDispatchAdd = (nodeId) => getResponseDatas('post', this.dispatchAddUrl + nodeId).then((res) => {
    message.info(res.data.content)
  })
  // 仿真应用调度修改
  getDispatchUpdate = (nodeId, planId, dispatchObj) => {
    Modal.confirm({
      title: '确定要删除该方案吗？',
      okText: '确定',
      cancelText: '取消',
      onOk : () => {
        getResponseDatas('put', this.dispatchUpdateUrl + nodeId + '/' + planId, dispatchObj).then((res) => {
          this.getDispatchList(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId)
          this.getScrollRightTime()
          message.info(res.data.content)
        })
      }
    })
  }
  // 8个路口是否有
  roadCrossingFn = (nodeId, geometryId) => getResponseDatas('get', this.crossingUrl + nodeId + '/' + geometryId).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        crossingRoadDatas: res.data.content,
      })
      // console.log('路口', this.state.crossingRoadDatas)
    } else {
      this.setState({
        crossingRoadDatas: [false, false, false, false, false, false, false, false],
      })
    }
  })
  // 流量插件图请求箭头
  getCrossingCvsFn = (nodeId, geometryId) => getResponseDatas('get', this.turnUrl + nodeId + '/' + geometryId).then((res) => {
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        crossingCvsData: res.data.content,
      }, () => {
        this.getCrossingPhaseFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId) // 相位图请求
      })
      // console.log('箭头', this.state.crossingCvsData)
    } else {
      this.setState({
        crossingCvsData: [],
      })
    }
  })
  // 流量插件图 必须放在相位图方法后调用
  getCrossingCvs = (relyId, data, index, nowId, strColor) => {
    const _this = this
    const defaultPeople = [];
    const defaultBike = JSON.parse(JSON.stringify(_this.state.crossingCvsData))
    _this.state.crossingRoadDatas.map((item, i) => {
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
    if (_this.state.clickFlag) {
      if (index == 0) {
        $($('.Singal_stageMsgBoxList__3eUZE').children().children().children()[0]).attr('class', 'Singal_phaseBox__2CKe_ Singal_svg_select__2lCrt')
      } else {
        $($('.Singal_stageMsgBoxList__3eUZE').children().children().children()[0]).attr('class', 'Singal_phaseBox__2CKe_')
      }
    }
    $((nowId ? '#'+nowId : '#container')).attr('arrow-data', JSON.stringify(data.vehicle))
    if (nowId){
      this.setState({
        current: index,
      })
    } else {
      this.setState({
        cycleCurrent: index,
      })
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
      arrowNowColor: strColor ? strColor : 'green',
      roadArrowData: _this.state.crossingCvsData, // 路线  
      arrowArrColor: (nowId ? ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'] : ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red']),
      arrowWidth: 8, //箭头宽度 
      pointerLength: 18, //箭头尺寸
      pointerWidth: 18, //箭头尺寸      
      dataRoad: _this.state.crossingRoadDatas, //8方向是否有
      bikeArr: defaultBike,
      peopleRoad: defaultPeople,
      bikeSelArr: data.bicycle, //自行车显示对应的图
      peopleSelRoad: data.pedestrian,
    })
    
    _this.setState({clickFlag:false})
    $(`<div style="position: absolute;top:0;right:0;bottom:0;left:0;z-index: 99;"></div>`).appendTo($('#container'))
  }
  // 相位插件图请求
  getCrossingPhaseFn = (nodeId, geometryId, flowId) => getResponseDatas('get', this.stpUrl + nodeId + '/' + geometryId).then((res) => {
    const timeArr = []
    const planNameArr = []
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        signalList: res.data.content,
        nowCycleLength: 0,
      }, () => {
        this.setState({
          phaseCvsArr: this.state.signalList[0].webPhases,
        }, () => {
          // console.log('方案数据', this.state.phaseCvsArr)
          
          this.state.phaseCvsArrFlag ? this.getScrollTime(this.state.phaseCvsArr) : null // 下方的时间轴
          this.state.phaseCvsArr.map((item, i) => {
            this.state.cycleLength += item.greenTime
            this.state.cycleLength += item.allRedTime
            this.state.cycleLength += item.yellowFlashTime
            this.getCrossingPhase('container', 'crossing' + i, item)
            i == 0 ? this.getCrossingCvs('crossing0', this.state.phaseCvsArr[0], 0) : '' // 流量图回显第一个
          })
          this.setState({
            phaseCvsArrFlag: true, // 默认执行，当是新加的方案时不执行
          })
        })
      })
    }
  })
  /* getCrossingPhaseFn = (nodeId, geometryId, flowId) => getResponseDatas('get', this.stpUrl + nodeId + '/' + geometryId + '/' + flowId).then((res) => {
    const timeArr = []
    const planNameArr = []
    if (res.data.code === 200 && res.data.content.length > 0) {
      this.setState({
        signalList: res.data.content,
      }, () => {
        console.log(this.state.signalList,'最大的')
        this.setState({
          phaseCvsArr: this.state.signalList[0].timePlans,
          cycleLength: this.state.signalList[0].cycleLength,
        }, () => {
          console.log('方案数据', this.state.phaseCvsArr)
          this.state.phaseCvsArr.map((item, i) => {
            this.getCrossingPhase('container', 'crossing' + i, item.phases)
            i == 0 ? this.getCrossingCvs('crossing0', this.state.phaseCvsArr[0].phases, 0) : '' // 流量图回显第一个
          })
        })
        
      })
    }
  }) */
  // 切换相位数据
  getPhaseCrossFn = (data, idx) => {
    if (data && data.length > 0) {
      data.map((item, i) => {
        this.setState({
          phaseCvsArr: this.state.signalList[idx].webPhases,
          phaseCvsArrDefault: this.state.signalList[idx].webPhases[0],
          cycleLength: this.state.signalList[idx].cycleLength,
          nowCycleLength: 0,
        }, () => {
          this.getCrossingPhase('container', 'crossing'+i, item)
          this.getCycleLength(this.state.phaseCvsArr)
        })
      })
      this.setState({
        currentPlan: idx,
        phaseCvsArr: this.state.signalList[idx].webPhases,
        clickFlag:true,
      }, () => {
        // console.log('当前方案的相位', this.state.phaseCvsArr)
        // 默认显示第一个
        if (this.state.phaseCvsArr.length > 0) {
          this.getCrossingCvs("crossing0", this.state.phaseCvsArr[0], 0); 
          $($('.Singal_stageMsgBoxList__3eUZE').children().children().children()[0]).attr('class', 'Singal_phaseBox__2CKe_ Singal_svg_select__2lCrt')
        }
      })
    }
    this.setState({
      currentPlan: idx,
      phaseCvsArr: this.state.signalList[idx].webPhases,
      downClickFlag: false,
    }, () => {
      // console.log('当前方案的相位', this.state.phaseCvsArr)
      // 默认显示第一个
      this.getCycleLength(this.state.phaseCvsArr)
      if (this.state.phaseCvsArr.length > 0) {
        this.getCrossingCvs("crossing0", this.state.phaseCvsArr[0], 0); 
        $($('.Singal_stageMsgBoxList__3eUZE').children().children().children()[0]).attr('class', 'Singal_phaseBox__2CKe_ Singal_svg_select__2lCrt')
      }
    })
  }
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
      // roadArrowData: [[0,1,2, 3, 4,5,6,7],[],[],[],[],[],[],[]],   
      bikeSelArr: data.bicycle,
      // bikeSelArr: [
      //   [false, true, false, false, false, true, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false],
      //   [false, false, false, false, false, false, false, false]
      // ], //自行车显示对应的图
      // peopleSelRoad: [false, false, false, false, false, false, false, false],
      peopleSelRoad: data.pedestrian,
      // peopleSelRoad: [false, true, false, true, false, false, false, false],
      dataRoad: _this.state.crossingRoadDatas,
      arrowWidth: 4, //箭头宽度 
      pointerLength: 6, //箭头尺寸
      pointerWidth: 6, //箭头尺寸
    })
  }
  // 时间轴开始停止 触发
  triggerClick = () => {
    if($($('#timeBox').find('mark')[0]).attr('class')){
      $($('#timeBox').find('mark')[0]).trigger('click')
      $($('#timeBox').parent().find('em')).attr('style', 'left:30px')
    }else{
      $($('#timeBox').parent().find('em')).attr('style', 'left:30px')
    }
  }
  getScrollTime = (bgData) => {
    debugger
    this.triggerClick()
    const _this = this
    if (bgData) {
      this.setState({
        thisIndex: bgData.length,
      })
      $('#timeBox').getScrollTime({
        bgColor: true, // 是否有颜色
        bgData: bgData, // 背景数据
        paddingBoth: 30, //左右padding 值
        plugStyle: styles, //样式传入
        thisDom: _this, // this根指向
      })
    }
    
  }
  getScrollRightTime = () => {
    const _this = this;
    /* if (flag) {
      const timeData = JSON.parse(JSON.stringify(_this.state.dispatchListArr))
      timeData.map((newItem, newIndex) => {
        newItem.endTime = (timeData[newIndex + 1] ? timeData[newIndex + 1].startTime : _this.state.dispatchTemplateArr[_this.state.dispatchTemplateArr.length - 1].startTime)
      })
    } */
    // 纵向时间轴
    $('#timeVerBox').getScrollTime({
      timeShow: true, //时间的显示
      vertical: _this.state.timeVerFlag,
      nowDate: _this.state.flowDay,
      timeStart: _this.state.timePicker.startTime, //开始时间
      timeEnd: _this.state.timePicker.endTime, //结束时间
      paddingBoth: 30, //左右padding 值
      plugStyle: styles, //样式传入
      timeGap: 5, //间隔时段
      thisDom: _this, // this根指向
      dispatchData: _this.state.dispatchListArr, // 调度列表数据
    })
    this.setState({
      timeVerFlag: false,
    })
        // 线的距上面Top值集合
    const timeLines = $('#timeVerBox').find('.Singal_horStepGapBig__1jXzL')
    // 线的时间集合
    const timeLineTimes = $('#timeVerBox .Singal_horStepGapBig__1jXzL').find('time')
    // top值添加到数组中
    this.state.dispatchNumTop = []
    timeLines.map((i,item) => {      
      this.state.dispatchNumTop.push(item.getBoundingClientRect().top)
    })
    this.state.relyOnObj = $('#rightPop')[0].getBoundingClientRect()
    // 纵轴的时间节点线
    // 单个对像模板
    if (this.state.dispatchListArr.length > 0) {
      const newObj = JSON.parse(JSON.stringify(this.state.dispatchListArr[0]))
      newObj.endTime = ""
      newObj.startTime = ""
      newObj.timePlanId = null
      newObj.timePlanTitle = ""
      this.setState({
        dispatchTemplateArr: JSON.parse(JSON.stringify(new Array(timeLines.length).fill(newObj)))
      },() => {
        // 时间节点添加到模板内
        const templateArr = this.state.dispatchTemplateArr
        timeLineTimes.map((i,item) => {
          this.state.dispatchTemplateArr[i].startTime = $(item)[0].childNodes[0].nodeValue
        })
      })

    } else {
      this.setState({
        timeVerFlag: true,
      })
    }
    // console.log( this.state.dispatchListArr,this.state.dispatchNumTop,this.state.relyOnObj,'集合')
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
  // 新增左侧方案
  getNewPlanName = (name) => {
    const { timePicker } = this.state
    this.paramerDetail.stpDes = name
    this.paramerDetail.startTime = timePicker.startTime
    this.paramerDetail.endTime = timePicker.endTime
    this.paramerDetail.rowId = 0
    getResponseDatas('post', this.addPlanInfoUrl, this.paramerDetail).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(res.data)
        this.handlePlanInfo() // 左侧列表
      }
    })
  }
  handleAddPhase = () => {
    this.setState({ isAddPhase: true }, () => {
      this.phaseAllAdd(this.paramerDetail.nodeId)
    })
  }
  handleCloseAddPhase = () => {
    this.setState({ isAddPhase: false })
  }
  handlePhaseManage = () => {
    const _this = this;
    this.setState({ showPhaseManage: true }, () => {
      this.phaseAll(this.paramerDetail.nodeId)
    })
  }
  handleClosePhaseManage = () => {
    this.setState({ showPhaseManage: false })
  }

  // 获取左侧列表
  handlePlanInfo = () => {
    const _this = this
    const { nodeId, geometryId } = this.paramerDetail
    let { timePicker } = this.state
    const { startHour, endHour } = this.InterPlanMsg.planMsg
    const url = startHour && endHour ?
      `${this.planInfoUrl}${nodeId}/${geometryId}?startTime=${startHour}&endTime=${endHour}` :
      `${this.planInfoUrl}${nodeId}/${geometryId}`
    if (startHour && endHour) {
      timePicker = { startTime: startHour, endTime: endHour }
      this.setState({ timePicker })
      this.hasFlowTime = true
    } else {
      this.hasFlowTime = false
    }
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200 && result.content.length > 0) {
        this.paramerDetail.stpId = this.InterPlanMsg.planMsg.stpId ? this.InterPlanMsg.planMsg.stpId : res.data.content[0].stpId
        // const { startHour, endHour } = this.InterPlanMsg.planMsg
        if (!this.hasFlowTime) {
          timePicker = { startTime: res.data.content[0].startTime, endTime: res.data.content[0].endTime }
        }
        let planItems = (res.data.content.filter(item => item.stpId === this.paramerDetail.stpId))[0]
        if (!planItems) planItems = res.data.content[0]
        const { designerId, planId, stpDes } = planItems
        this.paramerDetail.designerId = designerId
        this.paramerDetail.planId = planId
        this.paramerDetail.stpDes = stpDes
        this.signalFile.action = this.signalFile.action + designerId
        this.setState({
          planList: res.data.content,
          timePicker,
          hasFlowTime: this.hasFlowTime,
          stpId: this.paramerDetail.stpId,
        }, () => {
          // console.log('第一次获取到得stpId', this.state.stpId)
          this.changePlan(geometryId, this.paramerDetail.stpId, planId)
        })
      } else {
        this.setState({ planList: [] })
        message.info('暂无数据')
      }
    })
  }
  // 获取配时方案
  handleTimingList = () => {
    const { nodeId, geometryId } = this.paramerDetail
    getResponseDatas('get', this.timingListUrl + nodeId + '/' + geometryId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(res.data, '周期的方案列表')
        this.setState({ TimingList: res.data.content })
      }
    })
  }
  // 左侧列表删除
  handleDeletePlan = (geometryId, nodeId, stpId, rowId) => {
    // console.log(nodeId)
    getResponseDatas('delete', this.delInfoUrl + this.InterPlanMsg.nodeId + '/' + stpId + '/' + rowId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(res.data)
        this.handlePlanInfo()
        /*   this.setState({ TimingList: res.data.content }) */
      }
      message.info(result.content)
    })
  }
  // 修改方案名称
  handleChangePlanName = (value, stpId, rowId) => {
    getResponseDatas('put', this.planUpdateUrl, { rowId, stpDes: value }).then((res) => {
      // console.log('change plan Name ::::', res)
      const { code, content } = res.data
      if (code === 200) {
        this.handlePlanInfo()
      }
      message.info(content)
    })
  }
  // 时间选择框触发
  handleTimePicker = (e, name) => {
    // console.log(moment(e).format('HH:mm'))
    const { timePicker } = this.state
    timePicker[name] = moment(e).format('HH:mm')
  }
  // 点击左侧列表回调 切换方案
  changePlan = (geometryId, nowId, planId) => {
    let planItems = (this.state.planList.filter(item => item.stpId === nowId))[0]
    if (!planItems) planItems = this.state.planList[0]
    if (!this.hasFlowTime) {
      const { startTime, endTime, editable } = planItems
      this.setState({
        timePicker: { startTime, endTime },
        hasFlowTime: !editable,
      })
    }
    if (this.InterPlanMsg.planMsg) {
      Object.keys(planItems).forEach((item) => {
        this.InterPlanMsg.planMsg[item] = planItems[item]
      })
      sessionStorage.setItem('interPlanMsg', JSON.stringify(this.InterPlanMsg))
    }
    this.paramerDetail.stpId = nowId
    this.paramerDetail.planId = planId
    this.paramerDetail.stpDes = planItems.stpDes
    this.getDispatchList(this.paramerDetail.nodeId, geometryId, this.paramerDetail.stpId)
    // console.log(this.paramerDetail.nodeId, geometryId, nowId)
  }
  // 路口相位集合 > 相位管理
  phaseAll = (nodeId) => {
    getResponseDatas('get', this.nodeUrl + nodeId).then((res) => {
      const result = res.data
      if (result.code === 200 && result.content.length > 0 ) {
        this.setState({
          allPhaseList: result.content
        }, () => {
          this.state.allPhaseList.map((item, index) => {
            this.getCrossingPhase("containerList","crossingList" + index, item)
            // this.getCrossingCvs("crossingList" + index, item,'', "containerList")
          })
          this.getCrossingCvs("crossingList"+(this.state.allPhaseList.length-1), this.state.allPhaseList[(this.state.allPhaseList.length-1)], (this.state.allPhaseList.length-1), "containerList")
        })
      }
    })
  }
  // > 相位管理 > 加号添加
  newPhaseAdd = () => {
    const newObj = {
      pedestrian: new Array(8).fill(false),
      bicycle: new Array(8).fill(new Array(8).fill(false)),
      phaseName: '',
      vehicle: new Array(8).fill(new Array(8).fill(null)),
      nodeId: 0,
    }
    // console.log(this.state.allPhaseList, 'xiangwei messsage')
    const index = this.state.allPhaseList.length - 1
    const lastPhase = this.state.allPhaseList[index].phaseId + 1
    newObj.phaseName = '相位'+ lastPhase
    newObj.nodeId = this.InterPlanMsg.nodeId
    newObj.pedestrian[0] = true
    getResponseDatas('post', this.phaseManageAddUrl, newObj).then((res) => {
      this.phaseAll(this.InterPlanMsg.nodeId)
      message.info('添加成功!')
    })
  }
  // > 相位管理 > 输入框编辑
  inputChange = (e) => {
    const val = $(e.target).val(); // input 值
    const index = $(e.target).attr('id').substr(10); // 下标
      const newObj = JSON.parse(JSON.stringify(this.state.allPhaseList[index]));
      newObj.nodeId = this.InterPlanMsg.nodeId
      newObj.phaseName = val
      getResponseDatas('put', this.phaseManageUpdateUrl, newObj).then((res) => {
        this.phaseAll(this.InterPlanMsg.nodeId)
        message.info('修改成功!')
        this.getCrossingPhaseFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId) // 更新周期数据列表
      })
  }
  // > 相位管理 > 保存
  savePhase = () => {
    const vehicle = JSON.parse($('#containerList').attr('arrow-data'));
    const pedestrian = JSON.parse($('#containerList').attr('people-data'));
    const bicycle = JSON.parse($('#containerList').attr('bike-data'));
    const newObj = JSON.parse(JSON.stringify(this.state.allPhaseList[this.state.current]));
    newObj.pedestrian = pedestrian;
    newObj.bicycle = bicycle;
    newObj.vehicle = vehicle;
    newObj.nodeId = this.InterPlanMsg.nodeId
    getResponseDatas('put', this.phaseManageUpdateUrl, newObj).then((res) => {
      this.phaseAll(this.InterPlanMsg.nodeId)
      message.info('修改成功!');
      this.getCrossingPhaseFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId) // 更新周期数据列表
    })
  }
  // 相位管理 > 删除
  phaseManageDelete = (e, index, phaseId) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确定要删除该相位吗？',
      okText: '确定',
      cancelText: '取消',
      onOk : () => {
        getResponseDatas('delete', this.phaseManageDelUrl+this.InterPlanMsg.nodeId+'/'+phaseId).then((res) => {
          if ( res.data.code === 201) {
            message.info(res.data.content)
          } else {
            this.phaseAll(this.InterPlanMsg.nodeId)
            this.setState({
              hiddenSave: false,
            })
            message.info(res.data.content)
          }
        })
      }
    });
  }
  // 路口相位集合 > 周期 > 添加相位
  phaseAllAdd = (nodeId) => {
    getResponseDatas('get', this.nodeUrl + nodeId).then((res) => {
      const result = res.data
      if (result.code === 200 && result.content.length > 0 ) {
        this.setState({
          addPhaseList: result.content
        }, () => {
          this.state.addPhaseList.map((item, index) => {
            this.getCrossingPhase("","crossingAdd" + index, item)
          })
        })
      }
    })
  }
  // 路口相位集合 > 周期 > 方案添加
  planAdd = () => {
    // console.log('共有多少方案之添加')
    const nowPlan = this.state.signalList
    // debugger
    // console.log(nowPlan)
    // 模板方案
    const planArr = []
    const planNew = {
      allRedTime: 0,
      cycleLength: 0,
      designerId: 1,
      geometryId: 0,
      greenTime: 0,
      nodeId: 0,
      phaseId: 0,
      phaseSeq: 0,
      timePlanTitle: '方案名',
      yellowFlashTime: 0,
    }
    // 类型赋值
    planNew.nodeId = this.InterPlanMsg.nodeId
    planNew.geometryId = this.InterPlanMsg.planMsg.geometryId
    planNew.timePlanTitle = '方案'+(nowPlan.length+1)
    planArr.push(planNew)
    getResponseDatas('post', this.timeAddPlanUrl + this.InterPlanMsg.nodeId + '/' + this.InterPlanMsg.planMsg.geometryId, planArr).then((res) => {
      // console.log(res.data.code);
      message.info(res.data.content)
      this.setState({
        phaseCvsArrFlag: null,
      })
      this.getCrossingPhaseFn(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId)
      const timeShowLastOne = setTimeout(() => {
        this.getPhaseCrossFn(this.state.signalList[this.state.signalList.length-1].webPhases, this.state.signalList.length-1) 
        clearTimeout(timeShowLastOne)
      }, 300)
    })
    this.setState({
      nowCycleLength: 0,
    }, () => {
      $('#timeBox').empty().append('<div class="ant-spin ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span><div class="ant-spin-text">暂无数据</div></div>')
    })
  }
   // 路口相位集合 > 周期 > 方案拖动
   mouseMoveUp = (e, newDom, timePlanId) => {
    // debugger
    e.stopPropagation()
    const _this = this
    const downTime = new Date().getTime()
    const oldDom = $(e.currentTarget).clone()
    newDom = $('<span class=' + styles.newSpan +'>' + oldDom.attr('title') + '</span>')
    newDom.appendTo(document.body);
    this.setState({
      newDom: {timePlanId:timePlanId,timePlanTitle:oldDom.attr('title')},
    })
    $(document.body).mousemove(function (e) {
      e.stopPropagation()
      newDom.offset({
      left: e.pageX - 35,
      top: e.pageY - 12.5
      });
    })
    
     $(document.body).mouseup((e) => {
        const upTime = new Date().getTime()
        if( (upTime - downTime) < 200){
          _this.state.downClickFlag = true
        }
        $(document.body).off('mousemove')
        $(document.body).off('mouseup')
      //  debugger
       e.stopPropagation()
       const timeArr = JSON.parse(JSON.stringify(_this.state.dispatchListArr))
       newDom.remove()
      //  console.log(_this.state.newDom, 'up')
       if (e.pageX > _this.state.relyOnObj.left && e.pageX < _this.state.relyOnObj.right && e.pageY > _this.state.dispatchNumTop[0] && e.pageY < _this.state.dispatchNumTop[_this.state.dispatchNumTop.length - 1]) {
         const dayTime = _this.state.flowDay + ' '
         _this.state.dispatchNumTop.map((item, i) => {
           if (e.pageY > item && e.pageY < _this.state.dispatchNumTop[i + 1]) {
             _this.state.dispatchTemplateArr[i].timePlanId = +_this.state.newDom.timePlanId
             _this.state.dispatchTemplateArr[i].timePlanTitle = _this.state.newDom.timePlanTitle
            //  console.log(_this.state.dispatchTemplateArr[i], i)
             // 新增的对像
             const addObj = JSON.parse(JSON.stringify(_this.state.dispatchTemplateArr[i]))
             _this.state.dispatchListArr.map((thisItem, thisIndex) => {
               /*  
               1:开始时间等于时间轴的开始时间 --- 插入, 结束时间等于下一个开始时间
               2:开始时间等于结束时间 --- 插入,并且结束时间等于下一个开始时间；
               3:开始时间相等时 --- 替换；
               */
               //  Date.parse()
               if (thisItem.startTime === addObj.startTime) { // 1
                 // addObj.endTime = timeArr[thisIndex+1] ? timeArr[thisIndex+1].startTime : _this.state.dispatchTemplateArr[_this.state.dispatchTemplateArr.length - 1].startTime // 结束时间等于下一个的开始时间
                 addObj.endTime = thisItem.endTime
                 timeArr.splice(thisIndex, 1, addObj)
               } else if (Date.parse(dayTime + thisItem.startTime) < Date.parse(dayTime + addObj.startTime) && !timeArr[thisIndex + 1]) {
                 // addObj.endTime = _this.state.dispatchTemplateArr[_this.state.dispatchTemplateArr.length - 1].startTime
                 timeArr.push(addObj)
               } else if (Date.parse(dayTime + thisItem.startTime) < Date.parse(dayTime + addObj.startTime) && Date.parse(dayTime + addObj.startTime) < Date.parse(dayTime + timeArr[thisIndex + 1].startTime)) {
                 // addObj.endTime = timeArr[thisIndex+1].startTime
                 timeArr.splice(thisIndex + 1, 0, addObj)
               }
             })
           }
         })
         _this.setState({
           dispatchListArr: timeArr,
           hiddenSave: false,
         }, () => {
           _this.getScrollRightTime()
          // console.log(_this.state.dispatchListArr, 'look')
         })

       } else {
         $(document.body).off('mousemove')
         newDom.remove()
       }
      }) 
      
      // console.log(this.state.dispatchListArr,'最后的数据')   
   }
   // 路口相位集合 > 周期 > 方案删除
  planDelete = (e,index,timePlanId) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确定要删除该方案吗？',
      okText: '确定',
      cancelText: '取消',
      onOk : () => {
        const nowPlan = this.state.signalList;
        if (nowPlan.length !== 1) {
          getResponseDatas('delete', this.timeDelPlanUrl + this.InterPlanMsg.nodeId + '/' + this.InterPlanMsg.planMsg.geometryId+ '/' + timePlanId).then((res) => {
            // console.log(res.data.code);
            if (res.data.code === 201) {
              message.info(res.data.content)
            } else {
              nowPlan.splice(index,1);
              this.setState({
                signalList: nowPlan,
                downClickFlag: false,
              }, () => {
                this.getPhaseCrossFn(nowPlan[nowPlan.length-1].webPhases, nowPlan.length-1)
              })
              message.info(res.data.content)
            }
          })
          
        } else {
          message.info('亲，最后一个方案不能删除');
        }
      }
    });
    
  }
  // 路口相位集合 > 周期 > 相位删除
  phaseDelete = (e,index) => {
    e.stopPropagation();
    // phaseCvsArr
    Modal.confirm({
      title: '确定要删除该相位吗？',
      okText: '确定',
      cancelText: '取消',
      onOk : () => {
        const nowData = this.state.signalList[this.state.currentPlan].webPhases;
        if (this.state.currentPlan == 0 && this.state.signalList[this.state.currentPlan].webPhases.length == 1){
          message.info('亲,当前方案最后一个相位不能删除！')
        } else {
          nowData.splice(index,1);
          // console.log(nowData, '数据');
          this.setState({
            hiddenSave: false,
            phaseCvsArr: nowData,
          }, () => {
            this.state.phaseCvsArr.map((item, i) => {
              this.getCrossingPhase('container', 'crossing'+i, item) // 刷新相位图
              this.getCrossingCvs("crossing0", this.state.phaseCvsArr[0],0) // 渠化缩略图默认显示第一个
            })
            this.getCycleLength(nowData) //计算周期时间
          })      
          this.getScrollTime(this.state.phaseCvsArr) // 下方的时间轴 重载
        }
        }
    })
    
  }
  // 红灯的change 
  allRedTimeChange = (v, i) => {
    const itemPhase = this.state.signalList[this.state.currentPlan].webPhases; // 编辑单条数据
    itemPhase[i].allRedTime = +v;
    // console.log('value:',v,'下标', i)
    this.setState({
      hiddenSave: false,
      phaseCvsArr: itemPhase,
    }, () => {
      this.getCycleLength(this.state.phaseCvsArr);
      message.info('红灯时长修改成功!')
      this.getScrollTime(this.state.phaseCvsArr) // 下方的时间轴 重载
    })
  }
  // 绿灯的change 
  greenTimeChange = (v, i) => {
    const itemPhase = this.state.signalList[this.state.currentPlan].webPhases; // 编辑单条数据
    itemPhase[i].greenTime = +v;
    // console.log('value:',v,'下标', i)
    this.setState({
      hiddenSave: false,
      phaseCvsArr: itemPhase,
    }, () => {
      this.getCycleLength(this.state.phaseCvsArr);
      message.info('绿灯时长修改成功!')
      this.getScrollTime(this.state.phaseCvsArr) // 下方的时间轴 重载
    })
  }
  // > 添加相位 > 确认按钮添加
  rightPhaseAdd = () => {
    message.info('添加成功！');
    // console.log('添加相位列表')
    // console.log('// 添加的相位下标', this.state.currents) // 添加的相位下标
    // console.log('// 添加的相位数据', this.state.addPhaseList[this.state.currents]) 
    // console.log('相位方案列表')
    // console.log('所有方案', this.state.signalList)
    // console.log('//当前方案下标对应所有的方案', this.state.signalList[this.state.currentPlan]) 
    // console.log('// 当前选中的相位数据', this.state.signalList[this.state.currentPlan].timePlans[0])

    // 数据收集中数组
    const dataAll = this.state.signalList[this.state.currentPlan].webPhases
    // 添加的相位数据
    const dataNew = this.state.addPhaseList[this.state.currents]
    // 数据源模板
    const dataObjSourse = JSON.parse(JSON.stringify(this.state.signalList[0].webPhases[0]))
    let numCount = this.state.thisIndex + 1
    this.setState({
      thisIndex: numCount,
    },() => {
      dataObjSourse.phaseSeq = this.state.thisIndex;
    })
    // console.log(this.state.thisIndex,"后")
    dataObjSourse.phaseName = dataNew.phaseName;
    dataObjSourse.allRedTime = 0;
    dataObjSourse.greenTime = 1;
    dataObjSourse.bicycle = dataNew.bicycle;
    dataObjSourse.pedestrian = dataNew.pedestrian;
    dataObjSourse.vehicle = dataNew.vehicle;
    dataObjSourse.phaseId = dataNew.phaseId;
    dataAll.push(dataObjSourse);
    this.getCycleLength(dataAll) //计算周期时间
    // 执行最新添加的数据
    this.handleCloseAddPhase()
    const addTime = setTimeout(()=>{
      this.getCrossingPhase('container', 'crossing'+(dataAll.length-1), dataNew);
      this.getCrossingCvs("crossing"+(dataAll.length-1), dataNew, dataAll.length-1);
      clearTimeout(addTime);
    }, 100)
    this.setState({
      hiddenSave: false,
    })
    this.getScrollTime(this.state.phaseCvsArr) // 下方的时间轴 重载
  }
  // 更新周期时间 绿灯
  getCycleLength = (allPhaseData) => {
    if (allPhaseData && allPhaseData.length > 0) {
      let cycleLength = 0
      allPhaseData.map((item, index) => {
        cycleLength += item.greenTime
        cycleLength += item.allRedTime
        cycleLength += item.yellowFlashTime
      })
      this.setState({
        cycleLength: cycleLength,
        nowCycleLength: 0,
      }, () => {
        this.state.signalList[this.state.currentPlan].cycleLength = this.state.cycleLength
        // console.log('查看下当前是多少', this.state.cycleLength)
      })
    } else {
      this.setState({
        cycleLength: 0,
        nowCycleLength: 0,
      }, () => {
        this.state.signalList[this.state.currentPlan].cycleLength = 0
      })
    }
  }
  // 模块一
  oneModule  = (dispatchObj) => { 
    getResponseDatas('put', this.planUpdateUrl, dispatchObj).then((res) => {
    // debugger
    // console.log(res)
    if (res.data.code === 200) {
      this.setState({
        moduleOneFlag: true,
      }, () => {
        this.twoModule()
      })
    }
    
  })
}
// 模块二
twoModule = () => {
  getResponseDatas('put', this.timeUpdatePlanUrl + this.paramerDetail.nodeId + '/' + this.InterPlanMsg.planMsg.geometryId + '/' + this.paramerDetail.planId, this.state.signalList).then((res) => {
    // debugger
    // console.log(res)
    if (res.data.code === 200) {
      this.setState({
        moduleTwoFlag: true,
      }, ()=>{
        this.threeModule()
      })
    }
  })
}
threeModule = () => {
  getResponseDatas('put', this.dispatchUpdateUrl + this.paramerDetail.nodeId + '/' + this.paramerDetail.planId, this.state.dispatchListArr).then((res) => {
    if (res.data.code === 200) {
      this.setState({
        moduleThreeFlag: true,
      }, () =>{
        const _this = this
        Promise.all([this.state.moduleOneFlag,this.state.moduleTwoFlag,this.state.moduleThreeFlag]).then(function(values) {
          if(values[0] && values[1] && values[2]){
            _this.setState({
            hiddenSave: true, // 保存成功时按钮切换成灰色
            messageTips: '保存成功！',
          }, () => {
            const flagTime = setTimeout(() => {
              _this.setState({
                showPopSave: false, // 当点击按钮时隐藏浮层
                moduleOneFlag: null,
                moduleTwoFlag: null,
                moduleThreeFlag: null,
                messageTips: '保存中，请稍等...',
              })
              clearTimeout(flagTime)
            }, 1000)
          })
          }
        });
      })
    }
    this.getDispatchList(this.paramerDetail.nodeId, this.paramerDetail.geometryId, this.paramerDetail.stpId)
    this.getScrollRightTime()
  })
}
  // 统一保存修改
  handleUpdateSingalInfo = () => {
    this.setState({
      showPopSave: true, // 当点击按钮时显示浮层
    })
    // debugger
    const dispatchObj = {
      designerId: 1, // 默认1
      endTime: this.state.timePicker.endTime,
      geometryId: this.paramerDetail.geometryId,
      nodeId: this.paramerDetail.nodeId,
      planId: this.paramerDetail.planId,
      rowId: this.paramerDetail.rowId,
      startTime: this.state.timePicker.startTime,
      stpDes: this.paramerDetail.stpDes,
      stpId: this.paramerDetail.stpId,
    }
    this.oneModule(dispatchObj)
    // this.twoModule()
    const timeData = JSON.parse(JSON.stringify(this.state.dispatchListArr))
    timeData.map((newItem, newIndex) => {
      newItem.endTime = (timeData[newIndex + 1] ? timeData[newIndex + 1].startTime : this.state.dispatchTemplateArr[this.state.dispatchTemplateArr.length - 1].startTime)
    })
    this.setState({
      dispatchListArr: timeData,
    })
  }
  addPhaseClick = (index) => {
    this.setState({
      currents: index,
    })
  }
  render() {
    const { planList, timePicker, TimingList, signalList, phaseCvsArr, nowCycleLength, cycleLength, allPhaseList, addPhaseList } = this.state
    return (
      <div className={styles.singalWrapper}>
        { this.state.showPopSave &&
          <div className={styles.antModalMmask}>
            <div className='ant-modal-content'>
              {/* {this.state.moduleFail ? <Icon type="close" title='关闭' />:null} */}
              <div className={styles.moduleBox}>
                <dl>
                  <dt className={'', this.state.moduleOneFlag ? styles.success:styles.error}>{this.state.moduleOneFlag ? <Icon type="check" /> : <Icon type="exclamation" />}仿真信号</dt>
                  <dt className={'', this.state.moduleTwoFlag ? styles.success:styles.error}>{this.state.moduleTwoFlag ? <Icon type="check" /> : <Icon type="exclamation" />}时间方案</dt>
                  <dt className={'', this.state.moduleThreeFlag ? styles.success:styles.error}>{this.state.moduleThreeFlag ? <Icon type="check" /> : <Icon type="exclamation" />}仿真应用调度</dt>
                </dl>
                <Spin size="large" tip={this.state.messageTips} />
              </div>
            </div>
          </div>
        }
        {
          !!this.InterPlanMsg &&
          <Header InterName={this.InterPlanMsg.interName} hiddenSave={this.state.hiddenSave} handleSavePlan={this.handleUpdateSingalInfo} />
        }
        <div className={styles.singalBox}>
          <div className={styles.singalStage}>
            {/* <div className={styles.stageBox} /> */}
            <s id="stop">停</s>
            <div id="timeBox" className={styles.timeBox}>
              <Spin tip="暂无数据" />
            </div>
            <div className={styles.cycleLengthBox}>{'周期：'+ nowCycleLength +' / '+ cycleLength +' s'}</div>
          </div>

          <div id="container" className={styles.container} rely-onid="" arrow-data="" people-data="" bike-data="">
            <Spin size="large" tip ="暂无数据" />
          </div>
          <div className={styles.flowGetDate}>
            <span style={{ marginLeft: '20px' }}>信号时段: </span>
            <span className={styles.flowGetTime}>
              <TimePicker minuteStep={15} onChange={(e) => { this.handleTimePicker(e, 'startTime') }} defaultValue={moment(timePicker.startTime, format)} format={format} key={timePicker.startTime} disabled={this.state.hasFlowTime} />
            </span>
            <span style={{ padding: '0 5px' }}>至</span>
            <span className={styles.flowGetTime}>
              <TimePicker minuteStep={15} onChange={(e) => { this.handleTimePicker(e, 'endTime') }} defaultValue={moment(timePicker.endTime, format)} format={format} key={timePicker.endTime} disabled={this.state.hasFlowTime} />
            </span>
          </div>
          <div className={styles.planListBox}>
            {/* {planList &&
              <AddPlanList planList={planList} changePlan={this.changePlan} handleDeletePlan={this.handleDeletePlan} getNewPlanName={this.getNewPlanName} />} */}
            {planList &&
              <AddPlanList
                typeId="stpId"
                planList={planList}
                getNewPlanName={this.getNewPlanName}
                handleDeletePlan={this.handleDeletePlan}
                planRowId={this.state.stpId}
                changePlan={this.changePlan}
                changePlanName={this.handleChangePlanName}
              />
            }
          </div>
          <div className={styles.rightPopBox}>
            <div className={styles.rightPop}>
              <div className={styles.rightSpan}>
                {signalList && signalList.map((item, i) => {
                  return <span className={i == this.state.currentPlan ? styles.span_select : ''} key={item.timePlanId} title={item.timePlanTitle} onMouseDown={(e) => {
                    if (!this.state.downClickFlag) {
                      this.mouseMoveUp(e,null,item.timePlanId);
                    }
                    }} onDoubleClick={() => {
                        this.getPhaseCrossFn(item.webPhases, i)
                        this.getScrollTime(item.webPhases)
                        
                    }}><i className={styles.Ileft} />{item.timePlanTitle}<span><Icon type="close" 
                    onClick={(e) => {
                      if (this.state.downClickFlag) {
                        this.planDelete(e, i, item.timePlanId)
                        
                      }
                    }} /></span></span>
                })}
                { this.state.noSignal ? null : <span title="添加方案" onClick={() => { this.planAdd() }}><Icon type="plus" /></span> }
              </div>
              { this.state.noSignal ? null : <div className={styles.phaseManage} onClick={this.handlePhaseManage}>相位管理</div> }
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
                            <div className={classNames(styles.phaseBox, index == this.state.currents ? styles.svg_select : '')} onClick={() => {this.addPhaseClick(index) }}>
                              <div id={"crossingAdd" + index} className={styles.crossingItem} rely-onid="" crossing-width="6" arrow-width="5" pointer-arrow="5" />
                            </div>
                            <div className={styles.stageBox}>
                              {item.phaseName}
                              <span className={styles.closeIcon}></span>
                            </div>
                          </div>
                        )
                      })
                      }
                      <div className={styles.isAddWrapper}>
                        <div className={styles.btnBox}>
                          <div className={styles.isAddBtn} onClick={() => {this.rightPhaseAdd()}}>确定</div>
                          <div className={styles.isAddBtn} style={{ color: '#7e7d7b' }} onClick={this.handleCloseAddPhase}>取消</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
              }
              <div style={{ padding: '20px 0 0 10px' }}><Title title={'周期：'+ cycleLength +' s'} /></div>
              <div className={styles.stageMsgBoxList}>
                {phaseCvsArr && phaseCvsArr.length > 0 ? phaseCvsArr.map((item, i) => {
                  return (
                    <div key={"phaseSvg" + i} phase-id ={item.phaseId} className={styles.stageMsgBox}>
                      <div className={styles.stageMsg}>
                        <div className={classNames(styles.phaseBox, i == this.state.cycleCurrent ? styles.svg_select : '')} onClick={() => {this.setState({clickFlag:true}, ()=>{ this.getCrossingCvs("crossing" + i, this.state.phaseCvsArr[i], i) }); }}>
                          <div id={"crossing"+i} className={styles.crossingItem} rely-onid="container" crossing-width="6" arrow-width="5" pointer-arrow="5" />
                          <span onClick={(e) => {this.phaseDelete(e, i)}}><Icon type="close"  onClick={(e) => {}} /></span>
                        </div>
                        <div className={styles.stageBox}>
                          {item.phaseName}
                          <span className={styles.closeIcon}></span>
                        </div>
                        <div className={styles.lightTime}>
                          <div className={styles.lightBox}>
                            红灯: <span><InputNumber ref='redInput' id={'allRedTime'+i} min={0} disabled={(i == this.state.cycleCurrent ? false : true)} value={item.allRedTime} onBlur={(e) => {this.allRedTimeChange($(e.target).val(), i)}} />s 
                            <span input-id={'allRedTime'+i} title='编辑' className={styles.closeIcon} onClick={(e) => {this.setState({clickFlag:true}, ()=>{ this.getCrossingCvs("crossing" + i, this.state.phaseCvsArr[i], i) }); 
                            const inputId = $(e.target).parent().parent().attr('input-id');
                              setTimeout(()=>{
                                $('#'+inputId).focus();
                              }, 300)
                            }}><Icon type="edit" /></span></span>
                          </div>
                          <div className={styles.lightBox}>
                            绿灯: <span><InputNumber ref='greenInput' id={'greenTime'+i} min={1} disabled={(i == this.state.cycleCurrent ? false : true)} value={item.greenTime} onBlur={(e) => {this.greenTimeChange($(e.target).val(), i)}} />s 
                            <span input-id={'greenTime'+i} title='编辑' className={styles.closeIcon} onClick={(e) => {this.setState({clickFlag:true}, ()=>{ this.getCrossingCvs("crossing" + i, this.state.phaseCvsArr[i], i) }); 
                            const inputId = $(e.target).parent().parent().attr('input-id');
                              setTimeout(()=>{
                                $('#'+inputId).focus();
                              }, 300)
                            }}><Icon type="edit" /></span></span>
                          </div>
                        </div>
                      </div>
                  </div>)
                }):<Spin tip ="暂无数据" />}
                { this.state.noSignal ? null : <div className={styles.addStage} title='添加相位'>
                  <div className={styles.addBtn} onClick={this.handleAddPhase}>
                    <Icon type="plus" />
                  </div>
                </div> }
              </div>
              <div className={styles.singalImport}>
                <SplitLine />
                <div className={styles.singalImportBtn}> <Upload {...this.signalFile}><Icon type="upload" style={{ marginRight: 6 }} />通过模板导入</Upload></div>
              </div>
            </div>
            <div id="rightPop" className={styles.rightPop}>
              <div style={{ padding: '20px 0 0 10px' }}><Title title="仿真应用调度" /></div>
              {
                this.state.noSignal ? <Spin tip ="无信号灯" /> : 
                (this.state.dispatchListArr && this.state.dispatchListArr.length > 0 ? 
                <div id="timeVerBox" className={classNames(styles.timeBox, styles.simulatDispatch, styles.timeVerBox)} /> : <Spin tip ="暂无数据" />)
              }
            </div>
          </div>
          {
            this.state.showPhaseManage &&
            <div className={styles.popWarpper}>
              <div className={styles.phaseManageBox}>
              <div className={styles.title}>
                相位管理
                <span className={styles.closeIcon} onClick={this.handleClosePhaseManage}>
                  <Icon type="close" />
                </span>
              </div>
              <div className={styles.content}>
                <div className={styles.phaseContainer}>
                  <div className={styles.saveBtn} onClick={() => {this.savePhase()}}>保存</div>
                  <div id="containerList" className={styles.phaseCvs} rely-onid="" arrow-data="" people-data="" bike-data="" />
                </div>
                <div className={styles.phaseListBox}>
                  <div className={styles.phaseList}>
                    {allPhaseList && allPhaseList.map((item, index) =>{
                      return (
                        <div className={styles.stageMsg}>
                          <div className={classNames(styles.phaseBox, index == this.state.current ? styles.svg_select : '')} onClick={()=>{this.setState({clickFlag:true}, ()=>{
                            this.getCrossingPhase('containerList', 'crossingList'+index, item)
                            this.getCrossingCvs("crossingList" + index, item, index,'containerList')
                            }) }}>
                            <div id={"crossingList" + index} className={styles.crossingItem} rely-onid="containerList" crossing-width="6" arrow-width="5" pointer-arrow="5" />
                            <span><Icon type="close"  onClick={(e) => {this.phaseManageDelete(e, index, item.phaseId)}} /></span>
                          </div>
                          <div className={styles.stageBox}>
                            <Input placeholder="输入相位名" disabled={(index == this.state.current ? false : true)} id={'phaseInput'+index} defaultValue={item.phaseName} onBlur={(e) => {this.inputChange(e)}}  />
                            <span input-id={'phaseInput'+index} className={styles.closeIcon} title='编辑'  onClick={(e)=>{
                            this.setState({clickFlag:true}, ()=>{
                              this.getCrossingPhase('containerList', 'crossingList'+index, item)
                              this.getCrossingCvs("crossingList" + index, item, index,'containerList')
                            })
                            const inputId = $(e.target).parent().parent().attr('input-id');
                              setTimeout(()=>{
                                $('#'+inputId).focus();
                              }, 50)
                            
                            }}><Icon type="edit" /></span>
                          </div>
                        </div>
                      )
                    })
                    }
                    <div className={styles.stageMsg} onClick={() => {this.newPhaseAdd()}}>
                      <div title="添加相位" className={styles.addPhase}><Icon type="plus" /></div> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Singal
