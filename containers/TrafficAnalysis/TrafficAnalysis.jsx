import React from 'react'
import { DatePicker, Icon, message } from 'antd'
import Nav from '../Nav/Nav'
import LeftPop from './LeftPop/leftPop'
import RightPop from './RightPop/RightPop'
import PopMap from './PopMap/PopMap'
import classNames from 'classnames'
import style from './TrafficAnalysis.scss'
import getResponseDatas from '../../utlis/getResponseData'
import TrafficCharts from '../../components/TrafficCharts/TrafficCharts'
import styles from '../InterPlan/Navigation/Navigation.scss'
import Title from '../../components/Title/Title'
import roadStyles from '../InterPlan/Roadtraffic/Roadtraffic.scss'
import moment from 'moment'
const { RangePicker } = DatePicker
class TrafficAnalysis extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaIdName: null,
      popShow: [],
      markerDatas: [],
      sources: [],
      roadData: null,
      direction: [],
      mode: 'time',
      datePicker: false,
      indexTra: 0,
      latlonState: [],
      ChartData: null,
    }
    this.markers = []
    this.Tratime = '2020-02-26 16:03:49'
    this.areaName = { areaName: '' }
    this.dictUrl = '/simulation/trafficForecastAnalysis/dict' // 方向字典'
    this.roadStatUrl = '/simulation/trafficForecastAnalysis/roadStatistics' // 路段统计'
    this.areaMesUrl = '/simulation/trafficForecastAnalysis/areaMes' // 模糊查询路口'
    this.areaDataUrl = '/simulation/trafficForecastAnalysis/areaData' // 获取区域信息'
    this.areaRoadUrl = '/simulation/trafficForecastAnalysis/areaRoad' // 获取区域路口经纬度信息'
    this.roadLineUrl = '/simulation/trafficForecastAnalysis/roadLine' // 路口连线'
  }
  componentDidMount = () => {
    this.renderMineMap()
    // 获取左侧列表
    this.getareaData()
    this.getdir()
    this.getDate()
  }
  OpenInforWindow = (e, item) => {
    /* console.log(item.nodeName)
    alert(item.nodeName) */
    this.getTracallback(item)
  }
  // 获取右侧列表
  getroadStat = () => {
    getResponseDatas('get', this.roadStatUrl, { time: this.Tratime }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ roadData: result.content }, () => {
          /* this.getOperation(0) */
          this.addSources()
        })
      }
    })
  }
  // 获取当前时间
  getDate = () => {
    const today = new Date()
    const x = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    /* this.Tratime = navtime + navmse */
    this.Tratime ='2020-02-26 16:03:49'
    this.getroadStat()
  }
  //  方向
  getdir = () => {
    getResponseDatas('get', this.dictUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ direction: result.content })
      }
    })
  }
  getdirection = (value) => {
    const { direction } = this.state
    for (let i = 0; i < direction.length; i++) {
      if (direction[i].dict_code == value) {
        return direction[i].code_name
      }
    }
  }
  getOperation = (index) => {
    this.setState({ indexTra: index }, () => {
      this.getCrossingCvs(index)
    })
    /*   const { roadData } = this.state
      console.log(roadData['volume' + (index+1) * 5])
      debugger */
  }
  getdatePicker = (bool) => {
    this.setState({ datePicker: bool })
  }
  // 搜索回调
  getInput = (value) => {
    /* this.areaName.areaName = value
    this.getareaRoad() */
  }
  // 查询
  getSearch = (value, callback) => {
    getResponseDatas('get', this.areaMesUrl, { roadName: value }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        /*       key={item.nodeId}>{item.nodeName} */
        const data = result.content.map((item, index) => {
          item.nodeId = item.fname + item.tname + item.fid + item.tid + index
          item.nodeName = item.fname + '-' + item.tname
          return item
        })
        callback(data)
      }
    })
  }
  // 渲染点
  getmarkersState = () => {
    const { map } = this
    const { markerDatas } = this.state
    if (this.markers.length) {
      this.markers.forEach((item) => {
        item.remove()
      })
      this.markers = []
    }
    markerDatas.forEach((item, index) => {
      const el = document.createElement('div')
      const p = document.createElement('div')
      const title = document.createElement('div')
      const bgColor = '#fff'
      el.style.zIndex = 120000
      p.className = roadStyles.drawCircle
      p.style['background-color'] = bgColor
      p.style['box-shadow'] = '0 0 20px ' + bgColor
      p.id = 'markerWrapper' + index
      title.innerHTML = item.node_name
      title.className = 'MarkerTitle'
      el.appendChild(title)
      el.appendChild(p)
      // 添加选中样式
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

      // 添加marker
      const marker = new window.minemap.Marker(el, { offset: [-10, -30] }).setLngLat([item.unit_longitude, item.unit_latitude]).setPopup().addTo(map)
      this.markers.push(marker)
      el.addEventListener('click', (e) => {

      })
    })
  }
  getTraffic = (key) => {
    let data = ''
    switch (key) {
      case 'Crimson':
        data = {
          name: '拥堵',
          class: 'dtOne'
        }
        break;
      case 'red':
        data = {
          name: '拥挤',
          class: 'dtTwo'
        }
        break;
      case 'yellow':
        data = {
          name: '缓行',
          class: 'dtThree'
        }
        break;
      case 'green':
        data = {
          name: '畅通',
          class: 'dtFour'
        }
        break;
    }
    return data
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
    const { sources, roadData } = this.state
    const resdata = roadData ? roadData['volume' + (e + 1) * 5] : [[]]
    const dataAry = [] // 图层数据
    const stops = [] // 路段颜色
    const latlonState = []

    if (!sources.length) { return }
    sources.forEach((items, index) => {
      let color = 'green'
      for (let i = 0; i < resdata[0].length; i++) {
        if (resdata[0][i].fid === items.fid && resdata[0][i].tid === items.tid) {
          color = resdata[0][i].status
        }
      }
      dataAry.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: (this.getDistanceXy(items.flon, items.flat, items.tlon, items.tlat)),
        },
        properties: {
          title: items.fname + '-' + items.tname,
          kind: index + 1,
          colors: color,
          from_direction: items.from_node_direction,
          to_direction: items.to_node_direction,
          ftid: items.fid + '-' + items.tid,
        },
      })
      latlonState.push({
        title: items.fname + '-' + items.tname,
        kind: index + 1,
        colors: color,
        from_direction: items.from_node_direction,
        to_direction: items.to_node_direction,
        fid: items.fid,
        tid: items.tid,
        ftid: items.fid + '-' + items.tid,
      })
      stops.push([index + 1, color])
    })
    this.setState({ latlonState })
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
    // 画线
    this.addLayers(stops)
    if (this.domeE) {
      this.onMouseClick(this.domeE)
    }
  }
  onMouseMove = (e) => {
    const map = this.map
    const features = map.queryRenderedFeatures(e.point, { layers: ['pointLayer', 'lineLayer'] })
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
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
    if (coord) {
      const box = document.createElement('div')
      box.className = style.areapoput
      const p1 = document.createElement('p')
      const span11 = document.createElement('span')
      const span12 = document.createElement('span')
      span11.innerHTML = '路段名称 :'
      span12.innerHTML = feature.properties.title
      span12.style.color = feature.properties.colors
      p1.appendChild(span11)
      p1.appendChild(span12)
      const p2 = document.createElement('p')
      const span21 = document.createElement('span')
      const span22 = document.createElement('span')
      span21.innerHTML = '路段方向 :'
      span22.innerHTML = this.getdirection(feature.properties.from_direction) + '-' + this.getdirection(feature.properties.to_direction)
      p2.appendChild(span21)
      p2.appendChild(span22)
      const p3 = document.createElement('p')
      const span31 = document.createElement('span')
      const span32 = document.createElement('span')
      span32.style.color = feature.properties.colors
      span32.innerHTML = this.getTraffic(feature.properties.colors).name
      span31.innerHTML = '拥堵状态 :'
      p3.appendChild(span31)
      p3.appendChild(span32)
      const p4 = document.createElement('p')
      const span4 = document.createElement('span')
      span4.className = style.button
      span4.innerHTML = '预测分析'
      span4.onclick = this.getVlomes.bind(null, feature.properties.ftid)
      p4.appendChild(span4)
      box.appendChild(p1)
      box.appendChild(p2)
      box.appendChild(p3)
      box.appendChild(p4)
      // console.log(box);
      this.popup.setLngLat(coord)
        .setDOMContent(box)
        .addTo(map)
    }
  }
  // 获取左侧列表
  getareaData = () => {
    getResponseDatas('get', this.areaDataUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ areaIdName: result.content })
      }
    })
  }
  getPanel = (nodeid, callback) => {
    getResponseDatas('get', this.areaRoadUrl, { area_id: nodeid }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        callback(result.content)
      }
    })
  }
  getVlomes = (name) => {
    const { roadData } = this.state
    const data = []
    let ns = '', nm = ''
    Object.values(roadData).map((item) => {
      item[0].forEach((items) => {
        ns = items.fid + '-' + items.tid
        if (ns == name) {
          nm = items.fname + '-' + items.tname
          data.push(items.volume)
        }
      })
    })
    // console.log(data);

    if (data.length === 0) {
      message.warning('当前无预测分析!')
      return
    }
    const newData = {
      data: [{
        data: data,
        time: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
        name: '拥堵程度'
      }],
      name: nm + '未来一小时预测分析',
      title: nm + '未来一小时预测分析'
    }
    this.setState({
      ChartData: newData,
    })
  }
  getTracallback = (item) => {
    const { latlonState } = this.state
    // console.log(item, latlonState)
    for (let i = 0; i < latlonState.length; i++) {
      if (latlonState[i].fid === item.fid && latlonState[i].tid === item.tid) {
        const box = document.createElement('div')
        box.className = style.areapoput
        const p1 = document.createElement('p')
        const span11 = document.createElement('span')
        const span12 = document.createElement('span')
        span11.innerHTML = '路段名称 :'
        span12.innerHTML = latlonState[i].title
        span12.style.color = latlonState[i].colors
        p1.appendChild(span11)
        p1.appendChild(span12)
        const p2 = document.createElement('p')
        const span21 = document.createElement('span')
        const span22 = document.createElement('span')
        span21.innerHTML = '路段方向 :'
        span22.innerHTML = this.getdirection(latlonState[i].from_direction) + '-' + this.getdirection(latlonState[i].to_direction)
        p2.appendChild(span21)
        p2.appendChild(span22)
        const p3 = document.createElement('p')
        const span31 = document.createElement('span')
        const span32 = document.createElement('span')
        span32.style.color = latlonState[i].colors
        span32.innerHTML = this.getTraffic(latlonState[i].colors).name
        span31.innerHTML = '拥堵状态 :'
        p3.appendChild(span31)
        p3.appendChild(span32)
        const p4 = document.createElement('p')
        const span4 = document.createElement('span')
        span4.className = style.button
        span4.innerHTML = '预测分析'
        span4.onclick = this.getVlomes.bind(null, latlonState[i].ftid)
        p4.appendChild(span4)
        box.appendChild(p1)
        box.appendChild(p2)
        box.appendChild(p3)
        box.appendChild(p4)
        this.popup.setLngLat([(item.flon + item.tlon) / 2, (item.flat + item.tlat) / 2])
          .setDOMContent(box)
          .addTo(this.map)
        return
      }
    }
  }
  addSources = () => {
    getResponseDatas('get', this.roadLineUrl).then((res) => {
      const result = res.data
      const markerDatas = []
      const nodeid = []
      if (result.code === 200) {
        result.content.forEach((item) => {
          if (!nodeid.includes(item.fid)) {
            nodeid.push(item.fid)
            markerDatas.push({
              node_id: item.fid,
              node_name: item.fname,
              direction: item.from_node_direction,
              unit_longitude: item.flon,
              unit_latitude: item.flat,
            })
          }
          if (!nodeid.includes(item.tid)) {
            nodeid.push(item.tid)
            markerDatas.push({
              node_id: item.tid,
              node_name: item.tname,
              direction: item.to_node_direction,
              unit_longitude: item.tlon,
              unit_latitude: item.tlat,
            })
          }
        })
        this.setState({ sources: result.content, markerDatas }, () => {
          this.getmarkersState()
          this.getCrossingCvs(this.state.indexTra)
        })
      }
    })
  }
  renderMineMap = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      style: '//10.11.57.105:60050/service/solu/style/id/4636',
      center: [106.706278, 26.590897],
      zoom: 13.8,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    map.on('load', () => {
      // 增加自定义数据源、自定义图层
      /*  this.addSources() */
      /*   this.addLayers() */
    })
    this.popup = new window.minemap.Popup({
      closeButton: false,
      closeOnClick: false,
    })
    map.on('mousemove', this.onMouseMove)
    map.on('click', this.onMouseClick)
    this.map = map
    // 添加点
    this.getmarkersState()
  }
  handleChange = (e, value) => {
    // console.log(e, value)
    this.Tratime = value
  }
  handleOpenChange = (open, value) => {
    if (open) {
      this.setState({ mode: 'time' })
    } else {
      // console.log(this.Tratime);
      this.getroadStat()
    }
  }
  getClose = () => {
    this.setState({ ChartData: null })
  }
  handlePanelChange = (value, mode) => {
    this.setState({ mode });
  }
  render() {
    const { areaIdName, sources, roadData, datePicker, indexTra, ChartData } = this.state
    return (
      <div className={roadStyles.Roadtcontent} style={{ height: '100vh' }}>
        {/* 地图 */}
        <div id="mapContainer" className={roadStyles.mapContainer} />
        <Nav styles="350px" getSearch={this.getSearch} OpenInforWindow={this.OpenInforWindow} />
        <div className={styles.road_administer}>
          <div className={styles.road_administer_item}>
            <span>交通预测分析</span>
            <span />
          </div>
        </div>
        {areaIdName ? <LeftPop getPanel={this.getPanel} getTracallback={this.getTracallback} areaLength={sources.length} areaIdName={areaIdName} getInput={this.getInput} /> : null}
        {roadData ? <RightPop getdatePicker={this.getdatePicker} Tratime={this.Tratime} echartData={roadData['volume' + (indexTra + 1) * 5]} getCrossingCvs={this.getOperation} getdirection={this.getdirection} /> : null}
        {/*   <PopMap /> */}
        {datePicker ?
          <div className={style.popMap}>
            <Icon type="close" className={style.iconTra} onClick={() => { this.getdatePicker(false) }} />
            <DatePicker
              mode={this.state.mode}
              showTime
              defaultValue={moment(this.Tratime, 'YYYY-MM-DD HH:mm:ss')}
              onChange={this.handleChange}
              onOpenChange={this.handleOpenChange}
              onPanelChange={this.handlePanelChange}
            />
          </div> : null}
        {ChartData ?
          <div className={style.chartsBg}>
            <div className={style.chartsBox}>
              <div className={style.titleBox}><Title title={ChartData.title} /></div>
              <span className={style.Search} onClick={() => { this.getClose() }}><Icon type="close" className={style.Search_i} /> </span>
              <TrafficCharts height="95%" chartsItems={ChartData} />
            </div>
          </div> : null}
      </div>
    )
  }
}

export default TrafficAnalysis
