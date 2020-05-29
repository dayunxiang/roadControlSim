import React from 'react'
import classNames from 'classnames'
import { message } from 'antd'
import styles from './EntrancePlus.scss'

class EntrancePlus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount = () => {
    if (window.opener) {
      const userInfo = window.opener.localStorage.getItem('userInfo')
      localStorage.setItem('userInfo', userInfo)
    }
  }
  handleGoSystem = (e) => {
    const path = e.currentTarget.getAttribute('modalname')
    if (path) {
      window.open(path)
    } else {
      window.open('http://10.11.57.101:20206/simWeb/#/entrances')
    }
  }
  handleGoSystem = (e) => {
    const path = e.target.getAttribute('modalname')
    const limitId = Number(e.target.getAttribute('limit'))
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    console.log(userLimit, limitId)
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
  render() {
    return (
      <div className={styles.entranceBox}>
        <div className={styles.logoBox}>
          <div className={styles.logo} />
        </div>
        <div className={styles.modalWrapper}>
          <div className={styles.modalBg}>
            <div modalname="/roadtraffic" limit="6" className={classNames(styles.modalItem, styles.inter)} onClick={this.handleGoSystem} />
            <div modalname="/trafficArea" limit="5" className={classNames(styles.modalItem, styles.area)} onClick={this.handleGoSystem} />
            <div modalname="/trafficAnalysis" limit="4" className={classNames(styles.modalItem, styles.analysis)} onClick={this.handleGoSystem} />
            <div modalname="/trafficManage" limit="3" className={classNames(styles.modalItem, styles.manage)} onClick={this.handleGoSystem} />
            <div modalname="/trafficDatas" limit="2" className={classNames(styles.modalItem, styles.datas)} onClick={this.handleGoSystem} />
          </div>
        </div>
      </div>
    )
  }
}

export default EntrancePlus
