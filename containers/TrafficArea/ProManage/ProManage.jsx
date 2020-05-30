import React from 'react'
import classNames from 'classnames'
import { Select, Tree, message, Icon, Modal } from 'antd'

import mapStyles from '../../../utlis/styles_2301'
import styles from './ProManage.scss'
import style from '../TrafficArea/TrafficArea.scss'
import roadStyles from '../../InterPlan/Roadtraffic/Roadtraffic.scss'
import Prostyles from '../../InterPlan/Projectmana/Projectmana.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import Nav from '../../Nav/Nav'
import TrafficVideo from '../../../components/TrafficVideo/TrafficVideo'
import CanalizationPop from './CanalizationPop/CanalizationPop'
import FlowPop from './FlowPop/FlowPop'
import SingalPop from './SingalPop/SingalPop'
import AreaNavgation from '../AreaNavgation/AreaNavgation'

const { TreeNode, DirectoryTree } = Tree
/* 交通组织方案管理 */

class ProManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planMessage: '',
      listItemList: false, // 组织方案管理
      areaMessage: false, // 弹层 列表点击后的四个圆弹层
      hash: window.location.hash,
      popShow: null,
      modelState: [0, 2],
      interColor: [
        {
          modelState: 0,
          nodeName: '未选择',
          color: '#ccc',
        },
        {
          modelState: 2,
          nodeName: '已选择',
          color: '#00E500',
        },
      ],
      expandedKey: ['0'],
      canclizationPlan: 0,
      flowPlan: 0,
      singalPlan: 0,
      organization: 0,
      ModalVisible: false,
      videoSrc: null,
    }
    this.cityId = '1'
    this.parameters = {
      cityId: '1',
      searchKey: '',
    }
    this.markers = []
    this.areaAndNodeUrl = `/simulation/area/sim/manage/get/areaAndNode/${this.cityId}` // {cityId} 根据城市ID获取业务区域和区域下的路口'
    this.mapUrl = `/simulation/node/list/to/map/${this.cityId}` // {cityId} 根据城市ID获取地图上所有路口的点'
    this.areaPlanUrl = '/simulation/area/plan/manage/total/model'
    this.taskListUrl = '/simulation/area/plan/manage/list/by'
    this.deleteTaskUrl = '/simulation/sim/task/delete'
    this.videoUrl = '/simulation/sim/task/get/video/by/task/' // {rowId}/{taskType}获取仿真区域视频或仿真路口视频链接1'
  }
  componentDidMount = () => {
    // 加载地图
    this.renderMineMap()
    // 获取左侧列表
    this.getareaAndNode()
  }
  getOriganizationPlan = () => {
    getResponseDatas('get', `${this.taskListUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        this.setState({ listItemList: content })
      } else {
        this.setState({ listItemList: [] })
      }
    })
  }
  getAreaPlan = () => {
    getResponseDatas('get', `${this.areaPlanUrl}/${this.areaId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        const [canclizationPlan, flowPlan, singalPlan, organization] = content
        this.setState({
          canclizationPlan, flowPlan, singalPlan, organization,
        })
      }
    })
  }
  getRoadtraffic = (link) => {
    window.location.href = `#/${link}`
  }
  // 获取you侧列表
  getareaAndNode = () => {
    getResponseDatas('get', this.areaAndNodeUrl, this.parameters).then((resData) => {
      if (resData.data.code === 200) {
        const { content } = resData.data
        this.areaId = content[0].areaId
        this.setState({ areaAndNodeList: content }, () => {
          /* this.bindPopClick([String(this.areaId)], '', content[0]) */
        })
      } else {
        message.error('网络错误!')
      }
    })
  }
  // 渲染点
  getmarkersState = () => {
    const { map } = this
    const { popShow } = this.state
    getResponseDatas('get', this.mapUrl).then((res) => {
      this.markerDatas = res.data.content
      if (this.markers.length) {
        this.markers.forEach((item) => {
          item.remove()
        })
        this.markers = []
      }
      const nodeIds = popShow && popShow.nodes.map((item, index) => {
        return item.nodeId
      })
      // console.log(nodeIds, this.markerDatas)
      this.markerDatas.forEach((item, index) => {
        // console.log('点位信息：：：：', item)
        const el = document.createElement('div')
        const p = document.createElement('div')
        const title = document.createElement('div')
        const bgColor = nodeIds && nodeIds.includes(item.nodeId) ? '#00E500' : '#ccc'
        el.style.zIndex = 120000
        p.className = roadStyles.drawCircle
        p.style['background-color'] = bgColor
        p.style['box-shadow'] = '0 0 20px ' + bgColor
        p.id = 'markerWrapper' + index
        title.innerHTML = item.nodeName
        title.className = 'MarkerTitle'
        el.appendChild(title)
        el.appendChild(p)
        // 添加选中样式
        if (nodeIds && nodeIds.includes(item.nodeId)) {
          /* this.map.panTo([item.unitLongitude, item.unitLatitude])  */
          const p1 = document.createElement('div')
          const p2 = document.createElement('div')
          const p3 = document.createElement('div')
          const p4 = document.createElement('div')
          p2.style['background-color'] = bgColor
          p3.style['background-color'] = bgColor
          p4.style['background-color'] = bgColor
          p1.className = roadStyles.inner
          p2.className = roadStyles.avatar
          p3.className = classNames(roadStyles.container, roadStyles.inner)
          p4.className = classNames(roadStyles.outter, roadStyles.inner)
          p.appendChild(p1)
          p.appendChild(p2)
          p.appendChild(p3)
          p.appendChild(p4)
          el.appendChild(p)
        }
        // 添加marker
        const marker = new window.minemap.Marker(el, { offset: [-10, -30] }).setLngLat([item.unitLongitude, item.unitLatitude]).setPopup().addTo(map)
        this.markers.push(marker)
        el.addEventListener('click', (e) => {
          message.warning('操作区域请点击区域名称!')
        })
      })
    })
  }
  getAreaPlanAgain = () => {
    this.getAreaPlan()
  }
  // 查看方案信息
  handleAreaPlanMsg = (e) => {
    const planName = e.currentTarget.getAttribute('planname')
    this.setState({ planMessage: planName })
    if (planName === 'organization') {
      this.getOriganizationPlan()
    }
  }
  // 关闭方案信息
  handleClosePlanPop = (e) => {
    const planMessage = e.target.getAttribute('popmessage')
    this.setState({ planMessage })
  }
  handleCloseAreaMessage = () => {
    this.setState({ areaMessage: false, popShow: null }, () => {
      this.getmarkersState()
    })
  }
  handleDelTask = (e) => {
    this.orgRowId = e.target.getAttribute('rowid')
    this.setState({ ModalVisible: true })
  }
  handleModalOk = () => {
    getResponseDatas('delete', `${this.deleteTaskUrl}/${this.areaId}/2/${this.orgRowId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getOriganizationPlan()
        this.setState({ ModalVisible: false })
        this.getAreaPlan()
      }
      message.info(content)
    })
  }
  handleVideo = (rowId) => {
    if (rowId === null) {
      this.setState({ videoSrc: null })
    } else {
      getResponseDatas('get', this.videoUrl + rowId + '/2').then((res) => {
        const result = res.data
        if (result.code === 200) {
          // console.log(result.content)
          if (result.content) {
            this.setState({ videoSrc: result.content })
          } else {
            message.error('当前方案无视频！')
          }
        }
      })
    }
  }
  handleModalCancel = () => {
    this.setState({ ModalVisible: false })
  }
  bindPopClick = (keys, e, data) => {
    const [areaId] = keys
    this.areaId = areaId
    this.setState({
      popShow: data,
      areaMessage: true,
      expandedKey: keys,
    }, () => {
      this.getmarkersState()
    })
    this.getAreaPlan()
  }
  // 右侧区域列表切换
  /* bindPopClick = (keys, e, data) => {
    console.log(data,keys,keys[0] === this.state.expandedKey[0]);
    debugger
    if (keys[0] === this.state.expandedKey[0]) {
      this.setState({
        areaMessage: true,
        // expandedKey: [],
        // popShow: null,
      })
    } else {
      const [areaId] = keys
      this.areaId = areaId
      this.setState({
        popShow: data,
        areaMessage: true,
        expandedKey: keys,
      }, () => {
        this.getmarkersState()
      })
      this.getAreaPlan()
    }
  } */
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
  }
  render() {
    const { interColor, modelState, videoSrc, listItemList, popShow, areaAndNodeList, areaMessage } = this.state
    return (
      <div className={classNames({ [roadStyles.Roadtcontent]: true, [Prostyles.Content]: true })}>
        {/* 地图 */}
        <div id="mapContainer" className={roadStyles.mapContainer} />
        <Nav interColor={interColor} modelState={modelState} getmodelState={this.handlegetmodelState} />
        {/* 按钮导航 */}
        <AreaNavgation {...this.props} />
        {/* 右侧弹框 */}
        <div className={classNames(Prostyles.poin_area, style.poin_area)}>
          <div className={Prostyles.poin_line}>
            <span style={{ width: '150px' }}>建模区域{areaAndNodeList && areaAndNodeList.length}个</span>
          </div>{/* expandedKeys={this.state.expandedKey} */}
          <div className={Prostyles.pro_Button}>
            {
              areaAndNodeList ? areaAndNodeList.map((item, index) => {
                return (
                  <DirectoryTree
                    key={item.areaName + item.areaId}
                    defaultExpandedKeys={[index === 0 ? item.areaId + '' : '0']}
                    multiple={false}
                    showIcon={false}
                    switcherIcon={<Icon type="down" />}
                    expandAction={false}
                    onSelect={(keys, e) => { this.bindPopClick(keys, e, item) }}
                  >
                    <TreeNode title={item.areaName} key={item.areaId} >
                      {!!item.nodes && item.nodes.map((items, indexs) => {
                        return <TreeNode title={items.nodeName} key={items.nodeId} item={items} disabled />
                      })}
                    </TreeNode>
                  </DirectoryTree>
                )
              }) : null
            }
          </div>
        </div>
        {/* 点击列表弹窗 */}
        {areaMessage && popShow &&
          <div id="pointMarker" className={classNames(Prostyles.pointMarker, styles.positions)}>
            <span className={styles.clone} onClick={this.handleCloseAreaMessage} style={{ top: '20px', right: '20px' }} />
            <div className={Prostyles.poin_name}>建模区域名称:<span>{popShow && popShow.areaName}</span></div>
            <div className={classNames([Prostyles.poin_torus])} id="markerIds">
              <div className={Prostyles.circle_one} planname="canalization" onClick={this.handleAreaPlanMsg}><div><span>渠化{this.state.canclizationPlan}套</span><span /><span /></div></div>
              <div className={Prostyles.circle_two} planname="flow" onClick={this.handleAreaPlanMsg}><div><span>流量{this.state.flowPlan}套</span><span /><span /></div></div>
              <div className={Prostyles.circle_three} planname="singal" onClick={this.handleAreaPlanMsg}><div><span>信号{this.state.singalPlan}套</span><span /><span /></div></div>
              <div className={Prostyles.circle_four} planname="organization" onClick={this.handleAreaPlanMsg}><div><span>组织方案{this.state.organization}套</span><span /><span /></div></div>
            </div>
          </div>
        }
        {/* 区域渠化方案管理弹框 */}
        {
          this.state.planMessage === 'canalization' &&
          <div className={style.examineOther}>
            <div className={style.title}>{popShow.areaName}区域渠化方案管理
              <span className={style.clone} popmessage={null} onClick={this.handleClosePlanPop}><Icon type="close" /></span>
            </div>
            <div className={style.canclizationPlan}>
              <CanalizationPop areaId={this.state.popShow.areaId} isDelete={this.getAreaPlanAgain} />
            </div>
          </div>
        }
        {/* 区域流量方案管理弹框 */}
        {this.state.planMessage === 'flow' ?
          <div className={style.examineOther}>
            <div className={style.title}>{popShow.areaName}区域流量方案管理
              <span className={style.clone} onClick={this.handleClosePlanPop} />
            </div>
            <div className={style.flowPlan}>
              <FlowPop areaId={this.state.popShow.areaId} readOnly="true" isDelete={this.getAreaPlanAgain} />
            </div>
          </div> : null}
        {/* 区域信号方案管理弹框 */}
        {this.state.planMessage === 'singal' ?
          <div className={style.examineOther}>
            <div className={style.title}>{popShow.areaName}区域信号方案管理
              <span className={style.clone} onClick={this.handleClosePlanPop} />
            </div>
            <div className={styles.singalPlan}>
              <SingalPop areaId={this.state.popShow.areaId} readOnly="true" isDelete={this.getAreaPlanAgain} />
            </div>
          </div> : null}
        {/* 组织方案 */}
        {this.state.planMessage === 'organization' ?
          <div className={styles.organization}>
            <span className={styles.clone} onClick={this.handleClosePlanPop} />
            <div className={styles.organ_title}>{popShow.areaName}组织方案管理</div>
            <div className={styles.organ_cross} />
            <div className={styles.organ_list}>
              <div className={styles.listItem}>
                <div className={styles.listTd} style={{ color: '#03edff' }}>组织方案</div>
                <div className={styles.listTd}>渠化方案</div>
                <div className={styles.listTd}>流量方案</div>
                <div className={styles.listTd}>信号方案</div>
                <div className={styles.listTd}>操作</div>
              </div>
              {!!listItemList && listItemList.map((item, index) => {
                return (
                  <div className={styles.listItem} key={item.rowId}>
                    <div className={styles.listTh}>{item.programTitle}</div>
                    <div className={styles.listTh}>{item.geometryTitle}</div>
                    <div className={styles.listTh}>{item.flowTitle}</div>
                    <div className={styles.listTh}> {item.stpTitle}</div>{/* gettaskDelete */}
                    <div className={styles.listTh}><span onClick={() => { this.handleVideo(item.rowId, index) }}>{/* <i /> */}观看视频</span><span rowid={item.rowId} onClick={this.handleDelTask}><i />删&nbsp;&nbsp;除</span></div>
                  </div>)
              })}
            </div>
          </div> : null}
        <Modal
          title=""
          visible={this.state.ModalVisible}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <p>确定删除此方案吗？</p>
        </Modal>
        {videoSrc ? <TrafficVideo videoSrc={videoSrc} handleVideo={this.handleVideo} /> : null}
      </div>
    )
  }
}

export default ProManage
