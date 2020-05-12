import React from 'react'
import classNames from 'classnames'
import { Icon } from 'antd'
import styles from './Entrance.scss'

import Nav from '../Nav/Nav'

import Inter from './imgs/001.png'
import System from './imgs/003.png'
import Analysis from './imgs/002.png'
import Area from './imgs/006.png'
import Datas from './imgs/004.png'
import Manage from './imgs/005.png'

class Entrance extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRotate: false,
      systemTextBg: '',
      systemTextZ: -1,
      systemTextTop: '45%',
      systemTextLeft: '40%',
      listBoxLeft: 0,
    }
    this.systemsAry = [
      { name: '路口交通组织方案设计', img: Inter, href: '/roadtraffic' },
      { name: '区域交通组织方案设计', img: Area, href: '/TrafficArea' },
      { name: '交通预测分析', img: Analysis, href: '/TrafficAnalysis' },
      { name: '仿真资源管理', img: Manage, href: '/TrafficManage' },
      { name: '数据分析', img: Datas, href: '/TrafficDatas' },
      { name: '系统管理', img: System, href: '/TrafficSystem' },
    ]
    this.domRectXY = new Array(6).fill(null)
  }
  componentDidMount = () => {

  }
  handelSystemEnter = (e) => {
    const targetEle = e.currentTarget
    const systemName = targetEle.getAttribute('systemname')
    const indexs = targetEle.getAttribute('systemindex')
    const domRect = targetEle.getBoundingClientRect()
    const systems = this.systemsAry.filter(item => item.name === systemName)
    let domRectX = domRect.x
    let domRectY = domRect.y
    if (indexs === '0' || indexs === '2' || indexs === '4') {
      if (!this.domRectXY[indexs]) {
        this.domRectXY.splice(indexs, 1, [domRectX += 185, domRectY += 50])
      }
    } else {
      if (!this.domRectXY[indexs]) {
        this.domRectXY.splice(indexs, 1, [domRectX -= 270, domRectY += 50])
      }
    }
    const positionXY = this.domRectXY[indexs]
    this.setState({
      isRotate: true,
      systemTextBg: systems[0].img,
      systemTextTop: positionXY[1],
      systemTextLeft: positionXY[0],
      systemTextZ: 1,
    })
  }
  handelSystemLeave = (e) => {
    this.setState({
      isRotate: false,
      systemTextBg: '',
      systemTextTop: '45%',
      systemTextLeft: '40%',
      systemTextZ: -1,
    })
  }
  handleMoveLeft = () => {
    if (this.state.listBoxLeft === 0) return
    this.setState({ listBoxLeft: this.state.listBoxLeft += 270 })
  }
  handleMoveRight = () => {
    if (this.state.listBoxLeft === -270 * 5) return
    this.setState({ listBoxLeft: this.state.listBoxLeft -= 270 }, () => {
      // console.log(document.getElementsByClassName('.systemPicBox'))
      // console.log(-this.state.listBoxLeft / 270)
    })
  }
  handleModuleClick = (link) => {
    this.props.history.push(link)
  }
  render() {
    return (
      <div className={styles.entranceWrapper}>
        <Nav />
        <div className={styles.transformBox}>
          {/* <div className={styles.systemTextBox} style={{ top: this.state.systemTextTop, left: this.state.systemTextLeft, zIndex: this.state.systemTextZ }}>
            <img src={this.state.systemTextBg} alt="" />
          </div> */}
          <div className={styles.systemPicBox}>
            {
              this.systemsAry.map((item, index) =>
                (
                  <div
                    key={item.name}
                    className={styles.rotateBox}
                    systemname={item.name}
                    systemindex={index}
                    // onMouseEnter={(e) => { this.handelSystemEnter(e) }}
                    // onMouseLeave={(e) => { this.handelSystemLeave(e) }}
                    onClick={() => { this.handleModuleClick(item.href) }}
                  >
                    <div className={styles.systemTextBox} style={{ top: '60px', left: index === 0 || index === 2 || index === 4 ? '176px' : '-252px', zIndex: 1 }}>
                      <img src={item.img} alt="" />
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
        <div className={classNames({
          [styles.earhBgBox]: true,
          [styles.contentxRotate]: true,
          [styles.pauseRotate]: this.state.isRotate,
        })}
        />
        <div className={styles.systemListBox}>
          <div className={styles.moveBtn} onClick={this.handleMoveLeft}><Icon type="left" /></div>
          <div className={styles.listWrapper}>
            <div className={styles.listBox} style={{ left:this.state.listBoxLeft + 'px' }}>
              {
                this.systemsAry.map((item, index) => (
                  <div className={styles.sysName} key={item.name} itemindex={index}>{item.name}</div>
                ))
              }
            </div>
          </div>
          <div className={styles.moveBtn} onClick={this.handleMoveRight}><Icon type="right" /></div>
        </div>
      </div>
    )
  }
}

export default Entrance

