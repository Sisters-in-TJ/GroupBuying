// miniprogram/pages/my_group_messege/my_group_messege.js
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
    showcollect: false,
    showadd: false,
    showpublish: false,
    list:[],
    listadd:[],
    listcollect:[],
    listpublish:[],
    publishidlist:[],
    addidlist:[],
    collectidlist:[],
    _id:'',
    
  },

  showadd() {
    let that = this;
    wx.cloud.callFunction({
      name:'get',
      data:{
        message:'get',
      }
    }).then(res=>{
      this.setData({
        openid:res.result.openid,   
     })
    }).then(()=>{
    db.collection('user').where({
      _openid:that.data.openid,
    }).get({
      success: res =>{
        this.setData({
           addidlist:res.data[0].addidlist    
        })
        this.getList(that.data.addidlist,"listadd")
        
      }
    })
  })
    if (that.data.showadd) {
        that.setData({
              showadd: false,
        })
    } else {
        that.setData({
              showadd: true,
        })
    }
  },
  showcollect() {
    let that = this;
    wx.cloud.callFunction({
      name:'get',
      data:{
        message:'get',
      }
    }).then(res=>{
      this.setData({
        openid:res.result.openid,   
     })
    }).then(()=>{
    db.collection('user').where({
      _openid:that.data.openid,
    }).get({
      success: res =>{
        this.setData({
           collectidlist:res.data[0].collectidlist, 
        })
        this.getList(that.data.collectidlist,"listcollect");
        console.log('!!!!!!!!!!',that.data.listcollect);
        
      }
    })
  })
    if (that.data.showcollect) {
        that.setData({
              showcollect: false,
        })
    } else {
        that.setData({
              showcollect: true,
        })
    }
    
  },
  showpublish() {
    let that = this;
    wx.cloud.callFunction({
      name:'get',
      data:{
        message:'get',
      }
    }).then(res=>{
      this.setData({
        openid:res.result.openid,   
     })
    }).then(()=>{
    db.collection('user').where({
      _openid:that.data.openid,
    }).get({
      success: res =>{
        this.setData({
           publishidlist:res.data[0].publishidlist,   
        })
        this.getList(that.data.publishidlist,"listpublish")
       
      }
    })
  })
    if (that.data.showpublish) {
        that.setData({
              showpublish: false,
        })
    } else {
        that.setData({
              showpublish: true,
        })
    }
  },
  getList(list,list1) { 
    let that = this;
    console.log('!!!!!!!!!!',list1);
    db.collection('post').where({
        _id: _.in(list)
    }).get({
          success: function(res) {
                if (res.data.length == 0) {
                      that.setData({
                            nomore: true,
                            [list1]:[]   
                      })
                      return false;
                }
                else {
                      that.setData({
                            page: 0,
                            [list1]: res.data,
                            nomore: false,
                      })
                }
          }
    })
  },
  //跳转详情
detail(e) {
  let that = this;
  console.log(e);
  var detailID=e.currentTarget.dataset.id;
  wx.navigateTo({
        url: '/pages/detail/detail?scene=' + detailID,
  })
},

modify(e){
  //console.log("吊炸天=>",e);
  wx.navigateTo({
    url: '/pages/modify/modify?scene=' + e.currentTarget.dataset.id,
  })

},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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