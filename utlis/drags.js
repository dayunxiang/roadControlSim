
export function fnDown(event) {
    // console.log(event.currentTarget);
    
    event = event || window.event;
    var oBox = event.currentTarget
    // 光标按下时光标和页面之间的距离
    let disX = event.clientX - oBox.offsetLeft,
        disY = event.clientY - oBox.offsetTop;
    // 移动
    document.onmousemove = function (event) {
        event = event || window.event;
        var l = event.clientX - disX;
        var t = event.clientY - disY;
        // 最大left,top值      可见区域宽度     BODY对象宽度
        const parent = oBox.offsetParent;
      let leftMax = (parent.clientWidth) - oBox.offsetWidth;
      let topMax = (parent.clientHeight) - oBox.offsetHeight;
        if (l < 0) l = 0;
        if (l > leftMax) l = leftMax;
        if (t < 0) t = 0;
        if (t > topMax) t = topMax;
        oBox.style.left = l + 'px';
        oBox.style.top = t + 'px';
    }
    // 释放鼠标
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

export default fnDown