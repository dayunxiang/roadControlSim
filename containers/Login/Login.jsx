import React from 'react'
import { Icon, Checkbox, message } from 'antd'

import styles from './Login.scss'
import Nav from '../Nav/Nav'
import getResponseDatas from '../../utlis/getResponseData'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.loginUrl = '/simulation/sys/user/login'
    this.limitUrl = '/simulation/sys/menu/getUserMentList?userId='
    this.loginParams = {
      loginName: '',
      password: '',
    }
  }
  componentDidMount = () => {
    if (window.opener) {
      console.log(window.opener.localStorage)
    }
    document.addEventListener('keydown', this.handleEnter)
  }
  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleEnter)
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    return formData
  }
  getUserLimit = (id) => {
    getResponseDatas('post', `${this.limitUrl}${id}`).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        localStorage.setItem('userLimit', JSON.stringify(data))
      }
    })
  }
  handleLogin = () => {
    const { loginName, passWord } = this.loginParams
    if (loginName !== '' && passWord !== '') {
      getResponseDatas('post', this.loginUrl, this.getFormData(this.loginParams)).then((res) => {
        const { code, data, msg } = res.data
        if (code === 0) {
          this.getUserLimit(data.id)
          localStorage.setItem('userInfo', JSON.stringify(data))
          this.loginParams = {
            loginName: '',
            passWord: '',
          }
          this.props.history.push('/entrances')
        } else {
          message.warning(msg)
        }
      })
    }
  }
  handleEnter = (e) => {
    if (e.keyCode === 13) {
      this.handleLogin()
    }
  }
  handleUserName = (e) => {
    this.loginParams.loginName = e.target.value
  }
  handlePassWord = (e) => {
    this.loginParams.password = e.target.value
  }
  render() {
    return (
      <div className={styles.loginWrapper}>
        <Nav />
        <div className={styles.loginBox}>
          <div className={styles.title}>登录</div>
          <div className={styles.userMessage}>
            <span><Icon type="user" /></span>
            <input className={styles.userInput} placeholder="用户名" type="text" onChange={this.handleUserName} />
          </div>
          <div className={styles.userMessage}>
            <span><Icon type="lock" /></span>
            <input className={styles.userInput} placeholder="密码" type="password" onChange={this.handlePassWord} />
          </div>
          {/* <div className={styles.verificationCode}>
            <div className={styles.verification}>
              <div className={styles.codeInput}>
                <input type="text" placeholder="验证码" />
              </div>
              <div className={styles.codeShow} />
              <span className={styles.changeCode}>换一个</span>
            </div>
          </div> */}
          {/* <div className={styles.forgetPwd}>
            <div className={styles.pwdBox}>
              <span><Checkbox className={styles.remenberPwd}>记住密码</Checkbox></span>
              <span className={styles.isForget}>忘记密码 ？</span>
            </div>
          </div> */}
          <div className={styles.btnBox}>
            <div className={styles.loginBtn} onClick={this.handleLogin}>登录</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
