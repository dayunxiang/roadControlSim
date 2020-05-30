import React from 'react'
import classNames from 'classnames'
import { DatePicker, Select, Icon, Spin, message, TimePicker } from 'antd'
import echarts from 'echarts'
import getResponseDatas from '../../../utlis/getResponseData'
import ReactEcharts from 'echarts-for-react'
import Nav from '../../Nav/Nav'
import navStyles from '../../InterPlan/Navigation/Navigation.scss'
import styles from './TrafficDatas.scss'
import mapStyles from '../../../utlis/styles_2301'
import moment from 'moment'
import getDrag from '../../../utlis/drag'

const format = 'HH:mm'
const { Option } = Select
const directionArr = ['东', '西', '南', '北', '东北', '西北', '东南', '西北']
const directionChildren = []
for (let i = 0; i < 8; i++) {
  directionChildren.push(<Option key={i}>{directionArr[i]}</Option>)
}
const turnArr = ['左转', '直行', '右转', '掉头']
const turnChildren = []
for (let i = 0; i < 4; i++) {
  turnChildren.push(<Option key={i}>{turnArr[i]}</Option>)
}
class TrafficDatas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      chartPlan: null,
      chartSize: null,
      nodeData: null,
      datapick: ['07:00', '08:00', new Date().getTime(), new Date().getTime()],
      videoBoxs: false,
    }
    this.fileNameData = []
    this.markers = []
    this.planLength = 0
    this.stopIndex = 0
    this.videoUrl = '/simulation/sim/task/get/video/by/name/' // {fileName}/{taskType}' // '获取仿真区域视频或仿真路口视频链接2'
    this.simUnitsUrl = '/simulation/unitDataAnalysis/getSimUnitsInfo/' // {startTime}/{endTime} 查询所有路口等级优良中差'
    this.unitPlanUrl = '/simulation/unitDataAnalysis/getUnitPlanSize' // 各区域建模路口建模方案数量'
    this.unitSizeUrl = '/simulation/unitDataAnalysis/getUnitSize' // 各区域建模路口数量'
    this.DetailUrl = '/simulation/unitDataAnalysis/getUnitDetailInfo/' // {nodeId} 根据路口id查询路口详细信息'
  }
  componentDidMount = () => {
    this.renderMineMap()
    this.getChart()
  }
  getRoadtraffic = (path, limitId) => {
    const userLimit = JSON.parse(localStorage.getItem('userLimit'))
    const limitArr = []
    userLimit.forEach((item) => {
      limitArr.push(item.id)
    })
    if (limitArr.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      if (path === '/TrafficAreaDatas') {
        window.open(window.location.href.split('#')[0] + '#/TrafficAreaDatas')
      } else {
        this.props.history.push(path)
      }
    }
  }
  getDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const navtime = year + '-' + month + '-' + day
    return
  }
  getChart = () => {
    getResponseDatas('get', this.unitPlanUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        let dataX = [], dataY = []
        result.content.forEach((item) => {
          dataX.push(item.district_name)
          dataY.push(item.plan_size)
        })
        this.setState({ chartPlan: this.getOptions(dataX, dataY) })
      }
    })
    getResponseDatas('get', this.unitSizeUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        let dataX = [], dataY = []
        result.content.forEach((item) => {
          dataX.push(item.district_name)
          dataY.push(item.unit_size)
        })
        this.setState({ chartSize: this.getOptions(dataX, dataY) })
      }
    })
  }
  getDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    return (year + '-' + month + '-' + day + '-')
  }
  getresultList = () => {
    const { datapick } = this.state
    for (let i = 0; i < datapick.length; i++) {
      if (!datapick[i]) {
        if (i === 2) {
          message.warning('请选择开始日期!')
          return
        }
        if (i === 3) {
          message.warning('请选择结束日期!')
          return
        }
        if (i === 0) {
          message.warning('请选择开始时间!')
          return
        }
        if (i === 1) {
          message.warning('请选择结束时间!')
          return
        }
      }
    }
    this.gettsegment()
  }
  getDatapick = (e, value, index) => {
    const { datapick } = this.state
    if (index > 1) {
      value
      value = new Date(value).getTime()
    }
    // console.log(e, value, index)
    datapick[index] = value
  }
  getOption = () => {
    const option = {
      toolbox: {
        show: true,
        itemGap: 20,
        feature: {
          magicType: {
            type: ['line', 'bar'],
            icon: {
              line: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAOCAYAAADNGCeJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREI4OTdCRURGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREI4OTdCRkRGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQjg5N0JDREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFEQjg5N0JEREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+tLtOrQAAAPxJREFUeNqs0c9KAkEcwPHZXBYCQToL3X0AIQ/qniSJWLAXKME30afQm+BNVy91VrSnCAqCDv05dCnw0PYd+k2NsOOlWfio465ffzurVJYphx4eUJL1CaI91yvXiQ6eMccGbXzixhE8MrEENetEIqEqAlxji3OkmFnBY0yxtmP6dia4kpCJN/EiE61kAh1cYIA39FG0b/NQYl8YydqEYhQwxhKX+MATKnl7dir/ciHRR7xLyFyjg7e4w5lMmO7sIS8tvKJh/bCObs5G6ycbyudI9u8vKF/Eex+5mwkO9Tr4Kf7riFDGvY/Y7xH6SxELfMbk3cuABx4HU98CDAAxWWF32h/qdQAAAABJRU5ErkJggg==',
              bar: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAVklEQVQ4jWP8//8/AymAJWIHAwMDQwOacAMTSabgAVQziAWnBMQLlBsEBQ0E+HAwCMOI1LDAaRCUbkATR+cTBIMvjIaxQYzM4dupYhBVM20DNQyimosA/1sK9yldXCIAAAAASUVORK5CYII='
            },
            title: {
              line: '切换折线图',
              bar: '切换柱状图',
            },
          },
          /* saveAsImage: {
            icon: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAiCAYAAABlekbOAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD/klEQVRoge3bS2gbRxgH8G8f2tVqJcuSH/JKcmwnJk5d282lKTRQvHJy6CGHFuomtnBKMYG2lLaHtodeeuil5/RQQjFp5AehxC3FhUBiKQWn0F5ssGya4AZJsVax5dfKK61kvXpoBLKtF10plsz8bpr5EH/4GLGzo8GgRGb+RzdOqF8utR6pnHQy5va7RnqL1WGlfBnX75iWNx5fioqrpPJoiFKMsSPOGNpvCQ9GRgvVFW2u9cJUfzwq/Sx6/6gvXzxEKeOpAYlSE72eu1c8+WqKrsRUMv2TJMyjxlaZ8NqiFmvpuQkA/flqCjbXyo9/G9nxssm4XOZoiFIxaR00iegrloEJ3j877MpVk7e5nO1OWzod+TCy8ZipXEREid1ni/V662tjANCRaz5vc/G0/EtIWNBWLBmiWCK6C3vhoNF6cXJ09d7QDwfnczbXbJscjYeDJ+ORrconRBQJry3VUTrTdQA41NycT8vWC7fTG4/uVjwYUh5s02mZ1rdeF1z2L7PHDzUX7WlrU8PpizFVkmnxPHhrJzO2r4HP97Q8amztkdaWSbaxawwA3s6M7Vu5Zn4yKHrnGtHWpzYZTr4h4hTb7783uACQtXLRnrb2Sc/cep357E0AOAvwfOVytjtteDri3lxxoq1PjatrfVWkaOP7q67L0yQA2tMeJ1LArTd0vH4DAKZJtKc9XlIJGWJiQG0eGP+ChHTis5CwUHfUoZDykdaXWaOu+T0Sx4kbWq7nGyngRj/LxwTb3CUDTt3GAAAstnGv6PvrRCK2e9S5EIVwnARDpy3qn73C/PdAhRF2luv7VfQ8ROe2NU5jOiNhAF8BZL3EMPOOmfD632/GQgJ+dNEQJXAVA4b281t+53ADQNZLDDVBD2MtPWuxkEAfXTxECbbpTAgA/zTzed/rR6tt4mtZfPp5eP2R5sVHQ5QgaR3oT5zz+Z32tszYoVMhi21ic9vz0JhCryFrir71nEgyBrt/9vJMZuzw6Q9GXdVxfQ7R9yd6uKoRKsYAOK19mt1YgBzN9c++M2PhHUsU23R+Lxx8cQmR/01j6t5REfQHB8dzntumCHpIx/Uub6442cpHQ5Sg2CYgSXrJd39w7uBczuYG7g/6zPytMcbYeU3eWkFPz1WMNXWHsByrFqDIjQPLwJS8veJUp1KJyiRDFKHruDRr6v5NcNov5Zov/HcaHK6xLb3f7Qrz6GChCmmbX4qkcOqjfPNF7wpxvGNR8s/3xOXt8iZDFGHq2xLqxs6pgMs+kq+m6B/hCIIe0nJ9c9tPfkert4pomruSNEZ8XKimtCucNocjGvznXXnHqypPNEQJpuHUHmNo/15w2T8pVFdScwHQ5etqUurl638B7AlgEU3JXJYAAAAASUVORK5CYII=',
            title:'导 出',
            itemSize:30,
            
          }, */
        },
        right: 120,
        top: 5,
        left: 30,
        height: 25,
      },
      xAxis: {
        boundaryGap: false,
        data: ['00:00', '01:00', '02:00', '03:00', '04:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        axisLine: {
          lineStyle: {
            color: '#17396b'
          }
        },
        axisLabel: {
          color: 'white'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'white'
        },
        axisLine: {
          lineStyle: {
            color: '#17396b'
          }
        },
        splitLine: {
          lineStyle: {
            color: ['#17396b']
          }
        }
      },
      dataZoom: [
        {
          height: 10,
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 50,
          end: 100,
          bottom: 0
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 50,
          end: 100
        }
      ],
      grid: {
        top: 50,
        bottom: 35,
        right: 30,
      },
      series: [
        {
          name: '拥堵情况',
          type: 'line',
          data: [200, 400, 600, 880, 200, 200, 400, 600, 880, 200, 200, 400, 600, 880, 200, 200, 400, 600, 880, 200, 400, 600, 880, 200],
          itemStyle: {
            normal: {
              color: function (params) {
                var colorList = [
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                  ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                ];
                var index = params.dataIndex;
                //给大于颜色数量的柱体添加循环颜色的判断
                if (params.dataIndex >= colorList.length) {
                  index = params.dataIndex - colorList.length;
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
                  ]);
              }
            }
          }
        }
      ]
    }
    return option;
  }
  getOptions = (dataX, dataY) => {
    const option = {
      xAxis: {
        data: dataX,
        axisLine: {
          lineStyle: {
            color: '#17396b'
          }
        },
        axisLabel: {
          color: '#02fbff'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#02fbff'
        },
        axisLine: {
          lineStyle: {
            color: '#17396b'
          }
        },
        splitLine: {
          lineStyle: {
            color: ['#17396b']
          }
        }
      },
      grid: {
        top: 15,
        bottom: 25,
        right: 25,
      },
      series: [
        {
          name: '拥堵情况',
          type: 'bar',
          data: dataY,
          itemStyle: {
            normal: {
              color: function (params) {
                var colorList = [['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)']];
                var index = params.dataIndex;
                //给大于颜色数量的柱体添加循环颜色的判断
                if (params.dataIndex >= colorList.length) {
                  index = params.dataIndex - colorList.length;
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
    return option
  }
  handlevideoBoxs = (index) => {
    const { videoBoxs } = this.state
    videoBoxs.splice(index, 1)
    this.setState({ videoBoxs })
  }
  getNodevalue = () => {
    const { nodeData } = this.state
    const fileNames = [], fileRealNames = []
    let nodeId, targetId, interName
    nodeData.forEach((items) => {
      items.forEach((item) => {
        fileNames.push(item.file_name)
        fileRealNames.push(item.program_title)
        nodeId = item.node_id
        targetId = item.node_id
        interName = item.node_name
      })

    })
    sessionStorage.setItem('NodeIdPlanMsg', JSON.stringify({ interName, nodeId, taskType: 1, targetId, fileNames, fileRealNames }))
    window.open(window.location.href.split('#')[0] + '#/nodeEvaluate')
  }
  OpenInforWindow = (e, item) => {
    window.event ? window.event.cancelBubble = true : e.stopPropagation()
    let bgColor = '#aaa'
    if (item.vehicle_num && item.csize) {
      const num = item.vehicle_num / item.csize
      bgColor = num > 1.2 ? '#660000' : num > 0.8 ? '#fe0000' : num > 0.35 ? '#ffff00' : '#01ff00'
    }
    const el = this[item.node_id]
    const p = this[item.node_id + 'p']
    if (this.markerId) {
      document.getElementById(this.markerId).innerHTML = ''
    }
    /* this.markerId = e.target.getAttribute('id') */
    this.markerId = this[item.node_id].children[1].id
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
  }
  gettsegment = () => {
    const { datapick } = this.state
    getResponseDatas('get', this.simUnitsUrl + datapick.join('/')).then((res) => {
      const markerDatas = res.data.content ? res.data.content : []
      if (this.markers.length) {
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].remove()
          this.markers[i] = null
        }
        this.markers = []
      }
      markerDatas.forEach((item, index) => {
        const el = document.createElement('div')
        const p = document.createElement('div')
        const title = document.createElement('div')
        let bgColor = '#ccc'
        if (true) {
          if (item.vehicle_num && item.csize) {
            const num = item.vehicle_num / item.csize
            bgColor = num > 1.2 ? '#660000' : num > 0.8 ? '#fe0000' : num > 0.35 ? '#ffff00' : '#01ff00'
          }
          el.style.zIndex = 120000
          p.className = styles.drawCircle
          p.style['background-color'] = bgColor
          p.style['box-shadow'] = '0 0 20px ' + bgColor
          p.id = 'markerWrapper' + index
          title.innerHTML = item.node_name
          title.className = 'MarkerTitle'
          el.appendChild(title)
          el.appendChild(p)
          this[item.node_id] = el
          this[item.node_id + 'p'] = p
          const marker = new window.minemap.Marker(el, { offset: [-10, -30] })
          this.map.panTo([106.706278, 26.590897])
          marker.setLngLat([item.unit_longitude, item.unit_latitude]).setPopup().addTo(this.map)
          this.markers.push(marker)
          el.addEventListener('click', (e) => {
            this.OpenInforWindow(e, item)
            getResponseDatas('get', this.DetailUrl + item.node_id).then((res) => {
              const result = res.data
              if (result.code === 200) {
                const tasks = []
                this.fileNameData = []
                this.planLength = result.content.length
                if (result.content.length) {
                  for (var i = 0; i < result.content.length; i += 3) {
                    tasks.push(result.content.slice(i, i + 3));
                  }
                  for (var i = 0; i < result.content.length; i++) {
                    this.fileNameData.push({ program_title: result.content[i].program_title, file_name: result.content[i].file_name })
                  }
                  this.setState({ nodeData: tasks })
                } else {
                  message.warning('当前路口无数据!')
                  this.setState({ nodeData: null })
                  if (this.markerId) {
                    document.getElementById(this.markerId).innerHTML = ''
                  }
                }
              }
            })
          })
        }
      })
    })
  }
  handleVideo = () => {
    this.state.videoBoxs = []
    this.fileNameData.forEach((item) => {
      /* program_title: result.content[i].file_name, file_name */
      getResponseDatas('get', this.videoUrl + item.file_name + '/1').then((res) => {
        const { videoBoxs } = this.state
        const result = res.data
        if (result.code === 200) {
          // console.log(result.content)
          if (result.content) {
            // console.log([...videoBoxs, { url: result.content, program_title: item.program_title }]);
            this.setState({ videoBoxs: [...videoBoxs, { url: result.content, program_title: item.program_title }] })
          }
        }
      })
    })


  }
  getArrowLeft = () => {
    const { interPlanMsg } = this.state
    if (this.stopIndex == 0) {
      this.wrapper.style.left = -(this.planLength - 1) * 448 + 'px'
      this.stopIndex = this.planLength - 1
    } else {
      this.stopIndex--
      this.wrapper.style.left = -this.stopIndex * 448 + 'px'
    }
  }
  getArrowRight = () => {
    if (this.stopIndex >= this.planLength - 1) {
      this.wrapper.style.left = 0
      this.stopIndex = 0
    } else {
      this.stopIndex++
      this.wrapper.style.left = -this.stopIndex * 448 + 'px'
    }
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
    map.on('click', (e) => {
      if (this.markerId) {
        document.getElementById(this.markerId).innerHTML = ''
      }
      this.setState({ nodeData: null })
    })
    this.gettsegment()
  }
  render() {
    const { chartPlan, chartSize, nodeData, videoBoxs } = this.state
    return (
      <div className={styles.wrapper}>
        <Nav />
        <div className={navStyles.road_administer}>
          <div className={classNames({ [navStyles.administer_itemclick]: this.state.hash === '#/TrafficDatas', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficDatas', 47) }}>
            <span>路口数据分析</span>
            <span />
          </div>
          <div className={classNames({ [navStyles.administer_itemclick]: this.state.hash === '#/TrafficAreaDatas', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficAreaDatas', 48) }}>
            <span>区域数据分析</span>
            <span />
          </div>
        </div>
        <div id="mapContainer" className={styles.mapContainer} >
          <div className={styles.dateBox}>
            <div className={styles.flowGetDate}>
              <span style={{ marginLeft: '20px' }}>分析日期范围： </span>
              <span className={styles.flowGetTime}>
                <DatePicker style={{ minWidth: '130px' }} defaultValue={moment(this.getDate(), "YYYY-MM-DD")} onChange={(e, value) => { this.getDatapick(e, value, 2) }} placeholder="开始日期" format="YYYY-MM-DD" />
              </span>
              <span style={{ padding: '0 5px' }}>至</span>
              <span className={styles.flowGetTime}>
                <DatePicker style={{ minWidth: '130px' }} defaultValue={moment(this.getDate(), "YYYY-MM-DD")} onChange={(e, value) => { this.getDatapick(e, value, 3) }} placeholder="结束日期" showTime format="YYYY-MM-DD" />
              </span>
            </div>
            <div className={styles.flowGetDate}>
              <span style={{ marginLeft: '20px' }}>时间段： </span>
              <span className={styles.flowGetTime}>
                <TimePicker defaultValue={moment('07:00', format)} onChange={(e, value) => { this.getDatapick(e, value, 0) }} placeholder="开始时间" format={format} />
              </span>
              <span style={{ padding: '0 5px' }}>至</span>
              <span className={styles.flowGetTime}>
                <TimePicker defaultValue={moment('08:00', format)} onChange={(e, value) => { this.getDatapick(e, value, 1) }} placeholder="结束时间" format={format} />
              </span>
            </div>
            <div className={styles.inquire} onClick={this.getresultList}>查询</div>
          </div>
          <div className={styles.leftTopBox}>
            <dl>
              <dt>
                <s /><span>优</span>
              </dt>
              <dt>
                <s /><span>良</span>
              </dt>
              <dt>
                <s /><span>中</span>
              </dt>
              <dt>
                <s /><span>差</span>
              </dt>
            </dl>
          </div>
          {nodeData ?
            <div className={styles.leftBottomBox}>
              <dl>
                <dt><em>路口编号：</em><s>{nodeData.length ? nodeData[0][0].node_name : '无'}</s></dt>
                <dt><em>路口名称：</em><s>{nodeData.length ? nodeData[0][0].node_id : '无'}</s></dt>
                <dt><em>建模方案：</em><s>{this.planLength}</s></dt>
              </dl>
              {nodeData.length > 1 ?
                [<span className={styles.interLeft} onClick={this.getArrowLeft}><Icon type="left" /></span>,
                <span className={styles.interRight} onClick={this.getArrowRight}><Icon type="right" /></span>] : null}
              <div className={styles.planBox}>
                <div className={styles.contentBox} ref={(e) => { this.wrapper = e }} style={{ width: 448 * nodeData.length }}>
                  {nodeData.map((items, index) => {
                    return (
                      <div className={styles.itemox} key={'node' + index}>
                        {
                          items.map((item) => {
                            return (
                              <span key={item.program_title + index} ><s />{item.program_title}</span>
                            )
                          })
                        }
                      </div>
                    )

                  })}

                </div>

              </div>
              <div className={styles.btnBox}>
                <span onClick={this.getNodevalue}>数据分析</span>
                <span onClick={() => { this.handleVideo() }}>视频分析</span>
              </div>
            </div> : null}
          {/* 视频 */}
          <div className={styles.midBottomBox} style={{ display: 'none' }}>
            <div className={styles.itemDetailBox} />
            <div className={styles.itemDetailBox}>
              <div className={styles.title}><Icon type="double-right" />2019-09-27 08:20:00</div>
              <div className={styles.videoBox}>
                <video />
              </div>
            </div>
            <div className={styles.itemDetailBox}>
              <div className={styles.title}><Icon type="double-right" />2019-09-27 18:20:00</div>
              <div className={styles.videoBox}>
                <video />
              </div>
            </div>
          </div>
          {/* 图表 */}
          {/* <div className={styles.midBottomBox} style={{ display: '' }} >
            // <div className={styles.itemDetailBox} />
            // <div className={styles.itemDetailBox} style={{ background: 'none' }} />
            <div className={styles.itemDetailBox}>
              <div className={styles.title}><Icon type="double-right" />平均排队长度</div>
              <div className={styles.formDiv}>
                <div className={styles.itemDiv}>
                  <span style={{ marginLeft: '10px' }}>分析类型： </span>
                  <span className={styles.selectItem}>
                    <Select defaultValue="1">
                      <Option value="1">按路口</Option>
                      <Option value="2">其它</Option>
                    </Select>
                  </span>
                </div>
                <div className={styles.itemDir}>
                  <span>分析方向： </span>
                  <span className={styles.selectItem}>
                    <Select mode='multiple'
                      placeholder="请选择方向">
                      {directionChildren}
                    </Select>
                  </span>
                </div>
                <div className={styles.itemTurn}>
                  <span>转 向： </span>
                  <span className={styles.selectItem}>
                    <Select mode='multiple'
                      placeholder="请选择转向">
                      {turnChildren}
                    </Select>
                  </span>
                  <s>导 出</s>
                </div>
              </div>
              <div className={styles.echartsBox}>
                <ReactEcharts option={this.getOption()} style={{ height: '200px' }} />
              </div>
            </div>
          </div> */}

          <div className={styles.rightBox}>
            <div className={styles.echartsItem} />
            <div className={styles.echartsItem}>
              <div className={styles.title}>建模路口统计</div>
              <div className={styles.echartsHistogram}>
                {chartSize ? <ReactEcharts option={chartSize} style={{ height: '230px' }} /> : <Spin tip="加载中..." style={{ position: 'absolute', top: '35%', left: '45%' }} />}
              </div>
            </div>
            <div className={styles.echartsItem}>
              <div className={styles.title}>建模方案统计</div>
              <div className={styles.echartsHistogram}>
                {chartPlan ? <ReactEcharts option={chartPlan} style={{ height: '230px' }} /> : <Spin tip="加载中..." style={{ position: 'absolute', top: '35%', left: '45%' }} />}
              </div>
            </div>
          </div>
        </div>
        {videoBoxs && videoBoxs.length ?
          <div className={styles.chartsSearch} >
            <div className={styles.chartsCentent}>
              {videoBoxs.map((item, index) => {
                return (
                  <div className={styles.videoBox} key={item.url}>
                    <div className={styles.title}>
                      <div className={styles.nodeName}>{item.program_title}视频观看</div>
                      <Icon type="close" onClick={() => { this.handlevideoBoxs(index) }} style={{ fontSize: '15px', color: '#00ccff', position: 'absolute', right: '20px', top: '8px' }} />
                    </div>
                    <div className={styles.content}>
                      <video width="100%" height="100%" controls autoPlay >
                        <source src={item.url} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                )
              })}
            </div>

          </div> : null}
      </div>
    )
  }
}

export default TrafficDatas
