// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-9g9q4zpg30ad44b8',})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const user = db.collection('user')
  const _ = db.command
  var flag1=false
  var flag2=false
  var list=[]
  user.where({
    _openid: event.id1
  }).get({
    success(res) {
      list=res.data.contactlist
    }
  })
  for(var i=0;i<list.length;i++){
    if(list[i]==event.id2)
      flag1=true
  }
  if(!flag1){
    list[list.length]=event.id2

    user.where({
      _openid: event.id1
    }).update({
      data: {
        contactlist: list
      },
      success: res => {
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }
 
  var list2=[]
  user.where({
    _openid: event.id2
  }).get({
    success(res) {
      list2=res.data.contactlist
    }
  })
  for(var i=0;i<list2.length;i++){
    if(list2[i]==event.id1)
      flag2=true
  }
  if(!flag2){
    list2[list2.length]=event.id1

    user.where({
      _openid: event.id2
    }).update({
      data: {
        contactlist: list2,
      },
      success: res => {
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      },
    })
  }

    return {
      event
    }
}