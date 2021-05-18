// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-3go8mya6a6d9ae16',})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const user = db.collection('post')
  return user.where({
    _id: event._id,
  })
  .get()
}