import React from 'react'
import { Icon, Modal, message } from 'antd'
import classNames from 'classnames'

import styles from './AddPlanList.scss'

class AddPlanList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // planList: null,
      planChecked: this.props.planRowId,
      ModalVisible: false,
    }
    this.deleteParams = {}
  }
  handleDelatePlan = (rowId, geometryId, nodeId, id) => {
    this.setState({ ModalVisible: true })
    this.deleteParams = {
      rowId,
      geometryId,
      nodeId,
      id,
    }
  }
  handleAddPlan = () => {
    if (this.props.planList.length > 0) {
      const index = this.props.planList.length - 1
      const lastPlan = this.props.planList[index].rowId + 1
      this.props.getNewPlanName('方案' + lastPlan)
      return
    }
    this.props.getNewPlanName('方案0')
  }
  handlePlanChecked = (index) => {
    const { geometryId } = this.props.planList[index]
    const id = this.props.planList[index][this.props.typeId]
    const planId = this.props.planList[index]['planId']
    this.setState({ planChecked: id })
    this.props.changePlan(geometryId, id, planId)
  }
  handleChangePlanName = (e) => {
    const { value } = e.target
    const typeId = this.props.typeId.toLowerCase()
    const id = e.target.getAttribute(typeId)
    const rowId = e.target.getAttribute('rowid')
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (value === '') {
        message.info('请输入方案名称')
      } else {
        this.props.changePlanName(value, id, rowId)
      }
    }, 1500)
  }
  handleModalCancel = () => {
    this.setState({ ModalVisible: false })
  }
  handleModalOk = () => {
    this.setState({ ModalVisible: false })
    const { geometryId, nodeId, id, rowId } = this.deleteParams
    this.props.handleDeletePlan(geometryId, nodeId, id, rowId)
  }
  render() {
    const { planChecked } = this.state
    return (
      <div>
        {
          // this.props.planList &&
          this.props.planList.map((item, index) => (
            <div
              className={classNames({
                [styles.planBtn]: true,
                [styles.planBtnChecked]: item[this.props.typeId] === planChecked,
              })}
              key={item[this.props.typeId]}
            >{item[this.props.typeId] === planChecked}
              <input
                className={styles.planName}
                type="text"
                defaultValue={item.geometryTitle || item.flowTitle || item.stpDes || item.stpTitle}
                title={item.geometryTitle || item.flowTitle || item.stpDes || item.stpTitle}
                rowid={item.rowId}
                flowid={item.flowId}
                stpid={item.stpId}
                geometryid={item.geometryId}
                areageometryid={item.areaGeometryId}
                areaflowid={item.areaFlowId}
                areastpid={item.areaStpId}
                onChange={this.handleChangePlanName}
              />
              <span
                className={styles.planNameBox}
                style={{ display: (item.areaFlowId === planChecked || item.areaGeometryId === planChecked || item.areaStpId === planChecked || item.flowId === planChecked || item.stpId === planChecked || item.geometryId === planChecked) ? 'none' : 'block' }}
                onClick={() => { this.handlePlanChecked(index) }}
              />
              <span
                className={styles.closeBtn}
                onClick={() => { this.handleDelatePlan(item.rowId, item.geometryId, item.nodeId, item[this.props.typeId]) }}
                geometryid={item.geometryId}
                nodeid={item.nodeId}
                rowid={item.rowId}
                planid={item.planId}
              >
                <Icon type="close" />
              </span>
            </div>
          ))
        }
        <div className={styles.addPlanBtn} onClick={this.handleAddPlan}><Icon type="plus" /></div>
        <Modal
          title=""
          visible={this.state.ModalVisible}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <p>确定删除此方案吗？</p>
        </Modal>
      </div>
    )
  }
}

export default AddPlanList
