import React from 'react'
import { DatePicker, Select, TimePicker, message, Spin, Icon } from 'antd'
import classNames from 'classnames'
import styles from './NodeEvaluate.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import RowAddPlanList from '../../../components/RowAddPlanList/RowAddPlanList'
import TrafficCharts from '../../../components/TrafficCharts/TrafficCharts'
import Title from '../../../components/Title/Title'
import TrafficVideo from '../../../components/TrafficVideo/TrafficVideo'
import moment from 'moment'

const format = 'HH:mm'
class NodeEvaluate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      turnArr: null,
      directionArr: null,
      planList: null,
      directiondy: '1',
      unitResult: null,
      timeInterval: null,
      chartsData: null,
      videoSrc: null,
    }
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('NodeIdPlanMsg'))
    this.targetId = this.InterPlanMsg.targetId
    this.nodeId = this.InterPlanMsg.nodeId
    this.taskType = this.InterPlanMsg.taskType
    this.directionsUrl = '/simulation/codes/directions' // 评价方向'
    this.turnUrl = '/simulation/codes/turns' // 评价转向
    this.timeIntervalUrl = '/simulation/unitSimResults/getTimeInterval' // {targetId}/{fileNames}查询当前路口所有方案'
    this.UnitResultUrl = '/simulation/unitSimResults/list/unitResult' // 查询仿真结果数据表'
    this.unitQueueUrl = '/simulation/unitSimResults/list/unitQueueResult' // 查询仿真结果排队数据表'
    this.getFileUrl = `/simulation/unitSimResults/getFileNames/${this.targetId}/${this.taskType}` // {targetId}/{taskType}' // 查询当前路口所有方案'
    this.videoUrl = '/simulation/sim/task/get/video/by/name/' // {fileName}/{taskType}' // '获取仿真区域视频或仿真路口视频链接2'
    this.chartsItems = ['平均排队长度', '最大排队长度', '通过车辆数', '平均延误时间', '平均停车次数', '尾气排放', '机动车能耗', '旅行时间', '占有率']
    this.resultList = {
      directionCodes: '',
      excelParam: '',
      fileNames: '',
      flag: 'false',
      laneTurns: '',
      nodeId: this.nodeId,
      targetId: this.targetId,
      fileRealNames: '',
      taskType: this.taskType,
      startTime: '',
      endTime: '',
    }
  }
  componentDidMount = () => {
    // 获取评价方向和评价转向数据
    this.getdirections()
  }
  getdirections = () => {
    // 方案
    getResponseDatas('get', this.getFileUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ planList: result.content }, () => {
          if (result.content.length) {
            if (this.InterPlanMsg.hasOwnProperty('fileNames')) {
              this.resultList.fileNames = this.InterPlanMsg.fileNames.join()
              this.resultList.fileRealNames = this.InterPlanMsg.fileRealNames.join()
            } else {
              this.resultList.fileNames = result.content[0].id
              this.resultList.fileRealNames = result.content[0].name
            }
            // 渲染折线时间段
            this.getTimeInterval(result.content[0].id)
          }
        })
      }
    })
    // 评价方向
    getResponseDatas('get', this.directionsUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ directionArr: result.content })
      }
    })
    // 评价转向
    getResponseDatas('get', this.turnUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        this.setState({ turnArr: result.content })
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
  getresultList = (bool) => {
    this.state.unitResult = bool ? this.state.unitResult : [];
    /* [this.UnitResultUrl, this.unitQueueUrl].forEach((item, indexs) => { */
    getResponseDatas('post', bool ? this.unitQueueUrl : this.UnitResultUrl, this.resultList).then((res) => {
      const { unitResult } = this.state
      const result = res.data
      if (result.code === 200) {
        // console.log(result.content)
        if (result.content.length) {
          const { planList, directionArr } = this.state
          const turnArr = [
            { id: 10, name: '直行' }, { id: 11, name: '左转' }, { id: 12, name: '右转' }, { id: 13, name: '直行 右转' }, { id: 14, name: '直行 左转' }, { id: 15, name: '左转 右转' }, { id: 16, name: '直行 右转 左转' }, { id: 17, name: '掉头' }, { id: 18, name: '左转 掉头' }, { id: 19, name: '直行 左转 掉头' }, { id: 20, name: '直行 左转 右转 掉头' }, { id: 21, name: '左转 右转 掉头' }, { id: 22, name: '直行 掉头' }, { id: 23, name: '行人和非机动车斜向行驶' }, { id: 24, name: '其他' }
          ]
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
                if (indexss === 1) {
                  directionArr.forEach((x) => {
                    if (x.id == itemss) {
                      names += " " + x.name
                    }
                  })
                }
                if (indexss === 2) {
                  turnArr.forEach((x) => {
                    if (x.id == itemss) {
                      names += " " + x.name
                    }
                  })
                }
              })
              result.content[index].data[indexs].name = names
            })
          })
          this.setState({ unitResult: [...unitResult, ...result.content] }, () => {
            if (!bool) {
              this.getresultList(true)
            }
            if (bool && this.state.unitResult.length === 0) {
              message.warning('当前方案无数据!')
            }
          })
        }
      }

    })
    /*  }) */
  }
  getplanListFlag = (obj, names = []) => {
    const fileRealNames = []
    Object.values(obj).forEach((item) => {
      names.forEach((items) => {
        if (item === items.id) {
          fileRealNames.push(items.name)
        }
      })
    })
    this.resultList.fileNames = Object.values(obj).join()
    this.resultList.fileRealNames = fileRealNames.join()
    this.getTimeInterval(Object.values(obj).join())
  }
  getTimeInterval = (fileNames) => {
    getResponseDatas('post', this.timeIntervalUrl, { fileNames, targetId: this.targetId, taskType: this.taskType }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (result.content && Object.keys(result.content).length) {
          this.resultList.startTime = result.content.minTime
          this.resultList.endTime = result.content.maxTime
          this.setState({ timeInterval: result.content })
          // 渲染折线图
          this.getresultList()
        } else {
          this.setState({ unitResult: [] })
          message.warning('当前方案无数据!')
        }
      }
    })
  }

  // 导出
  getExportBtn = (item) => {
    this.resultList.excelParam = item.title
    // console.log(item.title);

    /* this.resultList.fileRealNames = item.name */
    this.resultList.flag = 'true'
    getResponseDatas('post', item.title == 'max_queue' || item.title == 'avg_queue' ? this.unitQueueUrl : this.UnitResultUrl, this.resultList, { responseType: 'blob' }).then((_res) => {
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
  handleChange = (value, name) => {
    this.resultList[name] = value.join()
  }
  handleTimePickr = (e, value, name) => {
    this.resultList[name] = value
  }
  handleType = (value) => {
    if (value === '1') {
      this.resultList.directionCodes = ''
      this.resultList.laneTurns = ''
    } else if (value === '2') {
      this.resultList.laneTurns = ''
    }
    this.setState({ directiondy: value })
  }
  getSearch = (item) => {
    this.setState({ chartsData: item })
  }
  handleVideo = (index) => {
    if (index === null) {
      this.setState({ videoSrc: null })
      return
    }
    this.setState({ videoSrc: true })
    const fileName = this.resultList.fileNames.split(',')[index]
    if (fileName) {
      getResponseDatas('get', this.videoUrl + fileName + '/' + this.taskType).then((res) => {
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
  render() {
    const { Option } = Select
    const {
      turnArr, videoSrc, chartsData, directionArr, planList, directiondy, unitResult, timeInterval,
    } = this.state
    return (
      <div className={styles.evaluateWrapper}>
        <div className={styles.header}>
          <div className={styles.header_left}>{this.InterPlanMsg.interName || '--'}</div>
        </div>
        <div className={styles.rowaddlist}>
          {
            planList &&
            <RowAddPlanList handleVideo={this.handleVideo} planList={planList} getplanListFlag={this.getplanListFlag} fileNames={this.InterPlanMsg.fileNames} />
          }
        </div>
        <div className={styles.inquire} onClick={() => { this.getresultList() }}>查询</div>
        <div className={styles.header_center}>
          <div className={styles.hdcenter}>
            {timeInterval ?
              <div className={styles.itemBox}>
                <div className={styles.flowGetDate}>
                  <span style={{ marginLeft: '20px' }}>评价时段： </span>
                  <span className={styles.flowGetTime}>
                    <TimePicker disabled onChange={(e, value) => { this.handleTimePickr(e, value, 'startTime') }} key={timeInterval.minTime} defaultValue={moment(timeInterval.minTime, format)} format={format} />
                  </span>
                  <span style={{ padding: '0 5px' }}>至</span>
                  <span className={styles.flowGetTime}>
                    <TimePicker disabled onChange={(e, value) => { this.handleTimePickr(e, value, 'endTime') }} key={timeInterval.maxTime} defaultValue={moment(timeInterval.maxTime, format)} format={format} />
                  </span>
                </div>
              </div> : null}
            <div className={styles.itemDiv}>
              <span style={{ marginLeft: '20px' }}>评价类型： </span>
              <span className={styles.selectItem}>
                <Select defaultValue="1" onChange={this.handleType}>
                  <Option value="1">按路口</Option>
                  <Option value="2">按方向</Option>
                  <Option value="3">按转向</Option>
                </Select>
              </span>
            </div>
            {directiondy !== '1' ?
              <div className={styles.itemDir}>
                <span>分析方向： </span>
                <span className={styles.selectItem}>
                  <Select mode="multiple" placeholder="请选择方向" onChange={(e) => { this.handleChange(e, 'directionCodes') }}>
                    {
                      !!directionArr && directionArr.map((item) => {
                        return <Option value={item.id} key={item.name + item.id}>{item.name}</Option>
                      })
                    }
                  </Select>
                </span>
              </div> : null}
            {directiondy === '3' ?
              <div className={styles.itemTurn}>
                <span>转 向： </span>
                <span className={styles.selectItem}>
                  <Select
                    mode="multiple"
                    placeholder="请选择转向"
                    onChange={(e) => { this.handleChange(e, 'laneTurns') }}
                  >
                    {
                      !!turnArr && turnArr.map((item) => {
                        return <Option value={item.id} key={item.name + item.id}>{item.name}</Option>
                      })
                    }
                  </Select>
                </span>
              </div> : null}

          </div>
        </div>
        <div className={classNames(styles.chartsWrapper, styles.scrollBox)}>
          {
            unitResult ? unitResult.map((item) => {
              return (
                <div className={styles.chartsBox} key={item.title + item.data.length}>
                  <div className={styles.titleBox}><Title title={item.name} /></div>
                  <span className={styles.Search} onClick={() => { this.getSearch(item) }}><Icon type="search" className={styles.Search_i} /> </span>
                  <div className={styles.exportBtn} onClick={() => { this.getExportBtn(item) }}>导出</div>
                  <TrafficCharts height="95%" chartsItems={item} />
                </div>)
            }) : <Spin tip="加载中..." style={{ position: 'absolute', top: '35%', left: '45%' }} />
          }
          {!!unitResult && unitResult.length === 0 ? <div className={styles.NullBox}>暂无数据</div> : null}
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

export default NodeEvaluate
