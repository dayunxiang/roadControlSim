import React from 'react'
import { Icon, Input } from 'antd'
import styles from './InputLabel.scss'

const { TextArea } = Input
class InputLabel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  render() {
    return (
      <div className={styles.InputLabelBox} style={{ marginLeft: this.props.left }} >
        <span className={styles.labelText}>{this.props.labelText}</span>
        <span className={styles.textBox} contentEditable="true" suppressContentEditableWarning="true" style={{ color: this.props.color }} onInput={this.props.handleChange}>{this.props.value}</span>
        <span><Icon type="edit" /></span>
      </div >
    )
  }
}

export default InputLabel
