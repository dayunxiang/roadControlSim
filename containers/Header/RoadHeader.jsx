import React from 'react'
import { DatePicker, Select, Radio } from 'antd'
import classNames from 'classnames'
import styles from './Header.scss'

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
class RoadHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navtime: '加载中',
    }
  }
  componentDidMount = () => {
    // 初始加载
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
    this.setState({ navtime })
  }
  render() {
    return (
      <div className={classNames({
        [styles.header]: true,
        [styles.headers]: true,
      })}
      >
        <div className={styles.header_left}>北京路与南京路</div>
        <div className={styles.header_center} style={{ left: '24%', width: 'auto', top: '25px' }}>
          <div className={styles.hdcenter}>
            <div className={styles.itemBox}>
              <div className={styles.flowGetDate}>
                <span style={{ marginLeft: '20px' }}>评价时段： </span>
                <span className={styles.flowGetTime}>
                  <DatePicker
                    style={{ minWidth: '120px' }}
                    format="HH:mm"
                    showTime
                  />
                </span>
                <span style={{ padding: '0 5px' }}>至</span>
                <span className={styles.flowGetTime}>
                  <DatePicker
                    style={{ minWidth: '120px' }}
                    format="HH:mm"
                    showTime
                  />
                </span>
              </div>
            </div>
            <div className={styles.itemDiv}>
              <span style={{ marginLeft: '20px' }}>评价类型： </span>
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
                <Select
                  mode="multiple"
                  placeholder="请选择方向"
                >
                  {directionChildren}
                </Select>
              </span>
            </div>
            <div className={styles.itemTurn}>
              <span>转 向： </span>
              <span className={styles.selectItem}>
                <Select
                  mode="multiple"
                  placeholder="请选择转向"
                >
                  {turnChildren}
                </Select>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default RoadHeader
