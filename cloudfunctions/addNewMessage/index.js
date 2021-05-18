// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-3go8mya6a6d9ae16',})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const user = db.collection('user')
  const _ = db.command
  var flag=false
  var list=[]
  user.where({
    _openid: event.openid
  }).get({
    success(res) {
      list=res.data.newmessagelist
    }
  })
  for(var i=0;i<list.length;i++){
    if(list[i]==event.oppoid)
      flag=true
  }
  if(!flag){
    list[list.length]=event.oppoid
    user.where({
      _openid: event.openid
    }).update({
      data: {
        newmessagelist: list
      },
      success: res => {
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }

  return {
    event,
  }
}