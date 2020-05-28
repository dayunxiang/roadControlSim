import React from 'react'
import { DatePicker, Radio, Icon, TimePicker, Spin, message } from 'antd'
import styles from '../../AreaPlan/AreaEvaluate/Areaevaluate.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import Nav from '../../Nav/Nav'
import RowAddPlanList from '../../../components/RowAddPlanList/RowAddPlanList'
import TrafficCharts from '../../../components/TrafficCharts/TrafficCharts'
import moment from 'moment'
import classNames from 'classnames'
import TrafficVideo from '../../../components/TrafficVideo/TrafficVideo'
import Title from '../../../components/Title/Title'
import style from './TrafficAssess.scss'
import navStyles from '../../InterPlan/Navigation/Navigation.scss'
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件

const format = 'HH:mm'
class TrafficAssess extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planList: [],
      timeInterval: { maxTime: '00:00', minTime: '00:00' },
      unitResult: null,
      chartsData: null,
      sources: [],
      videoSrc: null,
    }

    this.InterPlanMsg = sessionStorage.getItem('areaPlanMsg') && JSON.parse(sessionStorage.getItem('areaPlanMsg'))
    this.targetId = this.InterPlanMsg
    /*  this.targetId = 100000 */
    this.resultList = {
      excelParam: '',
      fileNames: '',
      flag: 'false',
      areaId: this.targetId,
      realFileNames: '',
      directionArr: null,
      taskType: 3,
      startTime: '',
      endTime: '',
    }
    this.stopsAry = []
    this.markers = []
    this.directionsUrl = '/simulation/codes/directions' // 评价方向'
    /*   this.planListUrl = '/simulation/geometry/get/info/1000' */
    this.getFileUrl = `/simulation/unitSimResults/getFileNames/${this.targetId}/3` // {targetId}/{taskType}' // 查询当前路口所有方案'
    this.timeIntervalUrl = '/simulation/areaReg/getTimeInterval/' // {targetId}/{fileNames}查询当前路口所有方案'
    this.UnitResultUrl = '/simulation/areaReg/listResultArea' // 查询所有的折线图数据
    this.segmentUrl = '/simulation/areaResultSegment/get/' // {areaId}/{fileNames}/{startTime}/{endTime} // 查询路段交通运行情况数据表'
    this.videoUrl = '/simulation/sim/task/get/video/by/name/' // {fileName}/{taskType}' // '获取仿真区域视频或仿真路口视频链接2'
  }
  componentDidMount = () => {
    this.renderMaps()
    this.getPlanLists()
    this.getdirections()
    /*  this.pvm() */
  }
  getRoadtraffic = (path, limitId) => {
    const userLimit = localStorage.getItem('userLimit') && JSON.parse(localStorage.getItem('userLimit'))
    const limitArr = []
    userLimit.forEach((item) => {
      limitArr.push(item.id)
    })
    if (limitArr.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      this.props.history.push(path)
    }
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
  getPlanLists = () => {
    getResponseDatas('get', this.getFileUrl).then((res) => {
      if (res.data.code === 200) {
        const result = res.data
        this.setState({ planList: res.data.content }, () => {
          if (res.data.content.length) {
            this.resultList.fileNames = result.content[0].id
            this.resultList.realFileNames = result.content[0].name
            this.getTimeInterval(res.data.content[0].id)
            /*  // 渲染折线图
             this.getresultList() */
          }
        })
      }
    })
  }
  getTimeInterval = (fileNames) => {
    getResponseDatas('get', this.timeIntervalUrl + this.targetId + '/' + fileNames + '/3').then((res) => {
      const result = res.data
      if (result.code === 200 && (result.content && Object.keys(result.content).length)) {
        this.setState({ timeInterval: result.content }, () => {
          this.resultList.startTime = result.content.minTime
          this.resultList.endTime = result.content.maxTime
          /*  // 获取地图点位
           this.gettsegment(result.content) */
          // 渲染时间轴
          this.getScrollTime()
          // 渲染折线图
          this.getresultList()
          // 地图点位
          this.addSources()
        })
      } else {
        message.error('当前方案无数据', 2)
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
          message.error('当前方案无数据', 2)
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
        this.setState({ unitResult: result.content })
      }
    })
  }
  handleVideo = (index) => {
    if (index === null) {
      this.setState({ videoSrc: null })
    } else {
      const fileName = this.resultList.fileNames.split(',')[index]
      if (fileName) {
        getResponseDatas('get', this.videoUrl + fileName + '/3').then((res) => {
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
  handleChange = (moment, dates) => {
    // console.log(moment, dates)
  }
  getScrollTime = () => {
    const selfThis = this
    const { timeInterval } = this.state
    $('#timeBox').getScrollTime({
      timeShow: true, // 时间的显示
      nowDate: '2019-10-9',
      timeStart: timeInterval.minTime, // 开始时间
      timeEnd: timeInterval.maxTime, // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      timeGap: 5, // 间隔时段
      thisDom: selfThis, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
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
    const { sources } = this.state
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

    if (this.map.getSource("customSource")) {
      this.map.removeSource("customSource")
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
    // 画线
    this.addLayers(stops)
  }
  queryRouteResult = (start, end) => {
    this.driving.search(start, end, '', (res) => {
      // console.log(res)
    })
  }

  addSources = () => {
    const { map } = this
    const { fileNames } = this.resultList
    const { timeInterval, planList } = this.state
    getResponseDatas('post', this.segmentUrl + this.targetId + '/' + fileNames + '/' + timeInterval.minTime + '/' + timeInterval.maxTime + '/3').then((res) => {
      const result = res.data
      const makers = [] // 点坐标
      let datas = [] // 数据集合
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
            return { ...lis, fileNames: item.split('_')[1] }
          })
        }

        this.setState({ sources: datas }, () => {
          this.getCrossingCvs(0)
          // 描点
          this.gettsegment(makers)
        })
      }
    })
  }
  addLayers = (stops) => {
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
  onMouseMove = (e) => {
    const map = this.map
    const features = map.queryRenderedFeatures(e.point, { layers: ['pointLayer', 'lineLayer'] })
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
  }

  onMouseClick = (e) => {
    const { map } = this
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
      this.popup.setLngLat(coord)
        .setHTML(`
        <div class=${styles.areapoput}>
        <p><span>路段名称 :</span><span style="color:${color}">${feature.properties.title}</span></p>
        <p><span>路段方向 :</span><span style="color:${color}">${feature.properties.direction}</span></p>
        <p><span>平均速度 :</span><span style="color:${color}">${feature.properties.avgSpeed}km/h</span></p>
        <p><span>拥堵状态 :</span><span style="color:${color}">${avgSpeed}</span></p>
        </div>`)
        .addTo(map)
    }
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
          sessionStorage.setItem('NodeIdPlanMsg', JSON.stringify({ targetId: this.targetId, nodeId: item.nodeId, interName: item.nodeName, taskType: 3 }))
          window.open(window.location.href.split('#')[0] + '#/nodeEvaluate')
        })
      }
    })
  }
  renderMaps = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      style: '//10.11.57.105:60050/service/solu/style/id/4636',
      center: [106.709075, 26.586574],
      zoom: 14,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    map.on('load', () => {
      // 增加自定义数据源、自定义图层
      /*  this.addSources() */
      /* this.addLayers() */
    })

    this.popup = new window.minemap.Popup({
      closeButton: false,
      closeOnClick: false,
    })
    map.on('mousemove', this.onMouseMove)
    map.on('click', this.onMouseClick)
  }
  render() {
    const { timeInterval, videoSrc, unitResult, chartsData, planList } = this.state
    return (
      <div className={styles.areaEvaluateWrapper}>
        <Nav />
        <div className={navStyles.road_administer}>
          <div className={classNames({ [navStyles.administer_itemclick]: this.props.location.pathname === '/TrafficManage', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficManage', 45) }}>
            <span>交通特性与模型参数管理</span>
            <span />
          </div>
          <div className={classNames({ [navStyles.administer_itemclick]: this.props.location.pathname === '/TrafficAssess', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficAssess', 46) }}>
            <span>交通特性与模型参数评估</span>
            <span />
          </div>
        </div>
        <div className={styles.AreaEvaluate} style={{ height: `calc(100% - 125px)` }}>
          {
            !!this.state.planList.length &&
            <RowAddPlanList planList={planList} handleVideo={this.handleVideo} getplanListFlag={this.getplanListFlag} />
          }
          <div className={styles.contentWrapper}>
            <div className={styles.mapBox} id="mapContainer" />
            <div className={styles.leftBottomBox}>
              {/* <img src={TimeImg} alt="" /> */}
              <div id="timeBox" className={styles.timeBox}>
                <mark>播放<i /></mark>
                <em><i /></em>
              </div>
            </div>
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
            <div className={styles.formBox}>
              <div className={styles.itemBox}>
                <div className={styles.flowGetDate}>
                  <span style={{ marginLeft: '20px' }}>评价时段： </span>
                  <span className={styles.flowGetTime}>
                    <TimePicker disabled key={timeInterval.minTime} value={moment(timeInterval.minTime, format)} format={format} />
                  </span>
                  <span style={{ padding: '0 5px' }}>至</span>
                  <span className={styles.flowGetTime}>
                    <TimePicker disabled key={timeInterval.maxTime} value={moment(timeInterval.maxTime, format)} format={format} />
                  </span>
                </div>
              </div>
              {/* <div className={styles.itemBox}>
                <Radio.Group onChange={this.handleChange} defaultValue={1}>
                  <Radio value={1} style={{ color: '#07eeff' }}>通停车延误</Radio>
                  <Radio value={2} style={{ color: '#07eeff' }}>占有率</Radio>
                  <Radio value={3} style={{ color: '#07eeff' }}>速度</Radio>
                  <Radio value={4} style={{ color: '#07eeff' }}>延误</Radio>
                  <Radio value={3} style={{ color: '#07eeff' }}>停车次数</Radio>
                  <Radio value={4} style={{ color: '#07eeff' }}>行程时间</Radio>
                </Radio.Group>
              </div> */}
            </div>
            <div className={styles.rightBox}>
              <div className={styles.pageTit}>
                {/* <Icon type="backward" />
                <Icon type="forward" /> */}
              </div>
              <div className={styles.echartsBox} ref={(el) => { this.vid = el }}>
                {
                  unitResult ? unitResult.map((item) => {
                    return (
                      <div className={styles.echartsItem} key={item.name + item.title}>
                        <span className={styles.Search} onClick={() => { this.getSearch(item) }}><Icon type="search" className={styles.Search_i} /> </span>
                        <div className={styles.title}><Icon type="double-right" />{item.name}<s onClick={() => { this.getExportBtn(item) }}>导 出</s></div>
                        <div className={styles.box} >
                          <TrafficCharts height="210px" chartsItems={item} />
                        </div>
                      </div>)
                  }) : null
                }{/* <Spin tip="加载中..." style={{ position: 'absolute', top: '35%', left: '45%' }} /> */}
              </div>
            </div>
          </div>
        </div>
        {chartsData ?
          <div className={styles.chartsSearch}>
            <div className={classNames(styles.chartsBox, styles.chartsBoxBg)}>
              <div className={classNames(styles.titleBox, styles.titleBoxBg)}><Title title={chartsData.name} /></div>
              <span className={classNames(styles.Search, styles.SearchBg)} onClick={() => { this.getSearch(null) }}><Icon type="close" className={styles.Search_i} /> </span>
              <div className={styles.exportBtn} onClick={() => { this.getExportBtn(chartsData) }}>导出</div>
              <TrafficCharts height="95%" chartsItems={chartsData} />
            </div>
          </div> : null}
        {videoSrc ? <TrafficVideo videoSrc={videoSrc} handleVideo={this.handleVideo} /> : null}
      </div>
    )
  }
}

export default TrafficAssess
