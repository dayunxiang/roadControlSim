import React from 'react'
import { Spin } from 'antd'

class LoadingPage extends React.Component {
  constructor(props) {
    super(props)
    this.styles = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e375d',
    }
  }
  render() {
    return (
      <div style={this.styles}><Spin size="large" /></div>
    )
  }
}

export default LoadingPage
