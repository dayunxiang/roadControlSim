import React from 'react'
import classNames from 'classnames'
import { Icon, Select, Input, message, Pagination } from 'antd'
import Nav from '../Nav/Nav'
import navStyles from '../InterPlan/Navigation/Navigation.scss'
import roadStyles from '../InterPlan/Roadtraffic/Roadtraffic.scss'
import styles from './TrafficSystem.scss'
import SystemNav from './SystemNav/SystenNav'
import getResponseDatas from '../../utlis/getResponseData'

const { Option } = Select
// 日志管理
class Journal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      current: 1,
    }
    this.sysUser = {
      pageNo: 1,
      keyword: '',
    }
    this.listUrl = '/simulation/log/list'
  }
  componentDidMount = () => {
    this.getSystemList()
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
  handlePagination = (pageNumber) => {
    this.sysUser.pageNo = pageNumber
    this.getSystemList()
  }
  getDate = (data) => {
    const today = new Date(data)
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return navtime + navmse
  }
  handleInputChange = (e, name) => {
    this.sysUser[name] = e.target.value
  }
  render() {
    const { systemList, totalCount, current } = this.state
    return (
      <div className={(roadStyles.Roadtcontent)}>
        {/* 地图 */}
        <div id="mapContainer" className={classNames(roadStyles.mapContainer, styles.mapContainer)} >
          <div className={styles.syetem_bg}>
            <div className={styles.syetem_top}>
              <div className={styles.syetem_item}>
                <span className={styles.item}>关键词</span>
                <div className={styles.inSle}>
                  <Input placeholder="查询条件" onChange={(e) => { this.handleInputChange(e, 'keyword') }} />
                </div>
              </div>
              {/*  <div className={styles.syetem_item}><span className={styles.item}>用户组</span>
                <div className={styles.inSle}>
                  <Select defaultValue="lucy" style={{ width: 200 }}>
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                  </Select>
                </div>
              </div> */}
              <span className={styles.searchBtn} onClick={() => { this.handlePagination('1') }}>查询</span>
              <i className={styles.line} />
            </div>
            <div className={styles.syetem_buttom}>
              <div className={styles.title} />
              <div className={styles.listBox}>
                <div className={styles.listItems}>
                  <div className={styles.listTd} >日志编号</div>
                  <div className={styles.listTd} >用户名称</div>
                  <div className={styles.listTd} >操作内容</div>
                  <div className={styles.listTd} >网络地址</div>
                  <div className={styles.listTd} >操作时间</div>
                </div>
                {!!systemList && systemList.map((item) => {
                  return (
                    <div className={styles.listItems} key={item.username + item.id}>
                      <div className={styles.listTd} ><span className={styles.username}>{item.id}</span></div>
                      <div className={styles.listTd} ><span className={styles.username}>{item.username}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.operation}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.ip}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.getDate(item.createDate)}</span></div>
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
        <SystemNav />
      </div >
    )
  }
}

export default Journal
