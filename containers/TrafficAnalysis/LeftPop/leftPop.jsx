import React from 'react'
import { Input, Collapse, Icon } from 'antd'
import styles from './leftPop.scss'

const { Panel } = Collapse

class LeftPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      areaIdName: this.props.areaIdName,
      areaLength: this.props.areaLength || 0,
      Panelresult: {},
    }
  }
  componentDidMount = () => {
    this.getareaLength()
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.areaIdName !== nextProps.areaIdName) {
      this.setState({ areaIdName: nextProps.areaIdName })
    }
    if (this.props.areaLength !== nextProps.areaLength) {
      this.setState({ areaLength: nextProps.areaLength })
    }
  }
  // 查询当前路干个数
  getareaLength = () => {
    /* let length = 0
    const { areaIdName } = this.state
    areaIdName.forEach((item) => {
      length += item.result.length
    })
    this.setState({ areaLength: length }) */
  }
  // 搜索框回调
  getInput = (value) => {
    if (this.props.getInput) {
      this.props.getInput(value)
    }
  }
  // 折叠面板的回调
  getPanel = (nodeid) => {
    if (!nodeid) { return }
    const { Panelresult } = this.state
    if (this.props.getPanel)
      this.props.getPanel(nodeid, (data) => {
        Panelresult[nodeid] = data
        // console.log(nodeid, data, Panelresult)
        this.setState({ Panelresult })
      })
  }
  getTracallback = (item) => {
    if (this.props.getTracallback) {
      this.props.getTracallback(item)
    }
  }
  render() {
    const { Search } = Input
    const { areaIdName, areaLength, Panelresult } = this.state
    return (
      <div className={styles.leftBox}>
        {/*  <Search
          placeholder="搜索资源"
          onSearch={(value) => { this.getInput(value) }}
        /> */}
        <div className={styles.title}>路段数{areaLength}个</div>
        <div className={styles.line} />
        <div className={styles.collapse}>
          <Collapse
            bordered={false}
            accordion={true}
            onChange={this.getPanel}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            {
              areaIdName && areaIdName.map((item) => {
                {/* console.log(Panelresult[item.area_id]) */ }
                return (
                  < Panel header={item.area_name} key={item.area_id} >
                    {
                      Panelresult[item.area_id] && Panelresult[item.area_id].map((items) => {
                        return (<p key={items.fname + items.tname} onClick={() => { this.getTracallback(items) }}>{items.fname + '-' + items.tname}</p>)
                      })
                    }
                  </Panel>
                )
              })
            }
          </Collapse>
        </div>
      </div >
    )
  }

}
export default LeftPop