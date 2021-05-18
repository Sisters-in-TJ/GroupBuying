const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    // chatRoomEnvId: 'release-f8415a',
    chatRoomCollection: 'chatroom',
    chatRoomGroupId: '',
    chatRoomGroupName: '',

    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,

    // 是否发送请求
    sendRequest: false,
  },

  onLoad: function(options) {

    // if(options.request=="true"){
    //   this.setData({
    //     sendRequest: true,
    //   })
    // }
    // 获得groupid
    let a = this.getOpenID().then(res=>{
      var oppoid=options.contact
      console.log(oppoid)
      var groupid=''
      var openid=res
      if (oppoid<res){
        groupid=oppoid+'_'+res
      }
      else{
        groupid=res+'_'+oppoid
      }
      this.setData({
        chatRoomGroupId: groupid,
      })

      
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {
          openid:oppoid
        },
        success: res => {
          this.setData({
            chatRoomGroupName: res.result.data[0].name,
          })
        },
        fail: err => {
          console.error('[云函数] [getInfo] 调用失败：', err)
        }
      })

      wx.cloud.callFunction({
        name: 'getInfo',
        data: {
          openid:openid
        },
        success: res => {
          this.setData({
            avatarUrl: res.result.data[0].avatarUrl,
            userInfo:res.result.data[0],
          })
        },
        fail: err => {
          console.error('[云函数] [getInfo] 调用失败：', err)
        }
      })
    })
    
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo,
    //           })
    //           console.log(res.userInfo)
    //         }
    //       })
    //     }
    //   }
    // })

    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    wx.getSystemInfo({
      success: res => {
        console.log('system info', res)
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },

  getOpenID: async function() {
    if (this.openid) {
      return this.openid
    }

    const { result } = await wx.cloud.callFunction({
      name: 'login',
    })

    return result.openid
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '即时通信 Demo',
      path: '/pages/messagePage/room/room',
    }
  },
})
