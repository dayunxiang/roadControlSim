import React from 'react'
import $ from 'jquery'
import styles from './Facilitiesmana.scss'
import Navigation from '../Navigation/Navigation'
import classNames from 'classnames'
import Nav from '../../Nav/Nav'
import { Radio, Input, DatePicker, message, Modal, Select, InputNumber } from 'antd'
import echarts from 'echarts'
import { getDrag } from '../../../utlis/drag'
import ReactEcharts from 'echarts-for-react';
import getResponseDatas from '../../../utlis/getResponseData' // 请求公用方法
import mapStyles from '../../../utlis/styles_2301'
import fnDown from '../../../utlis/drags'
import moment from 'moment'
const dateFormat = 'YYYY-MM-DD';
const { confirm } = Modal
const { Option } = Select
/* import { url } from 'inspector' */
/* 重点交通设施管理 */
class Facilitiesmana extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      facility: false, // 设施管理点击弹出
      semaphoreConf: false, // 信号灯设置
      pilotLamp: false, // 图元
      deviceArr: [],
      histogramNum: null,
      eachartOption: null,
      roadName: null,
      roadNodeId: null,
      nowArrow: null,
      roadImgBox: null,
      devicesSrc: null,
      parentGroup: null,
      modelState: [0, 2],
      interColor: [
        {
          modelState: 0,
          nodeName: '灰点',
          color: '#ccc'
        },
        {
          modelState: 2,
          nodeName: '绿点',
          color: '#00E500'
        }]
    }
    this.facilitiesInfo = {
      iconLeft: '',
      facilitiesIcon: '',
      facilitiesTypeId: '',
      iconHeight: 0,
      iconWidth: 0,
      departmentId: 0,
      factoryName: '',
      installDay: new Date().getTime(),
      iconAngle: 0,
      rowId: '',
      factoryPhone: '',
      iconTop: '',
      productionDay: new Date().getTime(),
      departmentPhone: '',
      installDes: '',
      nodeId: '',
    }
    this.cityID = '1'
    this.areaAndNode = {
      cityId: '1',
      searchKey: '',
    }
    this.markers = []
    this.listUrl = '/simulation/sys/dept/list'
    // this.totalUrl = '/simulation/node/facilities/get/node/facilities/total/{nodeId}' // 根据路口ID，查询路口下所有设备数量，按设备类型
    this.areaAndNodeUrl = '/simulation/district/list/districtAndNode/' + this.cityID // 根据城市ID获取业务区域和区域下的路口'
    this.mapPointUrl = '/simulation/node/facilities/get/total/map/' + this.cityID //查询路口信息管理的地图所有路口点位（inputIntegrity为0-99都是灰色、100是绿色）
    this.totalUrl = '/simulation/node/facilities/get/node/facilities/total/' //设施管理
    this.facTotalUrl = '/simulation/node/facilities/get/city/facilities/total/' + this.cityID // 或者echarts
    this.facPointUrl = '/simulation/node/facilities/get/facilities/point/' // {nodeId}根据路口ID，获取路口下所有设备的坐标'
    this.rightDataUrl = '/simulation/node/facilities/get/right/data' // 获取右侧设备类型和图标'
    this.getInfoUrl = '/simulation/node/facilities/get/info/' // {rowId} // 根据主键查询设备详情（用于设备回显）'
    this.addUrl = '/simulation/node/facilities/add' // 新增路口设备'
    this.updateUrl = '/simulation/node/facilities/update' // 根据主键ID更新设备信息'
    this.deleteUrl = '/simulation/node/facilities/delete/' // {rowId} 根据主键ID删除设备'
    this.iconsUrl = '/simulation/node/facilities/get/icons/' // {facilitiesType}' // 根据图片类型获取设备图片集合'
    this.angleUrl = '/simulation/node/facilities/update/position/or/angle' // 根据主键ID，更新坐标或者角度'
  }
  componentDidMount = () => {
    // 初始话地图
    this.renderMineMap()
    this.getfacTotal()
    this.getparentGroup()
  }
  componentWillUnmount = () => {

  }
  /* shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState.document,nextState);
    debugger
    if (nextState.document !== this.state.devicesSrc) {
      return true
    }
    return false
  } */
  getparentGroup = () => {
    getResponseDatas('post', this.listUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({
          parentGroup: data,
        })
      }
    })
  }
  getDate = (data) => {
    const today = data ? new Date(data) : new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const navtime = year + '-' + month + '-' + day
    return navtime
  }
  getfacTotal = () => {
    getResponseDatas('get', this.facTotalUrl).then((res) => {
      if (res.data.code === 200) {
        const { content } = res.data
        let x = [], y = [], num = 0
        content.map((item, index) => {
          x.push(item.name)
          y.push(item.total)
          num += item.total
        })
        this.getOption(x, y)
        this.setState({ histogramNum: num })
      }
    })
  }
  // 弹出左侧列表
  getfacility = (bool) => {
    if (bool) {
      let { roadNodeId } = this.state
      getResponseDatas('get', this.facPointUrl + roadNodeId).then((resData) => {
        if (resData.data.code === 200) {
          let deviceArr = []
          resData.data.content.map((item, index) => {
            const styleStr = {
              width: item.iconWidth,
              height: item.iconHeight,
              top: item.iconTop,
              left: item.iconLeft,
              position: 'absolute',
              background: `url(${item.facilitiesIcon}) no-repeat center center`,
              backgroundSize: '100% 100%',
              transform: `rotate(${item.iconAngle}deg)`,
            }
            deviceArr.push({ styleStr, rowId: item.rowId, facilitiesTypeId: item.facilitiesTypeId })
          })
          if (this.state.nowArrow) {
            this.state.nowArrow.remove()
          }
          this.setState({ deviceArr, nowArrow: null, }, () => {
            this.leftBoxMove()
          })
        }
      })
    } else {
      this.setState({ deviceArr: [] })
    }

    this.setState({
      facility: bool, // 控制左侧弹窗显示隐藏
      semaphoreConf: false, // 同时关闭信号灯编辑弹框
      pilotLamp: false, // 关闭图元弹窗
    })
  }

  // 双击信号灯
  getGetlamp = (bool) => {
    if (bool) {
      getResponseDatas('get', this.getInfoUrl + bool).then((resData) => {
        if (resData.data.code === 200) {
          this.facilitiesInfo = resData.data.content
          this.setState({
            pilotLamp: false, // 关闭图元弹窗
            semaphoreConf: resData.data.content, // 控制左侧弹窗显示隐藏
          }, () => {
            /* getDrag(this.semaphoreBox) */
          })
        }
      })
    } else {
      if (this.state.nowArrow) {
        this.state.nowArrow.remove()
      }
      this.setState({
        nowArrow: null,
        pilotLamp: false, // 关闭图元弹窗；
        semaphoreConf: bool, // 控制左侧弹窗显示隐藏
      })
    }
  }
  // 图元
  getpilotLamp = (bool, url) => {
    if (bool) {
      const { facilitiesTypeId } = this.facilitiesInfo
      getResponseDatas('get', this.iconsUrl + facilitiesTypeId).then((resData) => {
        if (resData.data.code === 200) {
          // console.log(resData.data.content);
          const { semaphoreConf } = this.state
          const cont = resData.data.content
          if (url) {
            this.facilitiesInfo.facilitiesIcon = url
            semaphoreConf.facilitiesIcon = url
            this.setState({
              pilotLamp: cont, // 控制左侧弹窗显示隐藏
            })
          } else {
            const facilitiesIcon = cont.requestPrefix + cont.fileNames[0]
            this.facilitiesInfo.facilitiesIcon = facilitiesIcon
            semaphoreConf.facilitiesIcon = facilitiesIcon
            this.setState({ semaphoreConf })
          }
        }
      })
    } else {
      if (url) {
        const { semaphoreConf } = this.state
        semaphoreConf.facilitiesIcon = url
        this.facilitiesInfo.facilitiesIcon = url
        this.setState({
          semaphoreConf,
          pilotLamp: false, // 控制左侧弹窗显示隐藏
        })
      } else {
        this.setState({
          pilotLamp: false, // 控制左侧弹窗显示隐藏
        })
      }
    }
  }
  getOption = (dataXX, dataYY) => {
    let eachartOption = {
      xAxis: {
        data: dataXX,
        axisLine: {
          lineStyle: {
            color: '#17396b',
          }
        },
        axisLabel: {
          color: '#00e9de',
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#00e9de',
        },
        axisLine: {
          lineStyle: {
            color: '#17396b',
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#17396b'],
          },
        },
      },
      grid: {
        top: 10,
        bottom: 20,
      },
      series: [
        {
          name: '拥堵情况',
          type: 'bar',
          data: dataYY,
          barWidth: 30,
          animationDurationUpdate: 2000,
          itemStyle: {
            normal: {
              color: function (params) {
                const colorList = [['rgba(226,205,38,1)', 'rgba(226,205,38,.1)'], ['rgba(155,253,228,1)', 'rgba(155,253,228,.1)'], ['rgba(197,0,253,1)', 'rgba(197,0,253,.1)'], ['rgba(255,170,51,1)', 'rgba(255,170,51,.1)'], ['rgba(255,110,98,1)', 'rgba(255,110,98,.1)']];
                let index = params.dataIndex
                // 给大于颜色数量的柱体添加循环颜色的判断
                if (params.dataIndex >= colorList.length) {
                  index = params.dataIndex - colorList.length
                }
                return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                  [
                    {
                      offset: 0,
                      color: colorList[index][0]
                    },
                    {
                      offset: 1,
                      color: colorList[index][1]
                    }
                  ])
              }
            }
          }
        }
      ]
    }
    this.setState({ eachartOption }, () => {
      // 绑定拖拽
      /*   getDrag(this.drag) */
    })
  }
  fnDown = (event) => {
    // console.log(event.currentTarget);
    $(event.target).addClass(styles.mouseDrop)
    event = event || window.event;
    var oBox = event.currentTarget
    // 光标按下时光标和页面之间的距离
    let disX = event.clientX - oBox.offsetLeft,
      disY = event.clientY - oBox.offsetTop;
    // 移动
    document.onmousemove = function (event) {
      event = event || window.event;
      var l = event.clientX - disX;
      var t = event.clientY - disY;
      // 最大left,top值      可见区域宽度     BODY对象宽度
      const parent = oBox.offsetParent;
      let leftMax = (parent.clientWidth) - oBox.offsetWidth;
      let topMax = (parent.clientHeight) - oBox.offsetHeight;
      if (l < 0) l = 0;
      if (l > leftMax) l = leftMax;
      if (t < 0) t = 0;
      if (t > topMax) t = topMax;
      oBox.style.left = l + 'px';
      oBox.style.top = t + 'px';
    }
    // 释放鼠标
    document.onmouseup = () => {
      const rowId = event.target.getAttribute('rowid')
      const facilitiesIn = {
        iconTop: event.target.offsetTop,
        iconLeft: event.target.offsetLeft,
        rowId,
      }
      this.getfacilities(facilitiesIn)
      $(event.target).removeClass(styles.mouseDrop)
      document.onmousemove = null
      document.onmouseup = null
    }
  }
  // 左侧拖拽效果
  leftBoxMove = () => {
    const divItems = $('#roadLeftBox').find('div')
    for (let i = 0; i < divItems.length; i++) {
      divItems[i].ondblclick = (e) => {
        e.stopPropagation()
        const rowId = e.target.getAttribute('rowid')
        if (rowId) {
          this.getGetlamp(rowId)
        }
      }
      divItems[i].onmousedown = this.fnDown
      /* divItems[i].onmousedown = (e) => {
        e.stopPropagation()
        $(e.target).addClass(styles.mouseDrop)
        if ($(e.target.parentNode).prop('id') == 'roadLeftBox') {
          $(e.target).on("mousemove", function (e) {
            console.log(11111111111);
            $(e.target).removeClass(styles.dsp_dn).offset({
              left: e.pageX - e.target.offsetWidth / 2,
              top: e.pageY - e.target.offsetHeight / 2,
            })
          })
        }
      } */
      /*  divItems[i].onmouseup = (e) => {
         e.stopPropagation()
         console.log(22222222222);
         const rowId = e.target.getAttribute('rowid')
         const boxleft = this.facilityDOM.offsetLeft
         const boxtop = this.facilityDOM.offsetTop
         const facilitiesIn = {
           iconTop: e.target.offsetTop,
           iconLeft: e.target.offsetLeft,
           rowId,
         }
         $(e.target).removeClass(styles.mouseDrop)
         $(e.target).off('mousemove')
         this.getfacilities(facilitiesIn)
       } */
    }
  }

  checkListImg = () => {
    const thisArr = []
    const divItems = $('#roadLeftBox').find('div')
    this.setState({
      deviceArr: []
    })
    divItems.map((i, item) => {
      const styleStr = {
        background: item.style.background,
        transform: item.style.transform,
        width: item.style.width,
        height: item.style.height,
        top: item.style.top,
        left: item.style.left,
        position: 'absolute',
        backgroundSize: '100% 100%',
      }
      thisArr.push({ styleStr })
    })
    this.setState({
      deviceArr: thisArr
    })
  }
  getfacilities = (facilitiesIn) => {
    getResponseDatas('put', this.angleUrl, facilitiesIn).then((resData) => {
      if (resData.data.code === 200) {
        this.getfacility(true)
      } else {
        message.error('操作失败！')
      }
    })
  }
  getoffset = (ele) => {
    let l = ele.offsetLeft;
    let t = ele.offsetTop;
    let parent = ele.offsetParent;
    while (parent.tagName !== 'BODY') {// while(parent)当parent为null说明到body了，null变成false
      l += parent.clientLeft + parent.offsetLeft;
      t += parent.clientTop + parent.offsetTop;
      // 需要不断的跟新父级参照物
      parent = parent.offsetParent
    }
    return { left: l, top: t }
  }
  mouseMoveFns = () => {
    getResponseDatas('get', this.rightDataUrl).then((resData) => {
      if (resData.data.code === 200) {
        const { content } = resData.data
        this.facilitiesInfo.facilitiesTypes = content.facilitiesTypes
        this.setState({/*  semaphoreConf: this.facilitiesInfo, */ roadImgBox: content }, () => {
          if (this.roadImgBoxs.children) {
            for (let i = 0; i < this.roadImgBoxs.children.length; i++) {
              let ele = this.roadImgBoxs.children[i]
              const img = ele.getElementsByTagName('img')[0]
              img.onmousedown = () => {
                const newRoadBox = img.cloneNode(true)
                ele.getElementsByTagName('div')[0].appendChild(newRoadBox)
                img.style.position = 'absolute'
                img.style.zIndex = '999999'
                img.style.left = this.getoffset(newRoadBox).lef + 'px'
                img.style.top = this.getoffset(newRoadBox).top + 'px'
                document.body.appendChild(img)
                getDrag(img)
              }
            }
          }
        })
      }
    })
  }
  // 图标拖拽效果
  mouseMoveFn = () => {
    const _that = this
    const $imgsBox = $('#roadImgBoxs')
    const $leftBox = $('#roadLeftBox')
    $imgsBox[0].innerHTML = ''

    getResponseDatas('get', this.rightDataUrl).then((resData) => {
      if (resData.data.code === 200) {
        const { content } = resData.data
        _that.facilitiesTypes = content.facilitiesTypes
        let nums = 0
        for (let m = 0; m < content.facilitiesTypes.length; m++) {
          const $itemBox = $(`<div class=` + styles.fac_item + `></div>`)
          const $itemImg = $(`<div class='itemSuper'></div>`).attr('style', `background:url(${content.facilitiesRequestPrefix + content.facilitiesTypes[m].dictCode}.png) no-repeat;background-position:center center;`)
          const $itemText = $(`<span>${content.facilitiesTypes[m].codeName}</span>`)
          const imgStr = ''
          $itemImg.appendTo($itemBox)
          $itemText.appendTo($itemBox)
          let $arrow //新创建出来的
          $itemImg.on({
            mousedown: (e) => {
              let _this = e.target
              // $(_this).addClass(styles.mouseDrop)
              if (e.which == 1) {
                //复制一份
                if ($(e.target.parentNode.parentNode).prop('id') == 'roadImgBoxs') {
                  this.facilitiesInfo = {
                    iconLeft: '',
                    facilitiesIcon: '',
                    facilitiesTypeId: '',
                    iconHeight: 0,
                    iconWidth: 0,
                    departmentId: 0,
                    factoryName: '',
                    installDay: new Date().getTime(),
                    iconAngle: 0,
                    rowId: '',
                    factoryPhone: '',
                    iconTop: '',
                    productionDay: new Date().getTime(),
                    departmentPhone: '',
                    installDes: '',
                    nodeId: this.state.roadNodeId,
                  }

                  nums++;
                  $arrow = $(`<div></div>`).attr('style', $(_this).attr('style') + 'position:absolute;z-index:1000;width:52px;height:59px;cursor:pointer')
                  $arrow.addClass(styles.dsp_dn)
                  $arrow.addClass(styles.mouseDrop)
                  $arrow.appendTo(document.body);
                  $(document.body)[0].onmousemove = (function (e) {
                    $arrow.removeClass(styles.dsp_dn).offset({
                      left: e.pageX - 26,
                      top: e.pageY - 29.5
                    });
                  })
                  $(document.body)[0].onmouseup = (function (e) {
                    e.stopPropagation()
                    let $left, $top
                    let nowPositon = $('.' + styles.facility_content)[0].getBoundingClientRect()
                    if (nowPositon.right > e.pageX && nowPositon.left < e.pageX && nowPositon.top < e.pageY && nowPositon.bottom > e.pageY) {
                      $arrow.removeClass(styles.mouseDrop)
                      $left = $arrow[0].getBoundingClientRect().left - $leftBox[0].getBoundingClientRect().left
                      $top = $arrow[0].getBoundingClientRect().top - $leftBox[0].getBoundingClientRect().top
                      $arrow.css({ 'top': $top, 'left': $left })
                      $arrow.appendTo($leftBox)
                      _that.facilitiesInfo.iconTop = $top
                      _that.facilitiesInfo.iconLeft = $left
                      _that.facilitiesInfo.facilitiesTypeId = content.facilitiesTypes[m].dictCode
                      // console.log(_that.facilitiesInfo);
                      _that.getpilotLamp(true)
                      /* _that.facilitiesInfo.facilitiesIcon = content.facilitiesRequestPrefix + content.facilitiesTypes[m].dictCode + '.png' */
                      _that.setState({ semaphoreConf: _that.facilitiesInfo, nowArrow: $arrow }, () => {
                        /* _that.facilitiesInfo.facilitiesIcon = content.facilitiesTypes[m].dictCode + '.png' */
                        /*  getDrag(this.semaphoreBox) */
                      })
                      $(document.body)[0].onmouseup = null
                      $(document.body)[0].onmousemove = null
                      /* $itemImg.off() */
                    }
                    else if (nowPositon.right < e.pageX && nowPositon.left < e.pageX && nowPositon.top > e.pageY && nowPositon.bottom < e.pageY) {
                      $arrow.removeClass(styles.mouseDrop)
                      $left = $arrow[0].getBoundingClientRect().left - $leftBox[0].getBoundingClientRect().left
                      $top = $arrow[0].getBoundingClientRect().top - $leftBox[0].getBoundingClientRect().top
                      $arrow.css({ 'top': $top, 'left': $left })
                      $arrow.appendTo($leftBox)
                    } else {
                      $arrow.remove()
                      $(document.body)[0].onmouseup = null
                      $(document.body)[0].onmousemove = null
                    }

                    $(document.body).off('mousemove')
                    _that.leftBoxMove($arrow[0])
                  })
                }
              }
            }
          })
          $itemBox.appendTo($imgsBox)
        }
      }
    })
  }
  getfaciDelete = () => {
    const that = this
    confirm({
      title: '确认要删除当前点位?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve, reject) => {
          getResponseDatas('delete', that.deleteUrl + that.facilitiesInfo.rowId).then((resData) => {
            if (resData.data.code === 200) {
              message.success('删除成功!')
              that.getfacility(true)
              that.getfacTotal()
              resolve()
            }
          })
        }).catch(() => message.error('操作失败!'))
      },
      onCancel() { },
    })
  }
  // 验证是否填全参数
  getintercept = () => {
    const {
      departmentId, departmentPhone, factoryName, factoryPhone, productionDay, installDay, iconAngle, iconWidth, iconHeight
    } = this.facilitiesInfo
    if (!departmentId) {
      message.warning('请填写维护单位!')
      return true
    }
    if (departmentPhone) {
      const reg = /^[0-9]\d*$/
      if (reg.test(departmentPhone) == false) {
        message.warning('请输入正确的维护电话')
        return true
      }
    }
    /* if (!factoryName) {
      message.warning('请填写生产厂家!')
      return true
    } */
    if (factoryPhone) {
      const reg = /^[0-9]\d*$/;
      if (reg.test(factoryPhone) == false) {
        message.warning('请输入正确的厂家电话')
        return true
      }
    }
    if (!productionDay) {
      message.warning('请填写生产日期!')
      return true
    }
    if (!installDay) {
      message.warning('请填写安装日期!')
      return true
    }
    // console.log(iconAngle);

    if (iconAngle === '' || iconAngle == null) {
      message.warning('请填写角度!')
      return true
    }
    if (!iconWidth) {
      message.warning('请填写图片宽度!')
      return true
    }
    if (!iconHeight) {
      message.warning('请填写图片高度!')
      return true
    }
    return false
  }
  getfaciAdd = () => {
    const { facilitiesIcon, iconAngle } = this.facilitiesInfo
    if (facilitiesIcon.lastIndexOf('/') !== -1) {
      this.facilitiesInfo.facilitiesIcon = facilitiesIcon.slice(facilitiesIcon.lastIndexOf('/') + 1)
    }
    if (this.getintercept()) { return }

    getResponseDatas('post', this.addUrl, this.facilitiesInfo).then((resData) => {
      if (resData.data.code === 200) {
        this.getfacility(true)
        this.getfacTotal()
        message.success('添加成功！');
      } else {
        message.error('操作失败!')
      }
    })
  }
  getfaciUpdate = () => {
    const { facilitiesIcon } = this.facilitiesInfo
    if (facilitiesIcon.lastIndexOf('/') !== -1) {
      this.facilitiesInfo.facilitiesIcon = facilitiesIcon.slice(facilitiesIcon.lastIndexOf('/') + 1)
    }
    if (this.getintercept()) { return }
    getResponseDatas('put', this.updateUrl, this.facilitiesInfo).then((resData) => {
      if (resData.data.code === 200) {
        this.getfacility(true)
        this.getfacTotal()
        message.success('修改成功！');
      } else {
        message.error('操作失败!')
      }
    })
  }
  getDatePicker = (e, value, name) => {
    this.facilitiesInfo[name] = new Date(value).getTime()
  }
  gettexyArea = (e) => {
    this.facilitiesInfo.installDes = e.target.value
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
  OpenInforWindow = (e, item) => {
    const map = this.map
    window.event ? window.event.cancelBubble = true : e.stopPropagation()
    this.map.panTo([item.unitLongitude, item.unitLatitude])
    if (this.markerId) {
      document.getElementById(this.markerId).innerHTML = ''
    }
    // 删除弹窗
    if (this.popup) {
      this.popup.remove()
      this.popup = null
    }
    const bgColor = item.total === 0 ? '#ccc' : '#00E500'
    const el = this[item.nodeId]
    const p = this[item.nodeId + 'p']
    this.setState({ roadName: item.nodeName, roadNodeId: item.nodeId })
    /*  this.markerId = e.target.getAttribute('id') */
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
    this.popup = new window.minemap.Popup({ closeOnClick: true, closeButton: true, offset: [0, -20] }).setHTML(`<div class=${styles.makerFrame}>
          <div class=${styles.marker_title}>` + item.nodeName + `</div>
            <div id='type-content' class=${styles.typeContent}></div>
            <div id='facilities-management' class=${styles.markerActive}>设施管理</div>
          </div>`).setLngLat([item.unitLongitude, item.unitLatitude]).addTo(map)
    $('#type-content').empty();
    this.facilitiesInfo.nodeId = item.nodeId
    getResponseDatas('get', this.totalUrl + item.nodeId).then((res) => {
      if (res.data.code === 200) {
        if (res.data.content.facilitiesTotal) {
          $(res.data.content.facilitiesTotal).map((idx, item) => {
            $('<p>' + item.name + '：<span>' + item.total + '</span></p>').appendTo($('#type-content'))
          })
        }
        this.setState({
          devicesSrc: res.data.content.imagePath
        })
        $('#facilities-management').on('click', () => {
          this.getfacility(true)
          this.mouseMoveFn()
        })
      }
    })
  }
  getmodelState = (modelState) => {
    this.setState({
      modelState,
    }, () => {
      if (modelState.length == 0 && this.markers.length) {
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].remove();
          this.markers[i] = null;
        }
        this.markers = []
      } else {
        this.getmarkersState()
      }
    })
  }
  getmarkersState = () => {
    // 加载地图中所有的点
    const map = this.map
    getResponseDatas('get', this.mapPointUrl).then((res) => {
      if (res.data.code === 200) {
        if (this.markers.length) {
          this.markers.forEach((item) => {
            item.remove()
          })
          this.markers = []
        }
        const markerDatas = res.data.content
        const lnglat = map.getCenter()
        markerDatas.forEach((item, index) => {
          let total = item.total == 0 ? 0 : 2
          if (this.state.modelState.includes(Number(total))) {
            const el = document.createElement('div')
            const p = document.createElement('div')
            const title = document.createElement('div')
            /* const bgColor = item.modelState === 0 ? '#ccc' : item.modelState === 1 ? 'yellow' : '#00E500' */
            const bgColor = item.total === 0 ? '#ccc' : '#00E500'
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
            this.map.panTo([106.706278, 26.590897])
            const marker = new window.minemap.Marker(el, { offset: [-10, -30] }).setLngLat([item.unitLongitude, item.unitLatitude]).addTo(map)
            el.addEventListener('click', (e) => {
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
    map.on('click', () => {
      if (this.markerId) {
        document.getElementById(this.markerId).innerHTML = ''
      }
    })
    this.map = map
    this.getmarkersState()
  }
  getstopPropagation = (e) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation()
  }
  getSelectChange = (value, name) => {
    this.facilitiesInfo[name] = value
  }
  getInputChange = (e, name) => {
    this.facilitiesInfo[name] = e.target.value
  }
  render() {
    const { facility, parentGroup, semaphoreConf, pilotLamp, deviceArr, devicesSrc, histogramNum, eachartOption, modelState, roadName, roadImgBox, interColor } = this.state
    return (
      <div className={styles.Content}>
        {/* 地图 */}
        <div id="mapContainer" className={styles.mapContainer} />
        <Nav getSearch={this.getSearch} OpenInforWindow={this.OpenInforWindow} modelState={modelState} interColor={interColor} getmodelState={this.getmodelState} />
        <Navigation {...this.props} />
        {eachartOption ?
          <div className={classNames(styles.histogram)
          }>
            <div className={styles.his_title}>重点交通设施共计{histogramNum || 0}个</div>
            <div className={styles.bargraph}><ReactEcharts option={eachartOption} style={{ height: '240px', width: '600px' }} /></div>
          </div > : null
        }
        {
          facility ?
            <div className={styles.facility_ed} ref={el => { this.facilityDOM = el }}>
              <span className={styles.clone} onClick={(e) => { this.getfacility(false) }} />
              <div className={styles.facility_left}>
                <div className={styles.facility_title}>{roadName + '编辑' || '加载中...'}</div>
                <div id='roadLeftBox' className={styles.facility_content} key={devicesSrc} style={{ background: `url(${devicesSrc}) center center no-repeat`, backgroundSize: '100% 100%' }}>
                  <img src={require('./imgs/zhibei.png')} alt="加载中" />
                  {
                    deviceArr != '' &&
                    deviceArr.map((item, i) => {
                      return <div style={item.styleStr} rowid={item.rowId} key={item.rowId}></div>
                    })
                  }
                </div>
              </div>
              <div id="roadImgBoxs" className={styles.facility_right} ref={(el) => { this.roadImgBoxs = el }}>
                {/*  {
                  roadImgBox ? roadImgBox.facilitiesTypes.map((item) => {
                    return (
                      <div className={styles.fac_item}>
                        <div>
                          <img src={roadImgBox.facilitiesRequestPrefix + item.dictCode + '.png'}/>
                        </div>
                        <span>{item.codeName}</span>
                      </div>
                    )
                  }) : null
                } */}
              </div>
            </div> : null
        }
        {
          semaphoreConf ?
            <div className={styles.semaphoreConf} onClick={(e) => { this.getstopPropagation(e) }}>
              <span className={styles.clone} onClick={() => { this.getGetlamp(false) }} />
              <div className={styles.device_name}>设施名称 :
                <Radio.Group name="radiogroup" value={semaphoreConf.facilitiesTypeId || ''} >
                  {
                    this.facilitiesTypes && this.facilitiesTypes.map((item) => {
                      return (<Radio value={item.dictCode} key={item.codeName + item.dictCode}>{item.codeName}</Radio>)
                    })
                  }
                </Radio.Group>

              </div>
              <div className={styles.particulars}>
                <div className={styles.part_left}>维护单位 :
                <Select
                    showSearch
                    defaultValue={semaphoreConf.departmentId || 0}
                    placeholder="请选择维护单位"
                    style={{ width: 165 }}
                    onChange={(value) => { this.getSelectChange(value, 'departmentId') }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value={0} key={0}>请选择维护单位</Option>
                    {
                      !!parentGroup && parentGroup.map((item) => {
                        return (
                          <Option value={item.id} key={item.id}>{item.deptName}</Option>
                        )
                      })
                    }
                  </Select>
                  {/* <Input defaultValue={semaphoreConf.departmentId || ''} onChange={(e) => { this.getInputChange(e, 'departmentId') }} /> */}
                </div>
                <div className={styles.part_right}>维护电话 :<Input maxLength={20} defaultValue={semaphoreConf.departmentPhone || ''} onChange={(e) => { this.getInputChange(e, 'departmentPhone') }} /></div>
              </div>
              <div className={styles.particulars}>
                <div className={styles.part_left}>生产厂家 :<Input maxLength={50} defaultValue={semaphoreConf.factoryName || ''} onChange={(e) => { this.getInputChange(e, 'factoryName') }} /></div>
                <div className={styles.part_right}>厂家电话 :<Input maxLength={20} defaultValue={semaphoreConf.factoryPhone || ''} onChange={(e) => { this.getInputChange(e, 'factoryPhone') }} /></div>
              </div>
              <div className={styles.particulars}>
                <div className={styles.part_left}>生产日期 :<DatePicker defaultValue={moment(semaphoreConf.productionDay ? this.getDate(semaphoreConf.productionDay) : this.getDate(null), dateFormat)} format={dateFormat} placeholder="" onChange={(e, value) => { this.getDatePicker(e, value, 'productionDay') }} /></div>
                <div className={styles.part_right}>安装日期 :<DatePicker defaultValue={moment(semaphoreConf.installDay ? this.getDate(semaphoreConf.installDay) : this.getDate(null), dateFormat)} format={dateFormat} placeholder="" onChange={(e, value) => { this.getDatePicker(e, value, 'installDay') }} /></div>
              </div>
              <div className={styles.particulars}>
                <div className={styles.part_left}>旋转角度 :<InputNumber min={0} max={360} defaultValue={semaphoreConf.iconAngle || ''} onChange={(e) => { this.getSelectChange(e, 'iconAngle') }} defaultValue={semaphoreConf.iconAngle} /></div>
              </div>
              <div className={styles.details}>
                安装位置描述 :<Input.TextArea maxLength={200} rows={4} onChange={this.gettexyArea} defaultValue={semaphoreConf.installDes} />
              </div>
              <div className={styles.icon}>
                选择设施图标 :<span onClick={() => { this.getpilotLamp(true, semaphoreConf.facilitiesIcon) }} style={{ background: `url(${semaphoreConf.facilitiesIcon}) no-repeat center center` }} />
              </div>
              <div className={classNames({ [styles.particulars]: true, [styles.particularsPX]: true })}>
                <div className={styles.part_left}>图标宽&nbsp;&nbsp;(px)&nbsp;&nbsp; :<InputNumber min={0} max={300} onChange={(e) => { this.getSelectChange(e, 'iconWidth') }} defaultValue={semaphoreConf.iconWidth} /></div>
                <div className={styles.part_right}>图标高&nbsp;&nbsp;(px)&nbsp;&nbsp; :<InputNumber min={0} max={300} onChange={(e) => { this.getSelectChange(e, 'iconHeight') }} defaultValue={semaphoreConf.iconHeight} /></div>
              </div>
              <div className={styles.handle}>
                <span onClick={semaphoreConf.rowId ? this.getfaciUpdate : this.getfaciAdd}>提交</span>
                {semaphoreConf.rowId ? <span onClick={this.getfaciDelete}>删除</span> : null}
                <span onClick={() => { this.getGetlamp(false) }}>取消</span>
              </div>
            </div> : null
        }
        {
          pilotLamp ?
            <div className={styles.pilotLamp} >
              <span className={styles.clone} onClick={() => { this.getpilotLamp(false) }} />
              <div className={styles.pil_title}>图元列表</div>
              <div className={styles.pil_list}>
                {pilotLamp.fileNames.map((item, index) => {
                  return (
                    <div className={styles.pil_list_item} key={"pilot" + item} onClick={() => { this.getpilotLamp(false, pilotLamp.requestPrefix + item) }}>
                      <span><img src={pilotLamp.requestPrefix + item} style={{ height: '55px' }} /></span>
                      <span>{index + 1}</span>
                    </div>)
                })}
              </div>
            </div> : null
        }
      </div>
    )
  }
}

export default Facilitiesmana
