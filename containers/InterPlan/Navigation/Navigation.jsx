import React from 'react'
import classNames from 'classnames'
import { message } from 'antd'
import styles from './Navigation.scss'


class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.navItems = [
      { name: '交通组织方案设计', path: '/roadtraffic', limitId: 38 },
      { name: '重点交通设施管理', path: '/facilitiesmana', limitId: 41 },
      { name: '交通组织方案管理', path: '/projectmana', limitId: 39 },
      { name: '路口信息管理', path: '/informationmana', limitId: 40 },
    ]
  }
  handleLocationGo = (e) => {
    const limitId = Number(e.currentTarget.getAttribute('limitid'))
    const pathName = e.currentTarget.getAttribute('pathname')
    const userLimit = JSON.parse(localStorage.getItem('userLimit'))
    const limitArr = []
    userLimit.forEach((item) => {
      limitArr.push(item.id)
    })
    if (limitArr.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      this.props.history.push(pathName)
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
              pathname={item.path}
              limitid={item.limitId}
              onClick={this.handleLocationGo}
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

export default Navigation
