// pages/mine/mine.js
const db = wx.cloud.database();
const cont = db.collection('user');
const app=getApp();
const _ = db.command;
const config = require("../../config.js");

Page({
    /**
     * 页面的初始数据
     */
    data: {
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    showcontactway: false,
    showaddress: false,
    gender:'',
    address:'',
    phonenumber:'',
    emails:'',
    id:'',
    openid:'',
    openidList:'',
    judge:'',
    user_id:'',
    user_openid:'',
    need:'',
    indicatorDots:true,
    autoplay:false,
    interval:1000,
    duration:2000,
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
  }
  ,
  
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    let that = this;
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
       
          
          db.collection('user').where({
          _openid:app.globalData.openid
        }).get({
          success: res =>{
            this.setData({
               gender:res.data[0].gender        
            })
          }
        })
        
        
      }
    })
  },
  

  

  showcontactway() {
    let that = this;
    console.log(that.data.openid)
    db.collection('user').where({
      _openid:app.globalData.openid,
    }).get({
      success: res =>{
          console.log(res.data[0]),
        this.setData({
           phonenumber:res.data[0].phonenumber, 
           emails:res.data[0].emails         
        })
      }
    })
    if (that.data.showcontactway) {
        that.setData({
              showcontactway: false,
        })
    } else {
        that.setData({
              showcontactway: true,
        })
    }
  },
  showaddress() {
    let that = this;
    db.collection('user').where({
      _openid:app.globalData.openid,
    }).get({
      success: res =>{
        this.setData({
           address:res.data[0].address,          
        })
      }
    })
    if (that.data.showaddress) {
        that.setData({
              showaddress: false,
        })
    } else {
        that.setData({
              showaddress: true,
        })
    }
  },

})



  