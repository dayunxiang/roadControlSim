import React from 'react'
import { message } from 'antd'
import styles from './StaticEntrance.scss'

class StaticEntrance extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.modalItems = [
      { name: '路口交通组织方案设计', href: '/roadtraffic', limitId: 6, clsname: 'traffic' },
      { name: '区域交通组织方案设计', href: '/trafficArea', limitId: 5, clsname: 'trafficArea' },
      { name: '交通预测分析', href: '/trafficAnalysis', limitId: 4, clsname: 'trafficAnalysis' },
      { name: '仿真资源管理', href: '/trafficManage', limitId: 3, clsname: 'trafficManage' },
      { name: '数据分析', href: '/trafficDatas', limitId: 2, clsname: 'trafficDatas' },
      // { name: '系统管理', href: '/trafficSystem', limitId: 1 },
    ]
  }
  componentDidMount = () => {
    if (window.opener) {
      const userInfo = window.opener.localStorage.getItem('userInfo')
      localStorage.setItem('userInfo', userInfo)
    }
  }
  handleGoSystem = (path, limitId) => {
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    if (userLimit.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      const pathUrl = []
      limitArr.forEach((item) => {
        if (item.parentId === limitId) {
          pathUrl.push(item.path)
        }
      })
      if (pathUrl.length === 0) {
        const limitItem = (limitArr.filter(item => item.id === limitId))[0]
        pathUrl.push(limitItem.path)
      }
      this.props.history.push(pathUrl[0])
    }
  }
  handleGoMainPage = () => {
    window.location.href = 'http://39.100.128.220:30000/road/control/system/#/entrance'
  }
  render() {
    return (
      <div className={styles.staticEntrance}>
        <div className={styles.logout} onClick={this.handleGoMainPage}>返回主页</div>
        {
          this.modalItems.map(item => (
            <div className={styles.modalItemBox} sysname={item.path} onClick={() => { this.handleGoSystem(item.href, item.limitId) }}>
              <div className={styles[item.clsname]} />
              <p>{item.name}</p>
            </div>
          ))
        }
      </div>
    )
  }
}

export default StaticEntrance
