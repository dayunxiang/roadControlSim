import React from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import styles from './Header.scss'


class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navtime: '加载中',
      navItemNum: 0, // 当前选中路由索引
    }
    this.navItems = [{ name: '渠化设计', url: '#/areaCanalization' }, { name: '流量设计', url: '#/areaFlow' }, { name: '信号设计', url: '#/areaSingal' }, { name: '仿真配置', url: '#/areaAllocation' }, { name: '仿真评价', url: '#/areaEvaluate' }]
  }
  componentDidMount = () => {
    // 初始加载
    this.getDate()
    this.timer = setInterval(this.getDate, 1000)
    this.navItems.forEach((item, index) => {
      if (item.url === window.location.hash) {
        this.setState({
          navItemNum: index, // 存储当前路由的索引，以判断之前路由样式
        })
      }
    })
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
  handleNavClick = (url) => {
    const areaMsg = JSON.parse(sessionStorage.getItem('areaPlanMsg'))
    const { geometryId, areaGeometryId, flowId, stpId } = areaMsg.planMsg
    if (url === '#/areaFlow' && !(geometryId || areaGeometryId)) return
    if (url === '#/areaSingal' && !flowId) return
    if (url === '#/areaAllocation' && !stpId) return
    window.location.href = url
  }
  handleSavePlan = () => {
    const { handleSavePlan, hiddenSave } = this.props
    if (!hiddenSave) {
      handleSavePlan()
    }
  }
  render() {
    const { navItemNum } = this.state
    return (
      <div className={styles.header}>
        <div className={styles.header_left}>{this.props.areaName}</div>
        <div className={styles.header_center}>
          <div className={styles.hdcenter}>
            {
              this.navItems.map((item, index) => (
                <div
                  className={classNames({ [styles.schedule]: navItemNum >= index, [styles.essential]: true })}
                  key={item.name}
                  pathurl={item.url}
                >
                  <span style={{ color: '#fff' }} onClick={() => this.handleNavClick(item.url)}>{item.name}</span>
                  {
                    index !== this.navItems.length - 1 && <em />
                  }
                </div>
              ))
            }
          </div>
        </div>
        <div
          className={classNames({
            [styles.header_right]: true,
            [styles.header_rightSave]: this.props.hiddenSave,
          })}
        >
          {this.state.navtime}<span onClick={this.handleSavePlan} />
        </div>
      </div>
    )
  }
}

export default Header
