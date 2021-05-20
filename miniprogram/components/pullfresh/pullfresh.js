//js文件代码实现
const app = getApp()
var that
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //刷新控件高度，单位rpx
    height: {
      type: Number,
      value: 0
    },
    //刷新控件宽度，单位rpx
    width: {
      type: Number,
      value: 0
    },
    //刷新控件背景颜色
    background: {
      type: String,
      value: 'white'
    },
    //刷新控件刷新超时时间
    timeout: {
      type: Number,
      value: 4000
    },
    //是否开启上拉加载更多，默认不开启
    enablemore: {
      type: Boolean,
      value: false
    }
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用slot支持
  },

  /**
   * 组件的初始数据
   */
  data: {
    triggered: false
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    that = this
  },
  //在组件在视图层布局完成后执行
  ready: function () {
  },
  // 在组件实例被从页面节点树移除时执行
  detached: function () {
    that.endFresh()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //拖拽下拉回调函数
    onPulling(e) {
      that.setData({
        triggered: true
      })
    },
    //刷新回调
    onRefresh(e) {
      if (that._freshing) return
      that._freshing = true
      //超过超时时间结束刷新状态
      setTimeout(() => {
        that.endFresh()
      }, that.properties.timeout)
      //对外暴露的刷新方法
      that.triggerEvent("onRefresh")
    },
    //刷新重置回调
    onRestore(e) {
      //对外暴露的刷新重置方法
      that.triggerEvent("onRestore")
    },
    //刷新中断回调
    onAbort(e) {
      //对外暴露的刷新中断方法
      that.triggerEvent("onAbort")
    },
    //刷新结束回调
    endFresh(){
      that.setData({
        triggered: false,
      })
      that._freshing = false
      //对外暴露的刷新结束方法
      that.triggerEvent("onRefreshEnd")
    },
    //上拉更多回调
    onLoadmore(e){
      if (!that.properties.enablemore){
        return
      }
      //对外暴露的上拉方法
      that.triggerEvent("onLoadmore")
    }
  }
})