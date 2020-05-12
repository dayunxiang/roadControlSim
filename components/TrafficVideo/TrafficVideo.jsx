import React from 'react'
import { Icon } from 'antd'
import styles from './TrafficVideo.scss'

class TrafficVideo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      videoSrc: this.props.videoSrc || ''
    }
  }
  componentDidMount = () => {
    // console.log(this.state.videoSrc);
  }
  handleVideo=()=>{
    if (this.props.handleVideo) {
      this.props.handleVideo(null)
    }
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.videoSrc !== nextProps.videoSrc) {
      this.setState({ videoSrc: nextProps.videoSrc })
    }
  }
  render() {
    const { videoSrc } = this.state
    return (
      <div className={styles.chartsSearch}>
        <div className={styles.videoBox}>
          <div className={styles.title}>
            <div className={styles.nodeName}><Icon style={{ fontSize: '28px', color: '#00ccff', marginRight: '10px' }} type="double-right" />视频观看</div>
            <Icon type="close" onClick={this.handleVideo} style={{ fontSize: '28px', color: '#00ccff', position: 'absolute', right: '20px', top: '-20px' }} />
          </div>{/* */}
          <div className={styles.content}>
            <video width="100%" height="100%" controls="controls" autoPlay="autoPlay" >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    )
  }
}

export default TrafficVideo
