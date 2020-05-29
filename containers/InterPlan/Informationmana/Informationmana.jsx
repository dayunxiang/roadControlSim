import React from 'react'
import { Menu, Dropdown, Button, Icon, Select, Input, message, Modal, Tree } from 'antd'
import classNames from 'classnames'
import styles from './Informationmana.scss'
import Navigation from '../Navigation/Navigation'
import Nav from '../../Nav/Nav'
import $ from 'jquery'
import getResponseDatas from '../../../utlis/getResponseData'
import mapStyles from '../../../utlis/styles_2301'

/* 路口信息管理 */
const { Option } = Select
const { TreeNode, DirectoryTree } = Tree
const { confirm } = Modal
class Informationmana extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaAndNodeList: null,
      interPlanMsg: null,
      listDrop: null,
      codeInfo: null,
      directionData: null,
      droplist: null,
      inmainMap: false,
      IngetLngLat: null,
      droproad: null,
      modelState: [0, 100],
      interColor: [
        {
          modelState: 0,
          nodeName: '灰点',
          color: '#ccc',
        },
        {
          modelState: 100,
          nodeName: '绿点',
          color: '#00E500',
        }]
    }
    this.areaAndNode = {
      cityId: '1',
      searchKey: '',
    }
    this.markers = []
    this.nodeInfo = {
      departmentId: '', // 管理单位
      districtId: '', // 区域编号
      inputIntegrity: '', // 录入信息占比
      maxCycle: '', // 信号最大周期
      minCycle: '', // 信号最小周期
      nodeId: '', // 路口编号
      nodeName: '', // 路口名称
      relation: [],
      unitLatitude: '', // 纬度
      unitLongitude: '', // 经度
      unitShape: '', // 路口形状
      yellowTime: '', // 黄灯时间
    }
    this.cityId = '1'
    this.dropUrl = '/simulation/road/info/list/drop'
    this.manageUrl = '/simulation/nodeInfo/list/manage/1'
    this.interDetails = '/simulation/nodeInfo/get/manage/'
    this.areaAndNodeUrl = '/simulation/district/list/districtAndNode/' + this.cityId // 根据城市ID获取业务区域和区域下的路口'
    this.listDropUrl = '/simulation/district/listDrop/1' // 查询区域下拉框'
    this.codeInfoUrl = '/simulation/code/list/codeInfo/' // 获取
    this.droplistUrl = '/simulation/nodeInfo/get/drop/list' // 所有路口集合（下拉）'
    this.addmanageUrl = '/simulation/nodeInfo/add/manage' // 新增路口'
    this.updatemanageUrl = '/simulation/nodeInfo/update/manage' // 修改路口'
    this.deletemanageUrl = '/simulation/nodeInfo/delete/manage/' // 根据路口ID，删除路口'
  }
  componentDidMount = () => {
    // 加载地图
    this.renderMineMap()
    // 获取右侧列表
    this.getareaAndNode()
  }
  componentWillUnmount = () => {

  }

  // 获取右侧列表
  getareaAndNode = (callback) => {
    getResponseDatas('get', this.areaAndNodeUrl, this.areaAndNode).then((resData) => {
      if (resData.data.code === 200) {
        if (callback) {
          let content = []
          resData.data.content.forEach((item) => {
            item.node.forEach(items => {
              content.push(items)
            })
          })
          callback(content)
        } else {
          this.setState({ areaAndNodeList: resData.data.content })
        }
      }
    })
  }
  // 查询
  getSearch = (value, callback) => {
    this.areaAndNode.searchKey = value
    this.getareaAndNode(callback)
  }
  // 获取路口集合
  getlistDrop = () => {
    getResponseDatas('get', this.listDropUrl).then((resData) => {
      if (resData.data.code === 200) {
        this.setState({ listDrop: resData.data.content })
      }
    })
  }
  // 获取路口形状
  getcodeInfo = () => {
    getResponseDatas('get', this.codeInfoUrl + '1').then((resData) => {
      if (resData.data.code === 200) {
        this.setState({ codeInfo: resData.data.content })
      }
    })
  }
  // 获取路口形状
  getdroplist = () => {
    getResponseDatas('get', this.droplistUrl).then((resData) => {
      if (resData.data.code === 200) {
        this.setState({ droplist: resData.data.content })
      }
    })
  }
  // 获取路口方向
  getdirection = () => {
    getResponseDatas('get', this.codeInfoUrl + '2').then((resData) => {
      if (resData.data.code === 200) {
        this.setState({ directionData: resData.data.content })
      }
    })
  }
  getdroproad = () => {
    getResponseDatas('get', this.dropUrl).then((resData) => {
      if (resData.data.code === 200) {
        this.setState({ droproad: resData.data.content })
      }
    })
  }
  // 获取左侧列表
  getinterDetails = (value, data) => {
    this.getdroproad()
    // 获取行政区域下拉
    this.getlistDrop()
    // 获取路口形状下拉
    this.getcodeInfo()
    // 获取路口方向
    this.getdirection()
    // 获取路口形状
    this.getdroplist()
    if (value && data) {
      let datas = data
      if (data.node) {
        datas = data.node.props.item
      }
      if (!datas) { return }
      const { modelState } = this.state
      if (modelState.includes(Number(this[datas.nodeId + 'input']))) {
        // 编辑时的请求
        if (datas.nodeId) {
          getResponseDatas('get', this.interDetails + datas.nodeId).then((resData) => {
            if (resData.data.code === 200) {
              this.map.panTo([datas.unitLongitude, datas.unitLatitude])
              this.setState({ interPlanMsg: resData.data.content, visible: true, IngetLngLat: [datas.unitLongitude, datas.unitLatitude] })
            }
          })
          const el = this[datas.nodeId]
          const p = this[datas.nodeId + 'p']
          const bgColor = this[datas.nodeId + 'color']
          if (this.markerId) {
            document.getElementById(this.markerId).innerHTML = ''
          }
          /* this.markerId = e.target.getAttribute('id') */
          this.markerId = el.children[1].id
          const p1 = document.createElement('div')
          const p2 = document.createElement('div')
          const p3 = document.createElement('div')
          const p4 = document.createElement('div')
          p2.style['background-color'] = bgColor
          p3.style['background-color'] = bgColor
          p4.style['background-color'] = bgColor
          p1.className = styles.inner
          p2.className = styles.avatar
          p3.className = classNames(styles.container, styles.inner)
          p4.className = classNames(styles.outter, styles.inner)
          p.appendChild(p1)
          p.appendChild(p2)
          p.appendChild(p3)
          p.appendChild(p4)
          el.appendChild(p)
        }
      } else {
        message.warning('当前路口已隐藏')
      }
    } else {
      // 新建的请求
      this.setState({ interPlanMsg: this.nodeInfo })
    }
  }

  // 新增点位
  getaddmanage = () => {
    const { interPlanMsg } = this.state
    if (interPlanMsg.nodeName == '') {
      message.warning('请填写路口名称')
      return
    }
    if (interPlanMsg.unitLatitude == '') {
      message.warning('请填写经度')
      return
    }
    if (interPlanMsg.unitLatitude == '') {
      message.warning('请填写纬度')
      return
    }
    if (interPlanMsg.unitLongitude == '') {
      message.warning('请填写纬度')
      return
    }
    if (interPlanMsg.districtId == '') {
      message.warning('请选择行政区域')
      return
    }
    if (interPlanMsg.departmentId == '') {
      message.warning('请选择管理单位')
      return
    }
    if (interPlanMsg.unitShape == '') {
      message.warning('请选择路口形状')
      return
    }
    if (interPlanMsg.maxCycle == '') {
      message.warning('请填写最大周期')
      return
    }
    if (interPlanMsg.minCycle == '') {
      message.warning('请填写最小周期')
      return
    }
    if (interPlanMsg.yellowTime == '') {
      message.warning('请填写黄灯时间')
      return
    }

    for (let i = 0; i < interPlanMsg.relation.length; i++) {
      let itemData = interPlanMsg.relation[i]
      if (itemData.fromNodeDirection === '') {
        message.warning(`请选择第${i + 1}行路口方向`)
        return
      }
      if (itemData.roadId === '') {
        message.warning(`请选择第${i + 1}行所属道路`)
        return
      }
      if (itemData.toNodeId == '') {
        message.warning(`请选择第${i + 1}行流向路口`)
        return
      }
      if (itemData.toNodeDirection == '') {
        message.warning(`请选择第${i + 1}行流向路口方向`)
        return
      }
    }
    getResponseDatas('post', this.addmanageUrl, this.state.interPlanMsg).then((resData) => {
      if (resData.data.code === 200) {
        this.getmarkersState()
        this.getareaAndNode()
        this.setState({ interPlanMsg: null, inmainMap: false })
      }
      this.promptDialogBox(resData.data.code, resData.data.content)
    })
  }
  // 修改点位
  getupdatemanage = () => {
    const { interPlanMsg } = this.state
    if (interPlanMsg.nodeName == '') {
      message.warning('请填写路口名称')
      return
    }
    if (interPlanMsg.unitLatitude == '') {
      message.warning('请填写经度')
      return
    }
    if (interPlanMsg.unitLatitude == '') {
      message.warning('请填写纬度')
      return
    }
    if (interPlanMsg.unitLongitude == '') {
      message.warning('请填写纬度')
      return
    }
    if (interPlanMsg.districtId == '') {
      message.warning('请选择行政区域')
      return
    }
    if (interPlanMsg.departmentId == '') {
      message.warning('请选择管理单位')
      return
    }
    if (interPlanMsg.unitShape == '') {
      message.warning('请选择路口形状')
      return
    }
    if (interPlanMsg.maxCycle == '') {
      message.warning('请填写最大周期')
      return
    }
    if (interPlanMsg.minCycle == '') {
      message.warning('请填写最小周期')
      return
    }
    if (interPlanMsg.yellowTime == '') {
      message.warning('请填写黄灯时间')
      return
    }
    for (let i = 0; i < interPlanMsg.relation.length; i++) {
      let itemData = interPlanMsg.relation[i]
      if (itemData.fromNodeDirection == '') {
        message.warning(`请选择第${i + 1}行路口方向`)
        return
      }
      if (itemData.roadId === '') {
        message.warning(`请选择第${i + 1}行所属道路`)
        return
      }
      if (itemData.toNodeId === '') {
        message.warning(`请选择第${i + 1}行流向路口`)
        return
      }
      if (itemData.toNodeDirection == '') {
        message.warning(`请选择第${i + 1}行流向路口方向`)
        return
      }
    }
    getResponseDatas('put', this.updatemanageUrl, this.state.interPlanMsg).then((resData) => {
      if (resData.data.code === 200) {
        this.getmarkersState()
        this.getareaAndNode()
        this.setState({ interPlanMsg: null, inmainMap: false })
      }
      this.promptDialogBox(resData.data.code, resData.data.content)
    })
  }
  // 删除点位
  getdeletemanage = (nodeId) => {
    const that = this
    confirm({
      title: '温馨提示',
      content: '删除当前路口，路口下的渠化、流量、信号、仿真方案都会被删除，确认删除当前路口?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve, reject) => {
          getResponseDatas('delete', that.deletemanageUrl + nodeId).then((resData) => {
            if (resData.data.code === 200) {
              that.getmarkersState()
              that.getareaAndNode()
              that.setState({ interPlanMsg: null, inmainMap: false })
              resolve()
            }
            if (resData.data.code === 201) {
              resolve()
            }
            that.promptDialogBox(resData.data.code, resData.data.content)
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 添加
  getAddlistItem = () => {
    const { interPlanMsg } = this.state
    const { relation } = interPlanMsg
    const relationData = relation[relation.length - 1]
    if (relationData) {
      if (relationData.fromNodeDirection == '') {
        message.warning(`请选择路口方向`)
        return
      }
      if (relationData.roadId === '') {
        message.warning(`请选择所属道路`)
        return
      }
      if (relationData.toNodeId === '') {
        message.warning(`请选择第流向路口`)
        return
      }
      if (relationData.toNodeDirection == '') {
        message.warning(`请选择流向路口方向`)
        return
      }
    }
    const obj = {
      distance: '', // 距离
      fromNodeDirection: '', // 流入路口相对方向
      fromNodeId: '', // 流入路口编号
      roadId: '', // 道路编号
      toNodeDirection: '', // 流出路口相对方向
      toNodeId: '', // 流出路口
    }
    if (interPlanMsg) {
      interPlanMsg.relation.push(obj)
      this.setState({ interPlanMsg })
    } else {
      this.setState({ interPlanMsg: this.nodeInfo })
    }
  }
  // 删除
  getRemlistItem = (index) => {
    const { interPlanMsg } = this.state
    if (interPlanMsg && interPlanMsg.relation) {
      interPlanMsg.relation.splice(index, 1)
      this.setState({ interPlanMsg })
    }
  }
  getlistItemList = () => {
    this.setState({ interPlanMsg: this.nodeInfo })
  }
  // 获取点坐标
  getmarkersState = () => {
    getResponseDatas('get', this.manageUrl).then((res) => {
      if (res.data.code === 200) {
        const markerDatas = res.data.content
        if (this.markers.length) {
          this.markers.forEach((item) => {
            item.remove()
          })
          this.markers = []
        }
        markerDatas.forEach((item, index) => {
          if (this.state.modelState.includes(Number(item.inputIntegrity))) {
            const el = document.createElement('div')
            const p = document.createElement('div')
            const title = document.createElement('div')
            const bgColor = item.inputIntegrity === 100 ? '#00E500' : '#ccc'
            el.style.zIndex = 120000
            p.className = styles.drawCircle
            p.style['background-color'] = bgColor
            p.style['box-shadow'] = '0 0 20px ' + bgColor
            p.id = 'markerWrapper' + index
            title.innerHTML = item.nodeName
            title.className = 'MarkerTitle'
            el.appendChild(title)
            el.appendChild(p)
            this[item.nodeId] = el
            this[item.nodeId + 'p'] = p
            this[item.nodeId + 'color'] = bgColor
            this[item.nodeId + 'input'] = item.inputIntegrity
            const marker = new window.minemap.Marker(el, { offset: [-3, -20] })
            this.markers.push(marker)
            /* if (index === 0) {
              this.map.panTo([item.unitLongitude, item.unitLatitude])
            } */
            /* this.map.panTo([106.709075, 26.586574]) */
            marker.setLngLat([item.unitLongitude, item.unitLatitude]).setPopup().addTo(this.map)
            el.addEventListener('click', (e) => {
              window.event ? window.event.cancelBubble = true : e.stopPropagation()
              this.map.panTo([item.unitLongitude, item.unitLatitude])
              if (this.markerId) {
                document.getElementById(this.markerId).innerHTML = ''
              }
              this.markerId = e.target.getAttribute('id')
              const p1 = document.createElement('div')
              const p2 = document.createElement('div')
              const p3 = document.createElement('div')
              const p4 = document.createElement('div')
              p2.style['background-color'] = bgColor
              p3.style['background-color'] = bgColor
              p4.style['background-color'] = bgColor
              p1.className = styles.inner
              p2.className = styles.avatar
              p3.className = classNames(styles.container, styles.inner)
              p4.className = classNames(styles.outter, styles.inner)
              p.appendChild(p1)
              p.appendChild(p2)
              p.appendChild(p3)
              p.appendChild(p4)
              el.appendChild(p)
              this.getinterDetails(true, item)
            })
          }
        })
      }
    })
  }
  getInmainMap = (bool) => {
    this.setState({ inmainMap: bool }, () => {
      if (bool) {
        const map = new window.minemap.Map({
          container: 'InmainMap',
          /* style: '//minedata.cn/service/solu/style/id/2365', */
          // style: '//10.11.57.105:60050/service/solu/style/id/4636',
          style: mapStyles,
          center: [106.709075, 26.586574],
          zoom: 13,
          pitch: 0,
          maxZoom: 17,
          minZoom: 3,
        })
        const el = document.createElement('div')
        el.id = 'marker'
        el.style['background-color'] = 'red'
        el.style['background-size'] = 'cover'
        el.style.width = '20px'
        el.style.height = '20px'
        el.style['border-radius'] = '50%'
        el.style['z-index'] = '999999999'
        el.style['box-shadow'] = '0 0 20px red'
        const marker = new window.minemap.Marker(el, { offset: [-10, -10] }).setLngLat(this.state.IngetLngLat || [106.713906, 26.59579]).addTo(map)
        map.panTo(this.state.IngetLngLat || [106.706278, 26.590897])
        map.on('click', (e) => {
          const p = e.lngLat
          document.getElementById('mapcenter').innerText = '您所点击的位置 : ' + p.lng.toFixed(6) + ',' + p.lat.toFixed(6)
          const inmainMap = [p.lng.toFixed(6), p.lat.toFixed(6)]
          marker.setLngLat([p.lng.toFixed(6), p.lat.toFixed(6)])
          this.setState({ inmainMap })
        })
      }
    })
  }
  getinmainMap = () => {
    const { interPlanMsg, inmainMap } = this.state
    interPlanMsg.unitLongitude = inmainMap[0]
    interPlanMsg.unitLatitude = inmainMap[1]
    this.setState({ interPlanMsg })
  }
  // 提示框
  promptDialogBox = (code, content) => {
    if (code === 200) {
      message.success(content)
    } else if (code === 201) {
      message.warning(content)
    } else {
      message.error(content)
    }
  }
  handleChange = (e, name) => {
    const { interPlanMsg } = this.state
    interPlanMsg[name] = e.target.value
    this.setState({ interPlanMsg })
  }
  handleSelChange = (value, name, index) => {
    const { interPlanMsg } = this.state
    if (index != null) {
      interPlanMsg.relation[index][name] = value
    } else {
      interPlanMsg[name] = value
    }
    this.setState({ interPlanMsg })
  }
  getmodelState = (modelState) => {
    this.setState({
      modelState,
      interPlanMsg: null,
      inmainMap: false,
    }, () => {
      this.getmarkersState()
    })
  }
  // mineData
  renderMineMap = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      // style: '//10.11.57.105:60050/service/solu/style/id/4636',
      style: mapStyles,
      center: [106.706278, 26.590897],
      zoom: 13.8,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    this.getmarkersState()
    map.on('click', () => {
      if (this.markerId) {
        document.getElementById(this.markerId).innerHTML = ''
      }
      this.nodeInfo = {
        departmentId: '', // 管理单位
        districtId: '', // 区域编号
        inputIntegrity: '', // 录入信息占比
        maxCycle: '', // 信号最大周期
        minCycle: '', // 信号最小周期
        nodeId: '', // 路口编号
        nodeName: '', // 路口名称
        relation: [],
        unitLatitude: '', // 纬度
        unitLongitude: '', // 经度
        unitShape: '', // 路口形状
        yellowTime: '', // 黄灯时间
      }
      this.setState({
        interPlanMsg: null,
        inmainMap: false,
      })
    })
  }
  render() {
    const { interPlanMsg, droproad, areaAndNodeList, listDrop, codeInfo, directionData, droplist, inmainMap, interColor, modelState } = this.state
    return (
      <div className={styles.Content}>
        {/* 地图 */}
        <div id="mapContainer" className={styles.mapContainer} />
        <Nav getSearch={this.getSearch} OpenInforWindow={this.getinterDetails} modelState={modelState} interColor={interColor} getmodelState={this.getmodelState} />
        <Navigation {...this.props} />
        {inmainMap ?
          <div className={styles.mainMapBox}>
            <div id="mapcenter" className={styles.mapcenter}>请点击屏幕</div>
            <div id="InmainMap" className={styles.mainMap} />
            <div className={styles.affirm}>
              <span onClick={this.getinmainMap}>确定</span><span onClick={() => { this.getInmainMap(false) }}>关闭</span>
            </div>
          </div> : null}
        {/* 右侧弹框 */}
        <div className={styles.poin_area}>
          <div className={styles.poin_line}>
            <span>区域</span>
            {/* <span>管理单位</span> */}
          </div>
          <div className={styles.pro_Button}>
            {
              areaAndNodeList ? areaAndNodeList.map((item, index) => {
                return (
                  <DirectoryTree defaultExpandedKeys={[index === 0 ? '' + item.districtId : '0']} key={'info' + item.districtId} multiple={false} showIcon={false} switcherIcon={<Icon type="down" />} onSelect={this.getinterDetails} >
                    <TreeNode title={item.districtName} key={item.districtId}  >
                      {!!item.node && item.node.map((items, indexs) => {
                        return <TreeNode title={items.nodeName} key={items.nodeId} item={items} />
                      })}
                    </TreeNode>
                  </DirectoryTree>
                )
              }) : null
            }
            <div className={styles.poin_item}><span onClick={() => { this.getinterDetails(false) }}>新建路口</span></div>
          </div>
        </div>
        {/* 点 弹窗 */}
        {!!interPlanMsg && interPlanMsg ?
          <div className={styles.configuration} id="configuration" key={interPlanMsg.nodeId}>
            <div className={styles.conf_title}>路口基本信息配置</div>
            {interPlanMsg.nodeId ?
              <div className={styles.message}>路口编号 : <span>{interPlanMsg.nodeId}</span></div> : null}
            <div className={styles.message}>路口名称 : <Input defaultValue={interPlanMsg.nodeName || ''} onChange={(e) => { this.handleChange(e, 'nodeName') }} /><i /></div>
            <div className={styles.message} key={interPlanMsg.unitLatitude || 'lat'}>经度 : <Input onChange={(e) => { this.handleChange(e, 'unitLatitude') }} defaultValue={interPlanMsg.unitLatitude || ''} onClick={() => { this.getInmainMap(true) }} /><i /></div>
            <div className={styles.message} key={interPlanMsg.unitLongitude || 'lng'}>纬度 : <Input onChange={(e) => { this.handleChange(e, 'unitLongitude') }} defaultValue={interPlanMsg.unitLongitude || ''} onClick={() => { this.getInmainMap(true) }} /><i /></div>
            <div className={styles.message}>行政区域 :
              <Select defaultValue={interPlanMsg.districtId || ''} style={{ width: '60%', height: '92%' }} onChange={(e) => { this.handleSelChange(e, 'districtId') }}>
                {!!listDrop && listDrop.map((items) => {
                  return <Option value={items.id} key={items.name + items.id}>{items.name}</Option>
                })}
              </Select>
              <b />
            </div>
            <div className={styles.message}>管理单位 :
              <Select defaultValue={interPlanMsg.departmentId || ''} style={{ width: '60%', height: '92%' }} onChange={(e) => { this.handleSelChange(e, 'departmentId') }}>
                <Option value={1}>交警支队</Option>
                <Option value={2}>交警大队</Option>
              </Select>
              <b />
            </div>
            <div className={styles.message}>路口形状 :
              <Select defaultValue={interPlanMsg.unitShape || ''} style={{ width: '60%', height: '92%' }} onChange={(e) => { this.handleSelChange(e, 'unitShape') }}>
                {!!codeInfo && codeInfo.map((code) => {
                  return <Option value={code.dictCode} key={code.codeName + code.dictCode}>{code.codeName}</Option>
                })}
              </Select>
              <b />
            </div>
            <div className={styles.message}>最大周期(s) : <Input defaultValue={interPlanMsg.maxCycle || ''} onChange={(e) => { this.handleChange(e, 'maxCycle') }} /><i /></div>
            <div className={styles.message}>最小周期(s) : <Input defaultValue={interPlanMsg.minCycle || ''} onChange={(e) => { this.handleChange(e, 'minCycle') }} /><i /></div>
            <div className={styles.message}>黄灯时间(s) : <Input defaultValue={interPlanMsg.yellowTime || ''} onChange={(e) => { this.handleChange(e, 'yellowTime') }} /><i /></div>
            {/* <div className={styles.message}>全红时间(s) : <Input defaultValue={interPlanMsg.yellowTime || ''} /><i /></div> */}
            <div className={styles.infor_centent}>
              <div className={styles.listItem}>
                <div className={styles.listTh}>路口方向</div>
                <div className={styles.listTh}>所属道路</div>
                <div className={styles.listTh}>流向路口</div>
                <div className={styles.listTh}>流向路口方向</div>
                {/* <div className={styles.listTh}>道路名称描述</div> */}
                <div className={styles.listTh}>操作</div>
              </div>
              <div className={classNames(styles.listBox, styles.scrollBox)}>
                {!!interPlanMsg.relation && interPlanMsg.relation.map((item, index) => {
                  return (
                    <div className={styles.listItem} key={item.toNodeId + item.fromNodeId + item.toNodeDirection }>
                      <div className={styles.listTh}>
                        <Select defaultValue={item.fromNodeDirection} style={{ width: 120 }} onChange={(e) => { this.handleSelChange(e, 'fromNodeDirection', index) }}>
                          {!!directionData && directionData.map((dire) => {
                            return <Option value={dire.dictCode} title={dire.codeName} key={dire.codeName + dire.dictCode}>{dire.codeName}</Option>
                          })}
                        </Select>
                      </div>
                      <div className={styles.listTh}>
                        <Select defaultValue={item.roadId} style={{ width: 120 }} onChange={(e) => { this.handleSelChange(e, 'roadId', index) }}>
                          {!!droproad && droproad.map((dire) => {
                            return <Option value={dire.id} title={dire.name} key={dire.name + dire.id}>{dire.name}</Option>
                          })}
                        </Select>
                      </div>
                      <div className={styles.listTh}>
                        <Select defaultValue={item.toNodeId} style={{ width: 150 }} onChange={(e) => { this.handleSelChange(e, 'toNodeId', index) }}>
                          <Option value={0} title="无" >无</Option>
                          {!!droplist && droplist.map((items) => {
                            return items.id !== interPlanMsg.nodeId ? <Option value={items.id} title={items.name} key={items.name + items.id}>{items.name}</Option> : null
                          })}
                        </Select>
                      </div>
                      <div className={styles.listTh}>
                        <Select defaultValue={item.toNodeDirection} style={{ width: 120 }} onChange={(e) => { this.handleSelChange(e, 'toNodeDirection', index) }}>
                          {!!directionData && directionData.map((dire) => {
                            return <Option value={dire.dictCode} title={dire.codeName} key={dire.codeName + dire.dictCode}>{dire.codeName}</Option>
                          })}
                        </Select>
                      </div>
                      {/*   <div className={styles.listTh}>
                      <Input defaultValue={interPlanMsg.yellowTime || ''} />
                    </div> */}
                      <div className={styles.listTh} > <i onClick={() => { this.getRemlistItem(index) }} /></div>
                    </div>)
                })}
              </div>
            </div>
            <div className={styles.listAdd} onClick={this.getAddlistItem}><i /></div>
            <div className={styles.listDelect}><span onClick={interPlanMsg.nodeId ? this.getupdatemanage : this.getaddmanage}>保存点位</span>{interPlanMsg.nodeId ? <span onClick={() => { this.getdeletemanage(interPlanMsg.nodeId) }}>删除点位</span> : null}</div>
          </div > : null
        }
      </div >
    )
  }
}

export default Informationmana
