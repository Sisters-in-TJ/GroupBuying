// 根据给定openid在users数据库中找到对应的用户名
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-9g9q4zpg30ad44b8',})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const user = db.collection('user')
  return user.where({
    _openid: event.openid,
  })
  .get()
}