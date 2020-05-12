import React from 'react'
import classNames from 'classnames'
import { message } from 'antd'
import styles from '../../InterPlan/Navigation/Navigation.scss'

class AreaNavgation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.navItems = [
      { name: '区域组织方案设计', path: '/TrafficArea', limitId: 42 },
      { name: '区域信息管理', path: '/InfoManage', limitId: 44 },
      { name: '区域组织方案管理', path: '/ProManage', limitId: 43 },
    ]
  }
  handleNavGo = (path, limitId) => {
    const userLimit = JSON.parse(localStorage.getItem('userLimit'))
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
  render() {
    return (
      <div className={styles.road_administer}>
        {
          this.navItems.map(item => (
            <div
              key={item.limitId}
              className={classNames({ [styles.administer_itemclick]: this.props.location.pathname === item.path, [styles.road_administer_item]: true })}
              onClick={() => { this.handleNavGo(item.path, item.limitId) }}
            >
              <span>{item.name}</span>
              <span />
            </div>
          ))
        }
      </div>
    )
  }
}

export default AreaNavgation
