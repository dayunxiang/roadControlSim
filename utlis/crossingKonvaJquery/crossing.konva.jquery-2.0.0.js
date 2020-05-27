import jQuery from 'jquery'
import Konva from 'konva'
// crossing.konva.jquery
(function ($, plug) {
  // 默认值
  let __DEF__ = {
    flow: false,
    contentId: '', //容器窗口ID
    relyOnId: '', //依赖id句柄
    pathR: 400, //圆直径
    crossingFill: "transparent", //8方向路口填充色
    crossingStroke: '#07BAD2', //边框色
    crossingWidth: 4, //边框宽度
    arrowFill: '#07BAD2', //箭头填充色
    arrowStroke: '#07BAD2', //箭头边框色
    arrowWidth: 4, //初始化箭头宽度    
    selectWidth: 8, //点击选中后箭头宽度
    arrowArrColor: ['#e61e19', '#5a60a2', '#58b048', '#e66424', '#3a593b', '#dfa29d', '#23aae2', '#efb70e'],
    arrowNowColor: 'green', //箭头点击后颜色
    arrowSelectArr: $(this).attr('arrow-data') && $(this).attr('arrow-data') != '' ? JSON.parse($(this).attr('arrow-data')) : [[], [], [], [], [], [], [], []], //箭头是否选中
    pointerLength: 15, //箭头尺寸
    pointerWidth: 15, //箭头尺寸
    dataRoad: [false, false, false, false, false, false, false, false], //测试数据
    roadArrowData: [[], [], [], [], [], [], [], []], //方向和该方向的箭头形式 0：直行;1:左转;2:左下转;3:左上转;4:右转;5:右上转;6:右下转;7:掉头
    peopleRoad: [false, false, false, false, false, false, false, false],//8个路口是否有人行道 相位图
    // peopleRoad: [], //8个路口是否有人行道 相位图
    peopleSelRoad: $(this).attr('people-data') && $(this).attr('people-data') !== '' ? $(this).attr('people-data') : [false, false, false, false, false, false, false, false],//8个路口是否有人行道选中 流量图中
    peopleRoadPoints: [],//8个路口人行道坐标
    textData: ['', '', '', '', '', '', '', ''], //道路名称
    textDataPoints: [], //道路坐标
    textSize: 12, // 道路字体大小
    textColor: 'yellow',
    flowData: [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ], //数据流量
    flowDataPoints: [], //道路坐标
    flowSize: 12, // 道路字体大小
    flowColor: 'yellow',
    bikeArr: [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],//8个路口的8条线是否有自行车在流量图中 false 代表有，但是没有和相位中同步
    bikeSelArr: ($(this).attr('bike-data') && $(this).attr('bike-data') != '') ? $(this).attr('bike-data') : [
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false]
    ],//8个路口的8条线是否有自行车选中 相位图中
  };
  let __PROP__ = {
    _init: function () {
      let _this = this;
      // debugger
      // console.log(this.arrowSelectArr)
      const pR = _this.pathR;
      // 数据传递给依赖id
      if (_this.relyOnId != '' && !_this.flow) {
        // debugger
        $('#' + _this.relyOnId).attr('arrow-data', JSON.stringify(_this.roadArrowData))
        $('#' + _this.relyOnId).attr('people-data', JSON.stringify(_this.peopleSelRoad))
        $('#' + _this.relyOnId).attr('bike-data', JSON.stringify(_this.bikeSelArr))
        $('#' + _this.relyOnId).attr('crossing-stroke', _this.crossingStroke)
        $('#' + _this.relyOnId).attr('arrow-fill', _this.arrowFill)
        $('#' + _this.relyOnId).attr('arrow-stroke', _this.arrowStroke)
        $('#' + _this.relyOnId).attr('arrow-width', _this.arrowWidth)
      } else {
        $(this).attr('flow-width', _this.arrowWidth)
        // $('#' + _this).attr('arrow-data', JSON.stringify(_this.roadArrowData))
      }
      //   背景图形
      // console.log("背景图形坐标：")
      // console.log(_this._toPathData(_this._toArrData(_this._actionPoints(_this.pathR))))
      let crossingPoly = new Konva.Path({
        x: this.crossingWidth,
        y: this.crossingWidth,
        data: _this._toPathData(_this._toArrData(_this._actionPoints(_this.pathR))),
        stroke: _this.crossingStroke,
        fill: _this.crossingFill,
        strokeWidth: _this.crossingWidth
      })
      crossingPoly.on('click', function (e) {
        // console.log("路口禁止操作")
      })
      crossingPoly.on('mouseover', function () {
        document.getElementById(_this.contentId).style.cursor = 'no-drop'
      })
      // let width = window.innerWidth
      // let height = window.innerHeight
      let stage = new Konva.Stage({
        container: _this.contentId,
        width: $('#' + this.contentId).width() + this.crossingWidth * 2,
        height: $('#' + this.contentId).height() + this.crossingWidth * 2
      })
      // 创建一个层
      let layer = new Konva.Layer()
      
      //箭头
      let arrArray = _this._toArrData(_this._arrowPoints(_this.pathR))
      // console.log("箭头数据", arrArray)
      let roadArrowData = _this.roadArrowData
      let arrowArr = []
      for (let z = 0; z < roadArrowData.length; z++) {
        if (_this.flow) {
          switch (z) {
            case 0:
              _this.arrowFill = _this.arrowArrColor[0]
              _this.arrowStroke = _this.arrowArrColor[0]
              break
            case 1:
              _this.arrowFill = _this.arrowArrColor[1]
              _this.arrowStroke = _this.arrowArrColor[1]
              break
            case 2:
              _this.arrowFill = _this.arrowArrColor[2]
              _this.arrowStroke = _this.arrowArrColor[2]
              break
            case 3:
              _this.arrowFill = _this.arrowArrColor[3]
              _this.arrowStroke = _this.arrowArrColor[3]
              break
            case 4:
              _this.arrowFill = _this.arrowArrColor[4]
              _this.arrowStroke = _this.arrowArrColor[4]
              break
            case 5:
              _this.arrowFill = _this.arrowArrColor[5]
              _this.arrowStroke = _this.arrowArrColor[5]
              break
            case 6:
              _this.arrowFill = _this.arrowArrColor[6]
              _this.arrowStroke = _this.arrowArrColor[6]
              break
            case 7:
              _this.arrowFill = _this.arrowArrColor[7]
              _this.arrowStroke = _this.arrowArrColor[7]
              break
          }

          if (roadArrowData[z].length > 0) {
            if (_this.flow && $(_this).attr("arrow-data") !== "") {
              let roadSelectArrow = JSON.parse($(_this).attr("arrow-data"));//路口选中的数据
              for (let v = 0; v < arrArray[z].length; v++) {
                if (roadArrowData[z][v] !== '' && roadSelectArrow[z][v] === roadArrowData[z][v]) {
                  _this.arrowFill = _this.arrowNowColor
                  _this.arrowStroke = _this.arrowNowColor
                } else {
                  _this.arrowFill = _this.arrowArrColor[z]
                  _this.arrowStroke = _this.arrowArrColor[z]
                }
                switch (roadArrowData[z][v]) {
                  case 7:
                    _this._arrowAddClick(7, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                    break
                  case 0: case 1: case 2: case 3: case 4: case 5: case 6:
                    _this._arrowAddClick(0, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                    break
                }
              }
            } else {
              for (let v = 0; v < arrArray[z].length; v++) {
                switch (roadArrowData[z][v]) {
                  case 7:
                    _this._arrowAddClick(7, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                    break
                  case 0: case 1: case 2: case 3: case 4: case 5: case 6:
                    _this._arrowAddClick(0, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                    break
                }
              }
            }
          }
        } else {
          if (roadArrowData[z].length > 0) {
            for (let v = 0; v < arrArray[z].length; v++) {
              switch (roadArrowData[z][v]) {
                case 7:
                  _this._arrowAddClick(7, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                  break
                case 0: case 1: case 2: case 3: case 4: case 5: case 6:
                  _this._arrowAddClick(0, layer, arrowArr, arrArray[z][roadArrowData[z][v]], z, v)
                  break
              }
            }
          }
        }


      }
      // add the shape to the layer
      layer.add(crossingPoly)
      // add the shape to the arrow
      for (let e = 0; e < arrowArr.length; e++) {
        layer.add(arrowArr[e])
      }
      // 人行道
      _this.peopleRoadPoints = []
      let peoArr = _this._peoplePoints(_this.pathR)
      // console.log("这个",peoArr)
      for (let p = 0; p < _this.peopleRoad.length; p++) {
        if (_this.flow) {
          if (!_this.peopleRoad[p]) {
            _this._imagesAddClick(layer, peoArr[p].X, peoArr[p].Y, p)
          }
        } else {
          if (_this.peopleSelRoad[p]) {
            _this._imagesAddClick(layer, peoArr[p].X, peoArr[p].Y, p)
          }
        }
      }
      
      //自行车
      let bikeArray = _this._toArrData(_this._bikePoints(_this.pathR))
      for (let b = 0; b < bikeArray.length; b++) {
        if (_this.flow) {
          for (let c = 0; c < _this.bikeArr[b].length; c++) {
            if (_this.bikeArr[b][c] !== null && !_this.bikeArr[b][c] === _this.bikeSelArr[b][c]) {
              _this._bikeAddClick(layer, bikeArray[b][c][0], bikeArray[b][c][1], b, c, true)
            } else {
              if (_this.bikeArr[b][c] === null) {
                _this._bikeAddClick(layer, bikeArray[b][c][0], bikeArray[b][c][1], b, c, null)
              } else {
                _this._bikeAddClick(layer, bikeArray[b][c][0], bikeArray[b][c][1], b, c, false)
              }
            }
          }
        } else {
          for (let c = 0; c < _this.bikeSelArr[b].length; c++) {
            if (_this.bikeSelArr[b][c]) {
              _this._bikeAddClick(layer, bikeArray[b][c][0], bikeArray[b][c][1], b, c)
            }
          }
        }
      }
      //流量数据
      _this.flowDataPoints = []
      let flowArray = _this._toArrData(_this._bikePoints(_this.pathR))
      for (let b = 0; b < flowArray.length; b++) {
        if (_this.flow) {
          for (let c = 0; c < _this.flowData[b].length; c++) {
            if (_this.flowData[b][c] !== '') {
              _this._flowAddPosition(layer, flowArray[b][c][0], flowArray[b][c][1], _this.flowData[b][c])
            }
          }
        }
      }
      // 道路名
      _this.textDataPoints = []
      let roadArr = _this._roadNamePoints(_this.pathR)
      for (let p = 0; p < _this.textData.length; p++) {
        if (_this.flow) {
          if (_this.textData[p] !== '') {
            // 创建文本
            _this._textAddPosition(layer, roadArr[p].X, roadArr[p].Y, _this.textData[p])
          }
        }
      }
      // add the layer to the stage
      stage.add(layer)
    },
    // 自行车点击事件
    _bikeAddClick: function (layer, x, y, idx, i, flag) {
      let _this = this
      if (!_this.flow) {
        let imageObj = new Image()
        imageObj.onload = function () {
          let img = new Konva.Image({
            x: +x,
            y: +y,
            offsetX: 10,
            offsetY: 7.5,
            image: imageObj,
            width: 20,
            height: 15,
            status: 'L'
          })
          // add the shape to the layer
          layer.add(img)
          layer.batchDraw()
        }
        imageObj.src = require('./bikeL.png')
      } else {
        let imageObj = new Image()
        imageObj.onload = function () {
          let img = new Konva.Image({
            x: +x,
            y: +y,
            offsetX: 15,
            offsetY: 11.5,
            image: imageObj,
            width: 30,
            height: 23
          })
          if (_this.relyOnId && _this.relyOnId !== '') {//bike
            img.on('click', function (e) {
              img.remove()
              if (imageObj.src.lastIndexOf('+cwDEQpsjlL0sOHPmnwT8CDABP3fGJpGc59gAAAABJRU5ErkJggg==') > -1) {
                imageObj.src = ''
                imageObj.src = require('./bikeL.png')
                _this.bikeSelArr[idx][i] = false
                _this.bikeArr[idx][i] = false
              } else {
                imageObj.src = ''
                imageObj.src = require('./bikeH.png')
                _this.bikeSelArr[idx][i] = true
                _this.bikeArr[idx][i] = true
              }
              if (_this.relyOnId != '') {
                // console.log($(_this).attr('crossing-stroke'))
                // console.log($(_this).attr('arrow-fill'))
                // console.log($(_this).attr('arrow-stroke'))
                // ('arrow-data')
                // ('people-data')
                // ('bike-data')
                $('#' + _this.relyOnId).crossingCvs({
                  contentId: _this.relyOnId,// id句柄
                  relyOnId: _this.contentId,//依赖id句柄
                  pathR: $('#' + _this.relyOnId).width(),//直径
                  roadArrowData: _this.arrowSelectArr,//箭头数据
                  peopleSelRoad: _this.peopleSelRoad,//行人数据
                  bikeSelArr: _this.bikeSelArr,//自行车数据
                  dataRoad: _this.dataRoad,//方向数据
                  crossingStroke: $(_this).attr('crossing-stroke'),//边框色
                  arrowFill: $(_this).attr('arrow-fill'),//箭头填充色
                  arrowStroke: $(_this).attr('arrow-stroke'),//箭头边框色
                  crossingWidth: ($('#' + _this.relyOnId).attr('crossing-width') && $('#' + _this.relyOnId).attr('crossing-width') != '') ? +$('#' + _this.relyOnId).attr('crossing-width') : _this.crossingWidth,//相位边框宽度
                  arrowWidth: ($('#' + _this.relyOnId).attr('arrow-width') && $('#' + _this.relyOnId).attr('arrow-width') != '') ? +$('#' + _this.relyOnId).attr('arrow-width') : _this.arrowWidth, //箭头线的粗细
                  pointerLength: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerLength,//箭头高
                  pointerWidth: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerWidth,//箭头宽
                })
              }
            })
            // add cursor styling
            img.on('mouseover', function () {
              document.getElementById(_this.contentId).style.cursor = 'pointer'
            })
            img.on('mouseout', function () {
              document.getElementById(_this.contentId).style.cursor = 'default'
            })
          }
          // add the shape to the layer
          layer.add(img)
          layer.batchDraw()
        }
        if (flag === null) {
          imageObj.src = '';
        } else if (flag === false) {
          imageObj.src = require('./bikeL.png')
        } else {
          imageObj.src = require('./bikeH.png')
        }

      }

    },
    // 人行道点击事件
    _imagesAddClick: function (layer, x, y, idx) {
      let _this = this
      if (!_this.flow) {
        let imageObj = new Image()
        imageObj.onload = function () {
          let img = new Konva.Image({
            x: +x,
            y: +y,
            offsetX: 10,
            offsetY: 10,
            image: imageObj,
            width: 20,
            height: 20
          })
          // add the shape to the layer
          layer.add(img)
          layer.batchDraw()
        }
        imageObj.src = require('./peopleL.png')
      } else {
        let imageObj = new Image()
        imageObj.onload = function () {
          let img = new Konva.Image({
            x: +x,
            y: +y,
            offsetX: 15,
            offsetY: 14.5,
            image: imageObj,
            width: 30,
            height: 29
          })
          if (_this.relyOnId && _this.relyOnId != '') {//people
            img.on('click', function (e) {
              img.remove()
              if (imageObj.src.lastIndexOf('nGIVf8D2maxJ1zlCAEAAAAASUVORK5CYII=') > -1) {
                imageObj.src = ''
                imageObj.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBN0E1OTY0RkQ0OEMxMUU5ODBENUZCM0Y2MUMzRjc3MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBN0E1OTY1MEQ0OEMxMUU5ODBENUZCM0Y2MUMzRjc3MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE3QTU5NjRERDQ4QzExRTk4MEQ1RkIzRjYxQzNGNzczIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE3QTU5NjRFRDQ4QzExRTk4MEQ1RkIzRjYxQzNGNzczIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+uCuAWQAABk1JREFUeNqUmGtoHUUUx3c2e6Oo1NpEWtoi+KFYY0LVKMGIj1QpqSktVlEStfgooRL9YH1GRXwES4npB1NNS6tgtS3tB6G2FkwgpEXE1sQmiK1YFRW0oIHamKjpvXfG/9md3Z2Z3c1OLuw9c87O7vzumXPOzFy2Z/Mqhz5cuA53XKcsKpwyrwgkrhL3nJLwYAtkkRekrRC2qyG34GrB82Uh2EHhuM9DjnOHOQLvFZBcoI33C18yfzyS+9552Jnp42lwClgZMCXoJV96UgZwRVHw20XuXQx5AHCNPBrcfRRyKeDuBNy/M8GRnvdxfTiRB1eQcAUFzpfNBpwvAdcIuGUmHDfg6Lm8j1f2AbPgCjGkD+epcOTBKhWOSw/JaZ2jw8UeVPVcQBUujrWKJJwSd2EcYpBzGXDkqbMmTHifSzvpuVOchNM9V5RwRQ2uEA56CHBfxJ6K4D6DPJEHR7oFoGfAxZDF9LhTBnGnALcG8n2ZtWcAtwmDr4JeyoZzIz13ikt+WVHgoqn0FDgvDS5MgHHoj8E+B4NOAaYGeh/gFkEehb4V9kkdjkXvyQfE4GUFLgTKhkvWNWmfhL0T+ivwYqWMv5UAXQ25EfqXeqwGz9tNcRpcGHuynQO3APaj0LsUuDD+boJ+BH224rklwvBkLmCUCEqcmbqYGY7adbDfbNY4Jf4q0bcD7WOwvaA+nwtYjDLWjLscOBHB0UBlkYQ7B31CSw7hXobnN6F9GLYFVlmcDedp2ZeAM72Y9NxxWk1wf0c0pfI9sK2kKRe2HixqcZeEE6q3EquDPzATcj1XprUCz/4MvR39W2A7aRTzyy2zOFlSUuFS1lHIJuFDuNNmATbKCk0pbRwGFW+XLD2YASdiOJ4O9xT0AdgX4/50XBsTcIFuhEL4g+08mAaXHWMXQL4NvV1CExxLq3EGHIvfEb8zFzDMYmN1yILDNopth16reJSjv5sD56TB2cWgDzdDjYvttHR9Ar2Ka1PlzuVBSTH6KyAZcFYxaAlH9pYUuI9wfwy6lwLH8uDsdtR2cKR/rsAVYd+I+w9B/xP9F1l4zjXgmFUMCjs4yriTkPdDr4F9CPeHJAxBdqfAbTPeMSG0OA0SK3+Kc+FctcTsR6K8qsC9DrkL+nwDbh1sP8jTXfjsCOQWyAnIX3DvJcstf2KrrmUjTzlHQK9E/96g1GjPU8m5Dz+2H8+eRntxsJOhrRat1+xp2HvQ/gftv+ySRN+qazBcWxkiuAuhH06B+xr31wDuJ7xzWMLRM5uDHxStx78TXBj7FlnMspaxrHPEWuh3GOcQ8lYz7DiLuFVoX6PE2q2QLxqbhVmUmdnBkb5e6ME/iEGbOGVzYDsC28t6QridaDfoxdwS0A4uOuQsDzYIUb9TGPQu6L8J/dz7JuRY4F0/VCpx9Zg10KoO2sFF0/KIXnoom93pxMAOdl/CfQ6S89hbtEy2ztqDs4C7BPpyBY7W4H0pcOE7+tHnDaVgU2Hug6yP4OxWEv1PnazjIfTbIBcqdXJYHpTS4EKdpvqU0udSyJ5ZrsUstf4ZcK7c/6lFfBsuYe7vuD6F59F+LZjyyHYLTbVjOcXs3sd3JfZxUu+Gfj10qls7MfCQAn8a9+uEtlFldNx8T3qZzsjrRLTLYXT+6Ig3CP5qci3aGyBvxFWk8/To7oZjKVmcgKuAvh1T9YyMuf8Ad7dRWj424Mh2JfQHBWW6w1aH4SD7ow6y7yWc/88X2t2Q3+FqQnuFcJxDyx44viQzi5WBPgRcu7SfAVwv9DatjDjsYHK1QZY6WjxWKf0n5L8L6v17cP2N9g4RTGY12nvr2oarU2IwGog816psk96CflF4ApMDfIv2V+b/ff6U6Rl9nQH0KSD2qyUG7fWA63LoQBXY68mTtW0j1dpaLOF6Fc8R3I/Q+6BvMF7aC7jzBhzF3+2GrV7PVr/9pJ/Vkd2ZGtvd8Cud+oL3+55sgH6gpvXEPDUGOwDzhLHBpLMH/bL5MZw7DrjdIrlk0fRcZdiag9oZwZHtD1xtaA8Aph/2ZwkCtnfDuij7NcI8cHXr6DwveMClgnqWR2XDxbrKPpCdu3BdgRJCyUN/W0yaqwHac2WcVSg2FHK20JHJodhHAbfCUbb83+y5YbC2dWQn7q8NSw/kUnx1/i/AAEAUblIFP1Z5AAAAAElFTkSuQmCC';
                _this.peopleSelRoad[idx] = false
              } else {
                imageObj.src = ''
                imageObj.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAFbElEQVRYha3Xb4hVRRjH8e9zd9mkxMxdSVYpCiQxFy0JayNtLUQzlAwKJYVKRLBeKJVpIZWihOmLdklFC/pH5IvA3BZU0F2J0LI/grqhJRakkAvmtmZr3vPrxTnn3jlzz733rO55NWc4O/PZ55lnZq4N0TAAECCDACSDwKL3qC+I2nmL2rn4vUGBbSZvsxF5sN2IlYgeMBBIELfx2lfHn6bSU1sdZyigHO4mBbaLvDU7Ez+HGAf2KOJyJVyWJ1fEWREXeLh8jMuFuMK7zfRwMaIZMbEqTlYVWFvEUYTJnJQCQS6R4hBukLf6FFyc1mFVcRmiWFsZ52BKcSAulsEBduF6cQC5BC4wFKWvLC5fwAHWjvgmBbcH8WNVXIYU55LrzV9/KbjA3KhcQswF+wDRI3EObAPiccTVajhlTXFZXN6LbBIXt3sQz0dr7hJiPGIL2GjEQUQbWJ8PzYIrAK8D56a1D7EKsQasLvpmFtgcxArEoRJclhQPEm5UFK11Di7+5gFEF9CGbKzS0l0JOAg4EE2IBytsK3XIlkkcBl4dUBWn4vKVcSo9vvIpuIuI3jhaUeRuQbYB0QGMyhxB5T1cUBlXOH3S2sXvvwUmItuektZZyNogyxp0UprEWRInD0eibaVQapCdkVgCzEZ2wtv/RmY+SVJxhcEiXBIUt1uAM4j+RD/OPxS2OxCXgf3O2FezF8m14ZYD+xBjkPUX+0twZTZqyJLi2mvA3YDsXWBJ1N9PIcXhpGVwVoLLkuIB4pqRbQMmOP0Biq5t5XGlkXNPlkrAAeBGI/sSqPf6hxPdagYbB5ArHazsmpudgvsE2VGw2hScVcMp023GG7gMDuBrp/0fYgWyhcB5idEeLi1yOQ9XXUfhN0lVHIgTyJ4GxiM6kXWGE7EQsTGx6MPxtjo4EL1e5IpFU+HJZcTF7Z2INxzcW4iPwG71cIuAXxArnbR+D2yWrBf4DfFalm3Gak/enhXntuskWhFLvMj1I54C9iJOgY0hvM0ccoqoEfEP2F8Igvu7K0fwGnBDJDpScD8g5gKnEUciHIi3weqKRcTZGJflyQ0Qh8Q8xCMe7hRiJrAHUQ92t7NxT5VYXRgHv3iqAgeEA7HYw+1HtADnI0AX4nVv416FmJK8fDhzVAQODDcdrMXBdSMeA/4ofBt+tx7sqJPWOrBNiQ06Ay4EZscB9qxXrZ1Af8nfYZJ4hfAYJIpcM2J+AjcYKXZwQxHTnUgFwOcpuDitexFrnbQasAXZ5Ky4EFgGpyQOxDREo7P+jiAOlsHF7+sR3U7UbwY2DbBI0nEkcTnEcq8CtyJTWVwY5SuINwE5czwEzC+MXeWxmmN3lsNtBLsXcRaxA6zTwZ1C1kS8/kJcHfA+ohFZH7AIcTGKXBuwzPn7XrBJwFLEfYRn+5pg6vHDZSKYwNWEdz57KVpz/4I9QTI6X3g4gDsQzyCbDswJl0MhO6sRJ51oDwM2In4GWpDNENZuXRPGlgLxI2cfU7gtcw6sFbGgMFk44e6UtDZ71VnvvPcCKxIbtXgS+BvZ9mjuBuAz65rQ4EUwgdtGvD7Cwd5B3AiMdK5PxxHfpay5SQ4OZPck3/kKbGeiMGSLBesIf1ABTEa0W2dTAemexa1O5AD7FbEFWOrd7VrBrni4OuBhbxOenKxWA/Ei0B1/I7ikqcd+Bzqc76YAu+xA04gogoBsGfCCV7nbgMvIvUrRA/Zp8fdxAdOAuMvBQXg2D02kFf4EFiDbp3CffDka+b1EVYtmYJ8daBpRi2wBsBZxAaFosPPAh1Hk1gG3IWrANkj0eZECMRzoRVZTjAQBskbgpJfWnwQz3D5NO7bfOpt2APOc/nGIVf8D2maxJ1zlCAEAAAAASUVORK5CYII=';
                _this.peopleSelRoad[idx] = true
              }
              if (_this.relyOnId != '') {
                // debugger
                $('#' + _this.relyOnId).crossingCvs({
                  contentId: _this.relyOnId,// id句柄
                  relyOnId: _this.contentId,//依赖id句柄
                  pathR: $('#' + _this.relyOnId).width(),//直径
                  roadArrowData: _this.arrowSelectArr,//箭头数据
                  peopleSelRoad: _this.peopleSelRoad,//行人数据
                  bikeSelArr: _this.bikeSelArr,//自行车数据
                  dataRoad: _this.dataRoad,//方向数据
                  crossingStroke: $(_this).attr('crossing-stroke'),//边框色
                  arrowFill: $(_this).attr('arrow-fill'),//箭头填充色
                  arrowStroke: $(_this).attr('arrow-stroke'),//箭头边框色
                  crossingWidth: ($('#' + _this.relyOnId).attr('crossing-width') && $('#' + _this.relyOnId).attr('crossing-width') != '') ? +$('#' + _this.relyOnId).attr('crossing-width') : _this.crossingWidth,//相位边框宽度
                  arrowWidth: ($('#' + _this.relyOnId).attr('arrow-width') && $('#' + _this.relyOnId).attr('arrow-width') != '') ? +$('#' + _this.relyOnId).attr('arrow-width') : _this.arrowWidth, //箭头线的粗细
                  pointerLength: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerLength,//箭头高
                  pointerWidth: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerWidth,//箭头宽
                })
              }
            })
            // add cursor styling
            img.on('mouseover', function () {
              document.getElementById(_this.contentId).style.cursor = 'pointer'
            })
            img.on('mouseout', function () {
              document.getElementById(_this.contentId).style.cursor = 'default'
            })
          }
          // add the shape to the layer
          layer.add(img)
          layer.batchDraw()
        }
        _this.peopleSelRoad[idx] ? imageObj.src = require('./peopleH.png') : imageObj.src = require('./peopleL.png')

      }

    },
    // 道路名称
    _textAddPosition: function (layer, x, y, val) {
      let _this = this
      if (_this.flow) {
        let simpleText = new Konva.Text({
          x: x - 25,
          y: y - 20,
          width: 50,
          height: 40,
          align: 'left',
          text: val,
          fontSize: _this.textSize,
          fontFamily: 'Calibri',
          fill: _this.textColor,
        })
        const divS = document.createElement('div');
        simpleText.on('mouseover', e => {
          divS.innerHTML = val;
          document.body.appendChild(divS);
          divS.setAttribute('style', 'width:150px;height:20px;text-align:center;font-size:12px;color:#fff;z-index:999999;position:absolute;'+'left:'+(e.evt.x - 75)+'px;top:'+(e.evt.y - 50)+'px;')
          // console.log(e)
        })
        simpleText.on('mouseout', e => {
          divS.setAttribute('style', 'display:none')
        })
        layer.add(simpleText)
      } else {
        // console.log('非流量显示')
      }

    },
    // 流量数据
    _flowAddPosition: function (layer, x, y, val) {
      let _this = this
      if (_this.flow) {
        let simpleText = new Konva.Text({
          x: x,
          y: y,
          text: val,
          fontSize: _this.flowSize,
          fontFamily: 'Calibri',
          fill: _this.flowColor
        })
        layer.add(simpleText)
      } else {
        // console.log('非流量显示')
      }

    },
    /* 
    * 箭头绑定点击事件
    */
    _arrowAddClick: function (num, layer, dataArr, dataSourse, idx, val) {
      // debugger
      let _this = this
      if (_this.flow) {
        if (_this.arrowFill == _this.arrowNowColor) {
          _this.arrowSelectArr[idx][val] = val
          _this.arrowWidth = _this.selectWidth
        } else {
          _this.arrowSelectArr[idx][val] = null

          _this.arrowWidth = +$(_this).attr('flow-width')
        }
        let arrow = new Konva.Arrow({
          x: 0,
          y: 0,
          points: dataSourse,
          tension: num == 7 ? .6 : .2,
          pointerLength: this.pointerLength,
          pointerWidth: this.pointerWidth,
          fill: _this.arrowFill,
          stroke: _this.arrowStroke,
          strokeWidth: _this.arrowWidth,
          arrowIndex: idx,
          arrowIndexValue: val
        }).on("click", function (e) {
          // console.log($(_this).attr('arrow-data'))
          if (_this.arrowSelectArr[idx][val] == val) {
            e.currentTarget.attrs.fill = _this.arrowArrColor[idx]
            e.currentTarget.attrs.stroke = _this.arrowArrColor[idx]
            layer.clear(this)
            layer.draw(this)
            _this.arrowSelectArr[idx].splice(_this.arrowSelectArr[idx][val], 1, null)
          } else {
            e.currentTarget.attrs.fill = _this.arrowNowColor
            e.currentTarget.attrs.stroke = _this.arrowNowColor
            layer.clear(this)
            layer.draw(this)
            _this.arrowSelectArr[idx][val] = val
          }
          // if (_this.relyOnId != "") $('#' + _this.relyOnId).attr("arrow-data", JSON.stringify(_this.arrowSelectArr))
          if (_this.relyOnId != "") {
            // debugger
            $('#' + _this.relyOnId).crossingCvs({
              contentId: _this.relyOnId,// id句柄
              relyOnId: _this.contentId,//依赖id句柄
              pathR: $('#' + _this.relyOnId).width(),//直径
              roadArrowData: _this.arrowSelectArr,//箭头数据
              peopleSelRoad: _this.peopleSelRoad,//行人数据
              bikeSelArr: _this.bikeSelArr,//自行车数据
              dataRoad: _this.dataRoad,//方向数据
              crossingStroke: $(_this).attr('crossing-stroke'),//边框色
              arrowFill: $(_this).attr('arrow-fill'),//箭头填充色
              arrowStroke: $(_this).attr('arrow-stroke'),//箭头边框色
              crossingWidth: ($('#' + _this.relyOnId).attr('crossing-width') && $('#' + _this.relyOnId).attr('crossing-width') != '') ? +$('#' + _this.relyOnId).attr('crossing-width') : _this.crossingWidth,//相位边框宽度
              arrowWidth: ($('#' + _this.relyOnId).attr('arrow-width') && $('#' + _this.relyOnId).attr('arrow-width') != '') ? +$('#' + _this.relyOnId).attr('arrow-width') : _this.arrowWidth, //箭头线的粗细
              pointerLength: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerLength,//箭头高
              pointerWidth: ($('#' + _this.relyOnId).attr('pointer-arrow') && $('#' + _this.relyOnId).attr('pointer-arrow') != '') ? +$('#' + _this.relyOnId).attr('pointer-arrow') : _this.pointerWidth,//箭头宽
            })
          }
        })
        // add cursor styling
        arrow.on('mouseover', function () {
          document.getElementById(_this.contentId).style.cursor = 'pointer'
        })
        arrow.on('mouseout', function () {
          document.getElementById(_this.contentId).style.cursor = 'default'
        })
        dataArr.push(arrow)
      } else {
        let arrow = new Konva.Arrow({
          x: 0,
          y: 0,
          points: dataSourse,
          tension: num == 7 ? .6 : .2,
          pointerLength: this.pointerLength,
          pointerWidth: this.pointerWidth,
          fill: _this.arrowFill,
          stroke: _this.arrowStroke,
          strokeWidth: _this.arrowWidth,
          arrowIndex: idx,
          arrowIndexValue: val,
        })
        dataArr.push(arrow)
      }
    },
    /* 
    *需要旋转的点：pointToRotate
    *中心点：centerPoint
    *角度：angleInDegrees  
    */
    _pointRotate: function (pointToRotate, centerPoint, angleInDegrees) {
      //弧度
      let angleInRadians = angleInDegrees * (Math.PI / 180)
      //余弦
      let cosTheta = Math.cos(angleInRadians)
      //正弦
      let sinTheta = Math.sin(angleInRadians)
      let X = (cosTheta * (pointToRotate.X - centerPoint.X) - sinTheta * (pointToRotate.Y - centerPoint.Y) + centerPoint.X).toFixed(0);
      let Y = (sinTheta * (pointToRotate.X - centerPoint.X) + cosTheta * (pointToRotate.Y - centerPoint.Y) + centerPoint.Y).toFixed(0);
      return { "X": X, "Y": Y };
    },
    /* 
    初始化坐标：根据半径计算坐标
    直径值：pathR
    */
    _actionPoints: function (pathR) {
      let _this = this;
      let pointArr = [], pointArrOld = [];
      const pR = pathR;
      let p375 = pR - pR * (3 / 8) / 2;
      let p150 = pR * (2 / 5);
      let p250 = pR * (3 / 5);
      pointArrOld.push({ X: p375 + pR * (1 / 40), Y: p150 });
      pointArrOld.push({ X: pR, Y: p150 });
      pointArrOld.push({ X: pR, Y: p250 });
      pointArrOld.push({ X: p375 + pR * (1 / 40), Y: p250 });
      for (let j = 0; j < 8; j++) {
        switch (j) {
          case 0:
            if (_this.dataRoad[0]) _this._actionTurn(pointArr, pointArrOld, pathR, 0);
            break;
          case 1:
            if (_this.dataRoad[1]) _this._actionTurn(pointArr, pointArrOld, pathR, 45);
            break;
          case 2:
            if (_this.dataRoad[2]) _this._actionTurn(pointArr, pointArrOld, pathR, 90);
            break;
          case 3:
            if (_this.dataRoad[3]) _this._actionTurn(pointArr, pointArrOld, pathR, 135);
            break;
          case 4:
            if (_this.dataRoad[4]) _this._actionTurn(pointArr, pointArrOld, pathR, 180);
            break;
          case 5:
            if (_this.dataRoad[5]) _this._actionTurn(pointArr, pointArrOld, pathR, 225);
            break;
          case 6:
            if (_this.dataRoad[6]) _this._actionTurn(pointArr, pointArrOld, pathR, 270);
            break;
          case 7:
            if (_this.dataRoad[7]) _this._actionTurn(pointArr, pointArrOld, pathR, 315);
            break;
        }
      }
      // console.log(pointArr);
      let newArr = [], objCount = 0;
      for (let i = 0; i < pointArr.length; i++) {
        objCount++;
        newArr.push(pointArr[i]);
        if (objCount == 4) {
          let Qpoint = _this._returnPoint(pointArr[i], pointArr[i + 1] ? pointArr[i + 1] : pointArr[0], pR);//曲线的操作点
          newArr.push(Qpoint);
          newArr.push(pointArr[i + 1] ? pointArr[i + 1] : pointArr[0]);
          objCount = 0;
        }
      }
      // console.log(newArr);
      return newArr;
    },
    /* 
    * 旋转后的相位口坐标点
    */
    _actionTurn: function (pointArr, pointArrOld, pR, rotate) {
      for (let i = 0; i < pointArrOld.length; i++) {
        let a = this._pointRotate(pointArrOld[i], { X: pR / 2, Y: pR / 2 }, rotate);
        pointArr.push(a);
      }
    },
    /* 
    初始化坐标：根据半径计算箭头
    直径值：pathR
    */
    _arrowPoints: function (pathR) {
      let _this = this,
        pointArr = [], pointArrOld = [],
        line1 = [], line2 = [], line3 = [], line4 = [], line5 = [], line6 = [], line7 = [], line8 = [];
      const pR = pathR;
      // 直线
      line1.push({ X: pathR - _this.pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line1.push({ X: pathR * (3 / 80), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      pointArrOld.push(line1);
      // 左转
      line2.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line2.push({ X: pathR / 2 + pathR * (3 / 40), Y: pathR / 2 });
      line2.push({ X: pathR / 2, Y: pathR / 2 + pathR * (1 / 4) });
      pointArrOld.push(line2);
      // 左下转
      line3.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line3.push({ X: pathR / 2 + pathR * (3 / 40), Y: pathR / 2 });
      line3.push({ X: pathR * (5 / 6), Y: pathR * (3 / 4) });
      pointArrOld.push(line3);
      // 左上转
      line4.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line4.push({ X: pathR / 2 + pathR * (3 / 40), Y: pathR / 2 });
      line4.push({ X: pathR * (1 / 4), Y: pathR * (3 / 4) });
      pointArrOld.push(line4);
      // 右转
      line5.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line5.push({ X: pathR / 2 + pathR * (3 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (7 / 80) });
      line5.push({ X: pathR / 2, Y: pathR / 2 - _this.pathR * (27 / 80) });
      pointArrOld.push(line5);
      // 右上转
      line6.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line6.push({ X: pathR / 2 + pathR * (3 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (7 / 80) });
      line6.push({ X: pathR * (1 / 4), Y: pathR * (1 / 4) });
      pointArrOld.push(line6);
      // 右下转
      line7.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line7.push({ X: pathR / 2 + pathR * (3 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (7 / 80) });
      line7.push({ X: pathR * (5 / 6), Y: pathR * (1 / 4) });
      pointArrOld.push(line7);
      // 掉头
      line8.push({ X: pathR - pathR * (1 / 40), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      line8.push({ X: pathR / 2 + _this.pathR * (1 / 8), Y: pathR / 2 });
      line8.push({ X: pathR / 2 + pathR * (3 / 10), Y: pathR / 2 + pathR * (3 / 40) });
      pointArrOld.push(line8);
      for (let i = 0; i < 8; i++) {
        switch (i) {
          case 0:
            _this._arrowTurn(pointArr, pointArrOld, 0);
            break;
          case 1:
            _this._arrowTurn(pointArr, pointArrOld, 45);
            break;
          case 2:
            _this._arrowTurn(pointArr, pointArrOld, 90);
            break;
          case 3:
            _this._arrowTurn(pointArr, pointArrOld, 135);
            break;
          case 4:
            _this._arrowTurn(pointArr, pointArrOld, 180);
            break;
          case 5:
            _this._arrowTurn(pointArr, pointArrOld, 225);
            break;
          case 6:
            _this._arrowTurn(pointArr, pointArrOld, 270);
            break;
          case 7:
            _this._arrowTurn(pointArr, pointArrOld, 315);
            break;
        }
      }
      return pointArr;
    },
    /* 
    * 旋转后的箭头线坐标点
    */
    _arrowTurn: function (pointArr, pointArrOld, rotate) {
      const pR = this.pathR;
      let bigArr = [];
      for (let q = 0; q < pointArrOld.length; q++) {
        let thisArr = [];
        for (let j = 0; j < pointArrOld[q].length; j++) {
          let a = this._pointRotate(pointArrOld[q][j], { X: pR / 2, Y: pR / 2 }, rotate);
          thisArr.push(a);
        }
        bigArr.push(thisArr);
      }
      pointArr.push(bigArr);
    },
    /* 
    初始化坐标：根据半径计算人行道
    直径值：pathR
    */
    _peoplePoints: function (pathR) {
      let _this = this, peoplePointsArr = {};
      const pR = pathR;
      // 坐标
      peoplePointsArr = { X: pathR - _this.pathR * (1 / 12), Y: pathR / 2 };
      for (let i = 0; i < 8; i++) {
        switch (i) {
          case 0:
            _this._peopleTurn(peoplePointsArr, pR, 0);
            break;
          case 1:
            _this._peopleTurn(peoplePointsArr, pR, 45);
            break;
          case 2:
            _this._peopleTurn(peoplePointsArr, pR, 90);
            break;
          case 3:
            _this._peopleTurn(peoplePointsArr, pR, 135);
            break;
          case 4:
            _this._peopleTurn(peoplePointsArr, pR, 180);
            break;
          case 5:
            _this._peopleTurn(peoplePointsArr, pR, 225);
            break;
          case 6:
            _this._peopleTurn(peoplePointsArr, pR, 270);
            break;
          case 7:
            _this._peopleTurn(peoplePointsArr, pR, 315);
            break;
        }
      }
      return _this.peopleRoadPoints;
    },
    /* 人行道旋转后的坐标 */
    _peopleTurn: function (resultArr, pR, rotate) {
      let a = this._pointRotate(resultArr, { X: pR / 2, Y: pR / 2 }, rotate);
      this.peopleRoadPoints.push(a);
    },
    /* 
    初始化坐标：根据半径计算道路名
    直径值：pathR
    */
    _roadNamePoints: function (pathR) {
      let _this = this, peoplePointsArr = {};
      const pR = pathR;
      // 坐标
      peoplePointsArr = { X: pathR - _this.pathR * (1 / 14), Y: pathR / 2 };
      for (let i = 0; i < 8; i++) {
        switch (i) {
          case 0:
            _this._roadNameTurn(peoplePointsArr, pR, 0);
            break;
          case 1:
            _this._roadNameTurn(peoplePointsArr, pR, 45);
            break;
          case 2:
            _this._roadNameTurn(peoplePointsArr, pR, 90);
            break;
          case 3:
            _this._roadNameTurn(peoplePointsArr, pR, 135);
            break;
          case 4:
            _this._roadNameTurn(peoplePointsArr, pR, 180);
            break;
          case 5:
            _this._roadNameTurn(peoplePointsArr, pR, 225);
            break;
          case 6:
            _this._roadNameTurn(peoplePointsArr, pR, 270);
            break;
          case 7:
            _this._roadNameTurn(peoplePointsArr, pR, 315);
            break;
        }
      }
      return _this.textDataPoints;
    },
    /* 人行道旋转后的坐标 */
    _roadNameTurn: function (resultArr, pR, rotate) {
      let a = this._pointRotate(resultArr, { X: pR / 2, Y: pR / 2 }, rotate);
      this.textDataPoints.push(a);
    },
    /* 
    初始化坐标：根据半径计算自行车
    直径值：pathR
    */
    _bikePoints: function (pathR) {
      let _this = this,
        pointArr = [], pointArrOld = [],
        line1 = [], line2 = [], line3 = [], line4 = [], line5 = [], line6 = [], line7 = [], line8 = [];
      const pR = pathR;
      // 直线
      line1.push({ X: pathR * (2.5 / 16), Y: (pathR / 2 + _this.crossingWidth) - pathR * (1 / 20) });
      pointArrOld.push(line1);
      // 左转
      line2.push({ X: pathR * (21 / 40), Y: pathR / 2 + pathR * (1 / 8) });
      pointArrOld.push(line2);
      // 左下转
      line3.push({ X: pathR * (27 / 40), Y: pathR * (26.5 / 40) });
      pointArrOld.push(line3);
      // 左上转
      line4.push({ X: pathR * (14 / 40), Y: pathR * (27 / 40) });
      pointArrOld.push(line4);
      // 右转
      line5.push({ X: pathR * (21 / 40), Y: pathR / 2 - _this.pathR * (17 / 80) });
      pointArrOld.push(line5);
      // 右上转
      line6.push({ X: pathR * (14 / 40), Y: pathR * (12.5 / 40) });
      pointArrOld.push(line6);
      // 右下转
      line7.push({ X: pathR * (26.5 / 40), Y: pathR * (13.5 / 40) });
      pointArrOld.push(line7);
      // 掉头
      line8.push({ X: pathR / 2 + pathR * (2 / 10), Y: pathR / 2 + pathR * (2 / 40) });
      pointArrOld.push(line8);
      for (let i = 0; i < 8; i++) {
        switch (i) {
          case 0:
            _this._arrowTurn(pointArr, pointArrOld, 0);
            break;
          case 1:
            _this._arrowTurn(pointArr, pointArrOld, 45);
            break;
          case 2:
            _this._arrowTurn(pointArr, pointArrOld, 90);
            break;
          case 3:
            _this._arrowTurn(pointArr, pointArrOld, 135);
            break;
          case 4:
            _this._arrowTurn(pointArr, pointArrOld, 180);
            break;
          case 5:
            _this._arrowTurn(pointArr, pointArrOld, 225);
            break;
          case 6:
            _this._arrowTurn(pointArr, pointArrOld, 270);
            break;
          case 7:
            _this._arrowTurn(pointArr, pointArrOld, 315);
            break;
        }
      }
      return pointArr;
    },
    //坐标对象转数组单个对像
    /* 
    坐标对象：pointArr
    */
    _toArrData: function (pointArr) {
      let newPoints = [];
      for (let m = 0; m < pointArr.length; m++) {
        if (pointArr[m] instanceof Array) {
          let smallArr = [];
          for (let n = 0; n < pointArr[m].length; n++) {
            let sArr = [];
            for (let s = 0; s < pointArr[m][n].length; s++) {
              sArr.push(+pointArr[m][n][s].X);
              sArr.push(+pointArr[m][n][s].Y);
            }
            smallArr.push(sArr);
          }
          newPoints.push(smallArr);
        } else {
          newPoints.push(+pointArr[m].X);
          newPoints.push(+pointArr[m].Y);
        }
      }
      return newPoints;
    },
    /* 
    // 根据两点算第三点坐标
    */
    _returnPoint: function (p1, p2, pR) {
      let p = { X: 0, Y: 0 };
      let num = 300;
      if (p1.X >= Math.round(pR * (244 / num)) && p1.Y == Math.round(pR * (180 / num)) && p2.X == Math.round(pR * (243 / num)) && p2.Y == Math.round(pR * (200 / num))) {
        // p.X = Math.round(pR * (74 / 100));
        // p.Y = Math.round(pR * (60 / 100));
        p.X = Math.round(pR * (221 / num));
        p.Y = Math.round(pR * (180 / num));
      }
      else if (p1.X == Math.round(pR * (200 / num)) && p1.Y == Math.round(pR * (243 / num)) && p2.X == Math.round(pR * (180 / num)) && p2.Y == Math.round(pR * (251 / num))) {
        // p.X = Math.round(pR * (60 / 100));
        // p.Y = Math.round(pR * (74 / 100));
        p.X = Math.round(pR * (179 / num));
        p.Y = Math.round(pR * (222 / num));
      } else if (p1.X == Math.round(pR * (120 / num)) && p1.Y == Math.round(pR * (251 / num)) && p2.X == Math.round(pR * (100 / num)) && p2.Y == Math.round(pR * (243 / num))) {
        // p.X = Math.round(pR * (40 / 100));
        // p.Y = Math.round(pR * (74 / 100));
        p.X = Math.round(pR * (120 / num));
        p.Y = Math.round(pR * (221 / num));
      } else if (p1.X == Math.round(pR * (57 / num)) && p1.Y == Math.round(pR * (200 / num)) && p2.X == Math.round(pR * (49 / num)) && p2.Y == Math.round(pR * (180 / num))) {
        // p.X = Math.round(pR * (26 / 100));
        // p.Y = Math.round(pR * (60 / 100));
        p.X = Math.round(pR * (78 / num));
        p.Y = Math.round(pR * (179 / num));
      } else if (p1.X == Math.round(pR * (49 / num)) && p1.Y == Math.round(pR * (120 / num)) && p2.X == Math.round(pR * (57 / num)) && p2.Y == Math.round(pR * (100 / num))) {
        // p.X = Math.round(pR * (26 / 100));
        // p.Y = Math.round(pR * (40 / 100));
        p.X = Math.round(pR * (79 / num));
        p.Y = Math.round(pR * (120 / num));
      } else if (p1.X == Math.round(pR * (100 / num)) && p1.Y == Math.round(pR * (57 / num)) && p2.X == Math.round(pR * (120 / num)) && p2.Y == Math.round(pR * (49 / num))) {
        // p.X = Math.round(pR * (40 / 100));
        // p.Y = Math.round(pR * (26 / 100));
        p.X = Math.round(pR * (121 / num));
        p.Y = Math.round(pR * (78 / num));
      } else if (p1.X == Math.round(pR * (180 / num)) && p1.Y == Math.round(pR * (49 / num)) && p2.X == Math.round(pR * (200 / num)) && p2.Y == Math.round(pR * (57 / num))) {
        // p.X = Math.round(pR * (60 / 100));
        // p.Y = Math.round(pR * (26 / 100));
        p.X = Math.round(pR * (180 / num));
        p.Y = Math.round(pR * (79 / num));
      } else if (p1.X == Math.round(pR * (243 / num)) && p1.Y == Math.round(pR * (100 / num)) && p2.X == Math.round(pR * (251 / num)) && p2.Y == Math.round(pR * (120 / num))) {
        // p.X = Math.round(pR * (74 / 100));
        // p.Y = Math.round(pR * (40 / 100));
        p.X = Math.round(pR * (222 / num));
        p.Y = Math.round(pR * (121 / num));
      }
      else if (p1.X > pR * (2 / 3) && p1.Y > pR * (1 / 2) && p2.X < pR * (1 / 3) && p2.Y <= pR * (1 / 3)) {//0,5
        p.X = pR * (1 / 2) - pR * (1 / 15);
        p.Y = pR * (1 / 2) + pR * (1 / 15);
      }
      else if (p1.X < pR * (1 / 3) && p1.Y >= pR * (2 / 3) && p2.X > pR * (2 / 3) && p2.Y < pR * (1 / 2)) {//0,3
        p.X = pR * (1 / 2) - pR * (1 / 15);
        p.Y = pR * (1 / 2) - pR * (1 / 15);
      }
      else if (p1.X >= pR * (2 / 3) && p1.Y > pR * (2 / 3) && p2.X > pR * (2 / 3) && p2.Y > pR * (1 / 3)) {//0,1
        p.X = pR * (1 / 2) - pR * (1 / 5);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (p1.X > pR / 3 && p1.Y > pR * (2 / 3) && p2.X > pR * (2 / 3) && p2.Y >= pR * (2 / 3)) {//1,2
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 5);
      }
      else if (p1.X < pR * (1 / 3) && p1.Y > pR * (1 / 3) && p1.Y < pR * (1 / 2) && p2.X > pR * (2 / 3) && p2.Y >= pR * (2 / 3)) {//1,4
        p.X = pR * (1 / 2) + pR * (1 / 15);
        p.Y = pR * (1 / 2) - pR * (1 / 15);
      }
      else if (p1.X >= pR * (2 / 3) && p1.Y > pR * (2 / 3) && p2.X > pR * (1 / 3) && p2.X < pR * (1 / 2) && p2.Y < pR * (1 / 3)) {//1,6 左曲线
        p.X = pR * (1 / 2) - pR * (1 / 15);
        p.Y = pR * (1 / 2) + pR * (1 / 15);
      }
      else if (p1.X > pR * (1 / 2) && p1.Y < pR * (1 / 3) && p2.X > pR * (2 / 3) && p2.Y >= pR * (2 / 3)) {//1,6 右曲线
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 20);
      }
      else if (p1.X < pR * (1 / 3) && p1.Y >= pR * (2 / 3) && p2.X <= pR * (2 / 3) && p2.Y > pR * (2 / 3)) {//2,3
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 5);
      }
      else if (p1.X > pR * (1 / 3) && p1.X < pR * (1 / 2) && p1.Y > pR * (2 / 3) && p2.X < pR * (1 / 3) && p2.Y <= pR * (1 / 3)) {//2,5左曲线
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.X <= pR * (1 / 3) && p1.Y < pR * (1 / 3) && p2.X > pR * (1 / 2) && p2.X < pR * (2 / 3) && p2.Y > pR * (2 / 3)) {//2,5右曲线
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2);
      }
      else if (p1.X > pR * (1 / 3) && p1.X < pR * (1 / 2) && p1.Y > pR * (2 / 3) && p2.X >= pR * (2 / 3) && p2.Y < pR * (1 / 3)) {//2,7左曲线
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2);
      }
      else if (p1.X > pR * (2 / 3) && p1.Y <= pR * (1 / 3) && p2.X > pR * (1 / 2) && p2.X < pR * (2 / 3) && p2.Y > pR * (2 / 3)) {//2,7右曲线
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.X < pR * (1 / 3) && p1.Y > pR / 3 && p1.Y < pR / 2 && p2.X <= pR / 3 && p2.Y > pR * (2 / 3)) {//3,4
        p.X = pR * (1 / 2) + pR * (1 / 5);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (p1.X < pR * (1 / 3) && p1.Y >= pR * (2 / 3) && p2.X > pR / 3 && p2.X < pR / 2 && p2.Y < pR / 3) {//3,6 左曲线
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (p1.X > pR * (1 / 2) && p1.X < pR * (2 / 3) && p1.Y < pR * (1 / 3) && p2.X <= pR / 3 && p2.Y > pR * (2 / 3)) {//3,6 右曲线
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2);
      }
      else if (p1.X <= pR * (1 / 3) && p1.Y < pR / 3 && p2.X < pR / 3 && p2.Y <= pR * (2 / 3)) {//4,5
        p.X = pR * (1 / 2) + pR * (1 / 5);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.X <= pR * (2 / 3) && p1.Y < pR / 3 && p2.X < pR / 3 && p2.Y <= pR / 3) {//5,6
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 5);
      }
      else if (p1.X > pR * (2 / 3) && p1.Y <= pR / 3 && p2.X <= pR * (2 / 3) && p2.Y < pR / 3) {//6,7
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 5);
      }
      else if (p1.X > pR * (2 / 3) && p1.Y <= pR * (2 / 3) && p2.X >= pR * (2 / 3) && p2.Y < pR / 3) {//0,7
        p.X = pR * (1 / 2) - pR * (1 / 5);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.Y == p2.Y && +p1.X + (+p2.X) == pR && p2.X < pR * (1 / 3) && p1.X > pR * (2 / 3) && p1.Y <= pR * (1 / 3)) {//5,6,7
        p.X = pR * (1 / 2);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.X == p2.X && +p1.Y + (+p2.Y) == pR && p2.Y > pR * (2 / 3) && p1.Y < pR / 3 && p2.Y >= pR * (2 / 3)) {//3,4,5
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2);
      }
      else if (p1.Y == p2.Y && +p1.X + (+p2.X) == pR && p1.X < pR * (1 / 3) && p2.X > pR * (2 / 3)) {//1,2,3
        p.X = pR * (1 / 2);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (p1.X == p2.X && +p1.Y + (+p2.Y) == pR && p1.Y > pR * (2 / 3) && p2.Y < pR / 3 && p1.X >= pR * (2 / 3)) {//0,1,7
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2);
      }
      else if (p1.X == p2.Y && p1.Y == p2.X && p1.X > pR / 3 && p1.Y > pR * (2 / 3) && p2.X > pR * (2 / 3) && p2.Y < pR * (1 / 2)) {//0,1,2
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (+p1.X + (+p2.Y) == pR && +p1.Y + (+p2.X) == pR && +p1.X < pR * (1 / 3) && +p1.Y < pR * (1 / 2) && +p2.X >= pR * (1 / 2) && +p2.Y > pR * (2 / 3)) {//2,3,4
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) - pR * (1 / 10);
      }
      else if (p1.X == p2.Y && p1.Y == p2.X && p1.X > pR / 2 && p1.Y < pR * (1 / 3) && p2.X < pR / 3 && p2.Y > pR * (1 / 2)) {//4,5,6
        p.X = pR * (1 / 2) + pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (+p1.X + (+p2.Y) == pR && +p1.Y + (+p2.X) == pR && +p1.X > pR * (2 / 3) && +p1.Y > pR * (1 / 2) && +p2.X < pR * (1 / 2) && +p2.Y < pR * (1 / 3)) {//0,6,7
        p.X = pR * (1 / 2) - pR * (1 / 10);
        p.Y = pR * (1 / 2) + pR * (1 / 10);
      }
      else if (p1.X == p2.Y && p1.Y == p2.X && +p1.X > pR / 2 && +p1.Y < pR / 2) {//3,4,6,7
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.X == p2.Y && p1.Y == p2.X && p1.X < pR / 3 && p1.Y > pR / 2 && +p2.X > pR / 2 && +p2.Y < pR / 3) {//0,2,3,7
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (Number(p1.X) + Number(p2.Y) == pR && +p1.X > pR / 2 && +p2.X < pR / 3) {//0,1,5,6
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (Number(p1.X) + Number(p2.Y) == pR && +p1.Y < pR / 3 && +p1.X < pR / 2) {//1,2,4,5
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.Y == p2.Y && Number(p1.X) + Number(p2.X) == pR && +p1.Y > pR / 3 && +p1.Y < pR / 2) {//0,1,3,4
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.Y == p2.Y && Number(p1.X) + Number(p2.X) == pR && +p1.Y > pR / 2 && +p1.Y < pR * (2 / 3)) {//0,4,5,7
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.X == p2.X && Number(p1.Y) + Number(p2.Y) == pR && +p1.X > pR / 2 && +p1.X < pR * (2 / 3)) {//2,3,5,6
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.X == p2.X && Number(p1.Y) + Number(p2.Y) == pR && +p1.X < pR / 2 && +p1.X > pR * (1 / 3)) {//1,2,6,7
        p.X = +p1.X;
        p.Y = +p1.Y;
      }
      else if (p1.X == p2.X && p1.X < Math.round(pR * (200 / num))) {//X字路口左曲线
        p.X = Math.round(pR / 2 - pR * (2 / 15));
        p.Y = Math.round(Number(Math.abs(p1.Y - p2.Y) / 2) + Number((p1.Y < p2.Y ? p1.Y : p2.Y)));
      } else if (p1.X == p2.X && p1.X > Math.round(pR * (200 / num))) {//X字路口右曲线
        p.X = Math.round(pR / 2 + pR * (2 / 15));
        p.Y = Math.round(Number(Math.abs(p1.Y - p2.Y) / 2) + Number((p1.Y < p2.Y ? p1.Y : p2.Y)));
      } else if (p1.Y == p2.Y && p1.Y > Math.round(pR * (200 / num))) {//X字路口下曲线
        p.X = Math.round(Number(Math.abs(p1.X - p2.X) / 2) + Number((p1.X < p2.X ? p1.X : p2.X)));
        p.Y = Math.round(pR / 2 + pR * (2 / 15));
        // p.Y = Math.round(p1.Y-pR*(2/15));
      } else if (p1.Y == p2.Y && p1.Y < Math.round(pR * (200 / num))) {//X字路口上曲线
        p.X = Math.round(Number(Math.abs(p1.X - p2.X) / 2) + Number((p1.X < p2.X ? p1.X : p2.X)));
        p.Y = Math.round(pR / 2 - pR * (2 / 15));
        // p.Y = Math.round(+p1.Y+pR*(2/15));
      }
      else if (p1.X < Math.round(pR * (1 / 2)) && p2.X < Math.round(pR * (1 / 2))) {//十字路口左侧两个曲线
        p.X = Number(Math.abs(p1.Y - p2.Y)) + Number((p1.X < p2.X ? p1.X : p2.X)) / 2 - pR * (1 / 30);
        p.Y = Number(p2.Y > p1.Y ? p1.Y : p2.Y);
      } else if (p1.X > Math.round(pR * (1 / 2)) && p2.X > Math.round(pR * (1 / 2))) {//十字路口右侧两个曲线
        p.X = Number(Math.abs(p1.Y - p2.Y)) + Number((p1.X < p2.X ? p1.X : p2.X)) / 2 + pR * (1 / 20);
        p.Y = Number(p2.Y > p1.Y ? p1.Y : p2.Y);
      }
      else if (Math.abs(p1.X - p2.X) > pR / 2 && +p1.Y > pR / 2) {// 1,4,5,7 ; 0,3,5,7;
        p.X = Number((+p1.X < +p2.X ? p1.X : p2.X)) + Math.abs(p1.X - p2.X) / 2;
        p.Y = Number((+p1.Y < +p2.Y ? p1.Y : p2.Y));
      } else if (Math.abs(p1.X - p2.X) > pR / 2 && +p1.Y < pR / 2) {//0,1,3,5 ; //1,3,4,7 ;
        p.X = Number((+p1.X < +p2.X ? p1.X : p2.X)) + Math.abs(p1.X - p2.X) / 2;
        p.Y = Number((+p1.Y < +p2.Y ? p1.Y : p2.Y)) + Math.abs(p1.Y - p2.Y);
      }
      return p;
    },
    // 转化成SVG path 可用文件 
    /* 
    坐标的数组：newPoints
    */
    _toPathData: function (pointsArr) {
      // console.log("坐标点：",pointsArr);
      let count = 0, svgStr = "";
      for (let i = 0; i < pointsArr.length; i++) {
        count++;
        if (count == 1) {
          if (i == 0) {
            svgStr += "M" + pointsArr[i] + ",";
          } else {
            svgStr += "L" + pointsArr[i] + ",";
          }
        } else if (count == 9) {
          svgStr += "Q" + pointsArr[i];
        } else if (count % 10 == 0 || count % 11 == 0 || count % 12 == 0) {
          svgStr += " " + pointsArr[i];
          if (count == 12) {
            count = 0;
            svgStr += ",";
          }
        } else {
          i != pointsArr.length - 1 ? svgStr += pointsArr[i] + "," : svgStr += pointsArr[i];
        }
      }
      // console.log("坐标点",svgStr)
      return svgStr + "Z";
    }
  };
  // JQuery对象方式
  $.fn[plug] = function (options) {
    $.extend(this, __DEF__, options, __PROP__);
    this._init();
  }
})(jQuery, "crossingCvs")

export default jQuery