// miniprogram/pages/complete_messege/complete_messege.js
const app = getApp();
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    tabbar: {},
    userInfo:{},
    openid: '',
    List: [],
    searchPost: '',
    newPost: '',
    user_name:'',
    user_avatarUrl:'',
    gender:'',
    address:'',
    phonenumber:'',
    emails:'',
    publishidlist:[],
    addidlist:[],
    collectidlist:[],
    finishidlist:[],
    contactlist:[],
    newmessagelist:[],
    l_length:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    db.collection('user').where({
      _openid:app.globalData.openid,
      })
    .get({
      success: res =>{
        console.log(res)
        console.log(res.data.length)
        this.setData({
           l_length:res.data.length       
        })  
      }
    })
  },
  

  createUser(e) {
    let that = this
    if (this.data.loading) {
      return
    }
    this.setData({loading: true})
    
  
    if(that.data.phonenumber === ""){
      wx.showToast({
        title: '联系方式不能为空!',
        icon: 'none',
        duration: 1500
      })
      console.log("null name")
    }else if(that.data.address === ""){
      wx.showToast({
        title: '地址不能为空!',
        icon: 'none',
        duration: 1500
      })
    }
    else if(this.data.loading){
      wx.showModal({
        title: '提示',
        content: '你确定要提交吗',
        success: function (res) {
          console.log("obj", res)
          
          if (res.confirm) {
            console.log('用户点击确定')
            
            console.log(that.data.l_length)
            if(that.data.l_length===0){
              that.issueUser(e);
            } else {
              wx.showToast({
                icon: 'none',
                title: '该用户已存在'
              })
        
            }
            
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }else {
      wx.showToast({
        title: '你已经提交过啦',
        icon: 'none',
        duration: 2000
      })
    }
    },

    issueUser(e){
      var that = this
      var gender = ""  //性别 0：未知、1：男、2：女
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.userInfo.gender)
      if(this.data.userInfo.gender==1){
          gender = '男'
      }else if(this.data.userInfo.gender==2){
          gender = '女'
      }else{
          gender = '未知'
      }
      
     
       db.collection('user').add({
        data: {
        name: this.data.userInfo.nickName,
        avatarUrl:this.data.userInfo.avatarUrl,
        gender:gender,
        phonenumber: this.data.phonenumber,
        emails: this.data.emails,
        address: this.data.address,
        publishidlist:this.data.publishidlist,
        addidlist:this.data.addidlist,
        collectidlist:this.data.collectidlist,
        finishidlist:this.data.finishidlist,
        contactlist:this.data.contactlist,
        newmessagelist:this.data.newmessagelist,
      },
      success: res => {
        this.setData({
          List: [
            ...this.data.List,
            {
              _id: this.data.openid,               
            }
          ],
        name: '',
        avatarUrl:'',
        gender:'',
        phonenumber: '',
        emails: '',
        address: '',
        publishidlist:[],
        addidlist:[],
        collectidlist:[],
        finishidlist:[],
        })
       
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ')
                
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      },
      complete: () => {
        this.setData({loading: false})
      }
    })
    

  },
  phonenumberBlur(e) {
    this.setData({
      phonenumber: e.detail.value
    })
  },
  emailsBlur(e) {
    this.setData({
      emails: e.detail.value
    })
  },
  addressBlur(e) {
    this.setData({
      address: e.detail.value
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

  }
})