const app = getApp()

Page({
  data: {
    oppoid:'',
    openid:'',
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

    let a = this.getOpenID().then(res=>{
      var oppoid=options.contact
      var groupid=''
      var openid=res
      if (oppoid<res){
        groupid=oppoid+'/'+res
      }
      else{
        groupid=res+'/'+oppoid
      }
      this.setData({
        oppoid:oppoid,
        openid:res,
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

    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    wx.getSystemInfo({
      success: res => {
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            // containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
            containerStyle: `padding-top: 0px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
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

  onUnload: function () {
    this.deleteNewMessageList(this.data.openid,this.data.oppoid)
  },
  deleteNewMessageList: function(openid,oppoid){
    const db = wx.cloud.database()
    const user = db.collection('user')
    const _ = db.command
    var list=[]
    user.where({
      _openid: openid
    }).get({
      success(res) {
        list=res.data[0].newmessagelist
        for(var i=0;i<list.length;i++){
          if(list[i]==oppoid){
            list.splice(i,1)
            user.where({
              _openid: openid
            }).update({
              data: {
                newmessagelist: list
              },
              success: res => {
              },
              fail: err => {
                console.error('[数据库] [更新记录] 失败：', err)
              }
            })
            break
          }
        }
      },
    })
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
})
