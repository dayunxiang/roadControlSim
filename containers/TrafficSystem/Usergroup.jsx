import React from 'react'
import classNames from 'classnames'
import { Icon, Select, Input, message, Pagination, Modal } from 'antd'
import roadStyles from '../InterPlan/Roadtraffic/Roadtraffic.scss'
import styles from './TrafficSystem.scss'
import Nav from '../Nav/Nav'
import SystemNav from './SystemNav/SystenNav'
import getResponseDatas from '../../utlis/getResponseData'
const { confirm } = Modal
const { Option } = Select
// 日志管理
class Usergroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      totalCount: 1,
      listDatas: null,
      showGroupMsg: false,
      listItems: null,
      parentGroup: null,
      userLimit: null,
      current: 1,
    }
    this.deptListUrl = '/simulation/sys/dept/listPage'
    this.addListUrl = '/simulation/sys/dept/save'
    this.updateUrl = '/simulation/sys/dept/update'
    this.deleteUrl = '/simulation/sys/dept/delete'
    this.listUrl = '/simulation/sys/dept/list'
    this.deleteParams = {
      deptIds: []
    }
    this.listParams = {
      keyword: '',
      pageNo: 1,
    }
    this.defaultparams = {
      id: '',
      deptCode: '',
      deptName: '',
      leaderName: '',
      parentId: '',
      remark: '',
      sort: '',
    }
  }
  componentDidMount = () => {
    this.getDeptList()
    this.getparentGroup()
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
  }
  getDeptList = () => {
    getResponseDatas('post', this.deptListUrl, this.getFormData(this.listParams)).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({
          listDatas: data.list,
          totalCount: data.totalCount,
          current: Number(this.listParams.pageNo)
        })
      }
    })
  }
  getparentGroup = () => {
    getResponseDatas('post', this.listUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({
          parentGroup: data,
        })
      }
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
  handleAddGroup = () => {
    this.isAdd = true
    this.defaultparams = {
      id: '',
      deptCode: '',
      deptName: '',
      leaderName: '',
      parentId: '',
      remark: '',
      sort: '',
    }
    this.setState({
      listItems: null,
      showGroupMsg: true,
    })
  }
  handleCloseGroupMsg = () => {
    this.setState({ showGroupMsg: false })
  }
  handleEditItems = (id) => {
    this.isAdd = false
    const listItem = (this.state.listDatas.filter(item => item.id === id))[0]
    this.setState({
      listItems: listItem,
      showGroupMsg: true,
    })
    Object.keys(this.defaultparams).map((item) => {
      this.defaultparams[item] = listItem[item]
    })
  }
  handleGroupMsgChange = (e, itemname) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    this.defaultparams[itemname] = value
  }
  handleAddEdit = () => {
    const { deptCode, deptName, leaderName, parentId, remark, sort } = this.defaultparams
    console.log(this.defaultparams);
    
    if (deptCode) {
      const reg = /^[0-9]\d*$/
      if (!reg.test(deptCode)) {
        message.error('请输入正确的部门编号!')
        return
      }
    } else {
      message.error('请填写部门编号!')
      return
    }
    if (!deptName) {
      message.error('请填写部门名称!')
      return
    }
    if (!leaderName) {
      message.error('请填写负责人!')
      return
    }
    if (!parentId) {
      message.error('请选择所属父部门!')
      return
    }
    if (!remark) {
      message.error('请填写备注!')
      return
    }
    if (sort) {
      const reg = /^[0-9]\d*$/
      if (!reg.test(sort)) {
        message.error('请输入正确的序号!')
        return
      }
    } else {
      message.error('请填写序号!')
      return
    }
    if (this.isAdd) {
      getResponseDatas('post', this.addListUrl, this.getFormData(this.defaultparams)).then((res) => {
        const { code, msg } = res.data
        if (code === 0) {
          /* this.listParams.keyword = ''
          this.listParams.pageNo = 1 */
          message.success('操作成功！')
          this.getDeptList()
        } else {
          message.info(msg)
        }
      })
    } else {
      getResponseDatas('post', this.updateUrl, this.getFormData(this.defaultparams)).then((res) => {
        const { code, msg } = res.data
        if (code === 0) {
          /* this.listParams.keyword = ''
          this.listParams.pageNo = 1 */
          message.success('操作成功！')
          this.getDeptList()
        } else {
          message.info(msg)
        }
      })
    }
    this.handleCloseGroupMsg()
  }
  handleDeleteItem = (id) => {
    const that = this
    this.deleteParams.deptIds.push(id)
    confirm({
      title: '确认要删除当前部门?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.deleteUrl, that.getFormData(that.deleteParams)).then((res) => {
            const { code, msg } = res.data
            if (code === 0) {
              message.info('删除成功！')
              /* that.listParams.keyword = '' */
              // this.listParams.pageNo = 1
              const { listDatas } = that.state
              if (listDatas.length === 1 && that.listParams.pageNo > 1) {
                that.listParams.pageNo = Number(that.listParams.pageNo) - 1
              }
              that.getDeptList()
              resolve()
            } else {
              message.info(msg)
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  handleKeywordChange = (e) => {
    const { value } = e.target
    this.listParams.keyword = value
  }
  handlePagination = (pageNumber) => {
    // console.log('Page: ', pageNumber)
    this.listParams.pageNo = pageNumber
    this.getDeptList()
  }
  render() {
    const { listItems, listDatas, showGroupMsg, parentGroup, totalCount, userLimit, current } = this.state
    return (
      <div className={(roadStyles.Roadtcontent)}>
        {/* 地图 */}
        <div id="mapContainer" className={classNames(roadStyles.mapContainer, styles.mapContainer)} >
          <div className={styles.syetem_bg}>
            <div className={styles.syetem_top}>
              <div className={styles.syetem_item}><span className={styles.item}>关键词</span><div className={styles.inSle}><Input placeholder="查询条件" onChange={this.handleKeywordChange} /></div></div>
              {/* <div className={styles.syetem_item}><span className={styles.item}>用户组</span>
                <div className={styles.inSle}>
                  <Select defaultValue="lucy" style={{ width: 200 }}>
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                </div>
              </div> */}
              {
                userLimit && userLimit.indexOf(31) !== -1 ?
                  <span className={styles.searchBtn} onClick={() => { this.handlePagination('1') }}>查询</span> : null
              }
              <i className={styles.line} />
            </div>
            <div className={styles.syetem_buttom}>
              {
                userLimit && userLimit.indexOf(28) !== -1 ?
                  <div className={styles.title}><span onClick={this.handleAddGroup}>+添加部门</span></div> : null
              }
              <div className={styles.listBox}>
                <div className={styles.listItems}>
                  <div className={styles.listTd} >序号</div>
                  <div className={styles.listTd} >部门编号</div>
                  <div className={styles.listTd} >部门名称</div>
                  <div className={styles.listTd} >描述</div>
                  <div className={styles.listTd} >上级部门</div>
                  <div className={styles.listTd} >部门负责人</div>
                  <div className={styles.listTd} >操作</div>
                </div>
                {
                  listDatas &&
                  listDatas.map((item, index) => {
                    return (
                      <div className={styles.listItems} key={item.id}>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item['sort']}</span></div>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item.deptCode}</span></div>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item.deptName}</span></div>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item.remark}</span></div>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item.parentName}</span></div>
                        <div className={styles.listTd} ><span className={styles.roadName}>{item.leaderName}</span></div>
                        <div className={styles.listTd} >
                          {
                            userLimit && userLimit.indexOf(30) !== -1 ?
                              <span className={styles.updateName} onClick={() => { this.handleEditItems(item.id) }}>
                                <Icon type="edit" className={styles.icon} />修改
                              </span> : null
                          }
                          {
                            userLimit && userLimit.indexOf(29) !== -1 ?
                              <span className={styles.delectName} onClick={() => { this.handleDeleteItem(item.id) }}>
                                <Icon type="close" className={styles.icon} />删除
                              </span> : null
                          }
                        </div>
                      </div>)
                  })
                }
                {
                  !!listDatas && listDatas.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
                }
              </div>
            </div>
          </div>
          <div className={styles.pagination}>
            <div className={styles.page}><span className={styles.count}>当前共{totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={totalCount} onChange={this.handlePagination} /></div>
          </div>
        </div>
        {showGroupMsg ?
          <div className={styles.traBox}>
            <div className={styles.addListBox}>
              <div className={styles.titleBox}>
                <div className={styles.title} style={{ marginRight: 15 }}><Icon type="double-right" /><span>部门信息</span></div>
                <Icon type="close" onClick={this.handleCloseGroupMsg} className={styles.close} />
              </div>
              <div className={styles.content}>
                <div className={styles.syetemItem}>
                  <span className={styles.item}>部门编号</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入部门编号" defaultValue={listItems && listItems.deptCode} onChange={(e) => { this.handleGroupMsgChange(e, 'deptCode') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>部门名称</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入部门名称" defaultValue={listItems && listItems.deptName} onChange={(e) => { this.handleGroupMsgChange(e, 'deptName') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>负责人</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入负责人" defaultValue={listItems && listItems.leaderName} onChange={(e) => { this.handleGroupMsgChange(e, 'leaderName') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>父部门</span>
                  <div className={styles.inSle}>
                    <Select defaultValue={listItems ? listItems.parentId : 0} placeholder="请选择所属用父部门" style={{ width: 300 }} onChange={(e) => { this.handleGroupMsgChange(e, 'parentId') }}>
                      <Option value={0} key={0}>请选择所属用父部门</Option>
                      {
                        !!parentGroup && parentGroup.map((item) => {
                          return (
                            <Option value={item.id} key={item.id}>{item.deptName}</Option>
                          )
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>备注</span>
                  <div className={styles.inSle}>
                    <Input maxLength={50} placeholder="请输入备注" defaultValue={listItems && listItems.remark} onChange={(e) => { this.handleGroupMsgChange(e, 'remark') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>排序</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入序号" defaultValue={listItems && listItems.sort} onChange={(e) => { this.handleGroupMsgChange(e, 'sort') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.botton} style={{ position: 'initial' }} onClick={this.handleAddEdit}>确认</span>
                  <span className={styles.botton} style={{ position: 'initial', color: '#817d7a' }} onClick={this.handleCloseGroupMsg}>取消</span>
                </div>
              </div>
            </div>
          </div> : null}
        <Nav />
        {/* <div className={navStyles.road_administer}>
          {
            this.systemItems.map(item => (
              <div
                className={classNames({
                  [navStyles.administer_itemclick]: this.props.location.pathname === item.path,
                  [navStyles.road_administer_item]: true,
                })}
                onClick={() => { this.getRoadtraffic(item.path) }}
                key={item.path}
              >
                <span>{item.item}</span>
                <span />
              </div>
            ))
          }
        </div> */}
        <SystemNav />
      </div>
    )
  }
}

export default Usergroup
