// pages/detail/detail.js
const db = wx.cloud.database();
const cont = db.collection('post');
const app=getApp();

const _ = db.command;
const config = require("../../config.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl'),
    name:'',
    thing:'',
    address:'',
    status:'',
    number:'',
    price:'',
    images_fileID:'',
    imageList:'',
    id:'',
    _openid:'',
    openid:'',
    openidList:'',
    judge:'',
    user_id:'',
    user_openid:'',
    addidlist:[],
    need:'',
    indicatorDots:true,
    autoplay:false,
    interval:1000,
    duration:2000,
    l_length:0
    },

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {     
      console.log('测试 ==> ',app.globalData.openid); 
      db.collection('post').where({
        _id:options.scene,
      }).get({
        success: res =>{
          console.log('test==>',res.data[0]);
          this.setData({
          id:options.scene,
          _openid:res.data[0]._openid,  
          name: res.data[0].name,
          thing:res.data[0].thing,
          address:res.data[0].address,
          status:res.data[0].status,
          number:res.data[0].number,
          price:res.data[0].price,
          images_fileID:res.data[0].images_fileID,
          imageList:res.data[0].imageList,
          openidList:res.data[0].openidList,
          need:res.data[0].need,          
          })
        }
      })

      
    let a = this.getOpenID().then(res=>{
      wx.cloud.callFunction({
        name: 'getInfo',
        data: {
          openid:res
        },
        success: result => {
          this.setData({
            userInfo:result.result.data[0]
          })
          console.log(this.data.userInfo)
        },
        fail: err => {
          console.error('[云函数] [getInfo] 调用失败：', err)
        }
      })
    })
      
    },    
        
    
    join:function(){
      var that=this
      db.collection('post').where({
        _id:that.data.id,
        _openid:that.data._openid,                
        openidList:app.globalData.openid,
      }).get({
        success:function(res){
          if(res.data.length>0){//用户已加入拼单
            wx.showToast({
              title: '您已加入该拼单！',
              icon:'none',
              duration:3000,
            })
          }
          else if(res.data.length==0){
            if(that.data.number<=that.data.status){
              wx.showToast({
                title: '无法加入',
                icon:'none',
                duration:2000
              })
            }else{
              if(that.data._openid==app.globalData.openid){//若用户为发布者
                wx.showToast({
                title: '您是该单的发布者！',
                icon:'none',
                duration:3000,
                })
              }
            else
            { 
            
              wx.showModal({
              title:'提示',
              content:'您确定要加入拼单吗',
              cancelColor: 'cancelColor',
              success: function(res) {
              //console.log(res);
              if (res.confirm) {

                console.log('用户点击确定');
                
                var contact=that.data._openid;
                console.log(contact);
                that.sendRequest()
                wx.navigateTo({
                  url: '../messagePage/room/room?contact='+contact,
                })
                wx.showToast({
                title: '申请加入成功',
                duration: 2000,
                icon: 'success',             
                mask: true,
                
                })
                //console.log('after=>',that.data.openidList)              
              } else if (res.cancel) {

                console.log('用户点击取消',that.data.status);
               
              }
              }
              })         
             
        }     
      }
          }
          }
        })
    },

    collect:function(){
      var that=this
      wx.cloud.callFunction({
        name:'get',
        data:{
          message:'get',
        }
      }).then(res=>{
        console.log(res.result.openid)
        this.setData({
          openid:res.result.openid        
       })
      }).then(()=>{
      db.collection('user').where({
        _openid:that.data.openid,
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
    }).then(()=>{
      db.collection('post').where({
        _id:that.data.id,
        _openid:that.data._openid,                
        openidList:app.globalData.openid,
      }).get({
        success:function(res){
          console.log(that.data.l_length)
          if(that.data.l_length==0){
            wx.showToast({
              icon: 'none',
              title: '该用户尚未注册，请注册后操作'
            })
          }else{
              wx.showModal({
              title:'提示',
              content:'您确定要收藏拼单吗',
              cancelColor: 'cancelColor',
              success: function(res) {
              //console.log(res);
              if (res.confirm) {

                console.log('用户点击确定');        
                console.log(that.data.openid);
                console.log(that.data.id);
                db.collection('user').where({
                  _openid:that.data.openid
                }).update({
                  data: {
                    collectidlist:_.push([that.data.id]),
                  }
                },
                )
                wx.showToast({
                title: '收藏成功',
                duration: 2000,
                icon: 'success',             
                mask: true,
                
                })
                //console.log('after=>',that.data.openidList)              
              } else if (res.cancel) {

                console.log('用户点击取消',that.data.status);
               
              }
              }
              })         
          }
        }, 
      })
    })
    },

    // 将请求加入的信息存入数据库
  sendRequest: function(event){
    var that=this
    const db = wx.cloud.database()
    let a = that.getOpenID().then(res=>{
      var oppoid=that.data._openid
      var groupid=''
      if (oppoid<res){
        groupid=oppoid+'_'+res
      }
      else{
        groupid=res+'_'+oppoid
      }
      const doc = {
        _id: `${Math.random()}_${Date.now()}`,
        groupId: groupid,
        avatar: this.data.userInfo.avatarUrl,  //获得userinfo
        nickName: this.data.userInfo.name,
        msgType: 'request',  // 'request' 'text'
        textContent: this.data.id,
        sendTime: new Date(),
        sendTimeTS: Date.now(), // fallback
        requestStatus: 0, //default:0, accept:1, reject:2, cancel:3
        postImage: this.data.imageList[0],
        postName:this.data.name,
        postThing:this.data.thing
      }
     db.collection("chatroom").add({
        data: doc,
      })
      this.addContact(res,oppoid)
    })
  },

  addContact:function(id1,id2){
    //调用addContact，更新user
    wx.cloud.callFunction({
      name: 'addContact',
      data: {
        id1:id1,
        id2:id2
      },
      success: res => {
        console.log('联系人加入成功')
      },
      fail: err => {
        console.error('[云函数] [addContact] 调用失败：', err)
      }
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
  
})