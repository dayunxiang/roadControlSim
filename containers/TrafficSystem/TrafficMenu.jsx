import React from 'react'
import classNames from 'classnames'
import { Icon, Select, InputNumber, Input, message, Pagination, TreeSelect, Radio, Modal } from 'antd'
import Nav from '../Nav/Nav'
import navStyles from '../InterPlan/Navigation/Navigation.scss'
import roadStyles from '../InterPlan/Roadtraffic/Roadtraffic.scss'
import styles from './TrafficSystem.scss'
import getResponseDatas from '../../utlis/getResponseData'
import SystemNav from './SystemNav/SystenNav'

const { Option } = Select
const { TreeNode } = TreeSelect
const { confirm } = Modal
// 日志管理
class TrafficMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      totalCount: null,
      systemList: null,
      treeData: null,
      treeValue: undefined,
      dataList: null,
      userLimit: null,
      current: 1,

    }
    this.sysUser = { keyword: '', pageNo: '1' }
    this.dataList = {
      name: '',
      parentId: '',
      path: '',
      perms: '',
      sort: '',
      type: '0',
    }
    this.listUrl = '/simulation/sys/menu/listPage'
    this.listTrueUrl = '/simulation/sys/menu/listTrue' // 获取树结构
    this.saveUrl = '/simulation/sys/menu/save'
    this.updateUrl = '/simulation/sys/menu/update'
    this.deleteUrl = '/simulation/sys/menu/delete'
  }
  componentDidMount = () => {
    this.getSystemList()
    this.getlistTrue()
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
  }
  getTreeChange = (value, name, e) => {
    // console.log(value, e.triggerNode.props.eventKey, e)
    this.dataList.perms = e.triggerNode.props.eventKey
    this.dataList.parentId = value
    if (this.dataList.id == value) {
      this.dataList.parentId = '0'
    }
  }
  getlistTrue = () => {
    getResponseDatas('post', this.listTrueUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        // console.log(data)
        const das = [{
          children: data,
          id: 0,
          isDelete: 0,
          name: '顶级',
          parentId: 0,
          parentName: null,
          sort: 0,
          path: 0,
          type: 0,
        }]
        this.setState({ treeData: das })
      }
    })
  }
  getaddMenu = () => {
    this.dataList = {
      name: '',
      parentId: '0',
      path: '',
      perms: '',
      sort: '',
      type: 0,
    }
    this.setState({ dataList: this.dataList })
  }
  geterTreeNodes = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} value={item.id} key={item.id} dataRef={item}>
            {this.geterTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} {...item} />
    })

  /*  geterTreeNodes = data =>
   data.map(item => {
     if (item.children.length) {
       return (
         <TreeNode title={item.name} value={item.id} key={item.perms} dataRef={item}>
           {this.geterTreeNodes(item.children)}
         </TreeNode>
       )
     }
     return <TreeNode key={item.id} {...item} />
   }); */
  getfaciDelete = (userid) => {
    const that = this
    confirm({
      title: '确认要删除当前菜单?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.deleteUrl, that.getFormData({ menuIds: [userid] })).then((resData) => {
            if (resData.data.code === 0) {
              message.success('删除成功!')
              const { systemList } = that.state
              if (systemList.length === 1 && that.sysUser.pageNo > 1) {
                that.sysUser.pageNo = Number(that.sysUser.pageNo) - 1
              }
              that.getSystemList()
              that.getlistTrue()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  getAddUserList = () => {
    const url = this.dataList.id ? this.updateUrl : this.saveUrl
    const path = this.dataList.path.replace(/\//g, '')
    this.dataList.path = path
    this.dataList.perms = this.dataList.perms + ';' + path
    if (!this.dataList.name) {
      message.error('请填写菜单名称!')
      return
    }
    if (!this.dataList.path) {
      message.error('请填写菜单地址!')
      return
    }
    if (this.dataList['sort']) {
      const reg = /^[0-9]\d*$/
      if (!reg.test(this.dataList['sort'])) {
        message.error('请输入正确的菜单序号!')
        return
      }
    } else {
      message.error('请填写菜单序号!')
      return
    }
    /* if (!this.dataList.type) {
      message.error('请填写菜单类型!')
      return
    } */
    if (this.dataList.parentId === '') {
      message.error('请选择父级菜单!')
      return
    }
    getResponseDatas('post', url, this.getFormData(this.dataList)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        message.success('保存成功!')
        this.getSystemList()
        this.setState({ dataList: null })
      } else {
        message.error('网络异常，请稍后再试!')
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
  getSystemList = () => {
    getResponseDatas('post', this.listUrl, this.getFormData(this.sysUser)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        // console.log(result.data, 'isDelete')
        const listdata = result.data.list.filter((item) => {
          return item.isDelete == 0
        })
        this.setState({ systemList: listdata, totalCount: result.data.totalCount, current: Number(this.sysUser.pageNo) })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  handleDataLists = (item) => {
    if (item) {
      this.dataList = {
        id: item.id,
        name: item.name,
        parentId: item.parentId,
        path: item.path,
        perms: item.perms,
        sort: item['sort'],
        type: item.type,
      }
      this.setState({ dataList: item })
    } else {
      this.dataList = {
        name: '',
        parentId: '0',
        path: '',
        perms: '',
        sort: '',
        type: 0,
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
    // console.log(e.target.value)
    let value = typeof (e) === 'object' ? e.target.value : e
    if (name) {
      this.dataList[name] = value
    } else {
      this.sysUser.keyword = value
    }
  }
  render() {
    const { systemList, totalCount, treeData, treeValue, current, dataList, userLimit } = this.state
    return (
      <div className={(roadStyles.Roadtcontent)}>
        {/* 地图 */}
        <div id="mapContainer" className={classNames(roadStyles.mapContainer, styles.mapContainer)} >
          <div className={styles.syetem_bg}>
            <div className={styles.syetem_top}>
              <div className={styles.syetem_item}><span className={styles.item}>关键词</span><div className={styles.inSle}><Input onChange={(e) => { this.handleInputChange(e) }} placeholder="查询条件" /></div></div>
              {
                userLimit && userLimit.indexOf(24) !== -1 ?
                  <span className={styles.searchBtn} onClick={() => { this.handlePagination('1') }} limitid="24">查询</span> : null
              }
              <i className={styles.line} />
            </div>
            <div className={styles.syetem_buttom}>
              {
                userLimit && userLimit.indexOf(23) !== -1 ?
                  <div className={styles.title}><span onClick={this.getaddMenu} limitid="23">+添加菜单</span></div> : null
              }
              <div className={styles.listBox}>
                <div className={styles.listItems}>
                  <div className={styles.listTd} >菜单名称</div>
                  <div className={styles.listTd} >上级菜单</div>
                  <div className={styles.listTd} >创建时间</div>
                  <div className={styles.listTd} >修改时间</div>
                  <div className={styles.listTd} >显示顺序</div>
                  <div className={styles.listTd} >操作</div>
                </div>
                {!!systemList && systemList.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item + index}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.name}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.parentName ? item.parentName : item.name}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.createTime}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.updateTime}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item['sort']}</span></div>
                      <div className={styles.listTd} >
                        {
                          userLimit && userLimit.indexOf(25) !== -1 ?
                            <span className={styles.updateName} onClick={() => { this.handleDataLists(item) }} limitid="25">
                              <Icon type="edit" className={styles.icon} />修改
                            </span> : null
                        }
                        {
                          userLimit && userLimit.indexOf(26) !== -1 ?
                            <span className={styles.delectName} onClick={() => { this.getfaciDelete(item.id) }} limitid="26">
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
        <Nav />
        {dataList ?
          <div className={styles.traBox}>
            <div className={styles.addListBox}>
              <div className={styles.titleBox}>
                <div className={styles.title} style={{ marginRight: 15 }}><Icon type="double-right" /><span>菜单信息</span></div>
                <Icon type="close" onClick={() => { this.handleDataLists(null) }} className={styles.close} />
              </div>
              <div className={styles.content}>
                <div className={styles.syetemItem}>
                  <span className={styles.item}>菜单名称</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入菜单名称" defaultValue={dataList.name} onChange={(e) => { this.handleInputChange(e, 'name') }} />
                  </div>
                </div>
                {/* <div className={styles.syetemItem}>
                  <span className={styles.item}>菜单编号</span>
                  <div className={styles.inSle}>
                    <Input placeholder="请输入登陆名称" onChange={(e) => { this.handleInputChange(e, 'loginName') }} />
                  </div>
                </div> */}
                <div className={styles.syetemItem}>
                  <span className={styles.item}>菜单地址</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入菜单地址" defaultValue={dataList.path} onChange={(e) => { this.handleInputChange(e, 'path') }} />
                  </div>
                </div>

                <div className={styles.syetemItem}>
                  <span className={styles.item}>菜单序号</span>
                  <div className={styles.inSle}>
                    <Input maxLength={18} placeholder="请输入菜单序号" defaultValue={dataList['sort']} onChange={(e) => { this.handleInputChange(e, 'sort') }} />
                  </div>
                </div>
                <div className={styles.syetemItem}>
                  <span className={styles.item}>菜单类型</span>
                  <div className={styles.inSle}>
                    <Radio.Group defaultValue={dataList.type} onChange={(e) => { this.handleInputChange(e, 'type') }}>
                      <Radio value={0}>目录</Radio>
                      <Radio value={1}>菜单</Radio>
                      <Radio value={2}>按钮</Radio>
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.syetemItem}><span className={styles.item}>父级菜单</span>
                  <div className={styles.inSle}>
                    {treeData ?
                      <TreeSelect
                        style={{ width: '100%' }}
                        defaultValue={dataList.parentId}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="请选择父级菜单"
                        allowClear
                        treeDefaultExpandAll
                        onChange={this.getTreeChange}
                      >
                        {this.geterTreeNodes(treeData)}
                      </TreeSelect > : null}
                  </div>
                </div>

                <div className={styles.syetemItem}>
                  <span className={styles.botton} style={{ position: 'initial' }} onClick={this.getAddUserList}>确认</span>
                  <span className={styles.botton} style={{ position: 'initial', color: '#817d7a' }} onClick={() => { this.handleDataLists(null) }}>取消</span>
                </div>
              </div>
            </div>
          </div> : null}
        <SystemNav />
      </div>
    )
  }
}

export default TrafficMenu
