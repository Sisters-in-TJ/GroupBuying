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
        multiArray: [],
        multiIndex: [],
        note_counts:'',
        provinces:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //console.log("吊炸天",options.scene);
        this.getCityInfo();
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
                    note_counts:res.data.note_counts,
                    multiIndex:res.data.multiIndex,
                    // multiArray:res.data.multiArray,
                })
        db.collection('cityDataArr').doc('3d27439a60adf5270003fcb420987c30').get({
          success: newres => {
            wx.hideLoading();
            if (newres.data){
              //获取云数据库数据
              var temp = newres.data.data;
              //初始化更新数据
              this.setData({
                provinces: temp,
                multiArray: [temp, temp[res.data.multiIndex[0]].citys, temp[res.data.multiIndex[0]].citys[res.data.multiIndex[1]].areas],
              })
            }
          },
          fail: err => {
            wx.hideLoading();
            console.error(err)
          }
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
                            note_counts:that.data.note_counts,
                            multiIndex:that.data.multiIndex,
                            // multiArray:that.data.multiArray

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
        this.setData({
          note_counts:e.detail.cursor
        })
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
      },
      getCityInfo: function(){//new
        wx.showLoading({
          title: 'Loading...',
        })
        //因为数据库只存有一个总的数据字典，所以指定它的ID直接获取数据
        var that = this
        db.collection('cityDataArr').doc('3d27439a60adf5270003fcb420987c30').get({
          success: res => {
            wx.hideLoading();
            if (res.data){
              //获取云数据库数据
              var temp = res.data.data;
              //初始化更新数据
              that.setData({
                provinces: temp,
                multiArray: [temp, temp[res.data.multiIndex[0]].citys, temp[res.data.multiIndex[0]].citys[res.data.multiIndex[1]].areas],
                multiIndex: [that.data.multiIndex[0],that.data.multiIndex[1],that.data.multiIndex[2]]
              })
              console.log(that.data.provinces)
            }
          },
          fail: err => {
            wx.hideLoading();
            console.error(err)
          }
        })     
      },
      //点击确定
      bindMultiPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          multiIndex: e.detail.value
        })
      },
      //滑动
      bindMultiPickerColumnChange: function(e){       
        
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
          multiArray: this.data.multiArray,
          multiIndex: this.data.multiIndex
        };
        //更新滑动的第几列e.detail.column的数组下标值e.detail.value
        data.multiIndex[e.detail.column] = e.detail.value;
        //如果更新的是第一列“省”，第二列“市”和第三列“区”的数组下标置为0
        if (e.detail.column == 0){
          data.multiIndex = [e.detail.value,0,0];
        } else if (e.detail.column == 1){
          //如果更新的是第二列“市”，第一列“省”的下标不变，第三列“区”的数组下标置为0
          data.multiIndex = [data.multiIndex[0], e.detail.value, 0];
        } else if (e.detail.column == 2) {
          //如果更新的是第三列“区”，第一列“省”和第二列“市”的值均不变。
          data.multiIndex = [data.multiIndex[0], data.multiIndex[1], e.detail.value];
        }
        var temp = this.data.provinces;
        data.multiArray[0] = temp;
        if ((temp[data.multiIndex[0]].citys).length > 0){
          //如果第二列“市”的个数大于0,通过multiIndex变更multiArray[1]的值
          data.multiArray[1] = temp[data.multiIndex[0]].citys;
          var areaArr = (temp[data.multiIndex[0]].citys[data.multiIndex[1]]).areas;
          //如果第三列“区”的个数大于0,通过multiIndex变更multiArray[2]的值；否则赋值为空数组
          data.multiArray[2] = areaArr.length > 0 ? areaArr : [];
        }else{
          //如果第二列“市”的个数不大于0，那么第二列“市”和第三列“区”都赋值为空数组
          data.multiArray[1] = [];
          data.multiArray[2] = [];
        }
        //data.multiArray = [temp, temp[data.multiIndex[0]].citys, temp[data.multiIndex[0]].citys[data.multiIndex[1]].areas];
        //setData更新数据
        this.setData(data);
        console.log(this.data.multiIndex,this.data.multiArray)
      }
})