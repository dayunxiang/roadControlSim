import React from 'react'
import { Select, message, Modal } from 'antd'
import classNames from 'classnames'
import styles from './Canalization.scss'

import getResponseDatas from '../../../utlis/getResponseData'

import Header from '../../Header/Header'
import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import Title from '../../../components/Title/Title'
import InputLabel from '../Allocation/InputLabel/InputLabel'
import SplitLine from '../../../components/SplitLine/SplitLine'

import defaultShapeUrl from '../../img/inter.png'

function SetItems(props) {
  const { itemname, color, types, text, value, handleTextChange, paramsname } = props
  return (
    <div className={styles.setItem}>
      <span>{itemname}</span>:&nbsp;
      {
        types === 'text' ?
          <span style={{ color: color }}>{text}</span> : types === 'input' ?
            <InputLabel key={value + paramsname} value={value} color={color} paramsname={paramsname} handleChange={handleTextChange} /> : null
      }
    </div>
  )
}


class Canalization extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planList: null,
      isOpenMode: true,
      isShape: true,
      shapeSelect: true,
      showDownLoad: true,
      fileName: null,
      upLoadFileName: null,
      upLoadFileTime: null,
      directionList: null,
      splitWay: null,
      trueOrFalse: null,
      TurnOverType: null,
      belongStretch: null,
      constructions: null,
      roadTypes: null,
      rightCanalization: null,
      InterPlanMsg: null,
      PicName: null,
      separateType: '',
      separateWidth: '',
      ifTurnBefore: '',
      turnRightType: '',
      ifPavement: '',
      ifLandPavement: '',
      shapePicUrl: null,
      laneNumber: '',
      defaultLineNum: null,
      laneWidth: '',
      laneLength: '',
      waitingLength: '',
      roadName: '',
      ifTurnDistance: '0',
      hiddenSave: true,
      ifWaiting: false,
      laneStructure: 1,
      laneTurn: 1,
      laneType: null,
      laneLocation: 1,
      planRowId: null,
    }
    this.breakCheck = 0 // 上传验证
    this.options = ['南方向南方向', '北方向']
    this.planListUrl = '/simulation/geometry/get/info/'
    this.addPlanUrl = '/simulation/geometry/add'
    this.uploadFileUrl = '/simulation/file/sim/open/up/'
    this.deleteUrl = '/simulation/geometry/delete'
    this.uploadPicUrl = '/simulation/file/sim/canalization/up'
    this.directionUrl = '/simulation/geometry/shape/get/dropList'
    this.codeInfoUrl = '/simulation/code/list/codeInfo/'
    this.shapeUrl = '/simulation/geometry/shape/get/shape'
    this.lineNumberUrl = '/simulation/geometry/shape/get/lane/number/'
    this.shapeLaneInfo = '/simulation/geometry/shape/get/shape/lane/info'
    this.roadNameUrl = '/simulation/geometry/shape/get/road/name'
    this.updateDirLane = '/simulation/geometry/shape/update/dir/lane'
    this.updatePlanName = '/simulation/geometry/update'
    this.downLoadPic = '/simulation/file/download/geometry/img/check'
    this.downLoadFile = '/simulation/file/download/geometry/conf'
    this.defaultParams = {
      geometryId: '100',
      nodeId: '1000',
    }
    this.addPlanParams = {
      designerId: 1,
      designerModel: 1,
      geometryDes: '测试',
      geometryTitle: 'string',
      nodeId: '',
      shapeFileName: 'string',
      simFileName: '',
      simFileState: 0,
    }
    this.uploadFiles = {
      file: '',
      fileName: '',
    }
    this.uploadPic = {
      file: '',
      newFileName: '',
    }
    this.shapeParams = {
      direction: '',
      geometryId: '',
      nodeId: '',
    }
    this.laneInfoParams = {
      direction: '',
      geometryId: '',
      laneSeq: '',
      laneRType: '',
      location: '',
      nodeId: '',
    }
    this.updateParams = {
      shape: {
        rowId: '',
        geometryRowId: '', // 所属渠化方案行号
        directionCode: '', // 路口方向
        // directionType: '',
        separateType: '', // 中央分隔带方式
        separateWidth: '', // 分隔带宽度
        ifTurnBefore: '', // 是否左转提前掉头
        ifTurnDistance: '', // 提前掉头
        turnRightType: '', // 右转渠化设置
        ifPavement: '', // 是否有行人过街
        ifLandPavement: '', // 是否有行人过街安全岛
      },
      shapeLane: {
        rowId: '',
        geometryRowId: '',
        directionCode: '', // 路口方向
        laneRType: '', // 车道进出口类型
        laneLocation: '', // 车道路段位置
        laneSeq: '', // 车道编号
        laneType: '', // 车道类型
        laneTurn: '', // 车道转向
        laneWidth: '', // 车道宽度
        laneLength: '', // 车道长度
        ifWaiting: '', // 是否有待行区
        waitingLength: '', // 待行区长度
        laneStructure: '', // 车道结构
      },
    }
  }
  componentDidMount = () => {
    if (!sessionStorage.getItem('interPlanMsg')) {
      // console.log(window.opener)
      sessionStorage.setItem('interPlanMsg', window.opener.InterPlanMsg)
    }
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('interPlanMsg'))
    const { nodeId } = this.InterPlanMsg
    this.nodeId = nodeId
    this.addPlanParams.nodeId = nodeId
    this.defaultParams.nodeId = nodeId
    this.shapeParams.nodeId = nodeId
    this.laneInfoParams.nodeId = nodeId
    this.setState({ InterPlanMsg: this.InterPlanMsg })
    this.getPlanLists(this.InterPlanMsg.nodeId)
  }
  getAllDatas = (geometryId, rowId, nodeId, planName) => {
    this.defaultParams.geometryId = geometryId
    this.addPlanParams.geometryTitle = planName
    this.uploadFiles.fileName = nodeId + String(rowId)
    this.uploadPic.newFileName = nodeId + String(rowId)
    this.shapeParams.geometryId = geometryId
    this.laneInfoParams.geometryId = geometryId
    this.laneInfoParams.nodeId = nodeId
    this.updateParams.shape.rowId = rowId
    this.updateParams.shape.geometryRowId = geometryId
    this.updateParams.shapeLane.rowId = rowId
    this.updateParams.shapeLane.geometryRowId = geometryId
    this.getDirectionList(geometryId, nodeId)
    this.getSplitWay()
    this.getTrueOrFalse()
    this.getConstruction()
    this.getRoadTypes()
    this.getRoadTurnTo()
    this.getRightCanalization()
    this.getLaneNumber(nodeId, geometryId)
  }
  // 分隔带方式
  getSplitWay = () => {
    getResponseDatas('get', this.codeInfoUrl + '5').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ splitWay: content })
      }
    })
  }
  // 右转渠化
  getRightCanalization = () => {
    getResponseDatas('get', this.codeInfoUrl + '7').then((res) => {
      if (res.data.code === 200) {
        this.setState({ rightCanalization: res.data.content })
      }
    })
  }
  // 车道转向
  getRoadTurnTo = () => {
    getResponseDatas('get', this.codeInfoUrl + '11').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ roadTurnTo: content })
        // this.updateParams.shapeLane.laneTurn = content[0].dictCode
      }
    })
  }
  // 车道类型
  getRoadTypes = () => {
    getResponseDatas('get', this.codeInfoUrl + '13').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ roadTypes: content })
        // this.updateParams.shapeLane.laneType = content[0].dictCode
      }
    })
  }
  // 所属道路结构
  getConstruction = () => {
    getResponseDatas('get', this.codeInfoUrl + '12').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ constructions: content })
        // this.updateParams.shapeLane.laneStructure = content[0].dictCode
      }
    })
  }
  // 所属路段
  getBelongstostretch = () => {
    return getResponseDatas('get', this.codeInfoUrl + '9').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ belongStretch: content })
        this.belongStretchVal = content[0]
        // this.updateParams.shapeLane.laneLocation = content[0].dictCode
        return this.belongStretchVal
      }
    })
  }
  // 所属进出口类型
  getTurnOverType = () => {
    return getResponseDatas('get', this.codeInfoUrl + '8').then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.setState({ TurnOverType: content })
        this.TurnOverTypeVal = content[0]
        // this.updateParams.shapeLane.laneRType = content[0].dictCode
        return this.TurnOverTypeVal
      }
    })
  }
  // 是否提前掉头 是否有行人道 行人道安全道 是否有待行区
  getTrueOrFalse = () => {
    getResponseDatas('get', this.codeInfoUrl + '6').then((res) => {
      if (res.data.code === 200) {
        this.setState({ trueOrFalse: res.data.content })
      }
    })
  }
  // 中心隔离带设置
  getCenterSplitSet = () => {
    getResponseDatas('get', this.shapeUrl, this.shapeParams).then((result) => {
      const { code, content } = result.data
      if (code === 200) {
        const { separateType, separateWidth, ifTurnBefore, turnRightType, ifPavement, ifLandPavement, ifTurnDistance } = content
        this.setState({
          separateType,
          separateWidth,
          ifTurnBefore: +ifTurnBefore,
          turnRightType,
          ifPavement: +ifPavement,
          ifLandPavement: +ifLandPavement,
          ifTurnDistance,
        })
        Object.keys(content).forEach((item) => {
          this.updateParams.shape[item] = content[item]
        })
      }
    })
  }
  // 道路名称
  getRoadName = (nodeId, geometryId, dirId) => {
    getResponseDatas('get', `${this.roadNameUrl}/${nodeId}/${geometryId}/${dirId}`).then((response) => {
      const { code, content } = response.data
      if (code === 200) {
        this.setState({ roadName: content })
      }
    })
  }
  // 所属方向
  getDirectionList = (geometryId, nodeId, isshapeReload = true) => {
    return getResponseDatas('get', this.directionUrl, this.defaultParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ directionList: content })
          this.directionListVal = content[0].id
          this.shapeParams.direction = content[0].id
          this.updateParams.shape.directionCode = content[0].id
          this.updateParams.shapeLane.directionCode = content[0].id
          if (isshapeReload) {
            this.getCenterSplitSet()
            this.getRoadName(nodeId, geometryId, content[0].id)
          }
        } else {
          this.setState({
            directionList: null,
            separateType: '',
            separateWidth: '',
            ifTurnBefore: '',
            turnRightType: '',
            ifPavement: '',
            ifLandPavement: '',
            roadName: '',
          })
        }
        return content[0]
      }
    })
  }
  // 获取车道编号后 --> 获取车道宽度，车道长度，待行区长度
  getShapeLanInfo = () => {
    getResponseDatas('get', this.shapeLaneInfo, this.laneInfoParams).then((result) => {
      const { code, content } = result.data
      if (code === 200) {
        const { laneWidth, laneLength, waitingLength, ifWaiting, laneStructure, laneType, laneTurn, laneLocation } = result.data.content
        this.setState({
          laneWidth,
          laneLength,
          waitingLength,
          ifWaiting: +ifWaiting,
          laneStructure,
          laneType,
          laneTurn,
          laneLocation,
        })
        Object.keys(content).forEach((item) => {
          this.updateParams.shapeLane[item] = content[item]
        })
      }
    })
  }
  // 获取车道编号
  getLaneDetails = (nodeId, geometryId, direction, lineType, locations) => {
    const directionVal = this.directionListVal ? this.directionListVal : direction.id
    getResponseDatas('get', `${this.lineNumberUrl}${nodeId}/${geometryId}/${directionVal}/${lineType.dictCode || lineType}/${locations.dictCode || locations}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        if (content.length > 0) {
          this.setState({ laneNumber: content, defaultLineNum: content[0] })
          this.laneNumberVal = content[0]
          this.updateParams.shapeLane.laneSeq = this.laneNumberVal
          this.laneInfoParams.direction = directionVal
          this.laneInfoParams.laneSeq = this.laneNumberVal
          this.laneInfoParams.location = locations.dictCode
          this.laneInfoParams.laneRType = lineType.dictCode
          this.getShapeLanInfo()
        }
      }
    })
  }
  // 根据车道编号所依赖的参数获取车道编号
  getLaneNumber = (nodeId, geometryId) => {
    const turnOVerType = this.getTurnOverType()
    const belongsTostretch = this.getBelongstostretch()
    const direction = this.directionListVal ? this.directionListVal : this.getDirectionList(geometryId, nodeId, false)
    Promise.all([turnOVerType, belongsTostretch, direction]).then((value) => {
      // console.log(value)
      if (value[0] && value[1] && value[2]) {
        this.getLaneDetails(nodeId, geometryId, value[2], value[0], value[1])
      } else {
        this.setState({
          laneWidth: '',
          laneLength: '',
          waitingLength: '',
          laneNumber: '',
        })
      }
    })
  }
  // 方案列表
  getPlanLists = (nodeId) => {
    getResponseDatas('get', this.planListUrl + nodeId).then((res) => {
      const { code, content } = res.data
      if (code === 200 && content.length > 0) {
        const { planMsg } = this.InterPlanMsg
        const { geometryId, rowId } = this.InterPlanMsg.planMsg ? this.InterPlanMsg.planMsg : content[0]
        this.setState({
          planList: content,
          planRowId: geometryId,
        }, () => {
          this.handleChangePlan(geometryId)
        })
      } else {
        this.setState({ planList: [] })
      }
    })
  }
  // 添加方案
  getNewPlanName = (planName) => {
    this.addPlanParams.geometryTitle = planName
    getResponseDatas('post', this.addPlanUrl, this.addPlanParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getPlanLists(this.InterPlanMsg.nodeId)
      } else {
        message.warning(content)
      }
    })
  }
  handleCustomMode = () => {
    if (!this.state.isOpenMode) return
    this.setState({ isOpenMode: !this.state.isOpenMode })
  }
  handleOpenMode = () => {
    if (this.state.isOpenMode) return
    this.setState({ isOpenMode: !this.state.isOpenMode })
  }
  handleShapeTextClick = (bool) => {
    this.setState({
      isShape: bool,
      shapeSelect: bool,
    })
  }
  // 上传文件
  handleUploadFile = () => {
    const fileMsg = this.uploadInput.files[0]
    this.setState({ fileName: fileMsg.name })
  }
  handleUploadBtn = () => {
    const formData = new FormData()
    formData.append('file', this.uploadInput.files[0])
    getResponseDatas('post', `${this.uploadFileUrl}${this.breakCheck}/${this.uploadFiles.fileName}/${this.rowId}`, formData).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        message.info(content.message)
        this.setState({
          showDownLoad: true,
          upLoadFileName: this.uploadFiles.fileName,
        })
        setTimeout(() => {
          window.location.reload()
        }, 400)
      } else if (code === -996) {
        const { confirm } = Modal
        const selfThis = this
        confirm({
          title: content,
          className: styles.confirmBox,
          bodyStyle: { backgroundColor: 'transparent' },
          onOk() {
            selfThis.breakCheck = 1
            selfThis.handleUploadBtn()
          },
        })
      } else {
        message.warning(content)
      }
    })
  }
  // 上传图片
  handleUploadPicFile = () => {
    const fileMsg = this.uploadPicInput.files[0]
    this.setState({ PicName: fileMsg.name })
  }
  handleUploadPicBtn = () => {
    const formData = new FormData()
    formData.append('file', this.uploadPicInput.files[0])
    formData.append('newFileName', this.uploadPic.newFileName)
    getResponseDatas('post', this.uploadPicUrl, formData).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        message.info(content.message)
        this.setState({ shapePicUrl: content.requestPrefix + content.newName + '?time=' + new Date().getTime() })
        this.planItems.shapeFileName = content.newName
        getResponseDatas('put', this.updatePlanName, this.planItems).then((res) => {
          // console.log('upload success -> callback', res)
          if (res.data.code === 200) {
            this.getPlanLists(this.nodeId)
            this.setState({ PicName: null })
          }
        })
      } else {
        message.warning(content)
      }
    })
  }
  // 下载图片
  handleDownLoadPic = () => {
    const { nodeId, geometryId } = this.defaultParams
    getResponseDatas('get', `${this.downLoadPic}/${nodeId}/${geometryId}`).then((res) => {
      // console.log(res)
      const { code, content } = res.data
      if (code === 200) {
        window.location.href = `http://39.100.128.220:20199/simulation/file/download/geometry/img/${content}`
      } else {
        message.warning(content)
      }
    })
  }
  // 删除方案
  handleDeletePlan = (geometryId, nodeId, id, rowId) => {
    getResponseDatas('delete', `${this.deleteUrl}/${nodeId}/${geometryId}/${rowId}`).then((res) => {
      this.getPlanLists(nodeId)
      message.info(res.data.content)
    })
  }
  // 切换方案
  handleChangePlan = (geometryId) => {
    const planItems = (this.state.planList.filter(item => item.geometryId === geometryId))[0] || this.state.planList[0]
    const { geometryTitle, shapeFileName, simFileName, rowId } = planItems
    this.geometryId = geometryId
    this.rowId = rowId
    if (this.InterPlanMsg.planMsg) {

      Object.keys(planItems).forEach((item) => {
        this.InterPlanMsg.planMsg[item] = planItems[item]
      })
    } else {
      this.InterPlanMsg.planMsg = {}
      this.InterPlanMsg.planMsg.geometryId = geometryId
    }
    sessionStorage.setItem('interPlanMsg', JSON.stringify(this.InterPlanMsg))
    this.planItems = planItems
    this.setState({
      shapePicUrl: shapeFileName + '?time=' + new Date().getTime(),
      upLoadFileName: simFileName,
    }, () => {
      this.getAllDatas(geometryId, rowId, this.InterPlanMsg.nodeId, geometryTitle)
    })
  }
  // 修改方案名称
  handleChangePlanName = (name, rowId) => {
    const planItem = this.state.planList.filter(item => item.geometryId === parseInt(rowId, 0))
    planItem[0].geometryTitle = name
    getResponseDatas('put', this.updatePlanName, planItem[0]).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        this.getPlanLists(this.nodeId)
      }
      message.info(content)
    })
  }
  // 修改所属方向
  handleDirChange = (value, options) => {
    // console.log(value, options)
    const { selname, paramsname } = options.props
    const valueId = options.key
    this.directionListVal = valueId
    this.shapeParams.direction = valueId
    this.laneInfoParams.direction = valueId
    if (selname === 'shape') { // 中心隔离带设置
      this.updateParams.shape[paramsname] = valueId
      this.getCenterSplitSet()
    } else if (selname === 'shapeLane') {
      this.updateParams.shapeLane[paramsname] = valueId
      // const { geometryId } = this.InterPlanMsg.planMsg
      const { nodeId } = this.InterPlanMsg
      this.getLaneNumber(nodeId, this.geometryId)
      this.getRoadName(nodeId, this.geometryId, this.directionListVal)
    }
    this.setState({ hiddenSave: false })
  }
  // 修改车道编号, 车道类型, 所属路段
  handleLaneMsgChange = (value, options) => {
    const valueId = options.key
    const { paramsname } = options.props
    this.laneNumberVal = valueId
    this.updateParams.shapeLane[paramsname] = valueId
    this.laneInfoParams.laneSeq = this.laneNumberVal
    if (paramsname === 'laneLocation') {
      const { nodeId, geometryId } = this.defaultParams
      // console.log(nodeId, geometryId, valueId)
      this.getLaneDetails(nodeId, geometryId, this.directionListVal, this.TurnOverTypeVal, valueId)
    } else {
      this.getShapeLanInfo()
    }
    this.setState({ hiddenSave: false })
  }
  // 修改进出口类型, 车道转向, 是否待行区, 道路结构
  handleLaneInfoChange = (value, options) => {
    const valueId = options.key
    const { paramsname } = options.props
    this.updateParams.shapeLane[paramsname] = valueId
    this.setState({ hiddenSave: false })
  }
  // 修改是否提前掉头 右转渠化设置 是否有行人道 行人道安全道
  handleShapeInfoChange = (value, options) => {
    const valueId = options.key
    const { paramsname } = options.props
    this.updateParams.shape[paramsname] = valueId
    this.setState({ hiddenSave: false })
  }
  handleSavePlan = () => {
    if (this.state.hiddenSave) return
    const shapeParams = escape(JSON.stringify(this.updateParams.shape))
    const shapeLaneParams = escape(JSON.stringify(this.updateParams.shapeLane))
    getResponseDatas('post', this.updateDirLane + '?shape=' + shapeParams + '&shapeLane=' + shapeLaneParams).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        message.info(content)
        this.setState({ hiddenSave: true }, () => {
          // setTimeout(() => {
          //   window.location.reload()
          // }, 1000)
        })
      }
    })
  }
  // 修改分隔带宽度 提前距离 车道宽度 车道长度 待行区长度
  handleTextChange = (e) => {
    const paramsName = e.target.getAttribute('paramsname')
    const value = parseFloat(e.target.innerText)
    if (paramsName in this.updateParams.shape) {
      this.updateParams.shape[paramsName] = value
    } else if (paramsName in this.updateParams.shapeLane) {
      this.updateParams.shapeLane[paramsName] = value
    }
    this.setState({
      hiddenSave: false,
    })
  }
  // 下载文件
  handleDownloadFile = () => {
    getResponseDatas('get', `${this.downLoadFile}/${this.nodeId}/${this.geometryId}`).then((res) => {
      const { code, content } = res.data
      if (code === 200) {
        window.location.href = `http://39.100.128.220:20199${this.downLoadFile}/${content}`
      } else {
        message.warning(content)
      }
    })
  }
  handleChangeLaneType = (value, options) => {
    this.updateParams.shapeLane.laneType = options.key
    this.setState({ hiddenSave: false })
  }
  render() {
    const { Option } = Select
    const { InterPlanMsg, planList } = this.state
    return (
      <div className={styles.canalizWrapper}>
        {
          !!InterPlanMsg &&
          <Header InterName={InterPlanMsg.interName} hiddenSave={this.state.hiddenSave} handleSavePlan={this.handleSavePlan} />
        }
        <div className={styles.canalizBox}>
          <div className={styles.planListBox}>
            {
              planList &&
                <AddPlanList
                  typeId="geometryId"
                  key={planList.length}
                  planList={planList}
                  getNewPlanName={this.getNewPlanName}
                  handleDeletePlan={this.handleDeletePlan}
                  planRowId={this.state.planRowId}
                  changePlan={this.handleChangePlan}
                  changePlanName={this.handleChangePlanName}
                />
            }
          </div>
          <div className={styles.interShapeSet}>
            <div className={styles.interShape}>
              <div className={styles.interShapeBg} />
              <div
                className={classNames({
                  [styles.shapeText]: true,
                  [styles.shapeSelect]: this.state.shapeSelect,
                })}
                onClick={() => { this.handleShapeTextClick(true) }}
              >路口形状
              </div>
            </div>
            <div className={styles.interShape}>
              <div className={styles.interSetBg} />
              <div
                className={classNames({
                  [styles.shapeText]: true,
                  [styles.shapeSelect]: !this.state.shapeSelect,
                })}
                onClick={() => { this.handleShapeTextClick(false) }}
              >车道配置
              </div>
            </div>
          </div>
          {
            this.state.isShape &&
            <div className={styles.rightDrawAgain}>
              <div className={styles.splitBorder} />
              <div className={styles.modeBox}>
                {/* <div
                  className={classNames({
                    [styles.modeBtn]: true,
                    [styles.whichMode]: !this.state.isOpenMode,
                  })}
                  onClick={this.handleCustomMode}
                >
                  开放模式
                </div> */}
                <div
                  className={classNames({
                    [styles.modeBtn]: true,
                    [styles.whichMode]: this.state.isOpenMode,
                  })}
                  onClick={this.handleOpenMode}
                >
                  定制模式
                </div>
              </div>
              {
                !this.state.isOpenMode &&
                <React.Fragment>
                  <div className={styles.introduce}>
                    用户需要自定义路口形状<br />
                    支持标准的交叉路口，最多可支持5叉口
                  </div>
                  <div className={styles.drawAgainBox}>
                    <div className={styles.drawAgainBtn}>重新绘制</div>
                  </div>
                </React.Fragment>
              }
              {
                this.state.isOpenMode &&
                <div className={styles.introduce}>
                  针对复杂的交叉口（高架，立交，环岛）<br />
                  需要上传定制的建模文件
                </div>
              }
            </div>
          }
          {
            !this.state.isShape ?
              <div className={styles.settingBox}>
                <div className={styles.centerIsolate}>
                  <div style={{ paddingLeft: '10px' }}><Title title="中心隔离带设置" /></div>
                  <div className={styles.isolateSet}>
                    <ul>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>所属方向：</span>
                          {
                            !!this.state.directionList &&
                            <Select
                              defaultValue={this.state.directionList[0].name}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleDirChange}
                            >
                              {
                                this.state.directionList.map(item => (
                                  <Option value={item.name} key={item.id} selname="shape" paramsname="directionCode">{item.name}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>分隔带方式：</span>
                          {
                            !!this.state.splitWay &&
                            <Select
                              key={this.state.separateType}
                              defaultValue={this.state.separateType}
                              style={{ width: '77px', color: '#ff8800' }}
                              onChange={this.handleShapeInfoChange}
                            >
                              {
                                this.state.splitWay.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="separateType">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                        <SetItems
                          key={this.state.separateWidth}
                          itemname="分隔带宽度"
                          types="input"
                          value={`${this.state.separateWidth}m`}
                          handleTextChange={this.handleTextChange}
                          paramsname="separateWidth"
                          color="#ff8800"
                        />
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>是否提前掉头：</span>
                          {
                            !!this.state.trueOrFalse &&

                            <Select
                              key={this.state.ifTurnBefore}
                              defaultValue={this.state.ifTurnBefore}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleShapeInfoChange}
                            >
                              {
                                this.state.trueOrFalse.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="ifTurnDistance">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                        <SetItems
                          key={this.state.ifTurnDistance}
                          itemname="提前距离"
                          types="input"
                          value={`${this.state.ifTurnDistance}m`}
                          handleTextChange={this.handleTextChange}
                          paramsname="ifTurnDistance"
                          color="#ff8800"
                        />
                      </li>
                      <li className={styles.setItemsLi}>
                        {/* <SetItems itemname="右转渠化设置" types="text" text="无" color="#ff0000" /> */}
                        <div className={styles.setItem}>
                          <span>右转渠化设置：</span>
                          {
                            !!this.state.rightCanalization &&
                            <Select
                              key={this.state.turnRightType}
                              defaultValue={this.state.turnRightType}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleShapeInfoChange}
                            >
                              {
                                this.state.rightCanalization.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="turnRightType">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>是否有行人道：</span>
                          {
                            !!this.state.trueOrFalse &&
                            <Select
                              key={this.state.ifPavement}
                              defaultValue={this.state.ifPavement}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleShapeInfoChange}
                            >
                              {
                                this.state.trueOrFalse.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="ifPavement">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                        <div className={styles.setItem}>
                          <span>行人道安全道：</span>
                          {
                            !!this.state.trueOrFalse &&
                            <Select
                              key={this.state.ifLandPavement}
                              defaultValue={this.state.ifLandPavement}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleShapeInfoChange}
                            >
                              {
                                this.state.trueOrFalse.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="ifLandPavement">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div><SplitLine /></div>
                <div className={styles.laneConfigBox}>
                  <div style={{ paddingLeft: '10px' }}><Title title="车道配置" /></div>
                  <div className={styles.laneConfig}>
                    <ul>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>所属方向：</span>
                          {
                            !!this.state.directionList &&
                            <Select
                              defaultValue={this.state.directionList[0].name}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleDirChange}
                            >
                              {
                                this.state.directionList.map(item => (
                                  <Option value={item.name} key={item.id} selname="shapeLane" paramsname="directionCode">{item.name}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <SetItems key={this.state.roadName} itemname="道路名" types="text" text={this.state.roadName} color="#ff8800" />
                        <div className={styles.setItem}>
                          <span>车道编号：</span>
                          {
                            !!this.state.laneNumber &&
                            <Select
                              key={this.directionListVal}
                              defaultValue={this.state.defaultLineNum}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneMsgChange}
                            >
                              {
                                this.state.laneNumber.map(item => (
                                  <Option value={item} key={item} paramsname="laneSeq">{item}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>所属进出口类型：</span>
                          {
                            !!this.state.TurnOverType &&
                            <Select
                              key={this.state.TurnOverType[0].codeName}
                              defaultValue={this.state.TurnOverType[0].codeName}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneInfoChange}
                            >
                              {
                                this.state.TurnOverType.map(item => (
                                  <Option value={item.codeName} key={item.dictCode} title={item.codeName} paramsname="laneRType">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>所属路段：</span>
                          {
                            !!this.state.belongStretch &&
                            <Select
                              defaultValue={this.state.laneLocation}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneMsgChange}
                            >
                              {
                                this.state.belongStretch.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="laneLocation">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>车道类型：</span>
                          {
                            !!this.state.roadTypes &&
                            <Select
                              key={this.state.laneType + this.laneNumberVal}
                              defaultValue={this.state.laneType}
                              style={{ width: '80px', color: '#27fdb5' }}
                              onChange={this.handleChangeLaneType}
                            >
                              {
                                this.state.roadTypes.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="laneType">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>车道转向：</span>
                          {
                            !!this.state.roadTurnTo &&
                            <Select
                              key={this.state.laneTurn}
                              defaultValue={this.state.laneTurn}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneInfoChange}
                            >
                              {
                                this.state.roadTurnTo.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="laneTurn">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                      <li className={styles.setItemsLi}>
                        <SetItems
                          key={this.state.laneWidth}
                          itemname="车道宽度"
                          types="input"
                          value={`${this.state.laneWidth}m`}
                          color="#ff8800"
                          handleTextChange={this.handleTextChange}
                          paramsname="laneWidth"
                        />
                        <SetItems
                          key={this.state.laneLength}
                          itemname="车道长度"
                          types="input"
                          value={`${this.state.laneLength}m`}
                          color="#ff8800"
                          handleTextChange={this.handleTextChange}
                          paramsname="laneLength"
                        />
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>是否有待行区</span>
                          {
                            !!this.state.trueOrFalse &&
                            <Select
                              key={this.state.ifWaiting}
                              defaultValue={this.state.ifWaiting}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneInfoChange}
                            >
                              {
                                this.state.trueOrFalse.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="ifWaiting">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                        <SetItems
                          key={this.state.waitingLength}
                          itemname="待行区长度"
                          types="input"
                          value={`${this.state.waitingLength}m`}
                          color="#ff8800"
                          handleTextChange={this.handleTextChange}
                          paramsname="waitingLength"
                        />
                      </li>
                      <li className={styles.setItemsLi}>
                        <div className={styles.setItem}>
                          <span>所属道路结构</span>
                          {
                            !!this.state.constructions &&
                            <Select
                              key={this.state.laneStructure}
                              defaultValue={this.state.laneStructure}
                              style={{ color: '#27fdb5' }}
                              onChange={this.handleLaneInfoChange}
                            >
                              {
                                this.state.constructions.map(item => (
                                  <Option value={item.dictCode} key={item.dictCode} title={item.codeName} paramsname="laneStructure">{item.codeName}</Option>
                                ))
                              }
                            </Select>
                          }
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div> : null
          }
          <div className={styles.centerWrapper}>
            {
              !this.state.isShape ?
                <React.Fragment>
                  <div className={styles.openModePicBox}>
                    <img width="100%" height="100%" src={this.state.shapePicUrl} alt="" />
                  </div>
                  <div className={styles.uploadPicBox}>
                    <span>上传渠化图：</span>
                    <div className={styles.checkPicBox}>
                      {this.state.PicName}
                      <div className={styles.checkPic}>
                        浏览文件
                        <input
                          className={styles.PicInput}
                          type="file"
                          ref={(input) => { this.uploadPicInput = input }}
                          onChange={this.handleUploadPicFile}
                        />
                      </div>
                    </div>
                    <div className={styles.uploadPicBtn} onClick={this.handleUploadPicBtn}>上传提交</div>
                    <div className={styles.uploadPicBtn} onClick={this.handleDownLoadPic}>下载图片</div>
                  </div>
                </React.Fragment> : this.state.isShape && !this.state.isOpenMode ?
                  <div className={styles.modePicBox} /> : this.state.isShape && this.state.isOpenMode ?
                    <div className={styles.uploadFile}>
                      <div className={styles.uploadBox}>
                        {/* <span className={styles.uploadText}>上传渠化图：</span> */}
                        <div className={styles.checkFileBox}>
                          {this.state.fileName}
                          <div className={styles.checkFile}>
                            浏览文件
                            <input
                              className={styles.fileInput}
                              type="file"
                              ref={(input) => { this.uploadInput = input }}
                              onChange={this.handleUploadFile}
                            />
                          </div>
                        </div>
                        <div className={styles.uploadBtn} onClick={this.handleUploadBtn}>上传提交</div>
                      </div>
                      {
                        this.state.showDownLoad &&
                        <div className={styles.downLoadBox}>
                          <div className={styles.fileName}>
                            <div className={styles.fileBg} />
                            <div className={styles.fileText}>
                              <p className={styles.text} key={this.state.upLoadFileName}>{this.state.upLoadFileName}</p>
                              <p className={styles.fileTip}>文件夹</p>
                            </div>
                          </div>
                          <div className={styles.fileTime}>
                            <div className={styles.time}>{this.state.upLoadFileTime}</div>
                            <div className={styles.downLoad} onClick={this.handleDownloadFile}>下载</div>
                          </div>
                        </div>
                      }
                    </div> : null
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Canalization
