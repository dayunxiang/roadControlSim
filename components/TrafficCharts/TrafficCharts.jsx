import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

class TrafficCharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartsItems: this.props.chartsItems,
    }
  }
  componentDidMount = () => {
    // console.log(this.props.chartsItems);
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.chartsItems !== nextProps.chartsItems) {
      this.setState({ chartsItems: nextProps.chartsItems })
    }
  }
  getOptions = () => {
    const { chartsItems } = this.state
    const titleS = []
    const paramEchart = chartsItems && chartsItems.data.map((item, index) => {
      const colors = [new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0,
        color: '#fccb05',
      }, {
        offset: 1,
        color: '#f5804d',
      }]), new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0,
        color: '#8bd46e',
      }, {
        offset: 1,
        color: '#09bcb7',
      }]), new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0,
        color: '#248ff7',
      }, {
        offset: 1,
        color: '#6851f1',
      }])]
      titleS.push(item.name)
      return {
        name: item.name,
        type: 'line',
        data: item.data,
        smooth: false,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          normal: {
            color: colors[index],
            lineStyle: {
              width: 2,
              color: colors[index]
            },
            /*  color: function (params) {
               var colorList = [
                 ['rgba(17,1374,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                 ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                 ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                 ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                 ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
                 ['rgba(17,174,17,1)', 'rgba(17,174,17,.1)'], ['rgba(213,213,60,1)', 'rgba(213,213,60,.1)'], ['rgba(255,5,2,1)', 'rgba(255,5,2,.1)'], ['rgba(169,6,4,1)', 'rgba(169,6,4,.1)'],
               ];
               var index = params.dataIndex;
               //给大于颜色数量的柱体添加循环颜色的判断
               if (params.dataIndex >= colorList.length) {
                 index = params.dataIndex - colorList.length;
               }
               return new echarts.graphic.LinearGradient(0, 0, 0, 1,
                 [
                   {
                     offset: 0,
                     color: colorList[index][0]
                   },
                   {
                     offset: 1,
                     color: colorList[index][1]
                   }
                 ]);
             } */
          },
        },
      }
    })
    const option = {
      toolbox: {
        show: true,
        itemGap: 20,
        feature: {
          magicType: {
            type: ['line', 'bar'],
            icon: {
              line: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAOCAYAAADNGCeJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREI4OTdCRURGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREI4OTdCRkRGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQjg5N0JDREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFEQjg5N0JEREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+tLtOrQAAAPxJREFUeNqs0c9KAkEcwPHZXBYCQToL3X0AIQ/qniSJWLAXKME30afQm+BNVy91VrSnCAqCDv05dCnw0PYd+k2NsOOlWfio465ffzurVJYphx4eUJL1CaI91yvXiQ6eMccGbXzixhE8MrEENetEIqEqAlxji3OkmFnBY0yxtmP6dia4kpCJN/EiE61kAh1cYIA39FG0b/NQYl8YydqEYhQwxhKX+MATKnl7dir/ciHRR7xLyFyjg7e4w5lMmO7sIS8tvKJh/bCObs5G6ycbyudI9u8vKF/Eex+5mwkO9Tr4Kf7riFDGvY/Y7xH6SxELfMbk3cuABx4HU98CDAAxWWF32h/qdQAAAABJRU5ErkJggg==',
              bar: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAVklEQVQ4jWP8//8/AymAJWIHAwMDQwOacAMTSabgAVQziAWnBMQLlBsEBQ0E+HAwCMOI1LDAaRCUbkATR+cTBIMvjIaxQYzM4dupYhBVM20DNQyimosA/1sK9yldXCIAAAAASUVORK5CYII='
            },
            title: {
              line: '切换折线图',
              bar: '切换柱状图',
            },
          },
          /* saveAsImage: {
            icon: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAiCAYAAABlekbOAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD/klEQVRoge3bS2gbRxgH8G8f2tVqJcuSH/JKcmwnJk5d282lKTRQvHJy6CGHFuomtnBKMYG2lLaHtodeeuil5/RQQjFp5AehxC3FhUBiKQWn0F5ssGya4AZJsVax5dfKK61kvXpoBLKtF10plsz8bpr5EH/4GLGzo8GgRGb+RzdOqF8utR6pnHQy5va7RnqL1WGlfBnX75iWNx5fioqrpPJoiFKMsSPOGNpvCQ9GRgvVFW2u9cJUfzwq/Sx6/6gvXzxEKeOpAYlSE72eu1c8+WqKrsRUMv2TJMyjxlaZ8NqiFmvpuQkA/flqCjbXyo9/G9nxssm4XOZoiFIxaR00iegrloEJ3j877MpVk7e5nO1OWzod+TCy8ZipXEREid1ni/V662tjANCRaz5vc/G0/EtIWNBWLBmiWCK6C3vhoNF6cXJ09d7QDwfnczbXbJscjYeDJ+ORrconRBQJry3VUTrTdQA41NycT8vWC7fTG4/uVjwYUh5s02mZ1rdeF1z2L7PHDzUX7WlrU8PpizFVkmnxPHhrJzO2r4HP97Q8amztkdaWSbaxawwA3s6M7Vu5Zn4yKHrnGtHWpzYZTr4h4hTb7783uACQtXLRnrb2Sc/cep357E0AOAvwfOVytjtteDri3lxxoq1PjatrfVWkaOP7q67L0yQA2tMeJ1LArTd0vH4DAKZJtKc9XlIJGWJiQG0eGP+ChHTis5CwUHfUoZDykdaXWaOu+T0Sx4kbWq7nGyngRj/LxwTb3CUDTt3GAAAstnGv6PvrRCK2e9S5EIVwnARDpy3qn73C/PdAhRF2luv7VfQ8ROe2NU5jOiNhAF8BZL3EMPOOmfD632/GQgJ+dNEQJXAVA4b281t+53ADQNZLDDVBD2MtPWuxkEAfXTxECbbpTAgA/zTzed/rR6tt4mtZfPp5eP2R5sVHQ5QgaR3oT5zz+Z32tszYoVMhi21ic9vz0JhCryFrir71nEgyBrt/9vJMZuzw6Q9GXdVxfQ7R9yd6uKoRKsYAOK19mt1YgBzN9c++M2PhHUsU23R+Lxx8cQmR/01j6t5REfQHB8dzntumCHpIx/Uub6442cpHQ5Sg2CYgSXrJd39w7uBczuYG7g/6zPytMcbYeU3eWkFPz1WMNXWHsByrFqDIjQPLwJS8veJUp1KJyiRDFKHruDRr6v5NcNov5Zov/HcaHK6xLb3f7Qrz6GChCmmbX4qkcOqjfPNF7wpxvGNR8s/3xOXt8iZDFGHq2xLqxs6pgMs+kq+m6B/hCIIe0nJ9c9tPfkert4pomruSNEZ8XKimtCucNocjGvznXXnHqypPNEQJpuHUHmNo/15w2T8pVFdScwHQ5etqUurl638B7AlgEU3JXJYAAAAASUVORK5CYII=',
            title:'导 出',
            itemSize:30,
          }, */
        },
        right: 120,
        top: 5,
        width: 81,
        height: 25,
      },
      xAxis: {
        /* name: 'X轴的名字', */
        boundaryGap: false,
        data: chartsItems && chartsItems.data[0].time,
        axisLine: {
          lineStyle: {
            color: '#67c6e6',
          },
        },
        axisLabel: {
          color: '#02fbff',
        },
      },
      yAxis: {
        /* name: 'Y轴的名字', */
        type: 'value',
        axisLabel: {
          color: '#02fbff',
          /* formatter: '{value} ' + this.chartsName, */
        },
        axisLine: {
          lineStyle: {
            color: '#17396b',
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#17396b'],
          },
        },
      },
      dataZoom: [
        {
          height: 10,
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 50,
          end: 100,
          bottom: 5,
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 50,
          end: 100,
        },
      ],
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'line', // 默认为直线，可选为：'line' | 'shadow'
        },

      },
      legend: {
        data: titleS,
        right: 190,
        top: 6,
        width: '265',
        type: 'scroll',
        pageTextStyle: { color: '#fff' }, // 页码颜色
        pageIconColor: '#6495ed', //翻页下一页的三角按钮颜色
        pageIconInactiveColor: '#6495ed', // 翻页到头的颜色
        textStyle: {
          color: '#fff',
        },
        itemWidth: 12,
        itemHeight: 10,
        // itemGap: 35
      },
      grid: {
        top: 45,
        bottom: 45,
        right: 30,
      },
      series: paramEchart,
    }
    return option
  }
  render() {
    return (
      <ReactEcharts option={this.getOptions()} style={{ height: this.props.height }} />
    )
  }
}

export default TrafficCharts
