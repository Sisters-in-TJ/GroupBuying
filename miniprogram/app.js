// app.js
App({
  onLaunch() {
    var curtime = Date.parse(new Date());
    var time = Date.parse(new Date(2021,4,5))
    if(curtime.valueOf()<time.valueOf()){
      wx.hideTabBar();//隐藏系统自带的tabBar
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud-group-0grmohzw06a018ef',
        traceUser: true,
      })
      /**
       * 打开小程序的时候首先获得用户openid
       */
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          this.globalData.openid = res.result.openid
          this.initWatcher(res.result.openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  initWatcher: function(openid){
    //监听新消息
    const db = wx.cloud.database()
    const watcher = db.collection('user')
      .where({
        _openid:openid
      })
      .watch({
        onChange: function(snapshot) {
          console.log('user-snapshot', snapshot)
          // wx.showToast({
          //   title: 'watch',
          // })
          if(snapshot.docs.length!=0 && snapshot.docs[0].newmessagelist.length!=0){
            wx.showTabBarRedDot({
              index: 2,
              fail:res=>{
                console.log(res);
              }
            })
          }
        },
        onError: function(err) {
          console.error('init watch error', err)
        }
      })
  },

  globalData: {
    para:0,//用于收藏按钮传参
    systemInfo: null,//客户端设备信息
    userInfo: null,
    openid:null,
    ifexist:false,
    appid: 'wx00ea7f5b6d650d05',
    tabBar: {//在app.js中的globalData中加入自定义tabbar的参数
      "backgroundColor": "#ffffff",
      "color": "#979795",
      "selectedColor": "#1c1c1b",
      "list": [
        {
          "pagePath": "/pages/index/index",
          "iconPath": "icon/icon_home.png",
          "selectedIconPath": "icon/icon_home_HL.png",
          "text": "首页"
        },
        {
          "pagePath": "/pages/middle/middle",
          "iconPath": "icon/icon_release.png",
          "isSpecial": true,
          "text": "发布"
        },
        {
          "pagePath": "/pages/mine/mine",
          "iconPath": "icon/icon_mine.png",
          "selectedIconPath": "icon/icon_mine_HL.png",
          "text": "我的"
        }
      ]
    },
    share:[{
      name: '拼车',
      id: 0
      },
    {
      name: '外卖',
      id: 1
    },
    {
      name: '娱乐',
      id: 2
    },
    {
      name: '网购',
      id: 3
    }]

  }
})
