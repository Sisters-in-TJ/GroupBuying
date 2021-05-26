// pages/modify/modify.js
const db = wx.cloud.database();
const cont = db.collection('post');
const app=getApp();
const config = require("../../config.js");
const _ = db.command;
Page({

    /**
     * 页面的初始数据
     */
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
        kind: JSON.parse(config.data).kind,
        cids: '',
        dura: '',
        openidList:[],
        loading: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //console.log("吊炸天",options.scene);
        db.collection('post').doc(options.scene).get({
            success: res =>{
                console.log('test==>',res);
                this.setData({
                    _id:res.data._id,
                    imageList:res.data.imageList,
                    name:res.data.name,
                    address:res.data.address,
                    price:res.data.price,
                    number:res.data.number,
                    dura:res.data.dura,
                    images_fileID:res.data.images_fileID,
                    thing:res.data.thing,
                    cids:res.data.index,
                })
            }
        })
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
                    //console.log('HHHHHHHHH',that.data.name);
                    console.log('HHHHHHHHH',that.data);
                    db.collection('post').doc(that.data._id).update({
                        data:{
                            name:that.data.name,
                            thing:that.data.thing,
                            address:that.data.address,
                            price:that.data.price,
                            number:that.data.number,
                            index:that.data.cids,
                        }
                      })

                  wx.showToast({
                    title: '修改成功',
                  })
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
    
      nameBlur(e) {
          this.data.name = e.detail.value ;      
      },
      thingBlur(e) {
        this.data.thing=e.detail.value;
      },
      addressBlur(e) {
        this.data.address=e.detail.value;
      },
      priceBlur(e) {
        this.data.price=e.detail.value;
      },
      numberBlur(e) {
        this.data.number=e.detail.value;
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
      bindlongpressimg(e){
        let that = this
        var imageList = that.data.imageList;
        var deleID = e.currentTarget.dataset.id    //获取点击项目的内容
        console.log(deleID)
        imageList.splice(deleID,1)
        that.setData({
          imageList:imageList
        })
      },
      cancel_modify(){
          wx.navigateBack({
              delta:1
          })
      }
})