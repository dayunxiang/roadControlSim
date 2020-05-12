import React from 'react'
import classNames from 'classnames'
import { message } from 'antd'
import navStyles from '../../InterPlan/Navigation/Navigation.scss'

class SystemNav extends React.Component {
  constructor(props) {
    super(props)
    this.stste = {}
    this.systemItems = [
      { item: '用户管理', path: '#/TrafficSystem', limitId: 7 },
      { item: '部门管理', path: '#/Usergroup', limitId: 27 },
      { item: '权限角色管理', path: '#/Jurisdiction', limitId: 17 },
      { item: '日志管理', path: '#/Journal', limitId: 32 },
      { item: '菜单管理', path: '#/TrafficMenu', limitId: 22 },
    ]
  }
  componentDidMount = () => {

  }
  getRoadtraffic = (link, limitId) => {
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    if (userLimit.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      window.location.href = link
    }
  }
  render() {
    return (
      <div className={navStyles.road_administer}>
        {
          this.systemItems.map(item => (
            <div
              className={classNames({
                [navStyles.administer_itemclick]: window.location.hash === item.path,
                [navStyles.road_administer_item]: true,
              })}
              onClick={() => { this.getRoadtraffic(item.path, item.limitId) }}
              key={item.path}
            >
              <span>{item.item}</span>
              <span />
            </div>
          ))
        }
      </div>
    )
  }
}

export default SystemNav
