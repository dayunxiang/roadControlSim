import React from 'react'
import { Select, Radio, Icon, Progress, message, DatePicker, Checkbox, Typography } from 'antd'
import moment from 'moment'
import styles from './AreaAllocation.scss'

import getResponseDatas from '../../../utlis/getResponseData'
import Header from '../../Header/AreaHeader'
// import GreenWaveCharts from '../../../components/GreenWaveCharts/GreenWaveCharts'
// import AddPlanList from '../../../components/AddPlanList/AddPlanList'
import InputLabel from '../../InterPlan/Allocation/InputLabel/InputLabel'

const dateFormat = 'YYYY-MM-DD HH:mm:ss'
// const { Paragraph } = Typography
class AreaAllocation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      paramerDetailInfo: {},
      paramerDetail: null,
      drivingType: null,
      progress: null,
      hiddenSave: true,
    }
    this.targetId = 10000
    this.paramerDetail = {
      targetId: '',
      flowId: '',
      stpId: '',
      geometryId: '',
      fileName: '',
      taskType: 2,
    }
    this.paramerDetails = {
      designerId: 1,
      detectorInterval: '',
      // 路口+渠化+流量+信号 编号
      fileName: '',
      // 流量
      flowId: '',
      // 渠化
      geometryId: '',
      programDes: '',
      programTitle: '',
      randomSeed: '',
      rowId: '',
      simDate: new Date(),
      simDuration: '',
      simFlag: 0,
      simParameterId: '',
      simRuns: '',
      simSpeed: '',
      simStep: '',
      imStepTo: '0.1',
      // 仿真过程中是否录制视频
      simVideoYn: 1,
      // 信号
      stpId: 0,
      // 路口id
      targetId: 0,
      taskType: 2,
      // 是否显示车辆
      vehicleYn: 0,
      simStateName: '',
      simFlagName: '',
      simState: '0',
    }
    this.InterPlanMsg = JSON.parse(sessionStorage.getItem('areaPlanMsg'))
    this.taskListUrl = '/simulation/sim/task/get/sim/task/' // 1000/1/100/10000/10000' // {targetId}/{taskType}/{geometryId}/{flowId}/{stpId}查询路口当前仿真方案'
    this.simparamUrl = '/simulation/sim/task/get/use/sim/param' // 查询当前使用的方案参数'
    this.taskUpdateUrl = '/simulation/sim/task/update' // 修改仿真方案'
    this.taskAddUrl = '/simulation/sim/task/add' // 新增仿真方案'
    this.taskstart = '/simulation/sim/task/run/task/' // {rowId}// 更新仿真任务状态（开始）'
    this.drivingTypeUrl = '/simulation/code/list/codeInfo/'
    this.flagState = '/simulation/sim/task/get/sim/task/flag/state/by/' // {simRowId} 根据仿真任务主键ID获取仿真任务状态和进度'
    this.parentName = '/simulation/code/list/sim/flag/parent/name' // 查询进度条下分段名称
  }
  componentDidMount = () => {
    if (this.InterPlanMsg.areaId) {
      this.paramerDetail.targetId = this.InterPlanMsg.areaId
      this.paramerDetail.flowId = this.InterPlanMsg.planMsg.flowId
      this.paramerDetail.stpId = this.InterPlanMsg.planMsg.stpId
      this.paramerDetail.geometryId = this.InterPlanMsg.planMsg.areaGeometryId
      this.paramerDetail.fileName = this.InterPlanMsg.areaId.toString() + this.InterPlanMsg.planMsg.areaGeometryId + this.InterPlanMsg.planMsg.flowId + this.InterPlanMsg.planMsg.stpId
    }
    this.getdrivingType()
    this.getsimparam()
  }
  componentWillUnmount = () => {
    if (this.timeState) {
      clearInterval(this.timeState)
      this.timeState = null
    }
  }
  getNowFormatDate = () => {
    const dates = new Date()
    const years = dates.getFullYear()
    let month = dates.getMonth() + 1
    let days = dates.getDate()
    month = month <= 9 ? '0' + month : month
    days = days <= 9 ? '0' + days : days
    return years + '-' + month + '-' + days
  }
  getsimparam = () => {
    getResponseDatas('get', this.simparamUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        let { paramerDetail } = this.state
        paramerDetail = { ...paramerDetail, ...result.content.parameterTask, simParameterId: result.content.parameter.simParameterId }
        this.paramerDetail = { ...this.paramerDetail, ...paramerDetail }
        this.setState({ paramerDetailInfo: result.content.parameter }, () => {
          this.gettaskList(paramerDetail)
        })
      }
    })
  }
  getflagStatea = (rowId) => {
    getResponseDatas('get', this.flagState + rowId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const { paramerDetail } = this.state
        const { simState, simVideoYn, simFlag, simFlagName, simProgress, simStateName } = result.content
        paramerDetail.simFlag = simFlag
        paramerDetail.simFlagName = simFlagName
        paramerDetail.simState = simState
        paramerDetail.simStateName = simStateName
        paramerDetail.simProgress = simProgress
        if (simState === 3 || (simState === 2 && ((simVideoYn === 0 && simFlag === 315) || (simVideoYn === 1 && simFlag === 316)))) {
          clearInterval(this.timeState)
          this.timeState = null
        }
        this.setState({ paramerDetail, hiddenSave: true })
      }
    })
  }
  gettaskList = (paramerDetail) => {
    const {
      stpId, flowId, geometryId, taskType, targetId,
    } = this.paramerDetail
    getResponseDatas('get', this.taskListUrl + targetId + '/' + taskType + '/' + geometryId + '/' + flowId + '/' + stpId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (result.content) {
          const { simState, rowId, simVideoYn, simFlag } = result.content
          if (simState !== -1) {
            this.timeState = setInterval(this.getflagStatea.bind(null, rowId), 1000)
          }
          if (simState === 3 || (simState === 2 && ((simVideoYn === 0 && simFlag === 315) || (simVideoYn === 1 && simFlag === 316)))) {
            clearInterval(this.timeState)
            this.timeState = null
          }
          this.paramerDetail = result.content
          this.setState({ paramerDetail: result.content })
        } else {
          this.setState({ paramerDetail })
        }
      } else {
        this.setState({ paramerDetail })
      }
    })
  }
  getdrivingType = () => {
    getResponseDatas('get', this.drivingTypeUrl + 28).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ drivingType: result.content })
      }
    })
    getResponseDatas('get', this.parentName).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ progress: result.content })
      }
    })
  }
  getTaskstart = () => {
    const { paramerDetail } = this.state
    if (paramerDetail.rowId) {
      getResponseDatas('put', this.taskstart + paramerDetail.rowId).then((res) => {
        const result = res.data
        if (result.code === 200) {
          if (this.timeState) {
            clearInterval(this.timeState)
            this.timeState = null
          }
          message.success('操作成功!', 1)
          this.setState({ paramerDetail })
          this.timeState = setInterval(this.getflagStatea.bind(null, paramerDetail.rowId), 1000)
        } else {
          message.error('网络异常，请稍后再试!', 1)
        }
      })
    } else {
      message.warning('请保存当前配置!', 1)
    }
  }
  getsimulatset = () => {
    message.error('正在仿真中,请稍后修改!', 1)
  }
  // 保存的回调
  handleSavePlan = () => {
    if (!this.paramerDetail.simStepTo) {
      this.paramerDetail.simStepTo = this.paramerDetail.simStep
    }
    if (!this.paramerDetail.programTitle) {
      message.warning('请填写方案名称!', 1)
      return
    }
    if (!this.paramerDetail.simDate) {
      message.warning('请填写仿真开始时间!', 1)
      return
    }
    if (!this.paramerDetail.simDuration) {
      message.warning('请填写仿真时长!', 1)
      return
    }
    if (!this.paramerDetail.randomSeed) {
      message.warning('请填写随即种子!', 1)
      return
    }
    if (!this.paramerDetail.simSpeed) {
      message.warning('请填写仿真速度!', 1)
      return
    }
    if (!this.paramerDetail.detectorInterval) {
      message.warning('请填写检测器上传间隔!', 1)
      return
    }
    if (!this.paramerDetail.simStep) {
      message.warning('请选择仿真步长!', 1)
      return
    }
    // console.log(this.paramerDetail.simStep, this.paramerDetail.simStepTo)
    if ((this.paramerDetail.simStep < 1) && (this.paramerDetail.simStep)) {
      this.paramerDetail.simStep = this.paramerDetail.simStepTo
      if (!this.paramerDetail.simStepTo) {
        message.warning('请填写仿真步长!', 1)
        return
      }
    }
    // rowid存在即编辑
    if (this.paramerDetail.rowId) { // 编辑
      getResponseDatas('put', this.taskUpdateUrl, this.paramerDetail).then((res) => {
        const result = res.data
        if (result.code === 200) {
          this.setState({ hiddenSave: true })
          message.success(result.content)
        } else {
          message.error('网络异常，请稍后再试!')
        }
      })
    } else {
      getResponseDatas('post', this.taskAddUrl, this.paramerDetail).then((res) => {
        const result = res.data
        if (result.code === 200) { // 新增
          this.getsimparam()
          this.setState({ hiddenSave: true })
          message.success('保存成功!')
        } else {
          message.error('网络异常，请稍后再试!')
        }
      })
    }
  }
  handleChangeBot = (e, name) => {
    this.setState({ hiddenSave: false })
    e.stopPropagation()
    if (name === 'simStepTo') {
      if (parseFloat(e.target.innerText) > 1) {
        this.paramerDetail[name] = 1
      } else if (parseFloat(e.target.innerText) <= 0) {
        this.paramerDetail[name] = 0.1
      } else {
        this.paramerDetail[name] = e.target.innerText
      }
    } else {
      this.paramerDetail[name] = e.target.innerText
    }
  }
  handleChangeInp = (e, name) => {
    this.paramerDetail[name] = e.target.value
    this.setState({ hiddenSave: false })
  }
  handleChangeROi = (e, name) => {
    this.setState({ hiddenSave: false })
    if (name === 'simStep') {
      this[name] = e.target.value
    }
    this.paramerDetail[name] = e.target.value
  }
  handleChangeTime = (e, value) => {
    this.setState({ hiddenSave: false })
    this.paramerDetail.simDate = value
  }
  handleChangeTChe = (value, name) => {
    this.setState({ hiddenSave: false })
    this.paramerDetail[name] = value.join()
  }
  render() {
    const { Option } = Select
    const {
      paramerDetailInfo, paramerDetail, drivingType, progress, hiddenSave
    } = this.state
    return (
      <div className={styles.areaAllocationWrapper}>
        <Header handleSavePlan={this.handleSavePlan} hiddenSave={hiddenSave} areaName={this.InterPlanMsg && this.InterPlanMsg.areaName} />
        <div className={styles.areaAllocation}>
          <div className={styles.planListBox}>
            {/* <AddPlanList /> */}
            <div className={styles.planBtn} >
              <input className={styles.planName} type="text" defaultValue={paramerDetail ? paramerDetail.programTitle : ''} title={paramerDetail ? paramerDetail.programTitle : ''} onChange={(e) => { this.handleChangeInp(e, 'programTitle') }} />
            </div>
          </div>
          <div className={styles.simulatSet}>
            <div className={styles.settingBox}>
              <div className={styles.title}>仿真设置</div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>仿真开始时间：</span>
                  {paramerDetail ? <DatePicker style={{ width: 120 }} showTime placeholder="请选择日期" defaultValue={moment(paramerDetail ? paramerDetail.simDate : this.getNowFormatDate(), dateFormat)} format={dateFormat} onChange={this.handleChangeTime} /> : '加载中...'}
                </div>
                <div className={styles.setItems}>
                  <span>仿真时长：</span>
                  <InputLabel labelText="" value={paramerDetail ? paramerDetail.simDuration : ' '} units="仿真秒" color="#ff8800" handleChange={(e) => { this.handleChangeBot(e, 'simDuration') }} />
                </div>
              </div>
              <div className={styles.setItemsBox}>
                {/* <div className={styles.setItems}>
                  <span>随即种子：</span>
                  <InputLabel labelText="" value={paramerDetail ? paramerDetail.randomSeed : ''} color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'randomSeed') }} />
                </div> */}
                <div className={styles.setItems}>
                  <span>仿真速度：</span>
                  <InputLabel labelText="" value={paramerDetail ? paramerDetail.simSpeed : ''} units="步/仿真秒" color="#ff8800" handleChange={(e) => { this.handleChangeBot(e, 'simSpeed') }} />
                </div>
                <div className={styles.setItems}>
                  <span>检测器上传间隔：</span>
                  <InputLabel labelText="" value={paramerDetail ? paramerDetail.detectorInterval : ''} color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'detectorInterval') }} />
                </div>
              </div>
              <div className={styles.setItemsBox}>

                <div className={styles.setItems}>
                  <span>仿真步长：</span>
                  {paramerDetail ?
                    <Radio.Group onChange={(e) => { this.handleChangeROi(e, 'simStep') }} defaultValue={paramerDetail ? paramerDetail.simStep < 1 ? 0.1 : 1 : 0.1}>
                      <Radio value={1} style={{ color: '#00994c' }}>最大速度</Radio>
                      <Radio value={0.1} style={{ color: '#fff' }} />
                      <span className={styles.textBox} suppressContentEditableWarning contentEditable="true" onInput={(e) => { this.handleChangeBot(e, 'simStepTo') }} >{paramerDetail ? paramerDetail.simStep < 1 ? paramerDetail.simStep : 0.1 : 0.1}</span>
                      <span style={{ color: '#ff8800' }}>仿真秒/秒</span>
                      <Icon type="edit" style={{ marginLeft: 5 }} />
                      <span style={{ color: 'red', marginLeft: 10 }}>{'注:<=1仿真秒/秒'}</span>
                    </Radio.Group> : '加载中...'}
                </div>
                <div className={styles.setItems} />
              </div>
              <div className={styles.carVideo}>
                {paramerDetail ?
                  <Checkbox.Group style={{ color: '#ffffff' }} onChange={(e) => { this.handleChangeTChe(e, 'vehicleYn') }} defaultValue={[paramerDetail.vehicleYn]}>
                    <Checkbox value={1} >不显示车辆</Checkbox>
                  </Checkbox.Group> : '加载中...'}
                {paramerDetail ?
                  <Checkbox.Group style={{ color: '#ffffff' }} onChange={(e) => { this.handleChangeTChe(e, 'simVideoYn') }} defaultValue={[paramerDetail.simVideoYn]}>
                    <Checkbox value={1}>仿真过程中录制视频</Checkbox>
                  </Checkbox.Group> : '加载中...'}
              </div>
            </div>
            <div className={styles.driveParams}>
              <div className={styles.title}>驾驶行为参数</div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>选择驾驶行为模型：</span>
                  {!!paramerDetailInfo && paramerDetailInfo.drivingType ?
                    <Select defaultValue={paramerDetailInfo.drivingType || '选择'} key={paramerDetailInfo.drivingType} style={{ color: '#ff8800' }} disabled>
                      <Option value="选择">请选择</Option>
                      {!!drivingType && drivingType.map((item) => {
                        return <Option key={item.dictCode} value={item.dictCode}>{item.codeName}</Option>
                      })}
                    </Select> : '加载中...'}
                </div>
                <div className={styles.setItems}>
                  <span>前向观测距离：</span>
                  <InputLabel labelText="最小值：" value={paramerDetailInfo ? paramerDetailInfo.frontDistanceMinimum : ''} color="#00994c" disabled="true" units="m" edit="true" />
                  <InputLabel left="10px" labelText="最大值：" value={paramerDetailInfo ? paramerDetailInfo.frontDistanceMaximum : ''} color="#ff0000" units="m" disabled="true" edit="true" />
                </div>
              </div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>后向观测距离：</span>
                  <InputLabel labelText="最小值：" value={paramerDetailInfo ? paramerDetailInfo.rearDistanceMinimum : ''} color="#00994c" disabled="true" units="m" edit="true" />
                  <InputLabel left="10px" labelText="最大值：" value={paramerDetailInfo.rearDistanceMaximum || ''} color="#ff0000" disabled="true" units="m" edit="true" />
                </div>
                <div className={styles.setItems}>
                  <span>临时走神参数：</span>
                  <InputLabel labelText="走神持续时间：" value={paramerDetailInfo ? paramerDetailInfo.wanderTime : ''} color="#ff8800" disabled="true" units="s" edit="true" />
                  <InputLabel left="10px" labelText="走神概率：" value={paramerDetailInfo ? paramerDetailInfo.wanderProbability : ''} color="#ff8800" units="%" disabled="true" edit="true" />
                </div>
              </div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>平均停止间距：</span>
                  <InputLabel value={paramerDetailInfo ? paramerDetailInfo.avgStopDistance : ''} units="m" color="#00994c" disabled="true" edit="true" />
                </div>
                <div className={styles.setItems}>
                  <span>最小车头间距：</span>
                  <InputLabel value={paramerDetailInfo ? paramerDetailInfo.headSpacingMinimum : ''} units="m" color="#00994c" disabled="true" edit="true" />
                </div>
              </div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>最大减速度：</span>
                  <InputLabel value={paramerDetailInfo ? paramerDetailInfo.slowDownMaximum : ''} units="m/s2" color="#ff8800" disabled="true" edit="true" />
                </div>
                <div className={styles.setItems}>
                  <span>黄灯期驾驶行为：</span>
                  {!!paramerDetailInfo && paramerDetailInfo.yellowDrivingBehavior ?
                    <Radio.Group defaultValue={paramerDetailInfo.yellowDrivingBehavior || ''} key={paramerDetailInfo.yellowDrivingBehavior}>
                      <Radio value={1} style={{ color: '#00994c' }}>与绿灯保持一致</Radio>
                      <Radio value={2} style={{ color: 'red' }}>与红灯保持一致</Radio>
                    </Radio.Group> : '加载中...'}
                </div>
              </div>
              <div className={styles.setItemsBox}>
                <div className={styles.setItems}>
                  <span>非机动车闯红灯概率：</span>
                  <InputLabel value={paramerDetailInfo ? paramerDetailInfo.nonVehicleRedProbability : ''} units="%" color="#ff0000" disabled="true" edit="true" />
                </div>
                <div className={styles.setItems}>
                  <span>行人闯红灯概率：</span>
                  <InputLabel value={paramerDetailInfo ? paramerDetailInfo.pedestrianRedProbability : ''} units="%" color="#ff0000" disabled="true" edit="true" />
                </div>
              </div>
              <div className={styles.splitBorder} />
            </div>
            <div className={styles.simulatStatus}>
              <div className={styles.title}>仿真状态</div>
              <div className={styles.progressBox}>
                <div className={styles.setNumBox}>
                  <span className={styles.setNum}>仿真进度 :<span style={{ marginLeft: 10 }}>{paramerDetail && paramerDetail.simState === 3 ? '仿真异常' : paramerDetail && paramerDetail.simFlagName}</span></span>
                </div>
                <Progress
                  percent={paramerDetail ? paramerDetail.simProgress : 0}
                  status="active"
                />
                <div className={styles.ProgressNumBox}>
                  {!!progress && progress.map((item) => {
                    return <span key={item} className={styles.ProgressNum}>{item}</span>
                  })}
                </div>
              </div>
            </div>
            <div className={styles.begainSimulat}>
              <div className={styles.begainBtn} onClick={this.getTaskstart}>{paramerDetail && paramerDetail.simState === -1 ? '开始仿真' : '重新仿真'}</div>
            </div>
          </div>
          {paramerDetail && paramerDetail.simState === -1 || paramerDetail && paramerDetail.simState === 3 || (paramerDetail && paramerDetail.simState === 2 && ((paramerDetail && paramerDetail.simVideoYn === 0 && paramerDetail && paramerDetail.simFlag === 315) || (paramerDetail && paramerDetail.simVideoYn === 1 && paramerDetail && paramerDetail.simFlag === 316))) ? null : <div className={styles.simulatsetBox} onClick={this.getsimulatset} />}
        </div>
      </div>
    )
  }
}

export default AreaAllocation
