import React from 'react'
import $ from 'jquery'
import { Select, Radio, Progress, Checkbox, Modal, Icon, message, DatePicker } from 'antd'
import classNames from 'classnames'
import Nav from '../../Nav/Nav'
import InputLabel from './InputLabel/InputLabel'
import navStyles from '../../InterPlan/Navigation/Navigation.scss'
import AddPlanList from '../../../components/AddPlanListCheck/AddPlanList'
import getResponseDatas from '../../../utlis/getResponseData'
import styles from './ManageStyle.scss'
import moment from 'moment';
const monthFormat = 'YYYY-MM-DD HH:mm:ss'
const { confirm } = Modal
class TrafficManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      planList: null,
      paramerDetailInfo: null,
      listDrop: [],
      dirvingModel: [],
      areaCode: [],
      fileName: null,
      parameter: null,
      progress: null,
      TarsimState: true,
      palnSave: true,
    }
    this.designerId = '1' // 登陆信息获取
    this.cityId = '1' // 当前城市的id
    this.InfoinitUrl = '/simulation/parameterInfo/add/' + this.designerId // 查询交通特性方案信息'{designer_id}
    this.InfolistUrl = '/simulation/parameterInfo/list' // 查询交通特性方案信息'
    this.InfodeleteUrl = '/simulation/parameterInfo/delete/' // 根据交通特性方案信息ID，删除交通特性方案信息'
    this.InfoeditUrl = '/simulation/parameterInfo/edit' // 添加和修改交通特性方案信息'
    this.InfogetUrl = '/simulation/parameterInfo/get/' // {rowId}' // 根据交通特性方案信息ID，查询交通特性方案信息详情'
    this.detailInfoUrl = '/simulation/parameterSimTasks/get/getParamerDetailInfo/' // { simParameterId } // 根据仿真方案编号，查询页面详细信息'
    this.listDrop = '/simulation/parameterSimTasks/get/areaCode' //{targetId} // 查询区域下拉框'
    this.dirvingModel = '/simulation/code/list/codeInfo/' // 查询驾驶模式'
    this.areaCode = '/simulation/parameterSimTasks/get/getSimTask/' // {simParameterId}/{areaId}/{fileName}' //根据仿真方案编号，查询区域组织方案'

    this.simTasksUrl = '/simulation/parameterSimTasks/edit' // 修改和添加交通特性方案仿真任务
    this.paramterUrl = '/simulation/parameters/edit/paramter' // 修改和添加交通特性方案参数'
    /* this.flagState = '/simulation/parameterSimTasks/get/parameterSimTask/' // {rowId}    //根据仿真任务主键ID获取仿真任务状态和进度' */
    this.flagState = '/simulation/sim/task/get/sim/task/flag/state/by/' // {simRowId} 根据仿真任务主键ID获取仿真任务状态和进度'
    this.parentName = '/simulation/code/list/sim/flag/parent/name' // 查询进度条下分段名称
    /* this.taskstart = '/simulation/parameterSimTasks/run/parameterSimTask/' // {rowId} //更新仿真任务状态（开始）' */
    this.taskstart = '/simulation/sim/task/run/task/' // {rowId}// 更新仿真任务状态（开始）'
    this.simUse = 1
    this.ParameterSimTasks = {
      target_id: 0,
      designer_id: 0,
      detector_interval: 0,
      file_name: '',
      random_seed: 0,
      row_id: 0,
      sim_date: '',
      sim_duration: 0,
      sim_flag: 0,
      sim_parameter_id: 0,
      sim_run: 0,
      sim_speed: 0,
      sim_step: 0,
      sim_video_yn: 0,
      vehicle_yn: 0,
    }
    this.Parameter = {
      avg_stop_distance: 0,
      driving_type: 0,
      front_distance_maximum: 0,
      front_distance_minimum: 0,
      head_spacing_minimum: 0,
      non_vehicle_red_probability: 0,
      pedestrian_red_probability: 0,
      rear_distance_maximum: 0,
      rear_distance_minimum: 0,
      row_id: 0,
      sim_parameter_id: 0,
      slow_down_maximum: 0,
      wander_probability: 0,
      wander_time: 0,
      yellow_driving_behavior: 1,
    }
  }
  componentDidMount = () => {
    this.getInfolist(0)
    this.getdrivingType()
    // console.log(localStorage.getItem('userLimit'))
    if (localStorage.getItem('userLimit')) {
      const id = JSON.parse(localStorage.getItem('userInfo')).id
      this.designerId = id
      this.simUse = id
    }
  }
  componentWillUnmount = () => {
    if (this.timeState) {
      clearTimeout(this.timeState)
      this.timeState = null
    }
  }
  getRoadtraffic = (path, limitId) => {
    if ((path === '/TrafficAssess') && (!this.ParameterSimTasks.target_id)) {
      message.warning('请先选择评估区域')
      return
    }
    const userLimit = JSON.parse(localStorage.getItem('userLimit'))
    const limitArr = []
    userLimit.forEach((item) => {
      limitArr.push(item.id)
    })
    if (limitArr.indexOf(limitId) === -1) {
      message.warning('暂无权限')
    } else {
      this.props.history.push(path)
    }
  }
  // 获取区域下拉
  getlistDrop = () => {
    getResponseDatas('get', this.listDrop).then((res) => {
      if (res.data.code === 200) {
        const data = res.data.content
        this.setState({ listDrop: data })
      }
    })
  }

  // 区域组织方案
  getareaCode = (targetId, bool) => {
    getResponseDatas('get', this.areaCode + this.simParameterId + '/' + targetId).then((res) => {
      if (res.data.code === 200) {
        if (res.data.content.length) {
          if (bool) {
            this.ParameterSimTasks.file_name = bool
            this.setState({ fileName: bool })
          } else {
            this.ParameterSimTasks.file_name = res.data.content[0].file_name
            this.setState({ fileName: res.data.content[0].file_name })
          }
        } else {
          this.ParameterSimTasks.file_name = ''
          this.setState({ fileName: null })
        }
        this.setState({ areaCode: res.data.content })
      }
    })
  }
  // 获取驾驶模式
  getdirvingModel = () => {
    getResponseDatas('get', this.dirvingModel + 28).then((res) => {
      if (res.data.code === 200) {
        this.setState({ dirvingModel: res.data.content })
      }
    })
  }
  // 获取左侧列表
  getInfolist = (index) => {
    getResponseDatas('get', this.InfolistUrl).then((res) => {
      if (res.data.code === 200) {
        this.setState({ planList: res.data.content }, () => {
          if (index === 0 && res.data.content.length) {
            this.handleItemPlanBefore(res.data.content[index].designer_id, res.data.content[index].sim_parameter_id)
          }
          if (res.data.content.length === 0) {
            this.setState({ paramerDetailInfo: null })
          }
        })
      }
    })
  }
  getAddPlan = () => {
    // console.log(this.ParameterSimTasks.sim_step, this.ParameterSimTasks.simStepTo)
    if (this.ParameterSimTasks.sim_step === 2) {
      this.ParameterSimTasks.sim_step = this.ParameterSimTasks.simStepTo
    }
    this.ParameterSimTasks.designer_id = this.designerId

    if (!this.ParameterSimTasks.target_id) {
      message.warning('请选择评估区域选择')
      return
    }
    if (!this.ParameterSimTasks.file_name) {
      message.warning('请选择区域组织方案选择')
      return
    }
    if (!this.ParameterSimTasks.sim_date) {
      message.warning('请选择仿真开始时间')
      return
    }
    if (!this.ParameterSimTasks.sim_duration) {
      message.warning('请填写仿真时长')
      return
    }
    if (!this.ParameterSimTasks.sim_speed) {
      message.warning('请填写仿真速度')
      return
    }
    if (!this.ParameterSimTasks.detector_interval) {
      message.warning('请填写检测器上传间隔')
      return
    }
    if (!this.ParameterSimTasks.sim_step) {
      message.warning('请选择仿真步长')
      return
    }
    /*  const ParameterTwo = Object.keys(this.Parameter)
     for (let i = 0; i < ParameterTwo.length; i++) {
       if (this.Parameter[ParameterOne[i]] === '') {
         message.warning('请填全模型参数标定')
         return
       }
     } */
    if (!this.Parameter.driving_type) {
      message.warning('请选择选择驾驶行为模型')
      return
    }
    if (!this.Parameter.front_distance_minimum) {
      message.warning('请填写前向观测距离最小值')
      return
    }
    if (!this.Parameter.front_distance_maximum) {
      message.warning('请填写前向观测距离最大值')
      return
    }
    if (!this.Parameter.rear_distance_minimum) {
      message.warning('请填写后向观测距离最小值')
      return
    }
    if (!this.Parameter.rear_distance_maximum) {
      message.warning('请填写后向观测距离最大值')
      return
    }
    if (!this.Parameter.wander_time) {
      message.warning('请填写临时走神参数走神持续时间')
      return
    }
    if (!this.Parameter.wander_probability) {
      message.warning('请填写临时走神参数走神概率')
      return
    }
    if (!this.Parameter.avg_stop_distance) {
      message.warning('请填写平均停止间距')
      return
    }
    if (!this.Parameter.head_spacing_minimum) {
      message.warning('请填写最小车头间距')
      return
    }
    if (!this.Parameter.slow_down_maximum) {
      message.warning('请填写最大减速度')
      return
    }
    if (!this.Parameter.yellow_driving_behavior) {
      message.warning('请选择黄灯期驾驶行为')
      return
    }
    if (!this.Parameter.non_vehicle_red_probability) {
      message.warning('请填写非机动车闯红灯概率')
      return
    }
    if (!this.Parameter.pedestrian_red_probability) {
      message.warning('请填写行人闯红灯概率')
      return
    }
    this.setState({
      parameter: [
        { parP: '模型参数评估设置数据上传中...', color: '#aaa', type: 'exclamation-circle', state: 0 },
        { parP: '模型参数标定数据上传中...', color: '#aaa', type: 'exclamation-circle', state: 0 }
      ]
    })
    // 修改添加1
    getResponseDatas('post', this.simTasksUrl, this.ParameterSimTasks).then((res) => {
      // console.log(res.data.content)
      if (res.data.code === 200) {
        this.state.parameter[0] = { parP: '模型参数评估设置数据上传成功', color: '#00f1ff', state: 1, type: 'check-circle' }
        this.setState({ parameter: this.state.parameter })
        this.getAddplanTwo()
      } else {
        let name = '模型参数评估设置数据上传中失败'
        if (res.data.code === 999) {
          name = '模型参数评估设置数据重复'
        }
        this.state.parameter[0] = { parP: name, color: 'red', state: 2, type: 'close-circle' }
        this.state.parameter[1] = { parP: '模型参数标定数据上传取消', state: 1, color: '#aaa', type: 'check-circle' }
        this.setState({ parameter: this.state.parameter })
      }
      if (this.state.parameter[1].state > 0) {
        setTimeout(() => {
          this.setState({ parameter: null })
        }, 2000)
      }
    })

  }
  getAddplanTwo = () => {
    // 修改添加2
    getResponseDatas('post', this.paramterUrl, this.Parameter).then((res) => {
      // console.log(res.data.content)
      if (res.data.code === 200) {
        this.state.parameter[1] = { parP: '模型参数标定数据上传成功', state: 1, color: '#00f1ff', type: 'check-circle' }
        this.setState({ parameter: this.state.parameter, palnSave: false })
        /*  message.success('添加一成功') */
        // this.handleItemPlan(this.designerId, this.ParameterSimTasks.sim_parameter_id)
      } else {
        this.state.parameter[1] = { parP: '模型参数标定数据上传中失败', state: 2, color: 'red', type: 'close-circle' }
        this.setState({ parameter: this.state.parameter })
      }
      if (this.state.parameter[0].state > 0) {
        setTimeout(() => {
          this.setState({ parameter: null })
        }, 2000)
      }
    })
  }
  getflagStatea = (rowId) => {
    getResponseDatas('get', this.flagState + rowId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const { paramerDetailInfo } = this.state
        const { simState, simVideoYn, simFlag, simFlagName, simProgress, simStateName } = result.content
        paramerDetailInfo.simFlag = simFlag
        paramerDetailInfo.simFlagName = simFlagName
        paramerDetailInfo.simState = simState
        paramerDetailInfo.simStateName = simStateName
        paramerDetailInfo.simProgress = simProgress
        // console.log(simState,paramerDetailInfo)
        this.setState({ TarsimState: false, palnSave: false })
        if (simState === -1 || simState === 3 || (simState === 2 && ((simVideoYn === 0 && simFlag === 315) || (simVideoYn === 1 && simFlag === 316)))) {
          clearInterval(this.timeState)
          this.timeState = null
          this.setState({ TarsimState: true, palnSave: true })
        }
        this.setState({ paramerDetailInfo })
      }
    })
  }
  getTaskstart = () => {
    const { paramerDetailInfo, palnSave } = this.state
    if (palnSave) {
      message.warning('请先保存当前配置!', 1)
      return
    }
    if (paramerDetailInfo.row3) {
      getResponseDatas('put', this.taskstart + paramerDetailInfo.row3).then((res) => {
        const result = res.data
        if (result.code === 200) {
          this.setState({ paramerDetailInfo })
          message.success('操作成功!')
          if (this.timeState) {
            clearInterval(this.timeState)
            this.timeState = null
            this.timeState = setInterval(this.getflagStatea.bind(null, paramerDetailInfo.row3), 1000)
          }
        } else {
          message.error('网络异常，请稍后再试!', 1)
        }
      })
    } else {
      message.warning('请先保存当前配置!', 1)
    }
  }
  getsimulatset = () => {
    message.error('正在仿真中,请稍后修改!', 1)
  }
  handleItemPlanBefore = (designerId, simParameterId) => {
    this.setState({ palnSave: true })
    this.handleItemPlan(designerId, simParameterId)
  }
  // 表单回显的回调
  handleItemPlan = (designerId, simParameterId) => {
    this.simParameterId = 'key' + simParameterId + designerId
    // console.log(designerId, simParameterId)
    if (this.timeState) {
      clearTimeout(this.timeState)
      this.timeState = null
    }
    this.ParameterSimTasks = {}
    this.Parameter = {}
    this.setState({ paramerDetailInfo: null })
    getResponseDatas('get', this.detailInfoUrl + simParameterId).then((res) => {
      if (res.data.code === 200) {
        if (res.data.content) {
          // console.log(res.data.content);
          const sim = res.data.content
          this.ParameterSimTasks = {
            target_id: sim.target_id,
            designer_id: sim.designer_id,
            detector_interval: sim.detector_interval,
            file_name: sim.file_name,
            random_seed: sim.random_seed,
            row_id: sim.row3,
            sim_date: sim.sim_date,
            sim_duration: sim.sim_duration,
            sim_flag: sim.sim_flag,
            sim_parameter_id: sim.sim_parameter_id,
            sim_run: sim.sim_run,
            sim_speed: sim.sim_speed,
            sim_step: sim.sim_step,
            sim_video_yn: sim.sim_video_yn,
            vehicle_yn: sim.vehicle_yn,
            simStepTo: sim.sim_step !== 1 ? sim.sim_step : 0.1
          }
          this.Parameter = {
            avg_stop_distance: sim.avg_stop_distance,
            driving_type: sim.driving_type,
            front_distance_maximum: sim.front_distance_maximum,
            front_distance_minimum: sim.front_distance_minimum,
            head_spacing_minimum: sim.head_spacing_minimum,
            non_vehicle_red_probability: sim.non_vehicle_red_probability,
            pedestrian_red_probability: sim.pedestrian_red_probability,
            rear_distance_maximum: sim.rear_distance_maximum,
            rear_distance_minimum: sim.rear_distance_minimum,
            row_id: sim.row2,
            sim_parameter_id: sim.sim_parameter_id,
            slow_down_maximum: sim.slow_down_maximum,
            wander_probability: sim.wander_probability,
            wander_time: sim.wander_time,
            yellow_driving_behavior: sim.yellow_driving_behavior === 0 ? 1 : sim.yellow_driving_behavior,
          }
          this.simParameterId = sim.sim_parameter_id
          sessionStorage.setItem('areaPlanMsg', sim.target_id)
          this.setState({ paramerDetailInfo: sim, fileName: sim.file_name }, () => {
            this.getlistDrop()
            this.getdirvingModel()
            clearInterval(this.timeState)
            this.timeState = null
            this.timeState = setInterval(this.getflagStatea.bind(null, sim.row3), 1000)
            if (sim.target_id) {
              this.getareaCode(sim.target_id, sim.file_name)
            } else {
              this.ParameterSimTasks.file_name = ''
              this.ParameterSimTasks.target_id = ''
              this.setState({ fileName: null })
              this.setState({ areaCode: [] })
            }
          })
        }
      }
    })
  }
  // 添加的回调
  handleAddPlan = (ParameterInfo) => {
    // console.log(ParameterInfo)
    getResponseDatas('get', this.InfoinitUrl, { designer_id: this.designerId }).then((res) => {
      // console.log(res)
      if (res.data.code === 200) {
        this.getInfolist()
      }
    })
  }
  // 删除的回调
  handleDelatePlan = (id) => {
    getResponseDatas('delete', this.InfodeleteUrl + id).then((res) => {
      // console.log(res)
      if (res.data.code === 200) {
        this.getInfolist(0)
      }
    })
  }
  // 修改名称的回调
  handleCompilePlan = (e, item) => {
    item['sim_parameter_name'] = e.target.value
    item.designer_id = this.designerId
    clearTimeout(this.timer)
    this.timer = null
    this.timer = setTimeout(() => {
      getResponseDatas('post', this.InfoeditUrl, item).then((res) => {
        // console.log(res)
        if (res.data.code === 200) {
          this.getInfolist()
        }
      })
    }, 800)
  }
  // 选中的回调
  handleCheckPlan = (item) => {
    /* this.simUse */
    item.sim_use = 1
    item.designer_id = this.designerId
    getResponseDatas('post', this.InfoeditUrl, item).then((res) => {
      if (res.data.code === 200) {
        this.getInfolist()
      }
    })
  }
  // input 输入触发
  handleChangeTop = (e, name) => {
    // console.log(name, e.target.innerText)
    this.ParameterSimTasks[name] = e.target.innerText
    this.setState({ palnSave: true })
  }

  // select
  handleSelChangeTop = (value, name) => {
    // console.log(value, name)
    this.ParameterSimTasks[name] = value
    this.setState({ palnSave: true })
    if (name === 'target_id') {
      sessionStorage.setItem('areaPlanMsg', value)
      this.getareaCode(value, false)
    }
    if (name === 'file_name') {
      this.setState({ fileName: value })
    }
  }
  // input 输入触发
  handleChangeBot = (e, name) => {
    // console.log(name, e.target.innerText)
    this.Parameter[name] = e.target.innerText
  }
  handleSelChangeBot = (value, name) => {
    // console.log(value, name)
    this.Parameter[name] = value
  }
  handleRadioBot = (e, name) => {
    this.Parameter[name] = e.target.value
  }
  handleRadioChange = (e, name) => {
    this.ParameterSimTasks[name] = e.target.value
    this.setState({ palnSave: true })
  }
  handleChangeTChe = (value, name) => {
    this.ParameterSimTasks[name] = value.join() ? value.join() : ''
    this.setState({ palnSave: true })
  }
  evaluateBoxS = () => {
    if (window.inputCenS) {
      window.inputCenS.style.display = 'block'
    }
  }

  handleDatePicker = (value, dateString) => {
    this.ParameterSimTasks['sim_date'] = dateString
    this.setState({ palnSave: true })
  }
  getdrivingType = () => {
    getResponseDatas('get', this.parentName).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ progress: result.content })
      }
    })
  }
  render() {
    const { Option } = Select
    const {
      planList, parameter, progress, TarsimState, paramerDetailInfo, listDrop, dirvingModel, areaCode, fileName, palnSave,
    } = this.state
    return (
      <div>
        <div className={styles.evaluateWrapper}>
          <Nav />
          <div className={navStyles.road_administer}>
            <div className={classNames({ [navStyles.administer_itemclick]: this.state.hash === '#/TrafficManage', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficManage', 45) }}>
              <span>交通特性与模型参数管理</span>
              <span />
            </div>
            <div className={classNames({ [navStyles.administer_itemclick]: this.state.hash === '#/TrafficAssess', [navStyles.road_administer_item]: true })} onClick={() => { this.getRoadtraffic('/TrafficAssess', 46) }}>
              <span>交通特性与模型参数评估</span>
              <span />
            </div>
          </div>
          <div className={styles.planListBox}>
            {planList ? <AddPlanList planList={planList} TarsimState={TarsimState} handleItemPlan={this.handleItemPlanBefore} handleAddPlan={this.handleAddPlan} handleDelatePlan={this.handleDelatePlan} handleCompilePlan={this.handleCompilePlan} handleCheckPlan={this.handleCheckPlan} /> : []}
          </div>
          <div className={styles.evaluateBox} onClick={this.evaluateBoxS}>
            {paramerDetailInfo ?
              <div className={styles.simulatSet} key={this.simParameterId}>
                <div className={styles.settingBox}>
                  <div className={styles.titleBigBox}>
                    交通特性模型参数标定
                    <span className={styles.designTime}>设计时间：{paramerDetailInfo.sim_date || ''}</span>
                    <span className={styles.designUser}>设计人：{paramerDetailInfo.user_name || ''}</span>
                    <s className={palnSave ? styles.save : styles.nosave} onClick={palnSave ? this.getAddPlan : null} />
                  </div>
                  <div className={styles.title}>模型参数评估设置</div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>评估区域选择：</span>
                      <Select defaultValue={paramerDetailInfo.target_id || ''} style={{ minWidth: 100 }} key={paramerDetailInfo.target_id || ''} onChange={(e) => { this.handleSelChangeTop(e, 'target_id') }}>
                        <Option value="">请选择</Option>
                        {!!listDrop && listDrop.map((item) => {
                          return <Option key={item.area_id} value={item.area_id}>{item.area_name}</Option>
                        })}
                      </Select>
                    </div>
                    <div className={styles.setItems}>
                      <span>区域组织方案选择：</span>
                      {areaCode ?
                        <Select value={fileName || ''} key={fileName} style={{ minWidth: 100 }} onChange={(e) => { this.handleSelChangeTop(e, 'file_name') }}>
                          <Option value="">请选择</Option>
                          {!!areaCode && areaCode.map((item) => {
                            return <Option key={item.file_name} value={item.file_name}>{item.program_title}</Option>
                          })}
                        </Select> : null}
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>仿真开始时间：</span>
                      <DatePicker showTime placeholder="Select Time" defaultValue={moment(paramerDetailInfo.sim_date, monthFormat)} format={monthFormat} onChange={this.handleDatePicker} />
                      {/* <InputLabel labelText="" value={paramerDetailInfo.sim_date || ''} color="#ff8800" handleChange={(e) => { this.handleChangeTop(e, 'sim_date') }} /> */}
                    </div>
                    <div className={styles.setItems}>
                      <span>仿真时长：</span>
                      <InputLabel labelText="" value={paramerDetailInfo.sim_duration || ''} units="仿真秒" color="#ff8800" handleChange={(e) => { this.handleChangeTop(e, 'sim_duration') }} />
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    {/* <div className={styles.setItems}>
                      <span>随即种子：</span>
                      <InputLabel labelText="" value={paramerDetailInfo.random_seed || ''} color="#00994c" handleChange={(e) => { this.handleChangeTop(e, 'random_seed') }} />
                    </div> */}
                    <div className={styles.setItems}>
                      <span>仿真速度：</span>
                      <InputLabel labelText="" value={paramerDetailInfo.sim_speed || ''} units="步/仿真秒" color="#ff8800" handleChange={(e) => { this.handleChangeTop(e, 'sim_speed') }} />
                    </div>
                    <div className={styles.setItems}>
                      <span>检测器上传间隔：</span>
                      <InputLabel labelText="" units="秒" value={paramerDetailInfo.detector_interval || ''} color="#00994c" handleChange={(e) => { this.handleChangeTop(e, 'detector_interval') }} />
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>

                    <div className={styles.setItems}>
                      <span>仿真步长：</span>
                      <Radio.Group onChange={this.handleStepSize} defaultValue={paramerDetailInfo.sim_step && paramerDetailInfo.sim_step == 1 ? 1 : 2} onChange={(e) => { this.handleRadioChange(e, 'sim_step') }}>
                        <Radio value={1} style={{ color: '#00994c' }}>最大速度</Radio>
                        <Radio value={2} style={{ color: '#ff8800' }} />
                        <span className={styles.textBox} suppressContentEditableWarning contentEditable="true" onInput={(e) => { this.handleChangeTop(e, 'simStepTo') }} >{paramerDetailInfo.sim_step == 1 ? 0.1 : paramerDetailInfo.sim_step}</span>
                        <span style={{ color: '#ff8800' }}>仿真秒/秒</span>
                        <Icon type="edit" style={{ color: '#ff8800', marginLeft: 5 }} />
                      </Radio.Group>
                    </div>
                    <div className={styles.setItems} />
                  </div>
                  <div className={styles.radiosBox}>
                    {/* <Radio.Group onChange={this.handleVideo} defaultValue={paramerDetailInfo.sim_duration || ''}>
                      <Radio value={paramerDetailInfo.vehicle_yn} style={{ color: '#00994c' }}>不显示车辆</Radio>
                      <Radio value={paramerDetailInfo.sim_video_yn} style={{ color: '#fff' }}>仿真过程中录制视频</Radio>
                    </Radio.Group> */}
                    {/* <Checkbox.Group style={{ color: '#ffffff' }} defaultValue={[paramerDetailInfo.vehicle_yn, paramerDetailInfo.sim_video_yn]}>
                      <Checkbox value="1">不显示车辆</Checkbox>
                      <Checkbox value="2">仿真过程中录制视频</Checkbox>
                    </Checkbox.Group> */}
                    {paramerDetailInfo ?
                      <Checkbox.Group style={{ color: '#ffffff' }} onChange={(e) => { this.handleChangeTChe(e, 'vehicle_yn') }} defaultValue={[paramerDetailInfo.vehicle_yn]}>
                        <Checkbox value={1} >不显示车辆</Checkbox>
                      </Checkbox.Group> : '加载中...'}
                    {paramerDetailInfo ?
                      <Checkbox.Group style={{ color: '#ffffff' }} onChange={(e) => { this.handleChangeTChe(e, 'sim_video_yn') }} defaultValue={[paramerDetailInfo.sim_video_yn]}>
                        <Checkbox value={1}>仿真过程中录制视频</Checkbox>
                      </Checkbox.Group> : '加载中...'}
                  </div>
                </div>
                <div className={styles.driveParams}>
                  <div className={styles.title}>模型参数标定</div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>选择驾驶行为模型：</span>
                      <Select defaultValue={paramerDetailInfo.driving_type || ''} onChange={(e) => { this.handleSelChangeBot(e, 'driving_type') }}>
                        {!!dirvingModel && dirvingModel.map((item) => {
                          return <Option key={item.dictCode} value={item.dictCode}>{item.codeName}</Option>
                        })}
                      </Select>
                    </div>
                    <div className={styles.setItems}>
                      <span style={{ color: '#ff0000' }}>前向观测距离：</span>
                      <InputLabel labelText="最小值：" value={paramerDetailInfo.front_distance_minimum || ''} units="m" color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'front_distance_minimum') }} />
                      <InputLabel left="10px" labelText="最大值：" value={paramerDetailInfo.front_distance_maximum || ''} units="m" color="#ff0000" handleChange={(e) => { this.handleChangeBot(e, 'front_distance_maximum') }} />
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span style={{ color: '#ff0000' }}>后向观测距离：</span>
                      <InputLabel labelText="最小值：" value={paramerDetailInfo.rear_distance_minimum || ''} units="m" color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'rear_distance_minimum') }} />
                      <InputLabel left="10px" labelText="最大值：" value={paramerDetailInfo.rear_distance_maximum || ''} units="m" color="#ff0000" handleChange={(e) => { this.handleChangeBot(e, 'rear_distance_maximum') }} />
                    </div>
                    <div className={styles.setItems}>
                      <span style={{ color: '#ff0000' }}>临时走神参数：</span>
                      <InputLabel labelText="走神持续时间：" value={paramerDetailInfo.wander_time || ''} color="#ff8800" units="s" handleChange={(e) => { this.handleChangeBot(e, 'wander_time') }} />
                      <InputLabel left="10px" labelText="走神概率：" value={paramerDetailInfo.wander_probability || ''} color="#ff8800" units="%" handleChange={(e) => { this.handleChangeBot(e, 'wander_probability') }} />
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>平均停止间距：</span>
                      <InputLabel value={paramerDetailInfo.avg_stop_distance || ''} units="m" color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'avg_stop_distance') }} />
                    </div>
                    <div className={styles.setItems}>
                      <span>最小车头间距：</span>
                      <InputLabel value={paramerDetailInfo.head_spacing_minimum || ''} units="m" color="#00994c" handleChange={(e) => { this.handleChangeBot(e, 'head_spacing_minimum') }} />
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>最大减速度：</span>
                      <InputLabel value={paramerDetailInfo.slow_down_maximum || ''} units="m/s2" color="#ff8800" handleChange={(e) => { this.handleChangeBot(e, 'slow_down_maximum') }} />
                    </div>
                    <div className={styles.setItems}>
                      <span style={{ color: 'yellow' }}>黄灯期驾驶行为：</span>
                      <Radio.Group onChange={(e) => { this.handleRadioBot(e, 'yellow_driving_behavior') }} defaultValue={paramerDetailInfo.yellow_driving_behavior || ''}>
                        <Radio value={1} style={{ color: '#00994c' }}>与绿灯保持一致</Radio>
                        <Radio value={2} style={{ color: '#fff' }}>与红灯保持一致</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                  <div className={styles.setItemsBox}>
                    <div className={styles.setItems}>
                      <span>非机动车闯红灯概率：</span>
                      <InputLabel value={paramerDetailInfo.non_vehicle_red_probability || ''} units="%" color="#ff0000" handleChange={(e) => { this.handleChangeBot(e, 'non_vehicle_red_probability') }} />
                    </div>
                    <div className={styles.setItems}>
                      <span style={{ color: '#ff0000' }}>行人闯红灯概率：</span>
                      <InputLabel value={paramerDetailInfo.pedestrian_red_probability || ''} units="%" color="#ff0000" handleChange={(e) => { this.handleChangeBot(e, 'pedestrian_red_probability') }} />
                    </div>
                  </div>
                </div>
                <div className={styles.simulatStatus}>
                  <div className={styles.title}>仿真状态</div>
                  {/* <div className={styles.progressBox}>
                    <div className={styles.progress}>
                      <span className={styles.setNum}>当前配置{paramerDetailInfo.sim_duration || ''}</span>
                    </div>
                    <Progress
                      strokeColor={{
                        from: '#09308f',
                        to: '#00c9fd',
                      }}
                      percent={70}
                      status="active"
                      showInfo={false}
                    />
                    <div className={styles.begainBtn}>开始仿真</div>
                  </div> */}
                  <div className={styles.progressBox}>
                    <div className={styles.setNumBox}>
                      <span className={styles.setNum}>仿真进度 :<span style={{ color: '#ff8800', marginLeft: 10 }}>{paramerDetailInfo && paramerDetailInfo.simState === 3 ? '仿真异常' : paramerDetailInfo && paramerDetailInfo.simState === -1 ? '未开始仿真' : paramerDetailInfo && paramerDetailInfo.simFlagName}</span></span>
                    </div>
                    <Progress
                      percent={paramerDetailInfo ? paramerDetailInfo.simProgress : 0}
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
                  {<div className={styles.begainBtn} onClick={this.getTaskstart}>{paramerDetailInfo.simState === -1 ? '开始仿真' : '重新仿真'}</div>}
                </div>
                {paramerDetailInfo && paramerDetailInfo.simState === -1 || paramerDetailInfo && paramerDetailInfo.simState === 3 || (paramerDetailInfo && paramerDetailInfo.simState === 2 && ((paramerDetailInfo && paramerDetailInfo.simVideoYn === 0 && paramerDetailInfo && paramerDetailInfo.simFlag === 315) || (paramerDetailInfo && paramerDetailInfo.simVideoYn === 1 && paramerDetailInfo && paramerDetailInfo.simFlag === 316))) ? null : <div className={styles.simulatsetBox} onClick={this.getsimulatset} />}
              </div> : null}
          </div>
        </div>
        {parameter ?
          <div className={styles.successBox}>
            <div className={styles.contenBox}>
              {
                parameter.map((item) => {
                  return (<p style={{ color: item.color }}>{item.parP}<Icon type={item.type} key={item.parP + item.state} className={styles.Icon} /></p>)
                })
              }
              {/*  <p>模型参数评估设置数据上传中...<Icon type="exclamation-circle" className={styles.Icon} /></p>
            <p>模型参数标定数据上传中...<Icon type="check-circle" className={styles.Icon} /></p> */}
            </div>
          </div> : null}
      </div>
    )
  }
}

export default TrafficManage
