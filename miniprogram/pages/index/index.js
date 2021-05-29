// index.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database();
const _ = db.command;
const config = require("../../config.js");

Page({
  data: {
    kind: JSON.parse(config.data).kind,
    indexCur:-2,
    showList: false,
    scrollTop: 0,
    nomore: false,
    list: [],
    show:false,
    multiIndex:[]
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    this.getMultiArray(this).then(()=>{
      this.listkind();
      this.getList();
    })
    var curtime = Date.parse(new Date());
    var time = Date.parse(new Date(2021,4,5))
    if(curtime.valueOf()<time.valueOf()){
      this.setData({
            show:false
      })
    }
    else{
      this.setData({
            show:true
      })
    }
  },
  //监测屏幕滚动
  onPageScroll: function(e) {
      this.setData({
            scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
      })
},
  getMultiArray:function(that){
      return new Promise(function (resolve, reject) {
        db.collection('cityDataArr').doc("3d27439a60adf5270003fcb420987c30")
        .get({
          success: res=>{
            that.setData({
              multiArray:res.data.data
            })
            resolve(res)
          },
          fail: res=>(
            reject(res)
          )
        })
      })
    },
   //获取上次布局记忆
   listkind() {
      let that = this;
      wx.getStorage({
            key: 'iscard',
            success: function(res) {
                  that.setData({
                        iscard: res.data
                  })
            },
            fail() {
                  that.setData({
                        iscard: true,
                  })
            }
      })
},
  //跳转搜索
  goSearch(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
  //布局方式选择
  changeCard() {
    let that = this;
    if (that.data.iscard) {
          that.setData({
                iscard: false
          })
          wx.setStorage({
                key: 'iscard',
                data: false,
          })
    } else {
          that.setData({
                iscard: true
          })
          wx.setStorage({
                key: 'iscard',
                data: true,
          })
    }
},
//分类选择
kindSelect(e) {
  this.setData({
        indexCur: e.currentTarget.dataset.id ,
        scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
        showList: false,
  })
  this.getList();
},
//选择全部
  selectAll() {
    this.setData({
          indexCur: -2,
          scrollLeft: -200,
          showList: false,
    })
    this.getList();
  }, 
  //展示列表小面板
  showlist() {
    let that = this;
    if (that.data.showList) {
        that.setData({
              showList: false,
        })
    } else {
        that.setData({
              showList: true,
        })
    }
  },

  getList() { 
  let that = this;
  if (that.data.indexCur == -2) {
        var index = _.neq(-2); //除-2之外所有
  } else {
        var index = that.data.indexCur + '' //小程序搜索必须对应格式
  }
  
//   console.log(index)
//       wx.cloud.callFunction({
//         name: 'getAllPost',
//         data: {
//             index:index,
//         },
//         success: res => {
//               console.log(res)
//         },
//         fail: err => {
//           console.error('[云函数] [addContact] 调用失败：', err)
//         }
//       })
  db.collection('post').where({
        need: _.neq(0),
        dura: _.gt(new Date().getTime()),
        index: index
  }).orderBy('creat', 'desc').limit(20).get({
        success: function(res) {
              wx.stopPullDownRefresh(); //暂停刷新动作
              if (res.data.length == 0) {
                    that.setData({
                          nomore: true,
                          list: [],
                    })
                    return false;
              }
              if (res.data.length < 20) {
                    that.setData({
                          nomore: true,
                          page: 0,
                          list: res.data,
                    })
              } else {
                    that.setData({
                          page: 0,
                          list: res.data,
                          nomore: false,
                    })
              }
        }
  })
},
 //跳转详情
detail(e) {
      let that = this;
      var detailID=e.currentTarget.dataset.id;
      wx.navigateTo({
            url: '/pages/detail/detail?scene=' + detailID,
      })
},
more() {
      let that = this;
      if (that.data.nomore || that.data.list.length < 20) {
            return false
      }
      let page = that.data.page + 1;
      if (that.data.indexCur == -2) {
            var index = _.neq(-2); //除-2之外所有
      } else {
            var index = that.data.indexCur + '' //小程序搜索必须对应格式
      }
      db.collection('publish').where({
            //status: 0,
            //dura: _.gt(new Date().getTime()),
            index : index
      }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
                  if (res.data.length == 0) {
                        that.setData({
                              nomore: true
                        })
                        return false;
                  }
                  if (res.data.length < 20) {
                        that.setData({
                              nomore: true
                        })
                  }
                  that.setData({
                        page: page,
                        list: that.data.list.concat(res.data)
                  })
            },
            fail() {
                  wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                  })
            }
      })
},
//下拉刷新
onPullDownRefresh() {
      this.getList();
},
gotop() {
      wx.pageScrollTo({
            scrollTop: 0
      })
},
onReachBottom() {
      this.more();
},
})
