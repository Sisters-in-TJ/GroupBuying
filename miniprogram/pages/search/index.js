// pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({
  data: {
        scrollTop: 0,
        newlist: [],
        list: [],
        key: '',
        blank: false,
        hislist: [],
        nomore:false,
  },
  onLoad: function (options) {
    this.gethis();
  },
  gethis() {
    let that = this;
    wx.getStorage({
          key: 'history',
          success: function(res) {
                let hislist = JSON.parse(res.data);
                //限制长度
                if (hislist.length > 5) {
                      hislist.length = 5
                }
                that.setData({
                      hislist: hislist
                })
          },
    })
},
choosekey(e) {
  this.data.key = e.currentTarget.dataset.key;
  this.search('his');
},
  search(n) {
    let that = this;
    let key = that.data.key;
    if (key == '') {
          wx.showToast({
                title: '请输入关键词',
                icon: 'none',
          })
          return false;
    }
    wx.setNavigationBarTitle({
          title:'"'+ that.data.key + '"的搜索结果',
    })
    wx.showLoading({
          title: '加载中',
    })
    if (n !== 'his') {
          that.history(key);
    }
    db.collection('post').where({
          key: db.RegExp({
                regexp: '.*' + key + '.*',
                options: 'i',
          }),
          need: _.neq(0),
        //dura: _.gt(new Date().getTime()),
    }).orderBy('creat', 'desc').limit(20).get({
          success: res => {
                wx.hideLoading();
                that.setData({
                      blank: true,
                      page: 0,
                      list: res.data,
                      nomore: false,
                })
                console.log('[数据库] [查询记录] 成功: ', res)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          },
    })
},

history(key) {
  let that = this;
  wx.getStorage({
        key: 'history',
        success(res) {
              let oldarr = JSON.parse(res.data); //字符串转数组
              let newa = [key]; //对象转为数组
              let newarr = JSON.stringify(newa.concat(oldarr)); //连接数组\转字符串
              wx.setStorage({
                    key: 'history',
                    data: newarr,
              })
        },
        fail(res) {
              //第一次打开时获取为null
              let newa = [key]; //对象转为数组
              var newarr = JSON.stringify(newa); //数组转字符串
              wx.setStorage({
                    key: 'history',
                    data: newarr,
              })
        }
  });
},
keyInput(e) {
  this.data.key = e.detail.value
},
detail(e) {
  let that = this;
  wx.navigateTo({
        url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
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
})