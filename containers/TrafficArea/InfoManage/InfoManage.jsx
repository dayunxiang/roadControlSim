import React from 'react'
import classNames from 'classnames'
import { Icon, Tree, Input, message, Modal } from 'antd'
import Nav from '../../Nav/Nav'
import style from '../TrafficArea/TrafficArea.scss'
import roadStyles from '../../InterPlan/Roadtraffic/Roadtraffic.scss'
import Prostyles from '../../InterPlan/Projectmana/Projectmana.scss'
import styles from './InfoManage.scss'
import getResponseDatas from '../../../utlis/getResponseData'
import { getDrag } from '../../../utlis/drag'
import AreaNavgation from '../AreaNavgation/AreaNavgation'

const { TreeNode, DirectoryTree } = Tree
const { confirm } = Modal
/* 区域信息管理 */

class InfoManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      examine: false, // 查看弹窗
      popShow: null, // 弹层
      markerDom: null, // 点击的按钮dom
      hash: window.location.hash,
      areaAndNodeList: null,
      dataPopshow: [],
      markerDatas: [],
      modelState: [0, 2],
      interColor: [
        {
          modelState: 0,
          nodeName: '未选择',
          color: '#ccc'
        },
        {
          modelState: 2,
          nodeName: '已选择',
          color: '#00E500'
        }]
    }
    this.cityId = '1'
    this.parameters = {
      cityId: '1',
      searchKey: '',
    }
    this.areaAndnode = {
      areaId: 0,
      areaName: '',
      cityId: 1,
      // 用户id需要做登陆加上
      designerId: 1,
      districtId: 0,
      rowId: 0
    }
    this.markers = []
    this.areaAndNodeUrl = '/simulation/area/sim/manage/get/areaAndNode/' + this.cityId // {cityId} 根据城市ID获取业务区域和区域下的路口'
    this.mapUrl = '/simulation/node/list/to/map/area/' + this.cityId // {cityId} 根据城市ID获取地图上所有路口的点'
    this.addareaUrl = '/simulation/area/sim/manage/add/areaAndNode?nodeIds=' //  新增业务区域，并且新增业务区域下的路口'
    this.updateareaUrl = '/simulation/area/sim/manage/update/areaAndNode?nodeIds='  // 更新业务区域信息和区域下路口的信息'
    this.deleteareaUrl = '/simulation/area/sim/manage/delete/areaAndNode/' // {rowId}/{areaId}  删除业务区域'
  }
  componentDidMount = () => {
    // 加载地图
    this.renderMineMap();
    // 获取右侧列表
    this.getareaAndNode()
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('interPlanMsg'))
    // console.log(this.InterPlanMsg);

  }
  getRoadtraffic = (link) => {
    window.location.href = `#/${link}`
  }
  getbanksFigure = (bool) => {
    this.setState({
      banksFigure: bool, // 渠化图弹窗
    })
  }
  // 获取右侧列表
  getareaAndNode = () => {
    getResponseDatas('get', this.areaAndNodeUrl, this.parameters).then((resData) => {
      if (resData.data.code === 200) {
        // console.log(resData.data.content)
        const data = resData.data.content
        this.setState({ areaAndNodeList: data })
        this.getmarkersState()
        /* this.bindPopClick({ expanded: true }, resData.data.content[0]) */
      } else {
        message.error('网络错误!')
      }
    })
  }
  // 更新区域
  getupareaAndNode = () => {
    const { areaName } = this.areaAndnode
    const { popShow, dataPopshow } = this.state
    if (!areaName) {
      message.warning('请填写区域名称!')
      return
    }
    /* if (!popShow.nodes.length) {
      message.warning('请至少选择一个路口!')
      return
    } */
    this.areaAndnode.nodeIds = dataPopshow.join()
    // console.log(dataPopshow.join(), this.areaAndnode)
    getResponseDatas('put', this.updateareaUrl + dataPopshow.join(), { ...this.areaAndnode, originalNodeIds: this.originalNodeIds }).then((resData) => {
      if (resData.data.code === 200) {
        // console.log(resData.data.content)
        this.getareaAndNode()
        message.success('保存成功!')
        this.originalNodeIds = '',
          this.setState({
            popShow: null,
          })
      } else {
        message.error('网络错误!')
      }
    })
  }
  // 新增区域
  getaddareaAndNode = () => {
    const { areaName } = this.areaAndnode
    const { popShow, dataPopshow } = this.state
    if (!areaName) {
      message.warning('请填写区域名称!')
      return
    }
    if (!popShow.nodes.length) {
      message.warning('请至少选择一个路口!')
      return
    }
    this.areaAndnode.nodeIds = dataPopshow.join()
    getResponseDatas('post', this.addareaUrl + dataPopshow.join(), this.areaAndnode).then((resData) => {
      if (resData.data.code === 200) {
        // console.log(resData.data.content)
        this.getareaAndNode()
        message.success('保存成功!')
        this.setState({
          popShow: null,
        })
      } else {
        message.error('网络错误!')
      }
    })
  }
  // 删除区域
  gettaskDelete = () => {
    const { popShow } = this.state
    const that = this
    confirm({
      title: '确认要删除当前区域?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve, reject) => {
          getResponseDatas('delete', that.deleteareaUrl + popShow.rowId + '/' + popShow.areaId).then((res) => {
            if (res.data.code === 200) {
              that.getareaAndNode()
              message.success('删除成功!')
              that.setState({
                popShow: null,
              })
            } else {
              message.error(res.data.content)
            }
            resolve()
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 关闭按钮
  getClone = () => {
    // 关闭所以弹窗
    this.setState({
      examine: false, // 查看弹窗
      popShow: null,
      banksFigure: false, // 渠化图弹窗
    }, () => {
      this.onEditBtnClick('trash')
      this.getmarkersState()
    })
  }
  // 弹层方法绑定
  bindPopClick = (e, data) => {
    const popShow = JSON.parse(JSON.stringify(data)) // 复制数据，莫名的变得了同一个引用地址
    this.areaAndnode.rowId = data.rowId
    this.areaAndnode.areaId = data.areaId
    this.areaAndnode.areaName = data.areaName
    this.originalNodeIds = popShow && popShow.nodes.map((item, index) => { return item.nodeId }).join()
    this.setState({
      popShow: popShow,// e.expanded ? data : null,
    }, () => {
      // 刷新地图点位
      this.getmarkersState()
      if (data) { //e.expanded
        if (!this.edit) {
          // 添加绘画层功能
          this.addEditControl()
        } else {
          // 绑定绘画层
          this.onEditBtnClick('rectangle')
        }
        // 获取焦点
        this.myInput.input.focus()
        // 添加拖拽
        /*  getDrag(this.pointMarkerBox) */
      }
    })
  }
  // 渲染点
  getmarkersState = () => {
    const map = this.map
    const { popShow } = this.state
    getResponseDatas('get', this.mapUrl).then((res) => {
      const markerDatas = res.data.content
      if (this.markers.length) {
        this.markers.forEach((item) => {
          item.remove()
        })
        this.markers = []
      }
      const dataPopshow = popShow && popShow.nodes.map((item, index) => {
        return item.nodeId
      })
      this.setState({ dataPopshow, markerDatas })
      markerDatas.forEach((item, index) => {
        const el = document.createElement('div')
        const p = document.createElement('div')
        const title = document.createElement('div')
        const bgColor = dataPopshow && dataPopshow.includes(item.nodeId) ? '#00E500' : '#ccc'
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
        if (dataPopshow && dataPopshow.includes(item.nodeId)) {
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
          if (this.state.popShow) {
            this.onEditBtnClick('trash')
            setTimeout(() => {
              this.onEditBtnClick('rectangle')
            }, 0)
            this.getnodeDelete(item)
          } else {
            message.warning('操作区域请点击区域名称')
          }
        })
      })
    })
  }
  getnodeDelete = (item) => {
    const { popShow, dataPopshow } = this.state
    // console.log(popShow, dataPopshow);

    if (dataPopshow && dataPopshow.includes(item.nodeId)) {
      // console.log(popShow.nodes, dataPopshow.indexOf(item.nodeId), item.nodeId);
      popShow && popShow.nodes.forEach((items, index) => {
        if (items.nodeId == item.nodeId) {
          popShow.nodes.splice(index, 1)
        }
      })
      dataPopshow && dataPopshow.splice(dataPopshow.indexOf(item.nodeId), 1)
      /* popShow && popShow.nodes.splice(dataPopshow.indexOf(item.nodeId), 1) */
    } else {
      popShow && popShow.nodes.push(item)
    }
    this.setState({ popShow,dataPopshow }, () => {
      this.getmarkersState()
    })
  }
  onEditRecordCreate = (e) => {
    this.onEditBtnClick('trash')
    setTimeout(() => {
      this.onEditBtnClick('rectangle')
    }, 0)
    if (e) {
      const lnglat = e.record.features[0].geometry.coordinates[0]
      const { markerDatas } = this.state
      markerDatas.forEach((item) => {
        if (lnglat[0][0] < item.unitLongitude && item.unitLongitude < lnglat[3][0] && lnglat[0][1] > item.unitLatitude && item.unitLatitude > lnglat[1][1]) {
          this.getnodeDelete(item)
        }
      })
    }
  }
  addEditControl = () => {
    if (this.map) {
      this.edit = new window.minemap.edit.init(this.map, {
        boxSelect: true,    /* 是否支持拉框选择 */
        touchEnabled: true,    /* 是否支持手指触屏 */
        displayControlsDefault: false,   /* 是否启用编辑控件 */
        showButtons: false,  /* 是否启用默认控件按钮 */
        userStyles: {
          "inactive": {
            "fillColor": "#090ff3",
            "fillOutlineColor": "#090ff3",
            "lineColor": "#090ff3",
            "circleColor": "#090ff3",
            "circleBorderColor": "#ffffff"
          },
          "active": {
            "fillColor": "#f00f0f",
            "fillOutlineColor": "#f00f0f",
            "lineColor": "#f00f0f",
            "circleColor": "#f00f0f",
            "circleBorderColor": "#ffffff"
          }
        }
      })
      this.onEditBtnClick('rectangle')
      this.map.on("edit.record.create", this.onEditRecordCreate);
    }
  }
  onEditBtnClick = (mode) => {
    if (this.edit && mode) {
      this.edit.onBtnCtrlActive(mode);
    }
  }
  getInputValue = (e) => {
    this.areaAndnode.areaName = e.target.value
  }
  getAddBtoarea = () => {
    const popShow = {
      areaId: 0,
      areaName: '',
      nodes: []
    }
    this.areaAndnode = {
      areaId: 0,
      areaName: '',
      cityId: 1,
      // 用户id需要做登陆加上
      designerId: 1,
      districtId: 0,
      rowId: 0
    }
    this.setState({ popShow }, () => {
      // 刷新地图点位
      this.getmarkersState()
      this.myInput.input.focus()
      if (!this.edit) {
        // 添加绘画层功能
        this.addEditControl()
      } else {
        // 绑定绘画层
        this.onEditBtnClick('rectangle')
      }
      // 添加拖拽
      /* getDrag(this.pointMarkerBox) */
    })
  }
  renderMineMap = () => {
    /* 初始化地图实例 */
    const map = new window.minemap.Map({
      container: 'mapContainer',
      style: '//minedata.cn/service/solu/style/id/2301',
      center: [106.706278, 26.590897],
      zoom: 13.8,
      pitch: 0,
      maxZoom: 17,
      minZoom: 3,
    })
    this.map = map
    // 添加点
    this.getmarkersState()
    // 添加画图层
    /* this.addEditControl() */
    /*  map.on('click', () => {
       if (this.EditBtn) {
         this.onEditBtnClick('trash')
         this.onEditBtnClick('rectangle')
         this.EditBtn = false
       }
     }) */
  }
  render() {
    const { examine, popShow, interColor, modelState, areaAndNodeList } = this.state
    return (
      <div className={classNames({ [roadStyles.Roadtcontent]: true, [Prostyles.Content]: true })}>
        {/* 地图 */}
        <div id="mapContainer" className={roadStyles.mapContainer} />
        <Nav interColor={interColor} modelState={modelState} />
        {/* 按钮导航 */}
        <AreaNavgation {...this.props} />
        {/* 查看弹框  */}
        {examine ?
          <div className={style.examineOther}>
            <div className={style.img_road}>
              <span onClick={() => { this.getbanksFigure(true) }} />
              <span onClick={() => { this.getbanksFigure(true) }} />
              <span onClick={() => { this.getbanksFigure(true) }} />
              <span onClick={() => { this.getbanksFigure(true) }} />
              <span onClick={() => { this.getbanksFigure(true) }} />
              <span onClick={() => { this.getbanksFigure(true) }} />
            </div>
            <div className={style.examine_top}>
              <span><i />路口中心点</span>
              <span><i />道路单行线</span>
            </div>
            <div className={style.examine_right}>
              <span><i />放大</span>
              <span><i />缩小</span>
              <span><i />全局</span>
              <span><i />平移</span>
            </div>
          </div> : null}
        {/* 右侧弹框 */}
        <div className={classNames(Prostyles.poin_area, style.poin_area)}>
          <div className={Prostyles.poin_line}>
            <span style={{ width: '150px' }}>建模区域{areaAndNodeList && areaAndNodeList.length}个</span>
          </div>
          <div className={Prostyles.pro_Button}>
            {
              areaAndNodeList ? areaAndNodeList.map((item, index) => {
                return (
                  <DirectoryTree key={item.areaName + item.areaId + 'area'} defaultExpandedKeys={[index === 0 ? item.areaId + '' : '0']} multiple={false} showIcon={false} switcherIcon={<Icon type="down" />} expandAction={false} onSelect={(e, b) => { this.bindPopClick(b, item) }}>
                    <TreeNode title={item.areaName} key={item.areaId} >
                      {!!item.nodes && item.nodes.map((items, indexs) => {
                        return <TreeNode title={items.nodeName} key={'areatree' + items.nodeId} item={items} disabled={true} />
                      })}
                    </TreeNode>
                  </DirectoryTree>
                )
              }) : null
            }
          </div>
          <div className={styles.poin_line}>
            <span onClick={this.getAddBtoarea}>新增区域</span>
          </div>
        </div>
        {/* 点击列表弹窗 */}
        {popShow ?
          <div id="pointMarker" className={classNames(styles.positions)} ref={el => { this.pointMarkerBox = el }}>
            <span className={styles.clone} onClick={this.getClone} />
            <div className={styles.title}>建模区域名称:<Input placeholder="请填写区域名称" ref={el => { this.myInput = el }} key={popShow.areaName} defaultValue={popShow.areaName} className={styles.Inputname} onChange={this.getInputValue} />
              <span>区域路口数：<s>{popShow && popShow.nodes.length}</s></span>
            </div>
            <div className={styles.heade}>
              {
                popShow && popShow.nodes.map((item, index) => {
                  return <div key={item.nodeName + index + item.nodeId}><span title={item.nodeName}>{item.nodeName}</span><i onClick={() => { this.getnodeDelete(item) }} /></div>
                })
              }
            </div>
            <div className={styles.textBtnBox}>
              <span>已建模引用的区域不能删除</span>
              <div>
                <span onClick={popShow.areaId ? this.getupareaAndNode : this.getaddareaAndNode}>保存</span>
                {popShow.areaId ? <span onClick={this.gettaskDelete}>删除</span> : null}
              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default InfoManage