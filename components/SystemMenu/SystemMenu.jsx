import React from 'react'

import styles from './SystemMenu.scss'
import IconOne from './twoIcon1.png'
import IconTwo from './twoIcon2.png'
import IconThree from './twoIcon3.png'
import MenuIcon from './twoMenu.png'

class SystemMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShow: false,
      oneBottom: 0,
      oneRight: 0,
      twoBottom: 0,
      twoRight: 0,
      threeBottom: 0,
      threeRight: 0,
      MenuBoxR: 0,
    }
  }
  componentDidMount = () => {

  }
  handleMenuClick = () => {
    if (this.state.isShow) {
      this.setState({
        isShow: false,
        oneBottom: 0,
        oneRight: 0,
        twoBottom: 0,
        twoRight: 0,
        threeBottom: 0,
        threeRight: 0,
        MenuBoxR: 0,
      })
    } else {
      this.setState({
        isShow: true,
        oneBottom: '105px',
        oneRight: 0,
        twoBottom: '75px',
        twoRight: '75px',
        threeBottom: 0,
        threeRight: '105px',
        MenuBoxR: 720,
      })
    }
  }
  handlePreventHref = (e) => {
    e.preventDefault()
  }
  render() {
    const { zIndexs,oneBottom, oneRight, twoBottom, twoRight, threeBottom, threeRight, MenuBoxR } = this.state
    return (
      <div className={styles.SystemMenuBox}>
        <div className={styles.MenuBox}>
          <a href="http://39.100.128.220/atms-web/" className={styles.menuHref} style={{ bottom: oneBottom, right: oneRight, transform: `rotate(${MenuBoxR}deg)` }}><img src={IconOne} /></a>
          <a href="http://39.100.128.220:3000/#/optimization" className={styles.menuHref} style={{ bottom: twoBottom, right: twoRight, transform: `rotate(${MenuBoxR}deg)` }}><img src={IconTwo} /></a>
          <a href="" onClick={this.handlePreventHref} className={styles.menuHref} style={{ bottom: threeBottom, right: threeRight, transform: `rotate(${MenuBoxR}deg)` }}><img src={IconThree} /></a>
        </div>
        <div className={styles.clickBox} style={{ transform: `rotate(${MenuBoxR}deg)` }} onClick={this.handleMenuClick} />
      </div>
    )
  }
}

export default SystemMenu
