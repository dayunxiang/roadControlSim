import React from 'react'
import { Icon } from 'antd'
import styles from './InputLabel.scss'

class InputLabel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  render() {
    return (
      <div className={styles.InputLabelBox} style={{ marginLeft: this.props.left }}>
        <span className={styles.labelText}>{this.props.labelText}</span>
        <span
          key={this.props.paramsname + this.props.value}
          className={styles.textBox}
          contentEditable={this.props.disabled ? false : true}
          suppressContentEditableWarning="true"
          style={{ color: this.props.color }}
          onInput={this.props.handleChange}
          paramsname={this.props.paramsname}
          flowtime={this.props.flowTime}
          typename={this.props.typeName}
          flowdir={this.props.flowDir}
          onBlur={this.props.handleBlur && this.props.handleBlur}
        >
          {this.props.value}
        </span>
        <span style={{ color: this.props.color }}>
          {this.props.units || null}{this.props.edit ? null : <Icon type="edit" style={{ marginLeft: 5 }} />}
        </span>
      </div>
    )
  }
}

export default InputLabel
