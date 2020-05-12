import React from 'react'
import GreenWaveCharts from './components/GreenWaveCharts/GreenWaveCharts'

class TestGreenWave extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount = () => {
    
  }
  render() {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000' }}>
        <div style={{ width: '1000px', height: '345px', margin: '50px' }}>
          <GreenWaveCharts />
        </div>
        <div style={{ height: '400px' }}>
          <svg width={300} height={300}>
            <g>
              <rect width="100%" height="100%" style={{ fill: 'purple', strokeWidth: 1, stroke: 'rgb(0,0,0)' }} />
            </g>
          </svg>
        </div>
      </div>
    )
  }
}

export default TestGreenWave
