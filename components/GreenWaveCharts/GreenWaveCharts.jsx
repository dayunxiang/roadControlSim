import React from 'react'
import $ from 'jquery'
import './GreenWaveCharts.css'

class GreenWaveCharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      svgs: null,
      reverseSvgs: null,
      showSvg: false,
    }
    this.W = parseInt(this.props.boxWidth) - 50 || 1000 // 容器width
    this.H = parseInt(this.props.boxHeight) || 345 // 容器height
    this.xAxis = 1145 // this.props.totleDistance // x轴的总距离（后期表示数据中各个路口距离之和）
    this.yAxis = 600 // y轴的总时间s
    this.Hs = this.H / this.yAxis // 每秒所占px值
    this.Ws = this.W / this.xAxis // 每千米所占px值
    this.ySplit = 10 // y轴分10份
    this.ySplitS = this.yAxis / this.ySplit // y轴每份的秒数
    this.yScaleH = this.Hs * this.ySplitS // y轴每个刻度的高度
    this.xSplit = 5 // x轴分5份
    this.xSplitD = this.xAxis / this.xSplit // x轴每份的距离
    this.xScaleW = this.Ws * this.xSplitD // x轴每个刻度的宽度
    this.cycleTime = 196 // 路口周期时长（后期获取各路口中的phaseList中的cycle_time）
    this.greenTime = 40 // 路口绿灯时长 （后期获取各个路口中的phaseList中的spliteTIme）
    this.redTime = this.cycleTime - this.greenTime // 红灯时长
    this.xAxisArr = [] // new Array(this.xSplit).fill(0)
    this.yAxisArr = new Array(this.ySplit).fill(0)
    this.repeatBox = new Array(3).fill(0)
    this.len = 0 // 路口到0点的距离
    this.unitMsg = []
    this.greenPositions = []
    this.reversePositions = []
    this.svgs = []
    this.reverseSvgs = []
    this.cycleNumArr = []
    this.reverseCycleNumArr = []
    this.reverseWave = []
    this.chartsDatas = [{"area_name":"路桥区","lenAll":0,"data_version":"20180630","reverseSpeed":"50.00","execute_end_date":"","reverse_phase_plan_id":"1","execute_start_date":"","forward_phase_plan_name":"9","forward_offset":0,"reverse_offset":0,"is_key_inter":0,"len":0,"inter_name":"灵山街-腾达路交叉","forward_phase_plan_id":"1","geohash":"w7w6nmzbtk","reverse_phase_plan_name":"9","id":"11LCE064040","lev":"4","lat":20.07075578,"inter_id":"11LCE064040","lng":110.32459793,"adcode":"460100","area_code":"460108","phaseList":[{"inter_id":"11LCE064040","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":35,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298902,"phase_name":"9","doe_date_type":99},{"inter_id":"11LCE064040","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":35,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298903,"phase_name":"4","doe_date_type":99},{"inter_id":"11LCE064040","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":43,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298904,"phase_name":"8","doe_date_type":99},{"inter_id":"11LCE064040","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":15,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298905,"phase_name":"2","doe_date_type":99},{"inter_id":"11LCE064040","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":20,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298922,"phase_name":"0","doe_date_type":99}],"name":"灵山街-腾达路交叉","cycle_time":148,"forwordSpeed":"0.00"},{"area_name":"路桥区","lenAll":685,"data_version":"20180630","reverseSpeed":"50.00","execute_end_date":"","reverse_phase_plan_id":"1","execute_start_date":"","forward_phase_plan_name":"9","forward_offset":70,"reverse_offset":70,"is_key_inter":0,"len":685,"inter_name":"腾达路-银安街","forward_phase_plan_id":"1","geohash":"w7w6ns5uqv","reverse_phase_plan_name":"9","id":"11LE6063TA0","lev":"4","lat":20.06179509,"inter_id":"11LE6063TA0","lng":110.33015509,"adcode":"460100","area_code":"460108","phaseList":[{"inter_id":"11LE6063TA0","offset":70,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":43,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298906,"phase_name":"9","doe_date_type":99},{"inter_id":"11LE6063TA0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":25,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298907,"phase_name":"4","doe_date_type":99},{"inter_id":"11LE6063TA0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":35,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298908,"phase_name":"8","doe_date_type":99},{"inter_id":"11LE6063TA0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":17,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298909,"phase_name":"2","doe_date_type":99},{"inter_id":"11LE6063TA0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":28,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298923,"phase_name":"0","doe_date_type":99}],"name":"腾达路-银安街","cycle_time":148,"forwordSpeed":"50.00"},{"area_name":"路桥区","lenAll":1145,"data_version":"20180630","reverseSpeed":"50.00","execute_end_date":"","reverse_phase_plan_id":"1","execute_start_date":"","forward_phase_plan_name":"9","forward_offset":105,"reverse_offset":105,"is_key_inter":0,"len":460,"inter_name":"腾达路-商海北街","forward_phase_plan_id":"1","geohash":"w7w6nvrnmm","reverse_phase_plan_name":"9","id":"11LIV063VI0","lev":"4","lat":20.06900403,"inter_id":"11LIV063VI0","lng":110.34553684,"adcode":"460100","area_code":"460108","phaseList":[{"inter_id":"11LIV063VI0","offset":105,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":45,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298910,"phase_name":"9","doe_date_type":99},{"inter_id":"11LIV063VI0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":25,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298911,"phase_name":"4","doe_date_type":99},{"inter_id":"11LIV063VI0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":33,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298912,"phase_name":"8","doe_date_type":99},{"inter_id":"11LIV063VI0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":16,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298913,"phase_name":"2","doe_date_type":99},{"inter_id":"11LIV063VI0","offset":0,"data_version":"20180630","adcode":"460100","stat_date":"20190911111219","end_time":"09:00:00","task_id":"0","split_time":25,"phase_plan_id":"1","offset_type_no":1,"dt":"20190911","start_time":"07:30:00","ctlregion_id":"TengDaLu","cyclesplit_source":1,"update_frequency":2,"cycle_time":148,"id":3298924,"phase_name":"0","doe_date_type":99}],"name":"腾达路-商海北街","cycle_time":148,"forwordSpeed":"50.00"}]
  }
  componentWillReceiveProps = (nextProps) => {
    // console.log(this.props.chartsData, this.props.totleDistance)
    this.prevTime = 0
    this.reversePrevTime = 0
    this.greenPositions = []
    this.reversePositions = []
    this.svgs = []
    this.reverseSvgs = []
    this.cycleNumArr = []
    this.reverseCycleNumArr = []
    this.reverseWave = []
    this.setState({
      svgs: null,
      reverseSvgs: null,
    }, () => {
      this.getGreenWaveCharts(nextProps.chartsData)
    })
  }
  componentDidMount = () => {
    this.prevTime = 0
    this.reversePrevTime = 0
    this.greenPositions = []
    this.reversePositions = []
    this.svgs = []
    this.reverseSvgs = []
    this.cycleNumArr = []
    this.reverseCycleNumArr = []
    this.reverseWave = []
    this.setState({
      svgs: null,
      reverseSvgs: null,
    }, () => {
      this.getGreenWaveCharts(this.chartsDatas) // this.props.chartsData
    })
    setTimeout(() => {
      this.setState({ showSvg: true })
    }, 2000)
    
  }
  getGreenWaveCharts = (chartsData) => {
    // 获取正向绿波坐标点
    this.interLen = 0
    this.reversePrevTime = 0
    chartsData.forEach((item, index) => {
      this.xAxisArr.push(item.lenAll) // 路口距离。做横坐标刻度显示
      if (item.cycle_time !== '' && item.phaseList.length > 0) {
        const phaseBox = document.getElementById('phaseBox' + index)
        const phaseBoxTop = phaseBox.offsetTop // 距离父容器顶部距离
        const graphLeft = $(phaseBox).closest('.graphBox')[0].offsetLeft // 每个路口柱子的容器距离左边的距离
        const repeatBoxLeft = $(phaseBox).closest('.repeatBox')[0].offsetLeft // 每个路口柱子距离其父容器左边的距离
        const phaseBoxLeft = graphLeft + repeatBoxLeft + 12 // 得到每个路口柱子距离左边y轴的距离
        const parentTop = phaseBox.parentNode.offsetTop // 当前周期box距离父容器顶部距离
        const phaseBoxH = phaseBox.offsetHeight // 自身高度
        const posT = 345 - (phaseBoxTop + parentTop + phaseBoxH) // 默认的存在偏移的协调相位的起始位置 
        // console.log('默认的存在偏移的协调相位的起始位置:', )
        const position = parseFloat(item.forward_offset) * this.Hs  //根据协调相位时间得出的起始位置
        $(phaseBox).closest('.repeatBox')[0].style.bottom = (position - posT) + 'px' // 将放置柱子的容器偏移到起始位置
        const forwordSpeed = parseFloat(item.forwordSpeed) // 速度
        const len = item.len  // 距离
        const phaseTime = forwordSpeed === 0 ? 0 : len / (forwordSpeed / 3.6) // 转 m/s, 得出协调相位时间
        const times = (phaseTime + this.prevTime) // 当前协调基准时间 + 上一个路口的协调基准时间
        let startPos = 345 - (times * this.Hs + phaseBoxH) // 当前路口绿波的终点 (phaseBoxLeft, endTime)
        let endPos = 345 - times * this.Hs // 当前路口绿波的起点 （phaseBoxLeft, svgPos）
        const phaseBoxStart = phaseBoxTop + parentTop - position + posT // 表示绿灯时长的第一个容器的顶部距离父元素的父元素的顶部距离
        const phaseBoxEnd = phaseBoxStart + phaseBoxH // 表示绿灯时长的第一个容器的底部距离父元素的父元素的顶部距离
        // console.log('起点', times*this.Hs, '终点：', times*this.Hs+phaseBoxH, '第'+ index + '个路口')
        if (startPos <= phaseBoxEnd && endPos >= phaseBoxStart) {
          // if (phaseBoxEnd > startPos && startPos > phaseBoxStart && endPos > phaseBoxEnd) {
          //   endPos = phaseBoxEnd
          // }
          // if (phaseBoxEnd > endPos && endPos > phaseBoxStart && startPos < phaseBoxStart) {
          //   startPos = phaseBoxStart
          // }
          const differH = (endPos - startPos) // 平行四边形右侧边线高度（决定着左侧边线的高度）
          this.prevTime = phaseTime // 保存此次的协调基准时间
          const obj = {}
          obj.start = [phaseBoxLeft, startPos]
          obj.end = [phaseBoxLeft, endPos]
          obj.differ = differH
          obj.cycleH = item.cycle_time * this.Hs
          this.greenPositions.push(obj)
        }
        const num = this.H / (item.cycle_time * this.Hs) // 周期循环个数
        this.cycleNumArr.push(Math.floor(num))
      }
    })
    // 获取反向绿波坐标点 px
    for(let i = chartsData.length - 1; i >= 0; i--) {
      const thisUnit = chartsData[i]
      if (thisUnit.cycle_time !== '' && thisUnit.phaseList.length > 0) {
        const reversePhaseBox = document.getElementById('reversePhaseBox' + i)
        const reversePhaseBoxTop = reversePhaseBox.offsetTop // 距离父容器顶部距离
        const reverseRepeatBoxLeft = $(reversePhaseBox).closest('.repeatBox')[0].offsetLeft // 每个路口柱子距离其父容器左边的距离
        const reverseGraphLeft = $(reversePhaseBox).closest('.graphBox')[0].offsetLeft // 每个路口柱子的容器距离左边的距离
        const reversePhaseBoxLeft = reverseGraphLeft + reverseRepeatBoxLeft + 12 // 得到每个路口柱子距离左边y轴的距离
        const reverseParentTop = reversePhaseBox.parentNode.offsetTop // 当前周期box距离父容器顶部距离
        const reversePhaseBoxH = reversePhaseBox.offsetHeight // 自身高度
        const reversePosT = 345 - (reversePhaseBoxTop + reverseParentTop + reversePhaseBoxH) // 默认的存在偏移的协调相位的起始位置
        const reversePosition = parseFloat(thisUnit.reverse_offset) * this.Hs  //根据协调相位时间得出的起始位置
        $(reversePhaseBox).closest('.repeatBox')[0].style.bottom = (reversePosition - reversePosT) + 'px' // 将放置柱子的容器偏移到起始位置
        
        const reverseSpeed = parseFloat(thisUnit.reverseSpeed) // 速度
        const reverseLen = thisUnit.len  // 距离
        const reversePhaseTime = reverseSpeed === 0 ? 0 : reverseLen / (reverseSpeed / 3.6) // 转 m/s, 得出协调相位时间
        const reverseTimes = reversePhaseTime + this.reversePrevTime // 当前协调基准时间 + 上一个路口的协调基准时间
        let reverseStartPos = 345 - (reverseTimes * this.Hs + reversePhaseBoxH) // 当前路口绿波的终点 (phaseBoxLeft, endTime)
        let reverseEndPos = 345 - reverseTimes * this.Hs // 当前路口绿波的起点 （phaseBoxLeft, svgPos）
        const phaseBoxStart = reversePhaseBoxTop + reverseParentTop - reversePosition + reversePosT // 表示绿灯时长的第一个容器的顶部距离父元素的父元素的顶部距离
        const phaseBoxEnd = phaseBoxStart + reversePhaseBoxH // 表示绿灯时长的第一个容器的底部距离父元素的父元素的顶部距离
        // console.log('top' + phaseBoxStart, 'bottom' + phaseBoxEnd, '第' + i + '次')
        // console.log('起点' + reverseStartPos, '终点' + reverseEndPos, '第' + i + '次')
        if (reverseStartPos <= phaseBoxEnd && reverseEndPos >= phaseBoxStart) {
          // if (phaseBoxEnd > reverseStartPos && reverseStartPos > phaseBoxStart && reverseEndPos > phaseBoxEnd) {
          //   reverseEndPos = phaseBoxEnd
          // }
          // if (phaseBoxEnd > reverseEndPos && reverseEndPos > phaseBoxStart && reverseStartPos < phaseBoxStart) {
          //   reverseStartPos = phaseBoxStart
          // }
          const reverseDifferH = (reverseEndPos - reverseStartPos) // 平行四边形右侧边线高度（决定着左侧边线的高度）
          this.reversePrevTime += reversePhaseTime // 保存此次的协调基准时间
          const obj = {}
          obj.reverseEnd = [reversePhaseBoxLeft, reverseStartPos]
          obj.reverseStart = [reversePhaseBoxLeft, reverseEndPos]
          obj.reverseDiffer = reverseDifferH
          obj.cycleH = thisUnit.cycle_time * this.Hs
          this.reversePositions.push(obj)
        }
        const num = this.H / (thisUnit.cycle_time * this.Hs) // 周期循环个数
        this.reverseCycleNumArr.push(Math.floor(num))
      }
    }
    
    // 正向绿波
    this.cycleNum = Math.min.apply(null, this.cycleNumArr)
    for (let i = 0; i < this.greenPositions.length; i++) {
      const thisP = this.greenPositions[i] //当前点位置
      const next = this.greenPositions[i+1] // 下一个点的位置
      if (!!next) {
        const obj = {}
        if (thisP.start[1] === 345) {
          obj.leftTop = thisP.start
          obj.rightTop = [next.end[0] -12, next.end[1]]
          obj.leftBottom = [thisP.start[0], thisP.start[1] - next.differ]
          obj.rightBottom = [next.start[0] - 12, next.start[1]]
          this.svgs.push(obj)
        } else {
          obj.leftTop = [thisP.start[0], thisP.start[1] + next.differ]
          obj.rightTop = [next.end[0] -12, next.end[1]]
          obj.leftBottom = thisP.start
          obj.rightBottom = [next.start[0] - 12, next.start[1]]
          this.svgs.push(obj)
        }
        for (let n = 1; n < this.cycleNum; n++) { // 可视区域内的周期添加绿波
          const obj = {}
          if (thisP.start[1] === 345) {
            obj.leftTop = [thisP.start[0], thisP.start[1] - next.cycleH*n] 
            obj.rightTop = [next.end[0] -12, next.end[1] - next.cycleH*n]
            obj.leftBottom = [thisP.start[0], thisP.start[1] - next.differ - next.cycleH*n]
            obj.rightBottom = [next.start[0] - 12, next.start[1] - next.cycleH*n]
            this.svgs.push(obj)
          } else {
            obj.leftTop = [thisP.start[0], thisP.start[1] + next.differ - next.cycleH*n]
            obj.rightTop = [next.end[0] -12, next.end[1] - next.cycleH*n]
            obj.leftBottom = [thisP.start[0], thisP.start[1] - next.cycleH*n] 
            obj.rightBottom = [next.start[0] - 12, next.start[1] - next.cycleH*n]
            this.svgs.push(obj)
          }
        }
      }
    }

    // 反向绿波
    this.reverseCycleNum = Math.min.apply(null, this.reverseCycleNumArr) // 绿波可循环的个数
    for (let i = 0; i < this.reversePositions.length; i++) {
      const thisP = this.reversePositions[i] //当前点位置
      const next = this.reversePositions[i+1] // 下一个点的位置
      if (!!next) {
        const obj = {}
        // if (thisP.reverseStart[1] === 345) {}
        obj.reverseLeftTop = next.reverseEnd
        obj.reverseRightTop = [thisP.reverseEnd[0] -12, thisP.reverseStart[1] - next.reverseDiffer]
        obj.reverseLeftBottom = [next.reverseStart[0], next.reverseStart[1]]
        obj.reverseRightBottom = [thisP.reverseStart[0] - 12, thisP.reverseStart[1]]
        this.reverseSvgs.push(obj)
        for (let n = 1; n < this.reverseCycleNum; n++) { // 可视区域内的周期添加绿波
          const obj = {}
          obj.reverseLeftTop = [next.reverseEnd[0], next.reverseEnd[1] - thisP.cycleH*n]
          obj.reverseRightTop = [thisP.reverseEnd[0] -12, thisP.reverseStart[1] - next.reverseDiffer - thisP.cycleH*n]
          obj.reverseLeftBottom = [next.reverseStart[0], next.reverseStart[1] - thisP.cycleH*n]
          obj.reverseRightBottom = [thisP.reverseStart[0] - 12, thisP.reverseStart[1] - thisP.cycleH*n]
          this.reverseSvgs.push(obj)
        }
      }
    }
    this.setState({ svgs: this.svgs, reverseSvgs: this.reverseSvgs }, () => {
      // console.log('reverseSvgs:::::::', this.state.reverseSvgs)
      // console.log('Svgs:::::::', this.state.svgs)
    })
  }
  render() {
    return (
      <div className="greenWaveBox">
        <div style={{ position: 'absolute', width: '100%', height: '345px', top: '0', zIndex: '1', opacity: '.8' }}>
          {
            this.state.showSvg &&
            <svg width={1000} height={345}>
              <polygon points="12,325 12,350 598,316.641 598,291.641" style={{ fill: 'green', stroke: '#000000', strokeWidth:1 }} />
            </svg>
          }
          
        </div>
        <div className="begainBox">0</div>
        <div className="xCoordinate"><div className="xarrows"></div></div>
        <div className="yCoordinate"><div className="yarrows"></div></div>
        {
          this.chartsDatas.map((item, index) => {
            if (item.cycle_time !== '') {
              const num = this.H / (item.cycle_time * this.Hs)
              const cycleTimeArr = new Array(Math.ceil(num)).fill(item.cycle_time * this.Hs)
              return (
                <div className="graphBox" style={{ left: item.lenAll * this.Ws + 'px' }} key={item.forward_offset+index}>
                  <div className="repeatBox" style={{ left: '0' }}>
                    {
                      this.repeatBox.map((repeat, reIndex) => {
                        const bottomN = (item.cycle_time * this.Hs) * cycleTimeArr.length
                        return (
                          <div key={reIndex} className="forwordGraph" style={{ bottom: reIndex === 0 ? -bottomN + 'px' : reIndex === 1 ? 0 : bottomN + 'px' }}>
                            {
                              cycleTimeArr.map((cycle, _index) => {
                                return (
                                  <div key={_index} className="phaseBox" style={{ bottom: cycle * _index + 'px' }}>
                                    {
                                      item.phaseList.length > 0 &&
                                      item.phaseList.map((items, indexs) => {
                                        const phaseOffSet = items.split_time < 0 ? -(items.split_time) : items.split_time
                                        if (item.forward_phase_plan_name === items.phase_name) {
                                          return (
                                            <div key={indexs} id={ reIndex === 1 && _index === 0 ? 'phaseBox' + index : ''} className="greenBox colorBox" phasename={items.phase_name} style={{ height: phaseOffSet * this.Hs + 'px', backgroundColor: '#73a22b' }}></div>
                                          )
                                        } else {
                                          return (
                                            <div key={indexs} className="redBox colorBox" phasename={items.phase_name} style={{ height: phaseOffSet * this.Hs + 'px' }}></div>
                                          )
                                        }
                                      })
                                    }
                                  </div>
                                )
                              })
                            }
                          </div>
                        )
                      })
                    }
                  </div>
                  <div className="repeatBox" style={{ left: '20px' }}>
                    {
                      this.repeatBox.map((repeat, reIndex) => {
                        const bottomN = (item.cycle_time * this.Hs) * cycleTimeArr.length
                        return (
                          <div key={reIndex} className="forwordGraph" style={{ bottom: reIndex === 0 ? -bottomN + 'px' : reIndex === 1 ? 0 : bottomN + 'px' }}>
                            {
                              cycleTimeArr.map((cycle, _index) => {
                                return (
                                  <div className="phaseBox" style={{ bottom: cycle * _index + 'px' }} key={cycle*_index}>
                                    {
                                      item.phaseList.length > 0 &&
                                      item.phaseList.map((items, indexs) => {
                                        const phaseOffSet = items.split_time < 0 ? -(items.split_time) : items.split_time
                                        if (item.reverse_phase_plan_name === items.phase_name) {
                                          return (
                                            <div key={items.phase_name} id={ reIndex === 1 && _index === 0 ? 'reversePhaseBox' + index : ''} className="greenBox colorBox" phasename={items.phase_name} style={{ height: phaseOffSet * this.Hs + 'px', backgroundColor: '#4c791d' }}></div>
                                          )
                                        } else {
                                          return (
                                            <div key={items.phase_name} className="redBox colorBox" phasename={items.phase_name} style={{ height: phaseOffSet * this.Hs + 'px' }}></div>
                                          )
                                        }
                                      })
                                    }
                                  </div>
                                )
                              })
                            }
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              )
            }
          })
        }
        
        {/* <div className="graphBox">
          <div className="forwordGraph">
            <div className="phaseBox">
              <div className="greenBox colorBox"></div>
            </div>
          </div>
          <div className="reverseGraph"></div>
        </div> */}
        {
          this.yAxisArr.map((item, index) => {
            return (
              <div className="yAxisBox" style={{ height: this.yScaleH + 'px', bottom: index * this.yScaleH + 'px' }} key={'y' + index}>
                <div style={{ position: 'relative' }}>
                  <span className="yScaleText">{this.ySplitS * (index +1)}</span>
                </div>
              </div>
            )
          })
        }
        {
          this.xAxisArr.map((item, index) => {
            const interMsg = this.chartsDatas[index]
            if (!!interMsg) {
              return (
                <div className="xAxisBox" style={{ width: this.Ws * item + 'px', left: '0px' }} key={'x' + index}>
                  <div style={{ position: 'relative' }}>
                    <span className="xScalText">{item}</span>
                  </div>
                  <div className="xAxisInterMsg" style={{ left: this.Ws * item - 20 + 'px' }} key={interMsg.inter_name + interMsg.forwordSpeed + interMsg.reverseSpeed}>
                    <div>{interMsg.inter_name}</div>
                    <div>周期：{interMsg.phaseList.length > 0 ? interMsg.phaseList[0].cycle_time : 0}秒</div>
                    <div>速度(正)：{interMsg.forwordSpeed}km/h</div>
                    <div>速度(反)：{interMsg.reverseSpeed}km/h</div>
                  </div>
                </div>
              )
            }
          })
        }
      </div>
    )
  }
}

export default GreenWaveCharts
