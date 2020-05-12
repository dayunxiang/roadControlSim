import React from 'react'
import styles from './Title.scss'

class Title extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount = () => {

  }
  render() {
    return (
      <div className={styles.titleBox}>
        {this.props.title}
      </div>
    )
  }
}

export default Title
