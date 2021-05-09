// pages/detail/detail.js
const db = wx.cloud.database({env: 'cloud1-7gqeolyoe3270a31'});
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
    },    
        
    join:function(){
      var that=this
      db.collection('post').where({
        _id:that.data.id,
        _openid:that.data._openid,                
        openidList:app.globalData.openid,
      }).get({
        success:function(res){
                   
          //console.log('!!!!!!!!!!',that.data.openidList);
          //console.log('!!!!!!!!!!!',res.data.length)
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
                that.data.status++,          
                console.log('after=>',that.data.status,that.data.id);
                db.collection('post').doc(that.data.id).update({
                  data: {
                    status:that.data.status,
                    openidList:_.push([app.globalData.openid]),
                    need:that.data.number-that.data.status,
                  }
                },
                )
                wx.showToast({
                title: '加入成功',
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
      console.log(app.globalData.openid);
      //console.log('id:',that.data.id,'openid:',that.data._openid);        
    },

    collect:function(){
      wx.showToast({
        title: '收藏成功',
        icon:'success',
        duration:2000
      })
      app.globalData.para=this.data.id
      
    },

})