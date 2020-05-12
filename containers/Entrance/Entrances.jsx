import React from 'react'
import { Icon, Avatar, message, Input } from 'antd'
import styles from './Entrances.scss'
import getResponseDatas from '../../utlis/getResponseData'

class Entrances extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nowTime: null,
      nowMse: null,
      nowtoday: null,
      userName: null,
      password: null,
    }
    this.systemsItem = [
      { name: '路口交通组织方案设计', href: '/roadtraffic', limitId: 6 },
      { name: '区域交通组织方案设计', href: '/trafficArea', limitId: 5 },
      { name: '交通预测分析', href: '/trafficAnalysis', limitId: 4 },
      { name: '仿真资源管理', href: '/trafficManage', limitId: 3 },
      { name: '数据分析', href: '/trafficDatas', limitId: 2 },
      { name: '系统管理', href: '/trafficSystem', limitId: 1 },
    ]
    this.loginKeys = {
      password: '',
      oldPassword: '',
      id: '',
    }
    this.updatePassUrl = '/simulation/sys/user/updatePassword'
    this.logoutUrl = '/simulation/sys/user/logout'
  }
  componentDidMount = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.coustomInterval()
    this.loginKeys.id = userInfo.id
    this.setState({ userName: userInfo.userName })
  }
  componentWillUnmount = () => {
    if (this.headerTimer) {
      clearTimeout(this.headerTimer)
      this.headerTimer = null
    }
  }
  getNowDate = () => {
    const today = new Date()
    const x = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const nowTime = year + '年' + month + '月' + day + '日'
    const nowMse = hour + ':' + minutes + ':' + seconds
    const nowtoday = (x[today.getDay()])
    this.setState({
      nowTime,
      nowMse,
      nowtoday,
    })
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    // console.log(formData)
    return formData
  }
  getupdatePwd = () => {
    const { password, oldPassword, id } = this.loginKeys
    if (password === '') {
      message.error('请填写新密码！')
      return
    }
    if (oldPassword === '') {
      message.error('请再次填写新密码！')
      return
    }
    if (oldPassword !== password) {
      message.error('密码输入不一致！')
      return
    }
    getResponseDatas('post', this.updatePassUrl, this.getFormData(this.loginKeys)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        // console.log(result.data)
        this.handleClose(null)
        message.error('密码修改成功,3秒后返回登陆页面！')
        setTimeout(() => {
          this.handleLogout()
        }, 3000)
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  coustomInterval = () => {
    this.getNowDate()
    this.headerTimer = setTimeout(this.coustomInterval, 1000)
  }
  handleLogout = () => {
    getResponseDatas('post', this.logoutUrl).then((res) => {
      const { code, msg } = res.data
      if (code === 0) {
        localStorage.clear()
        this.props.history.push('/login')
      } else {
        message.warning(msg)
      }
    })
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
  handleInputChange = (e, name) => {
    this.loginKeys[name] = e.target.value
  }
  handleClose = (value) => {
    this.setState({ password: value })
  }
  render() {
    const { password } = this.state
    return (
      <div className={styles.EntrancesBox}>
        <div className={styles.entrancesHead}>
          <div className={styles.headTime} key={this.state.nowTime}>
            <span className={styles.timeSpan}>{this.state.nowTime}</span>
            <span className={styles.timeSpan}>{this.state.nowMse}</span>
            <span className={styles.timeSpan}>{this.state.nowtoday}</span>
          </div>
          <div className={styles.headUserMsg}>
            <span className={styles.userAvatar}>
              <Avatar style={{ backgroundColor: '#0085fa' }} icon="user" />
            </span>
            <span>hello, {this.state.userName}</span>
            <div className={styles.userFeture}>
              <Icon type="down" />
              <div className={styles.fetureList}>
                <div className={styles.listItems} onClick={() => { this.handleClose(true) }}>修改密码</div>
                <div className={styles.listItems} onClick={this.handleLogout}>退出</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.entrancesItem}>
          <div className={styles.menuBox}>
            {
              this.systemsItem.map(item => <div className={styles.menuItems} key={item.name} onClick={() => { this.handleGoSystem(item.href, item.limitId) }}>{item.name}</div>)
            }
          </div>
        </div>
        <div className={styles.entrancesDetails}>
          <div className={styles.menuDetails} />
        </div>
        {password ?
          <div className={styles.traBox}>
            <div className={styles.addListBox}>
              <div className={styles.titleBox}>
                <div className={styles.title} style={{ marginRight: 15 }}><Icon type="double-right" /><span>修改密码</span></div>
                <Icon type="close" onClick={() => { this.handleClose(null) }} className={styles.close} />
              </div>
              <div className={styles.content}>
                <div className={styles.syetemItem}>
                  {/*  <span className={styles.item}>输入新密码</span> */}
                  <div className={styles.inSle}>
                    <Input.Password placeholder="输入新密码" onChange={(e) => { this.handleInputChange(e, 'password') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  {/*   <span className={styles.item}>再次输入新密码</span> */}
                  <div className={styles.inSle}>
                    <Input.Password placeholder="再次输入新密码" onChange={(e) => { this.handleInputChange(e, 'oldPassword') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.botton} style={{ position: 'initial' }} onClick={this.getupdatePwd}>确认</span>
                  <span className={styles.botton} style={{ position: 'initial', color: '#817d7a' }} onClick={() => { this.handleClose(null) }}>取消</span>
                </div>
              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default Entrances
