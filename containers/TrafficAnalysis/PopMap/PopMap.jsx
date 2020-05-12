import React from 'react'
import { Icon } from 'antd';
import styles from './PopMap.scss'

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1432521_n6pn7ili16q.js',
});
class PopMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: true, 
    }
  }
  componentDidMount = () => {

  }
  closePop = (bool) => {
      this.setState({
        show: bool,
      })
  }
  
  render() {
    const { show } = this.state
    return (
      <div>
        {show ? <div className={styles.popMapBox}>
          <IconFont type="icon-close" onClick={() => { this.closePop(false) }} />
          <dl>
            <dt><span>路段名称：</span><span>路口1-路口2</span></dt>
            <dt><span>路段方向：</span><span>西向东</span></dt>
            {/* 状态的四种：拥堵 > red 拥挤 > orange 缓行 > yellow 畅通 > green */}
            <dt><span>拥堵状态：</span><span className={styles.red}>拥堵</span></dt>
          </dl>
        </div>:null}
      </div>
    )
  }
}

export default PopMap