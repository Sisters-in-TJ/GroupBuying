// pages/middle/middle.js
const app = getApp();
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
  data: {
    openid: '',
    List: [],
    searchPost: '',
    newPost: '',
    name:'',
    thing:'',
    address:'',
    price:'',
    number:'',
    imageList:[],
    _id:'',
    images_fileID:[],
    loading: false,
    kind: JSON.parse(config.data).kind,
    cids: '-1',
    dura: 3,
    openidList:[],
    publishidlist:[],
    l_length:0,
  },
  createPost(e) {
    let that = this
    if (this.data.loading) {
      return
    }
    
    this.setData({loading: true})
    if(that.data.name === ""){
      wx.showToast({
        title: '姓名不能为空!',
        icon: 'none',
        duration: 1500
      })
      console.log("null name")
    }else if(that.data.thing === ""){
      wx.showToast({
        title: '详情不能为空!',
        icon: 'none',
        duration: 1500
      })
    }else if(that.data.address===""){
      wx.showToast({
        title: '地址不能为空!',
        icon: 'none',
        duration: 1500
      })
    }else if(that.data.price===""){
        wx.showToast({
          title: '价格不能为空!',
          icon: 'none',
          duration: 1500
        })
    }else if(that.data.number===""){
      wx.showToast({
        title: '人数不能为空!',
        icon: 'none',
        duration: 1500
      })
    }else if(that.data.cids== -1){
      wx.showToast({
        title: '请选择分类',
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
            wx.cloud.callFunction({
              name:'get',
              data:{
                message:'get',
              }
            }).then(res=>{
              that.setData({
                openid:res.result.openid,   
             })
            }).then(()=>{
            db.collection('user').where({
              _openid:that.data.openid,
            })
            .get({
              success: res =>{
                console.log(res)
                console.log(res.data.length)
                 if(res.data.length == 0){
                 wx.showToast({
                icon: 'none',
                title: '该用户尚未注册，请注册后再发布'
              })
            } else {
              that.issuePost(e);
            }
          
              }
            })
          })
            
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

    issuePost(e){
      var that = this
      var imgeList = that.data.imageList.concat(e.tempFilePaths);
      db.collection('post').add({
      data: {
        name: this.data.name,
        thing: this.data.thing,
        index: this.data.cids,
        address: this.data.address,
        price: this.data.price,
        number: Number(this.data.number),
        imageList: this.data.imageList,
        images_fileID: this.data.images_fileID,
        creat: new Date().getTime(),
        key: this.data.name + this.data.thing,
        status: 1, //已拼几人
        need: Number(this.data.number)-1,//还需要几个人
        dura: new Date().getTime() + this.data.dura * (24 * 60 * 60 * 1000),
        openidList:this.data.openidList,
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          List: [
            ...this.data.List,
            {
              _id: res._id,
              _openid: this.data.openid,               
            }
          ],
          name:'',
          thing:'',
          address:'',
          price:'',
          number:'',
          imageList:[],
          images_fileID:[],          
          openidList:[],
          cids: '-1',
        })
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
          console.log(res._id)
          console.log(that.data.openid,)
          db.collection('user').where({
          _openid:that.data.openid,
        }).update({
          data: {
            publishidlist:_.push([res._id]),
          },
          success:function(res){
            console.log("更新成功",res.data)
          }
        },
        )
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
  nameBlur(e) {
    this.setData({
      name: e.detail.value
    })
  },
  thingBlur(e) {
    this.setData({
      thing: e.detail.value
    })
  },
  addressBlur(e) {
    this.setData({
      address: e.detail.value
    })
  },
  priceBlur(e) {
    this.setData({
      price: e.detail.value
    })
  },
  numberBlur(e) {
    this.setData({
      number: e.detail.value
    })
  },
  duraChange(e) {
    this.data.dura = e.detail;
},
  chooseImage: function (event) {
    var that = this;
    wx.chooseImage({
      count: 3, // 一次最多可以选择2张图片一起上传
      sizeType: ['original', 'compressed'],//可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        var imageList = that.data.imageList.concat(res.tempFilePaths);
        var imageUrl = imageList[0].split("/");
        var imagename = imageUrl[imageUrl.length - 1];//得到图片的名称
        var images_fileID = that.data.images_fileID;
        wx.cloud.uploadFile({
          cloudPath: "community/article_images/" + imagename,  
          filePath: imageList[0],
          success:res =>{
            images_fileID.push(res.fileID);
            that.setData({
              images_fileID: images_fileID//更新data中的fileID
            })
          }
        })
        that.setData({
          imageList: imageList
        });
      }
    })
  
  },
  previewImage: function (e) {
    var that = this;
    var dataid = e.currentTarget.dataset.id;
    var imageList = that.data.imageList;
    wx.previewImage({
      current: imageList[dataid],
      urls: this.data.imageList
    });
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      cids: e.detail.value
    })
  },
})