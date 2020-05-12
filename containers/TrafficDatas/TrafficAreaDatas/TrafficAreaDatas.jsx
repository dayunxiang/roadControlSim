import React from 'react'
import { DatePicker, Select, Icon, Spin, message, TimePicker } from 'antd'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import $ from 'jquery'
import RowAddPlanList from '../../../components/RowAddPlanList/RowAddPlanList'
import getResponseDatas from '../../../utlis/getResponseData' // 请求公用方法
import moment from 'moment';
import Header from '../../Header/RoadHeader' // 有路口转向的头
// import Header from '../../Header/AnalysisHeader' // 有单选按钮  平均速度的头
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
import styles from './TrafficAreaDatas.scss'
import classNames from 'classnames'
import TrafficVideo from '../../../components/TrafficVideo/TrafficVideo'
import Title from '../../../components/Title/Title'
import TrafficCharts from '../../../components/TrafficCharts/TrafficCharts'
import fnDown from '../../../utlis/drags'
const format = 'HH:mm'
const { Option } = Select
let timeout
let currentValue
class TrafficAreaDatas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      planList: null,
      value: undefined,
      timeInterval: { maxTime: '00:00', minTime: '00:00' },
      datapick: [0, 0, 0, 0],
      unitResult: null,
      direction: null,
      avgSpeedIndex: 0,
      chartsData: null,
      dataValue: null,
      sources: [],
      videoSrc: null,
    }
    /* this.targetId = 10000 */
    this.resultList = {
      excelParam: '',
      fileNames: '',
      flag: 'false',
      areaId: '', // 是区域id
      realFileNames: '',
      directionArr: null,
      taskType: '2',
      startTime: '',
      endTime: '',
    }
    this.stopsAry = []
    this.markers = []
    this.directionsUrl = '/simulation/codes/directions' // 评价方向'
    this.getFileUrl = `/simulation/unitSimResults/getFileNames/` // {targetId}/{taskType}' // 查询当前路口所有方案'
    this.UnitResultUrl = '/simulation/areaReg/listResultArea' // 查询所有的折线图数据
    this.segmentUrl = '/simulation/areaResultSegment/get/' // {areaId}/{fileNames}/{startTime}/{endTime} // 查询路段交通运行情况数据表'
    this.timeIntervalUrl = '/simulation/areaReg/getTimeInterval/' // {targetId}/{fileNames}查询当前路口所有方案'
    this.areaInfoUrl = '/simulation/areaResultSegment/areaInfo' // {keyWords} 查询路段交通运行情况数据表'
    this.videoUrl = '/simulation/sim/task/get/video/by/name/' // {fileName}/{taskType}' // '获取仿真区域视频或仿真路口视频链接2'
  }
  componentDidMount = () => {
    this.renderMaps()
    this.getfakeData('', true) // 获取区域下拉，默认显示第一个区域
    /* this.getScrollTime() */
    /* this.getPlanLists() */
    this.getdirections() // 查询方向字典
  }
  getPlanLists = () => {
    getResponseDatas('get', this.getFileUrl + this.targetId + '/2').then((res) => {
      if (res.data.code === 200) {
        // console.log(res.data.content)
        const result = res.data
        this.setState({ planList: res.data.content }, () => {
          if (res.data.content.length) {
            this.resultList.fileNames = result.content[0].id
            this.resultList.realFileNames = result.content[0].name
            this.getTimeInterval(res.data.content[0].id)
            /*    // 渲染折线图
               this.getresultList() */
          } else {
            this.setState({ unitResult: [] })
          }
        })
      }
    })
  }
  getdirections = () => {
    // 评价方向
    getResponseDatas('get', this.directionsUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ directionArr: result.content })
      }
    })
  }
  // 导出
  getExportBtn = (item) => {
    this.resultList.excelParam = item.title
    /* this.resultList.fileRealNames = item.name */
    this.resultList.flag = 'true'
    getResponseDatas('post', this.UnitResultUrl, this.resultList, { responseType: 'blob' }).then((_res) => {
      this.resultList.flag = 'false'
      const blob = new Blob([_res.data], { type: 'application/vnd.ms-excel,charset=utf-8' })
      const a = document.createElement('a')
      const href = window.URL.createObjectURL(blob)
      a.href = href
      /*  const fileName = _res.headers['content-disposition'].split(';')[1].split('=')[1].split('.')[0] */
      const fileName = item.name
      // 文件名中有中文 则对文件名进行转码
      a.download = decodeURIComponent(fileName)
      // 利用a标签做下载
      document.body.appendChild(a)
      // a.click()
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
      document.body.removeChild(a)
      window.URL.revokeObjectURL(href)
    })
  }
  getTimeInterval = (fileNames) => {
    getResponseDatas('get', this.timeIntervalUrl + this.targetId + '/' + fileNames + '/2').then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (!result.content) {
          result.content = {
            maxTime: '00:00',
            minTime: '00:00',
          }
        }
        this.resultList.startTime = result.content.minTime
        this.resultList.endTime = result.content.maxTime
        this.setState({ timeInterval: result.content }, () => {
          /*  // 获取地图点位
           this.gettsegment(result.content) */
          // 渲染时间轴
          this.getScrollTime(result.content.maxTime, result.content.minTime)
          // 渲染折线图
          this.getresultList()
          // 地图点位
          this.addSources()
        })
      }
    })
  }

  fnDown = (event) => {
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
      let leftMax = (document.documentElement.clientWidth || document.body.clientWidth) - oBox.offsetWidth;
      let topMax = (document.documentElement.clientHeight || document.body.clientHeight) - oBox.offsetHeight;
      if (l < 0) l = 0;
      if (l > leftMax) l = leftMax;
      if (t < 0) t = 0;
      if (t > topMax) t = topMax;
      oBox.style.left = l + 'px';
      oBox.style.top = t + 'px';
    }
    // 释放鼠标
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }
  getScrollTime = (maxTime, minTime) => {
    const selfThis = this
    $('#timeBox').getScrollTime({
      timeShow: true, // 时间的显示
      nowDate: '2019-10-9',
      timeStart: minTime, // 开始时间
      timeEnd: maxTime, // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      timeGap: 5, // 间隔时段
      thisDom: selfThis, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
    })
  }
  getRoadtraffic = (link) => {
    window.location.href = `#/${link}`
  }
  getDatapick = (e, value, index) => {
    // console.log(e, value, index)
    const { datapick, timeInterval } = this.state
    datapick[index] = value
    if (index === 1) {
      timeInterval.maxTime = value
    } else {
      timeInterval.minTime = value
    }
    this.setState({ timeInterval })
  }
  handleonFocus = () => {
    const { value } = this.state
    if (value == null || value == '') {
      this.handleSearch()
    }
    this.setState({ value })
  }
  handleChange = (value, e) => {
    this.targetId = value
    this.resultList.nodeId = value
    this.areaName = e.props.children
    this.getPlanLists()
    this.setState({ value })
  }
  handleSearch = (value = '') => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    currentValue = value
    timeout = setTimeout(this.getfakeData.bind(null, value), 300)
  }
  getfakeData = (value = '', initial) => {
    getResponseDatas('post', this.areaInfoUrl, { keyWords: value, taskType: 2 }).then((res) => {
      if (res.data.code === 200) {
        if (initial) {
          this.targetId = res.data.content[0].area_id
          this.resultList.areaId = res.data.content[0].area_id
          this.areaName = res.data.content[0].area_name
          this.getPlanLists()
          this.setState({ value: res.data.content[0].area_name })
        }
        this.setState({ dataValue: res.data.content })
      }
    })
  }
  getUnitResult = (name) => {
    switch (name) {
      case '延误时间':
        this.chartsName = name + ' (秒)'
        break
      case '平均速度':
        this.chartsName = name + ' (km/s)'
        break
      case '停车次数':
        this.chartsName = name + ' (次)'
        break
      case '停车延误':
        this.chartsName = name + ' (秒)'
        break
      case '驶离车辆数':
        this.chartsName = name + ' (辆)'
        break
      case '旅行时间':
        this.chartsName = name + ' (秒)'
        break
      case '综合延误指标':
        this.chartsName = name + ' (秒)'
        break
      case '路口拥堵延时指数':
        this.chartsName = name
        break
      case '尾气排放量':
        this.chartsName = name + ' (g·车公里﹣¹)'
        break
      case '能耗量':
        this.chartsName = name + ' (MJ*车公里﹣¹)'
        break
      case '最大排队长度':
        this.chartsName = name + ' (米)'
        break
      case '平均排队长度':
        this.chartsName = name + ' (米)'
        break
      default:
        this.chartsName = name + ''
        break
    }
    return this.chartsName
  }
  getresultList = () => {
    getResponseDatas('post', this.UnitResultUrl, this.resultList).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        if (result.content.length === 0) {
          message.error('当前方案无数据')
        } else {
          const { planList } = this.state
          result.content.forEach((item, index) => {
            item.name = this.getUnitResult(item.name)
            item.data.forEach((items, indexs) => {
              const name = items.name.split('_')
              let names = ''
              name.forEach((itemss, indexss) => {
                if (indexss === 0) {
                  planList.forEach((x) => {
                    if (x.id == itemss) {
                      names = x.name
                    }
                  })
                }
              })
              result.content[index].data[indexs].name = names
            })
          })
        }
        this.setState({ unitResult: result.content || [] })
      }
    })
  }
  getDistanceXy = (x0, y0, x1, y1) => {
    const d = (Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2)))
    let x2 = 0
    let y2 = 0
    if (x0 === x1) {
      x2 = x0
      y2 = y0 - (((y0 - y1) / Math.abs(y0 - y1)) * d)
    } else {
      const k = (y1 - y0) / (x1 - x0)
      x2 = x0 + (d / Math.sqrt((1 + Math.pow(k, 2)))) * ((x1 - x0) / Math.abs(x1 - x0))
      y2 = y0 + ((d * k) / Math.sqrt((1 + Math.pow(k, 2)))) * ((x1 - x0) / Math.abs(x1 - x0))
    }
    return this.calculateXy(x0, y0, x2, y2)
  }
  calculateXy = (fromX, fromY, toX, toY) => {
    const l = 0.00025
    const x1 = fromX
    const y1 = fromY
    const x2 = toX
    const y2 = toY
    let x3 = 0
    let y3 = 0
    let x4 = 0
    let y4 = 0
    let x5 = 0
    let y5 = 0
    let x6 = 0
    let y6 = 0
    if (x2 - x1 === 0) {
      x3 = x1 - (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y3 = y1
      x4 = x1 + (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y4 = y1
      x5 = x2 - (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y5 = y2
      x6 = x2 + (((y2 - y1) / Math.abs(y2 - y1)) * (l / 2))
      y6 = y2
    } else {
      const k = (y2 - y1) / (x2 - x1)
      const s1 = (l / 2) * (1 / Math.sqrt(1 + Math.pow(k, 2))) * ((x2 - x1) / Math.abs(x2 - x1))
      const sk = (l / 2) * (k / Math.sqrt(1 + Math.pow(k, 2))) * ((x2 - x1) / Math.abs(x2 - x1))
      x3 = x1 + sk
      y3 = y1 - s1
      x4 = x1 - sk
      y4 = y1 + s1
      x5 = x2 + sk
      y5 = y2 - s1
      x6 = x2 - sk
      y6 = y2 + s1
    }
    return [[x4, y4], [x6, y6]]
  }
  getCrossingCvs = (e) => {
    const { sources, direction } = this.state
    const dataAry = [] // 图层数据
    const stops = [] // 路段颜色
    if (!sources.length) { return }
    sources.forEach((items, index) => {
      dataAry.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.getDistanceXy(items.from_longitude[0], items.from_latitude[0], items.to_longitude[0], items.to_latitude[0]),
        },
        properties: {
          title: items.from_node_name[0] + '-' + items.to_node_name[0],
          kind: index + 1,
          avgSpeed: items.avg_speed[e] || '--',
          losSegment: items.los_segment[e] || '--',
          ftid: items.from_node_id[0] + '-' + items.to_node_id[0],
          direction: this.getdirection(items.from_node_direction) + '-' + this.getdirection(items.to_node_direction)
        },
      })
      const gColor = items.los_segment[e]
      let color = '#ccc'
      if (gColor > 0) {
        color = 'green'
      } else if (gColor > 0.25) {
        color = 'yellow'
      } else if (gColor > 0.5) {
        color = '#FF0000'
      } else if (gColor > 0.75) {
        color = '##800000'
      } else if (gColor == null) {
        color = '#ccc'
      }
      /* > 30 || items.avg_speed[e] == 30 ? 'green' : items.avg_speed[e] > 15 ? 'yellow' : items.avg_speed[e] == null ? '#ccc' : 'red' */
      stops.push([index + 1, color])
    })
    const jsonData = {
      type: 'FeatureCollection',
      features: dataAry,
    }

    if (this.map.getSource('customSource')) {
      this.map.removeSource('customSource')
    }
    /* if (this.map.removeLayer("lineLayer")) {
      this.map.removeLayer("lineLayer")
    } */
    this.map.addSource('customSource', {
      type: 'geojson',
      data: jsonData,
    })
    /* // 描点
    this.gettsegment(makers) */
    direction.sort((a, b) => {
      return b.avg_speed[e] - a.avg_speed[e]
    })
    this.setState({ direction, avgSpeedIndex: e })
    // 画线
    this.addLayers(stops)
    if (this.domeE) {
      this.onMouseClick(this.domeE)
    }
  }
  addSources = () => {
    const { map } = this
    const { fileNames } = this.resultList
    const { timeInterval, planList } = this.state
    getResponseDatas('post', this.segmentUrl + this.targetId + '/' + fileNames + '/' + timeInterval.minTime + '/' + timeInterval.maxTime + '/' + 2).then((res) => {
      const result = res.data
      const makers = [] // 点坐标
      let datas = [] // 数据集合
      const dir = [] // 方向排序集合
      if (result.code === 200) {
        if (result.content.key.key.length) {
          datas = result.content.key.key.map((item) => {
            const lis = result.content[item]
            makers.push({
              nodeId: lis.from_node_id[0],
              nodeName: lis.from_node_name[0],
              unitLatitude: lis.from_latitude[0],
              unitLongitude: lis.from_longitude[0],
            })
            makers.push({
              nodeId: lis.to_node_id[0],
              nodeName: lis.to_node_name[0],
              unitLatitude: lis.to_latitude[0],
              unitLongitude: lis.to_longitude[0],
            })
            dir.push(lis)
            return { ...lis, fileNames: item.split('_')[0] }
          })
        }
        dir.sort((a, b) => {
          return b.avg_speed[0] - a.avg_speed[0]
        })
        this.setState({ sources: datas, direction: dir, avgSpeedIndex: 0 }, () => {
          this.getCrossingCvs(0)
          // 描点
          this.gettsegment(makers)
        })
      }
    })
  }
  addLayers = (stops) => {
    if (stops.length) {
      const map = this.map
      map.addLayer({
        id: 'lineLayer',
        type: 'line',
        source: 'customSource',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-width': 6,
          'line-color': {
            type: 'categorical',
            property: 'kind',
            stops: stops,
            default: '#ff0000'
          }
        },
        minzoom: 7,
        maxzoom: 17.5,
      })
      map.addLayer({
        id: "pointLayer",
        type: "symbol",
        source: "customSource",
        layout: {
          visibility: "visible",
          "icon-image": "marker-15-6",
          "text-field": "{title}",
          "text-offset": [0, 0.6],
          "text-anchor": "top",
          "text-size": 14,
          "icon-allow-overlap": true,  //图标允许压盖
          "text-allow-overlap": true,   //图标覆盖文字允许压盖
        },
        paint: {
          "icon-color": {
            type: "categorical",
            property: "kind",
            stops: [["school", "#ff0000"], ["park", "#00ff00"]],
            default: "#ff0000",
          },
          "text-color": {
            type: "categorical",
            property: "kind",
            stops: [["school", "#ff0000"], ["park", "#00ff00"]],
            default: "#ff0000"
          },
          "text-halo-color": "#000000",
          "text-halo-width": 0.5,
        },
        minzoom: 7,
        maxzoom: 17.5,
        filter: ['in', '$type', 'Point']
      })
    }
  }
  getdirection = (value) => {
    const { directionArr } = this.state
    let dir = directionArr.filter((item) => {
      return item.id == value
    })
    if (dir.length === 0) {
      dir = [{ name: '' }]
    }
    return dir[0].name
  }
  onMouseMove = (e) => {
    const map = this.map
    const features = map.queryRenderedFeatures(e.point, { layers: ['pointLayer', 'lineLayer'] })
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
  }
  getVlomes = () => {
    const { sources, planList } = this.state
    const data = []
    let name = ''
    let unit = null
    sources && sources.forEach((item) => {
      // console.log(item.from_node_id[0] + '-' + item.to_node_id[0], this.featureftid) fileNames;
      planList && planList.forEach((items) => {
        if (items.id == item.fileNames) {
          name = items.name
        }
      })
      if (item.from_node_id[0] + '-' + item.to_node_id[0] === this.featureftid) {
        data.push({
          data: item.occupancy,
          name,
          time: item.start_time,
        })
        /* data.push({
          data: item.avg_speed,
          name: '平均速度',
          time: item.start_time,
        })
        data.push({
          data: item.volume_num,
          name: '通过断面车辆数',
          time: item.start_time,
        })
        data.push({
          data: item.travel_time,
          name: '旅行时间',
          time: item.start_time,
        })
        data.push({
          data: item.complex_pi,
          name: '综延误指标',
          time: item.start_time,
        }) */
        unit = {
          name: item.from_node_name + '-' + item.to_node_name,
          title: '',
          data: data,
          export: true,
        }
      }
    })
    this.setState({ chartsData: unit })
  }
  onMouseClick = (e) => {
    const { map } = this
    this.domeE = e
    const features = map.queryRenderedFeatures(e.point, { layers: ['pointLayer', 'lineLayer'] })
    if (!features.length) {
      this.popup.remove()
      return
    }
    const feature = features[0]
    let coord = null
    if (feature.layer.id == 'pointLayer') {
      coord = feature.geometry.coordinates
    } else if (feature.layer.id == 'lineLayer') {
      coord = [(feature.geometry.coordinates[0][0] + feature.geometry.coordinates[1][0]) / 2, (feature.geometry.coordinates[0][1] + feature.geometry.coordinates[1][1]) / 2]
    }
    let avgSpeed = '--', color = '#ccc'
    if (feature.properties.losSegment > 0) {
      avgSpeed = '基本畅通'
      color = 'green'
    } else if (feature.properties.losSegment > 0.25) {
      avgSpeed = '基本畅通'
      color = 'yellow'
    } else if (feature.properties.losSegment > 0.5) {
      avgSpeed = '堵塞'
      color = '#FF0000'
    } else if (feature.properties.losSegment > 0.75) {
      avgSpeed = '严重堵塞'
      color = '##800000'
    } else if (feature.properties.losSegment == null) {
      avgSpeed = '--'
      color = '#ccc'
    }
    if (coord) {
      window.getVlomes = this.getVlomes
      this.featureftid = feature.properties.ftid
      this.popup.setLngLat(coord)
        .setHTML(`
        <div class=${styles.areapoput}>
        <p><span>路段名称 :</span><span style="color:${color}">${feature.properties.title}</span></p>
        <p><span>路段方向 :</span><span style="color:${color}">${feature.properties.direction}</span></p>
        <p><span>平均速度 :</span><span style="color:${color}">${feature.properties.avgSpeed || '--'}km/h</span></p>
        <p><span>拥堵状态 :</span><span style="color:${color}">${avgSpeed}</span></p>
        <p class=${styles.areap} onclick='window.getVlomes()'><span>评价分析</span></p>
        </div>`)
        .addTo(map)
    }
  }
  handleVideo = (index) => {
    if (index === null) {
      this.setState({ videoSrc: null })
      return
    }
    const fileName = this.resultList.fileNames.split(',')[index]
    if (fileName) {
      getResponseDatas('get', this.videoUrl + fileName + '/2').then((res) => {
        const result = res.data
        if (result.code === 200) {
          // console.log(result.content)
          if (result.content) {
            this.setState({ videoSrc: result.content })
          } else {
            message.error('当前方案无视频！')
          }
        }
      })
    } else {
      message.warning('请选择方案!')
    }
  }
  getplanListFlag = (obj, names = []) => {
    const realFileNames = []
    Object.values(obj).forEach((item) => {
      names.forEach((items) => {
        if (item === items.id) {
          realFileNames.push(items.name)
        }
      })
    })
    this.resultList.fileNames = Object.values(obj).join()
    this.resultList.realFileNames = realFileNames.join()
    this.getTimeInterval(Object.values(obj).join())
  }
  getSearch = (item) => {
    this.setState({ chartsData: item })
  }
  gettsegment = (markerDatas) => {
    if (this.markers.length) {
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].remove()
        this.markers[i] = null
      }
      this.markers = []
    }
    markerDatas && markerDatas.forEach((item, index) => {
      const el = document.createElement('div')
      const p = document.createElement('div')
      const title = document.createElement('div')
      if (true) {
        const bgColor = '#CCFF00'
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
        this.map.panTo([106.709075, 26.586574])
        marker.setLngLat([item.unitLongitude, item.unitLatitude]).setPopup().addTo(this.map)
        this.markers.push(marker)
        el.addEventListener('click', (e) => {
          sessionStorage.setItem('NodeIdPlanMsg', JSON.stringify({ targetId: this.targetId, nodeId: item.nodeId, interName: item.nodeName, taskType: 2 }))
          window.open(window.location.href.split('#')[0] + '#/nodeEvaluate')
        })
      }
    })
  }
  renderMaps = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      style: '//minedata.cn/service/solu/style/id/2301',
      center: [106.709075, 26.586574],
      zoom: 14,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    map.on('load', () => {
      // 增加自定义数据源、自定义图层
      /* this.addSources() */
      /* this.addLayers() */
    })

    this.popup = new window.minemap.Popup({
      closeButton: false,
      closeOnClick: false,
    })
    map.on('mousemove', this.onMouseMove)
    map.on('click', this.onMouseClick)
  }
  tableToExcel = () => {
    const { chartsData } = this.state
    let str = `仿真方案/时间,`;
    // 增加\t为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < chartsData.data[0].time.length; i++) {
      str += `${chartsData.data[0].time[i]},`
      if (chartsData.data[0].time.length - 1 === i) {
        str += '\n'
      }
    }
    // 循环遍历，每行加入tr标签，每个单元格加td标签
    for (let i = 0; i < chartsData.data.length; i++) {
      str += `${chartsData.data[i].name},`
      for (let j = 0; j < chartsData.data[i].data.length; j++) {
        // 增加\t为了不让表格显示科学计数法或者其他格式
        str += `${chartsData.data[i].data[j] + '\t'},`
      }
      str += '\n'
    }
    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    // 通过创建a标签实现
    const link = document.createElement("a");
    link.href = uri;
    // 对下载的文件命名
    link.download = chartsData.name + '.xls'
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  render() {
    const { planList, chartsData, videoSrc, timeInterval, unitResult, direction, avgSpeedIndex, dataValue, value } = this.state
    return (
      <div className={styles.wrapper}>
        {/*  <Header /> */}
        <div className={styles.header}>
          <div className={styles.header_left}>
            <Select
              showSearch
              value={value}
              placeholder="选择区域"
              defaultActiveFirstOption={false}
              showArrow={false}
              style={{ width: '100%', heght: '100%' }}
              filterOption={false}
              onSearch={this.handleSearch}
              onChange={this.handleChange}
              notFoundContent="无当前路口"
              onFocus={this.handleonFocus}
            >
              {dataValue && dataValue.map((item) => {
                return <Option key={item.area_id}>{item.area_name}</Option>
              })}
            </Select>
          </div>

          <div className={styles.header_center}>
            {
              planList && planList.length &&
              <RowAddPlanList handleVideo={this.handleVideo} planList={planList} key={planList.length ? planList[0].id : planList} getplanListFlag={this.getplanListFlag} />
            }
          </div>

        </div>
        {/* 地图 */}
        <div id="mapContainer" className={styles.mapContainer} style={{ display: '' }}>
          <div className={styles.leftTopBox}>
            <dl>
              <dt>
                <s /><span>速度＜15km/h</span>
              </dt>
              <dt>
                <s /><span>15km/h≤速度＜30km/h</span>
              </dt>
              <dt>
                <s /><span>速度≥30km/h</span>
              </dt>
            </dl>
          </div>

          <div className={styles.dateBox}>
            <s />
            <s className={styles.bottomRight} />
            {/* <div className={styles.flowGetDate}>
              <span style={{ marginLeft: '20px' }}>分析日期范围： </span>
              <span className={styles.flowGetTime}>
                <DatePicker style={{ minWidth: '130px' }} onChange={(e, value) => { this.getDatapick(e, value, 2) }} placeholder="开始日期" format="YYYY-MM-DD" showTime />
              </span>
              <span style={{ padding: '0 5px' }}>至</span>
              <span className={styles.flowGetTime}>
                <DatePicker style={{ minWidth: '130px' }} onChange={(e, value) => { this.getDatapick(e, value, 3) }} placeholder="结束日期" showTime format="YYYY-MM-DD" />
              </span>
            </div> */}
            <div className={styles.flowGetDate}>
              <span style={{ marginLeft: '20px' }}>时间段: </span>
              <span className={styles.flowGetTime}>
                <TimePicker key={timeInterval.minTime} disabled value={moment(timeInterval.minTime, format)} onChange={(e, value) => { this.getDatapick(e, value, 0) }} placeholder="开始时间" format={format} />
              </span>
              <span style={{ padding: '0 5px' }}>至</span>
              <span className={styles.flowGetTime}>
                <TimePicker key={timeInterval.maxTime} disabled value={moment(timeInterval.maxTime, format)} onChange={(e, value) => { this.getDatapick(e, value, 1) }} placeholder="结束时间" format={format} />
              </span>
            </div>
            {/*  <div className={styles.inquire} onClick={this.getresultList}>查询</div> */}
          </div>
          <div className={styles.leftBottomBox}>{/* 时间轴 */}
            <div id="timeBox" className={styles.timeBox}>
              <mark>播放<i /></mark>
              <em><i /></em>
            </div>
          </div>
          <div className={styles.rightBox}>
            <div className={styles.pageTit}>
              {/*  <Icon type="backward" />
              <Icon type="forward" /> */}
            </div>
            <div className={styles.echartsBox}>
              {
                unitResult ? unitResult.map((item, index) => {
                  return (
                    <div className={styles.echartsItem} key={item.name + item.title + index}>
                      <span className={styles.Search} onClick={() => { this.getSearch(item) }}><Icon type="search" className={styles.Search_i} /> </span>
                      <div className={styles.title}><Icon type="double-right" />{item.name}<s onClick={() => { this.getExportBtn(item) }}>导 出</s></div>
                      <div className={styles.box} >
                        <TrafficCharts height="210px" chartsItems={item} />
                      </div>
                    </div>)
                }) : <Spin tip="加载中..." style={{ position: 'absolute', top: '35%', left: '45%' }} />
              }
            </div>
          </div>
          {direction ?
            <div className={styles.nodeRank} ref={(el) => { el ? el.onmousedown = fnDown : null }}>
              <div className={styles.nodeRank_top}><i />{this.areaName}</div>
              <div className={styles.nodeRank_bottom}>
                <div className={styles.listItem}>
                  <div className={styles.listTh}>序号</div>
                  <div className={styles.listTh}>路段名称</div>
                  <div className={styles.listTh}>路段方向</div>
                  <div className={styles.listTh}>拥堵指数</div>
                </div>
                <div className={styles.listItemBox}>
                  {direction.map((item, index) => {
                    return (
                      <div className={styles.listItem} key={'dir' + index}>
                        <div className={styles.listTh}><s>{index + 1}</s></div>
                        <div className={styles.listTh} title={item.from_node_name + '-' + item.to_node_name}><span>{item.from_node_name + '-' + item.to_node_name}</span></div>
                        <div className={styles.listTh}><span>{this.getdirection(item.from_node_direction[0]) + '-' + this.getdirection(item.to_node_direction[0])}</span></div>
                        <div className={styles.listTh} key={item.avg_speed[avgSpeedIndex]}><span>{item.avg_speed[avgSpeedIndex] || '--'}</span></div>
                      </div>)
                  })}
                </div>
              </div>
            </div> : null}
        </div>
        {
          chartsData ?
            <div className={styles.chartsSearch}>
              <div className={classNames(styles.chartsBox, styles.chartsBoxBg)}>
                <div className={classNames(styles.titleBox, styles.titleBoxBg)}><span>{chartsData.name}</span></div>
                <span className={classNames(styles.Search, styles.SearchBg)} onClick={() => { this.getSearch(null) }}><Icon type="close" className={styles.Search_i} /> </span>
                <div className={styles.exportBtn} onClick={() => { chartsData.export ? this.tableToExcel() : this.getExportBtn(chartsData) }}>导出</div>
                <TrafficCharts height="95%" chartsItems={chartsData} />
              </div>
            </div> : null
        }
        {videoSrc ? <TrafficVideo videoSrc={videoSrc} handleVideo={this.handleVideo} /> : null}
      </div>
    )
  }
}

export default TrafficAreaDatas
