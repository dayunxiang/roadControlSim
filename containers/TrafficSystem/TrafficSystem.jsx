import React from 'react'
import classNames from 'classnames'
import { Icon, Select, Input, message, Pagination, Modal } from 'antd'
import roadStyles from '../InterPlan/Roadtraffic/Roadtraffic.scss'
import styles from './TrafficSystem.scss'
import Nav from '../Nav/Nav'
import SystemNav from './SystemNav/SystenNav'
import getResponseDatas from '../../utlis/getResponseData'

const { Option } = Select
const { confirm } = Modal
// 系统管理
class TrafficSystem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      systemList: null,
      totalCount: 1,
      depList: null,
      roleList: null,
      dataList: null,
      userLimit: null,
      current: 1,
    }
    this.sysUser = {
      pageNo: 1,
      keyword: '',
    }
    this.dataList = {
      address: '',
      avatar: '',
      deptIds: '',
      email: '',
      loginName: '',
      password: '123456',
      phone: '',
      roleIds: '',
      status: 0,
      userName: '',
    }
    this.listUrl = '/simulation/sys/user/list' // 获取列表
    this.deptUrl = '/simulation/sys/dept/list' // 获取用户组
    this.deleteUrl = '/simulation/sys/user/delete' // 删除
    this.roleUrl = '/simulation/sys/role/list' // 获取角色
    this.userUrl = '/simulation/sys/user/getUser'
    this.saveUrl = '/simulation/sys/user/save'
    this.updateUrl = '/simulation/sys/user/update'
    this.resetPassUrl = '/simulation/sys/user/resetPassword'
  }
  componentDidMount = () => {
    // 获取用户列表
    this.getSystemList()
    // 获取用户组信息
    this.getSystemdep()
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    // console.log(userLimit)
    this.setState({ userLimit })
  }
  getSystemdep = () => {
    // 获取用户
    getResponseDatas('post', this.deptUrl).then((res) => {
      const result = res.data
      if (result.code === 0) {
        this.setState({ depList: result.data })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
    // 获取角色
    getResponseDatas('post', this.roleUrl).then((res) => {
      const result = res.data
      if (result.code === 0) {
        const roleList = (result.data.filter(item => item.isDelete === 0))
        this.setState({ roleList })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  getAddUserList = () => {
    const url = this.dataList.id ? this.updateUrl : this.saveUrl
    if (!this.dataList.userName) {
      message.error('请填写用户名称!')
      return
    }
    if (!this.dataList.loginName) {
      message.error('请填写登陆名称!')
      return
    }
    /* if (!this.dataList.password) {
      message.error('请填写登陆密码!')
      return
    } */
    if (this.dataList.phone) {
      const reg = /^[0-9]\d*$/
      if (!reg.test(this.dataList.phone)) {
        message.error('请输入正确的厂家电话')
        return
      }
    } else {
      message.error('请填写联系电话!')
      return
    }
    if (this.dataList.email) {
      const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (!reg.test(this.dataList.email)) {
        message.error('请填写正确的电子邮箱!')
        return
      }
    } else {
      message.error('请填写电子邮箱!')
      return
    }
    if ((!this.dataList.deptIds) || (!this.dataList.deptIds.length)) {
      message.error('请选择用户组!')
      return
    }
    if ((!this.dataList.roleIds) || (!this.dataList.roleIds.length)) {
      message.error('请选择用户角色!')
      return
    }
    getResponseDatas('post', url, this.getFormData(this.dataList)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        message.success('保存成功!')
        this.getSystemList()
        this.setState({ dataList: null })
      } else {
        message.error(result.msg)
      }
    })
  }

  getfaciDelete = (userid) => {
    const that = this
    confirm({
      title: '确认要删除当前用户?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.deleteUrl, that.getFormData({ userIds: [userid] })).then((resData) => {
            if (resData.data.code === 0) {
              const { systemList } = that.state
              message.success('删除成功!')
              if (systemList.length === 1 && that.sysUser.pageNo > 1) {
                that.sysUser.pageNo = Number(that.sysUser.pageNo) - 1
              }
              that.getSystemList()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  getresetPwd = (userid) => {
    const that = this
    confirm({
      title: '确认要重置当前用户密码?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.resetPassUrl, that.getFormData({ id: [userid] })).then((resData) => {
            if (resData.data.code === 0) {
              message.success('重置密码成功!')
              that.getSystemList()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
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

  getSystemList = () => {
    getResponseDatas('post', this.listUrl, this.getFormData(this.sysUser)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        // console.log(result.data)
        this.setState({ systemList: result.data.list, totalCount: result.data.totalCount, current: Number(this.sysUser.pageNo) })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  getAddUser = () => {
    const dataList = {
      id: '',
      address: '',
      avatar: '',
      deptId: '',
      email: '',
      loginName: '',
      password: '1',
      phone: '',
      roleId: '',
      status: 0,
      userName: '',
    }
    this.setState({ dataList })
  }
  handleDataLists = (id) => {
    if (id) {
      getResponseDatas('post', this.userUrl, this.getFormData({ type: 'id', value: id })).then((res) => {
        const result = res.data
        if (result.code === 0) {
          if (Object.keys(result.data).length) {
            // console.log(this.dataList);
            this.dataList = result.data
            /* this.dataList.id = result.data.id */
            this.dataList.deptIds = [result.data.deptId]
            /* this.dataList.userName = result.data.userName */
            this.dataList.roleIds = [result.data.roleId]
            this.setState({ dataList: result.data })
          } else {
            message.error('查无数据！')
          }
        } else {
          message.error('网络异常，请稍后再试!')
        }
      })
    } else {
      this.dataList = {
        address: '',
        avatar: '',
        deptIds: [],
        email: '',
        loginName: '',
        password: '1',
        phone: '',
        roleIds: [],
        status: 0,
        userName: '',
      }
      this.setState({ dataList: null })
    }
  }
  handlePagination = (pageNumber) => {
    // console.log('Page: ', pageNumber)
    this.sysUser.pageNo = pageNumber
    this.getSystemList()
  }
  handleInputChange = (e, name) => {
    if (name) {
      this.dataList[name] = e.target.value
    } else {
      this.sysUser.keyword = e.target.value
    }
  }
  handleSetChange = (name, value) => {
    this.dataList[name] = [value]
    // console.log(name, value, this.dataList)
  }
  render() {
    const { systemList, totalCount, depList, roleList, dataList, userLimit, current } = this.state
    return (
      <div className={(roadStyles.Roadtcontent)}>
        {/* 地图 */}
        <div id="mapContainer" className={classNames(roadStyles.mapContainer, styles.mapContainer)} >
          <div className={styles.syetem_bg} ref={(input) => { this.userLimitBox = input }}>
            <div className={styles.syetem_top}>
              <div className={styles.syetem_item}><span className={styles.item}>关键词</span>
                <div className={styles.inSle}><Input placeholder="查询条件" onChange={this.handleInputChange} /></div>
              </div>
              {/* <div className={styles.syetem_item}><span className={styles.item}>用户组</span>
                <div className={styles.inSle}>
                  <Select defaultValue="lucy" style={{ width: 200 }} onChange={this.handleSetChange}>
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                </div>
              </div> */}
              {
                userLimit && userLimit.indexOf(13) !== -1 ?
                  <span className={styles.searchBtn} onClick={() => { this.handlePagination('1') }} limitid="13">查询</span> : null
              }
              <i className={styles.line} />
            </div>
            <div className={styles.syetem_buttom}>
              {
                userLimit && userLimit.indexOf(14) !== -1 ?
                  <div className={styles.title}><span onClick={this.getAddUser} limitid="14">+添加用户</span></div> : null
              }
              <div className={styles.listBox}>
                <div className={styles.listItems}>
                  <div className={styles.listTd} >用户编号</div>
                  <div className={styles.listTd} >用户名称</div>
                  <div className={styles.listTd} >登陆名称</div>
                  <div className={styles.listTd} >所属用户组</div>
                  <div className={styles.listTd} >权限角色</div>
                  <div className={styles.listTd} >用户创建时间</div>
                  <div className={styles.listTd} >最后一次登陆客户机时间</div>
                  <div className={styles.listTd} >用户状态</div>
                  <div className={styles.listTd} >操作</div>
                </div>
                {!!systemList && systemList.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item.id + index}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.id}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.userName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.loginName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deptName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roleName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.createTime}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.lastTime}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.status ? '已禁用' : '已启用'}</span></div>
                      <div className={styles.listTd} >
                        <span className={styles.delectName} onClick={() => { this.getresetPwd(item.id) }}>
                          <Icon type="reload" className={styles.icon} />重置密码
                        </span>
                        {
                          userLimit && userLimit.indexOf(16) !== -1 ?
                            <span className={styles.updateName} onClick={() => { this.handleDataLists(item.id) }} limitid="16">
                              <Icon type="edit" className={styles.icon} />修改
                            </span> : null
                        }
                        {
                          userLimit && userLimit.indexOf(15) !== -1 ?
                            <span className={styles.delectName} onClick={() => { this.getfaciDelete(item.id) }} limitid="15">
                              <Icon type="close" className={styles.icon} />删除
                            </span> : null
                        }
                      </div>
                    </div>)
                })}
                {
                  !!systemList && systemList.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
                }
              </div>
            </div>
          </div>
          <div className={styles.pagination}>
            <div className={styles.page}><span className={styles.count}>当前共{totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={totalCount} onChange={this.handlePagination} /></div>
          </div>
        </div>
        {dataList ?
          <div className={styles.traBox}>
            <div className={styles.addListBox}>
              <div className={styles.titleBox}>
                <div className={styles.title} style={{ marginRight: 15 }}><Icon type="double-right" /><span>用户信息</span></div>
                <Icon type="close" onClick={() => { this.handleDataLists(null) }} className={styles.close} />
              </div>
              <div className={styles.content}>
                {/* <div className={styles.syetemItem}>
                  <span className={styles.item}>用户编号</span>
                  <div className={styles.inSle}>
                    <Input placeholder="请输入用户编号" disabled={dataList.id ? true : false} defaultValue={dataList.id} onChange={this.handleInputChange} />
                  </div>
                </div> */}
                <div className={styles.syetemItem}>
                  <span className={styles.item}>用户名称</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入用户名称" defaultValue={dataList.userName} onChange={(e) => { this.handleInputChange(e, 'userName') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.item}>登陆名称</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入登陆名称" disabled={dataList.id } defaultValue={dataList.loginName} onChange={(e) => { this.handleInputChange(e, 'loginName') }} />
                  </div>
                </div>
                {/* <div className={styles.syetemItem}>
                  <span className={styles.item}>登陆密码</span>
                  <div className={styles.inSle}>
                    <Input placeholder="请输入登陆密码" defaultValue={dataList.password} onChange={(e) => { this.handleInputChange(e, 'password') }} />
                  </div>
                </div> */}
                <div className={styles.syetemItem}>
                  <span className={styles.item}>电子邮箱</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入电子邮箱" defaultValue={dataList.email} onChange={(e) => { this.handleInputChange(e, 'email') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.item}>联系电话</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入联系电话" defaultValue={dataList.phone} onChange={(e) => { this.handleInputChange(e, 'phone') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>所属用户组</span>
                  <div className={styles.inSle}>
                    <Select defaultValue={dataList.deptId} placeholder="请输入所属用户组" style={{ width: 300 }} onChange={(e) => { this.handleSetChange('deptIds', e) }}>
                      <Option value="">请选择所属用户组</Option>
                      {
                        !!depList && depList.map((item, index) => {
                          return (<Option value={item.id} key={item.deptCode + index}>{item.deptName}</Option>)
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>用户角色</span>
                  <div className={styles.inSle}>
                    <Select defaultValue={dataList.roleId} placeholder="用户角色" style={{ width: 300 }} onChange={(e) => { this.handleSetChange('roleIds', e) }}>
                      <Option value="">请选择用户角色</Option>
                      {
                        !!roleList && roleList.map((item, index) => {
                          return (<Option value={item.id} key={item.id + index}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.botton} style={{ position: 'initial' }} onClick={this.getAddUserList}>确认</span>
                  <span className={styles.botton} style={{ position: 'initial', color: '#817d7a' }} onClick={() => { this.handleDataLists(null) }}>取消</span>
                </div>
              </div>
            </div>
          </div> : null}
        <Nav />
        <SystemNav />
      </div>
    )
  }
}

export default TrafficSystem
