import React from 'react'
import { Icon } from 'antd'
import styles from './AddPlanList.scss'
import $ from 'jquery'
import classNames from 'classnames'
class AddPlanList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planList: this.props.planList || [],
      selected: false,
      delatePlan: false,
      planIndex: null,
    }
    this.count = 0
    this.ParameterInfo = {
      'designer_id': 1001,
      'sim_parameter_des': '描述',
      'sim_parameter_id': 0,
      'sim_parameter_name': '',
      'sim_use': 0,
    }
  }
  componentDidMount = () => {
    if (this.props.planList.length) {
      this.state.planIndex = this.props.planList[0].sim_parameter_id
    }
  }
  handleDelatePlan = (indexs) => {
    this.state.planList.splice(indexs, 1)
    this.setState({ planList: this.state.planList })
  }
  handleAddPlan = () => {
    this.state.planList.push({ sim_parameter_des: '新增' })
    this.setState({ planList: this.state.planList })
    this.props.handleAddPlan()
  }
  toggleCheck = (index, item) => {
    this.setState({ selected: index })
    /* if (!this.state.selected) {
      // this.clearAll()
    } else {
      this.setState({ selected: !this.state.selected })
    } */
  }
  handleCompilePlan = (e) => {
    // console.log(e.target.value)
  }
  // 有用
  handleClosePlan = (e, value) => {
    const domX = e.clientX
    const domY = e.clientY
    this.setState({
      delatePlan: value,
    }, () => {
      if (value) {
        // console.log(domX, domY, document.getElementById('popout'))
        document.getElementById('popout').style.Top = domY
        document.getElementById('popout').style.Left = domX
      }
    })
  }
  // 有用
  handleDelatePlans = (value) => {
    // console.log(value === this.state.planIndex, this.props.planList.length);
    if (value === this.state.planIndex && this.props.planList.length) {
      this.setState({
        planIndex: this.props.planList[0].sim_parameter_id
      })
    }
    this.props.handleDelatePlan(value)
    this.setState({ delatePlan: false })
  }
  handleCheckPlan = (e, item) => {
    /*  window.event ? window.event.cancelBubble = true : e.stopPropagation() */
    this.props.handleCheckPlan(item)
  }
  handleClick = (index, designerId, IparameterId) => {
    this.count += 1;
    setTimeout(() => {
      if (this.count === 1) { // 单机
        if (window.inputCenS) {
          window.inputCenS.style.display = 'block'
        }
        this.setState({ planIndex: IparameterId })
        this.props.handleItemPlan && this.props.handleItemPlan(designerId, IparameterId)
        if(this.props.TarsimState){
          this['inputCen' + index].style.display = 'none'
          window.inputCenS = this['inputCen' + index]
          this['addInput' + index].focus()
        }
      } else if (this.count === 2) { //双击
        /* console.log(this['addInput' + index], 'setTimeout onDoubleClick: ', this.count)
        this['inputCen' + index].style.display = 'none'
        window.inputCenS = this['inputCen' + index]
        this['addInput' + index].focus() */
      }
      this.count = 0;
    }, 300)
  }
  render() {
    return (
      <div>
        {
          this.props.planList.map((item, index) => (
            <div className={classNames({ [styles.planBtn]: true, [styles.planBtnClick]: item.sim_parameter_id === this.state.planIndex })} key={item.sim_parameter_name + item.sim_parameter_id} onClick={(e) => { this.handleClick(index, item.designer_id, item.sim_parameter_id) }}>
              <input className={styles.planNameInput} type="text" defaultValue={item.sim_parameter_name} ref={(el) => { this['addInput' + index] = el }} onBlur={(e) => { this.props.handleCompilePlan(e, item) }} />
              <span className={styles.closeBtn} onClick={(e) => { this.handleClosePlan(e, item.sim_parameter_id) }}><Icon type="close" /></span>
              <s className={item.sim_use == 1 ? styles.current : ''} onClick={(e) => this.handleCheckPlan(e, item)} />
              <div className={styles.planCen} ref={(el) => { this['inputCen' + index] = el }} />
            </div>
          ))
        }
        <div className={styles.addPlanBtn} onClick={() => { this.props.handleAddPlan && this.props.handleAddPlan(this.ParameterInfo) }}><Icon type="plus" /></div>
        {this.state.delatePlan ?
          <div className={styles.popout} id="popout">
            <div className={styles.top}>是否删除当前方案</div>
            <div className={styles.bottom}><span onClick={() => { this.handleDelatePlans(this.state.delatePlan) }}>是</span><span onClick={() => { this.handleClosePlan(false) }}>否</span></div>
          </div> : null}
      </div>
    )
  }
}

export default AddPlanList
