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
    this.navItems = [{ name: '渠化设计', url: '#/canalization' }, { name: '流量设计', url: '#/flow' }, { name: '信号设计', url: '#/singal' }, { name: '仿真配置', url: '#/allocation' }, { name: '仿真评价', url: '#/evaluate' }]
  }
  componentDidMount = () => {
    // 初始加载
    this.getDate()
    this.timer = setInterval(this.getDate, 1000)
    this.navItems.map((item, index) => {
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
    const InterPlanMsg = JSON.parse(sessionStorage.getItem('interPlanMsg'))
    const { planMsg } = InterPlanMsg
    const path = window.location.hash
    if (InterPlanMsg.planMsg) {
      if (url === '#/allocation') {
        if (planMsg.flowId && planMsg.stpId) {
          window.location.href = window.location.href.replace(path, url)
        }
        return
      }
      window.location.href = window.location.href.replace(path, url)
    } else {
      if (url === '#/evaluate') {
        window.location.href = window.location.href.replace(path, url)
      }
    }
  }
  handleSavePlan = () => {
    if (!this.props.hiddenSave) {
      this.props.handleSavePlan()
    }
  }
  render() {
    const { navItemNum } = this.state
    const { InterName } = this.props
    return (
      <div className={styles.header}>
        <div className={styles.header_left}>{InterName || '--'}</div>
        <div className={styles.header_center}>
          <div className={styles.hdcenter}>
            {
              this.navItems.map((item, index) => (
                <div
                  className={classNames({ [styles.schedule]: item.url === window.location.hash, [styles.essential]: true })}
                  key={item.name}
                  pathurl={item.url}
                  onClick={() => this.handleNavClick(item.url)}
                >
                  {navItemNum > index ? <p>{item.name}</p> : <span>{item.name}</span>}
                  {
                    index !== this.navItems.length - 1 &&
                    (navItemNum > index ? <em /> : <i />)
                  }
                </div>
              ))
            }
          </div>
        </div>
        {/* hiddenSave true 保存按钮隐藏 false/不传默认显示 */}
        <div className={classNames({
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
