import React from 'react'

import Line from '../../containers/img/line.png'

class SplitLine extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.styles = {
      height: '10px',
      backgroundImage: `url(${Line})`,
      backgroundPosition: 'center center',
      backgroundRepeat: 'repeat',
      backgroundSize: '100% 10px',
    }
  }
  componentDidMount = () => {

  }
  render() {
    return (
      <div style={this.styles} />
    )
  }
}

export default SplitLine

