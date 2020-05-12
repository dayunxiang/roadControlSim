import React from 'react'
import { Icon, Select } from 'antd'
import styles from './RowAddPlanList.scss'

class RowAddPlanList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      planList: new Array(1).fill(0),
      planListItems: null,
      planListLeft: 0,
      isDisabled: {},
    }
    this.planListOrder = 0
  }
  componentDidMount = () => {
    this.setState({ planListItems: this.props.planList })
    if (this.props.planList.length) {
      if (this.props.fileNames) {
        this.props.fileNames.forEach((item, index) => {
          this.state.isDisabled['select' + index] = item
          this.state.planList[index] = index
          this.planListOrder = index
        })
      } else {
        this.state.planList = [this.props.planList[0].id]
        this.state.isDisabled.select0 = this.props.planList[0].id
      }
    }
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.planList !== nextProps.planList) {
      this.setState({ planListItems: nextProps.planList })
    }
  }
  handleDelatePlan = (selName, indexs) => {
    this.state.planList.splice(indexs, 1)
    delete this.state.isDisabled[selName]
    this.setState({ planList: this.state.planList })
    this.props.getplanListFlag(this.state.isDisabled, this.state.planListItems) 
  }
  handleAddPlan = () => {
    this.state.planList.push(++this.planListOrder)
    this.setState({ planList: this.state.planList }, () => {
      if (this.state.planList.length > 6) {
        this.setState({ planListLeft: this.state.planListLeft -= 150 })
      }
    })
  }
  handleVideo = (index) => {
    this.props.handleVideo(index)
  }
  handleMoveLeft = () => {
    if (this.state.planListLeft === 0) return
    this.setState({ planListLeft: this.state.planListLeft += 150 })
  }
  handleMoveRight = () => {
    const boxWidth = this.state.planList.length * 150
    const maxWidth = 900
    const isMax = boxWidth + (this.state.planListLeft - 150)
    if (boxWidth > maxWidth && isMax >= maxWidth) {
      this.setState({ planListLeft: this.state.planListLeft -= 150 })
    }
  }
  handleOnChange = (value, options) => {
    const selName = options.props.selname
    this.state.isDisabled[selName] = value
    this.setState({ isDisabled: this.state.isDisabled }, () => {
      this.props.getplanListFlag(this.state.isDisabled, this.state.planListItems)
    })
  }
  render() {
    const { Option } = Select
    return (
      <div>
        <div className={styles.rowAddPlanListBox}>
          <div className={styles.planListWrapper} ref={(input) => { this.listWrapper = input }}>
            <div className={styles.planLists} style={{ left: this.state.planListLeft }}>
              {
                this.state.planList.map((plan, planIndex) => {
                  return (
                    <div className={styles.planItems} key={plan}>
                      {
                        this.state.planListItems &&
                        <Select
                          defaultValue={this.state.isDisabled['select' + planIndex] ? this.state.isDisabled['select' + planIndex] : planIndex === 0 ? 0 : '请选择'}
                          onChange={this.handleOnChange}
                        >
                          {
                            planIndex !== 0 &&
                            <Option key="请选择" value="请选择">请选择</Option>
                          }
                          {
                            this.state.planListItems.map((item, index) => (
                              <Option
                                key={item.geometryTitle + item.id}
                                value={item.id}
                                title={item.geometryTitle}
                                disabled={Object.values(this.state.isDisabled).indexOf(item.id) !== -1}
                                selname={'select' + planIndex}
                              >
                                {item.name}
                              </Option>
                            ))
                          }
                        </Select>
                      }
                      <i className={styles.rowVideo} onClick={() => { this.handleVideo(planIndex) }} />
                      {planIndex ? <span className={styles.closeBtn} onClick={() => { this.handleDelatePlan('select' + planIndex, planIndex) }}><Icon type="close" /></span> : null}
                    </div>
                  )
                })
              }
              {/* {
                this.state.planListItems &&
                this.state.planListItems.map((item, index) => (
                  <div className={styles.planItems} key={item.row_id}>
                    {item.sim_parameter_name}
                    <span className={styles.closeBtn} onClick={() => { this.handleDelatePlan(index, item.row_id) }}><Icon type="close" /></span>
                  </div>
                ))
              } */}
            </div>
          </div>
          <div className={styles.addPlanBtn} onClick={this.handleAddPlan}><Icon type="plus" /></div>
          <div className={styles.moveLeftBtn} onClick={this.handleMoveLeft}><Icon type="backward" /></div>
          <div className={styles.moveRightBtn} onClick={this.handleMoveRight}><Icon type="forward" /></div>
        </div>
      </div >
    )
  }
}

export default RowAddPlanList
