import React from 'react'
import { DatePicker, Select, Radio } from 'antd'
import styles from './Header.scss'
import classNames from 'classnames'
import { relative } from 'path'

const { Option } = Select

class AnalysisHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navtime: '加载中',
    }
  }
  componentDidMount = () => {
    //初始加载
    this.getDate()
    this.timer = setInterval(this.getDate, 1000)
  }
  componentWillUnmount = () => {
    clearInterval(this.timer)
  }
  getDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '.' + month + '.' + day + '' + ' ' + hour + ':' + minutes + ':' + seconds
    this.setState({
      navtime,
    })
  }
  render() {
    return (
      <div className={styles.header}>
        <div className={styles.header_left}>北京路与南京路</div>
        <div className={styles.header_center} style={{ left: '24%', width: 'auto', top: '25px' }}>
          <div className={styles.hdcenter}>
            <div className={styles.itemDiv}>
              <span className={styles.selectItem}>
                <Select defaultValue="1">
                  <Option value="1">方案1</Option>
                  <Option value="2">方案2</Option>
                </Select>
              </span>
            </div>
            <div className={styles.itemBox}>
              <div className={styles.flowGetDate}>
                <span style={{ marginLeft: '20px' }}>评价时段： </span>
                <span className={styles.flowGetTime}>
                  <DatePicker
                    style={{ minWidth: '130px' }}
                    format="HH:mm"
                    showTime
                  />
                </span>
                <span style={{ padding: '0 5px' }}>至</span>
                <span className={styles.flowGetTime}>
                  <DatePicker
                    style={{ minWidth: '130px' }}
                    format="HH:mm"
                    showTime
                  />
                </span>
              </div>
            </div>
            <div className={styles.itemBox} style={{ position: 'relative', top: '-6px', left: '10px' }}>
              <Radio.Group onChange={this.handleChange} defaultValue={1}>
                <Radio value={1} style={{ color: '#07eeff' }}>平均速度</Radio>
                <Radio value={2} style={{ color: '#07eeff' }}>平均延误</Radio>
                <Radio value={3} style={{ color: '#07eeff' }}>停车次数</Radio>
                <Radio value={4} style={{ color: '#07eeff' }}>行程时间</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>
        <div className={styles.header_right}>{this.state.navtime}<span /></div>
      </div>
    )
  }
}

export default AnalysisHeader
