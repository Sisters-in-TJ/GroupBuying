// miniprogram/pages/messagePage/messagePage.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    contacts:[],
    newmessage:[],
    noContact:true,
    hasnew:true,
    contentH:200,
    contentW:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //这里单位是px
      var windowHeight = wx.getSystemInfoSync().windowHeight
      var windowWidth = wx.getSystemInfoSync().windowWidth
      //转成rpx
      var windowHeightRpx = windowHeight * 750 / windowWidth
      var windowWidthRpx = 750
      this.setData({
        contentH: windowHeightRpx,
        contentW: windowWidthRpx
      })
      if (app.globalData.openid) {
        this.setData({
          openid: app.globalData.openid
        })
      }
      this.onGetContact()
  },

  changeTabBar: function(){
    wx.hideTabBarRedDot({
      index: 2,
    })
  },
  /**
   * 读取数据库获得全部联系人openid和uid
   */
  onGetContact: function(){
    const db = wx.cloud.database()
    const users = db.collection('user')
    let that=this
    this.updateNewMessage(that).then(()=>{
    users.where({
      _openid: this.data.openid,
    })
    .get({
      success: res => {
        this.setData({
          contacts: res.data[0].contactlist
        })
        let tmplist = new Array()
        for(var index=0;index< res.data[0].contactlist.length;index++){
          if(res.data[0].contactlist[index]!=""){
            wx.cloud.callFunction({
              name: 'getInfo',
              data: {
                openid:res.data[0].contactlist[index]
              },
              success: newres => {
                let tmpdict = {}
                tmpdict['openid']=newres.result.data[0]._openid
                tmpdict['name']=newres.result.data[0].name
                tmpdict['avatarUrl']=newres.result.data[0].avatarUrl
                if(this.data.newmessage.length!==0 && this.data.newmessage.indexOf(tmpdict['openid'])!==-1)
                  tmpdict['ifnew']=true
                else  tmpdict['ifnew']=false
                tmplist[tmplist.length]=tmpdict
                this.setData({
                  contacts: tmplist
                })
              },
              fail: err => {
                console.error('[云函数] [getInfo] 调用失败：', err)
              }
            })
          }
        }
        if (this.data.contacts.length!=0){
          this.setData({
            noContact:false
          })
        }
      },
      fail: err => {
        console.error('查询失败：', err)
      }
    })
  })
  },

  updateNewMessage:function(that){
    return new Promise(function (resolve, reject) {
    const db = wx.cloud.database()
    const users = db.collection('user')
    users.where({
      _openid: that.data.openid
    })
    .get({
      success: res=>{
        that.setData({
          newmessage:res.data[0].newmessagelist
        })
        resolve(res)
      },
      fail: res=>(
        reject(res)
      )
    })
  })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
    this.onGetContact()
    this.hideTabBar()
  },

  hideTabBar:function(){
    const db = wx.cloud.database()
    db.collection('user')
      .where({
        _openid:this.data.openid
      }).get({
        success: function(res) {
          if(res.data[0].newmessagelist.length==0){
            wx.hideTabBarRedDot({
              index: 2,
            })
          }
        }
      })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onRefresh(e){
    this.onGetContact()
  }
  
})
