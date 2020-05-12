import React from 'react'
import styles from './rightPop.scss'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react';
import { Icon } from 'antd';
import '../../../utlis/crossingKonvaJquery/crossing.konva.jquery-2.0.0'
import '../../../utlis/scrollTime/scrollTime.jquery.min' // 引用时间轴插件
/* const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1432521_n6pn7ili16q.js',
}) */

class RightPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      echartData: this.props.echartData || [],
      Tratime: this.props.Tratime || [],
    }
  }
  componentDidMount = () => {
    this.getScrollTime()
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.echartData !== nextProps.echartData) {
      this.setState({ echartData: nextProps.echartData })
    }
    if (this.props.Tratime !== nextProps.Tratime) {
      this.setState({ Tratime: nextProps.Tratime }, () => {
        this.getScrollTime()
      })
    }
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
  getOption = () => {
    const { echartData } = this.state
    const datas = []
    if (echartData.length) {
      datas.push(echartData[1].green)
      datas.push(echartData[1].yellow)
      datas.push(echartData[1].red)
      datas.push(echartData[1].Crimson)
    }

    let option = {
      xAxis: {
        data: ['畅通', '缓行', '拥挤', '拥堵'],
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
      grid: {
        top: 10,
        bottom: 20
      },
      series: [
        {
          name: '拥堵情况',
          type: 'bar',
          data: datas,
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
    return option;
  }
  getCrossingCvs = (num) => {
    // console.log(num)
    if (this.props.getCrossingCvs) {
      this.props.getCrossingCvs(num)
    }
  }
  // 获取当前时间
  getDate = (data) => {
    const today = new Date(data)
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return (navtime + navmse)
  }
  // 时间轴
  getScrollTime = () => {
    const { Tratime } = this.state
    const year = Tratime.split(' ')[0]
    const Starttime = Tratime.split(' ')[1]
    const d = new Date(Tratime)
    const end = new Date(d.getTime() + 60 * 60 * 1000)
    const endtime = this.getDate(end).split(' ')[1]
    // console.log(Starttime, endtime);

    const selfThis = this
    $('#timeBox').getScrollTime({
      timeShow: true, // 时间的显示
      nowDate: year,
      timeStart: '00:05:00', // 开始时间
      timeEnd: '01:00:00', // 结束时间
      paddingBoth: 30, // 左右padding 值
      plugStyle: styles, // 样式传入
      timeGap: 5, // 间隔时段
      thisDom: selfThis, // this根指向
      // borderL: "1px #333 solid", //绘制线的颜色
      // borderH: "1px blue solid", //高亮线颜色长线
    })
    for (let i = 0; i < $('time').length; i++) {
      $('time')[i].innerHTML = (i + 1) * 5
    }
  }
  getdatePicker = (bool) => {
    if (this.props.getdatePicker) {
      this.props.getdatePicker(bool)
    }
  }
  render() {
    const { echartData } = this.state
    return (
      <div className={styles.rightBox}>
        <div className={styles.rightTit}>
          基于历史数据统计预测<i onClick={() => { this.getdatePicker(true) }}>设置</i>
        </div>
        <div className={styles.roadStatus}>
          {/* <span className={styles.darkRedCol}>严重</span> */}
          <span className={styles.redCol}>{'拥堵 >0.75'}</span>
          <span className={styles.orangeCol}>拥挤&nbsp;&nbsp;0.5-0.75</span>
          <span className={styles.yellowCol}>缓行&nbsp;&nbsp;0.25-0.5</span>
          <span>畅通&nbsp;&nbsp;0-0.25</span>
        </div>
        <div className={styles.timeBoxs}>
          <div id="timeBox" className={styles.timeBox}>
            {/* <mark>播放<i /></mark> */}
            <em><i /></em>
          </div>
        </div>
        <div className={styles.line} />
        <div className={styles.title}>路段统计图</div>
        <div className={styles.echartsHistogram}>
          <ReactEcharts option={this.getOption()} style={{ height: '200px' }} />
        </div>
        <div className={styles.line} />
        <div className={styles.title}>路段拥堵</div>
        <div className={styles.topTenBox}>
          <h5 className={styles.topTitle}>
            <span>路段名称</span>
            <span>路段方向</span>
            <span>状态</span>
          </h5>
          <div className={styles.itemBox}>
            <dl>
              {echartData.length && echartData[0].map((item, index) => {
                return (<dt key={item.fname + item.tname} className={styles[this.getTraffic(item.status).class]}><s>{index + 1}</s><span style={{ color: item.status }} title={item.fname + '-' + item.tname}>{item.fname + '-' + item.tname}</span><span style={{ color: item.status }}>{this.props.getdirection(item.from_node_direction) + "-" + this.props.getdirection(item.to_node_direction)}</span><span style={{ color: item.status }}>{this.getTraffic(item.status).name}</span></dt>)
              })}
              {/* <dt><s>2</s><span>路段名称2</span><span>路段方向2</span><span>拥挤</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>3</s><span>路段名称3</span><span>路段方向3</span><span>缓行</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>4</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>5</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>6</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>7</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>8</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>9</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt>
              <dt><s>10</s><span>路段名称4</span><span>路段方向4</span><span>畅通</span><IconFont type="icon-jiantou" /></dt> */}
            </dl>
          </div>
        </div>
      </div>
    )
  }
}

export default RightPop