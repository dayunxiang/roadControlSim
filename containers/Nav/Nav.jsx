import React from 'react'
import { Input, Menu, Dropdown, Button, Icon, Select } from 'antd'
import styles from './Nav.scss'
import getResponseDatas from '../../utlis/getResponseData'

const { Option } = Select
let timeout
let currentValue
class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navtime: '',
      navmse: '',
      navtoday: '',
      data: [],
      menu: '',
      value: undefined,
      modelValue: null,
    }
    this.urls = '/simulation/parameterInfo/list'
  }
  componentDidMount = () => {
    this.timer = setInterval(this.getDate, 1000)
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ modelValue: nextProps.modelState })
  }
  componentWillUnmount = () => {
    clearInterval(this.timer)
  }

  getDate = () => {
    const today = new Date()
    const x = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '年' + month + '月' + day + '日'
    const navmse = hour + ':' + minutes + ':' + seconds
    const navtoday = (x[today.getDay()])
    this.setState({
      navtime,
      navmse,
      navtoday,
    })
  }
  handleGoEntrance = () => {
    const hashName = window.location.hash
    window.location.href = window.location.hash.replace(hashName, '#/entrances') // entrance作为产品入口 entrnaces人民大道入口
  }
  /* handleSearch = (value) => {
    console.log(value);
    if (this.props.getSearch) {
      this.props.getSearch(value)
    }
  } */
  fake = (value) => {
    this.props.getSearch(value, (data) => {
      this.setState({ data })
    })
  }
  handleonFocus = () => {
    const { value } = this.state
    if (value == null || value == '') {
      this.handleSearch()
    }
    this.setState({ value })
  }
  handleSearch = (value = '') => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    currentValue = value
    timeout = setTimeout(this.fake.bind(null, value), 300)
  }

  handleChange = value => {
    this.setState({ value })
  }
  handlemodelState = (e) => {
    this.props.getmodelState(e)
  }
  render() {
    const { Search } = Input
    return (
      <div className={styles.navWrapper}>
        <div className={styles.navWrapper_left}>
          <span>{this.state.navtime}</span>
          <span>{this.state.navmse}</span>
          <span>{this.state.navtoday}</span>
        </div>
        {
          window.location.hash === '#/login' || window.location.hash === '#/entrance' ? '' :
            <div className={styles.navWrapper_right}>
              {window.location.hash === '#/TrafficAnalysis' || window.location.hash === '#/roadtraffic' || window.location.hash === '#/projectmana' || window.location.hash === '#/informationmana' || window.location.hash === '#/facilitiesmana' ?
                [(<div className={styles.searchNav} style={{ width: this.props.styles }} key="showSearch">
                  <Select
                    showSearch
                    value={this.state.value}
                    placeholder="搜索资源"
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    style={{ width: '100%', heght: '100%' }}
                    filterOption={false}
                    onSearch={this.handleSearch}
                    onChange={this.handleChange}
                    notFoundContent="无当前路口"
                    onFocus={this.handleonFocus}
                  >
                    {this.state.data.map((item) => {
                      return <Option key={item.nodeId} onClick={(e) => { this.props.OpenInforWindow(e, item) }}>{item.nodeName}</Option>
                    })}
                  </Select>
                </div>),
                this.state.modelValue &&
                <Select key="multiple" mode="multiple" placeholder="图  层" style={{ width: '300px', height: '22px' }} defaultValue={this.state.modelValue || []} onChange={this.handlemodelState}>
                  {
                    this.props.interColor && this.props.interColor.map((item, index) => {
                      return (
                        <Option key={item.modelState} value={item.modelState}><span className={styles.optionY} style={{ background: item.color }} />{item.nodeName}</Option>
                      )
                    })
                  }
                </Select>
                ] : null}
              <div className={styles.homepage} onClick={this.handleGoEntrance}>主&nbsp;&nbsp;页<i /></div>
            </div>
        }
      </div>
    )
  }
}

export default Nav
