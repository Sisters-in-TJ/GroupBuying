const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 100000,
  scrollWithAnimation: true,
}

Component({
  properties: {
    envId: String,
    collection: String,
    groupId: String,
    groupName: String,
    userInfo: Object,
    sendRequest: Boolean,
    onGetUserInfo: {
      type: Function,
    },
    getOpenID: {
      type: Function,
    },
  },

  data: {
    chats: [],
    textInputValue: '',
    openId: '',
    scrollTop: 0,
    scrollToMessage: '',
    hasKeyboard: false,
    requestChats: [],   // 未定状态的拼单加入请求
  },

  methods: {
    onGetUserInfo(e) {
      this.properties.onGetUserInfo(e)
    },

    getOpenID() { 
      return this.properties.getOpenID() 
    },

    mergeCommonCriteria(criteria) {
      return {
        groupId: this.data.groupId,
        ...criteria,
      }
    },

    async initRoom() {
      this.try(async () => {
        await this.initOpenID()

        const { envId, collection } = this.properties
        this.db = wx.cloud.database({
          env: envId,
        })
        const db = this.db
        const _ = db.command

        const { data: initList } = await db.collection(collection).where(this.mergeCommonCriteria()).orderBy('sendTimeTS', 'desc').get()

        console.log('init query chats', initList)

        this.setData({
          chats: initList.reverse(),
          scrollTop: 10000,
        })

        for(var i=0;i<this.data.chats.length;i++){
          if(this.data.chats[i].msgType=="request" && this.data.chats[i].requestStatus==0){
            let change = "requestChats[" + this.data.requestChats.length + "]"
            this.setData({
              [change]: this.data.chats[i]._id
            })
          }
        }

        this.initWatch(initList.length ? {
          sendTimeTS: _.gt(initList[initList.length - 1].sendTimeTS),
        } : {})

        var list=this.data.groupId.split('/',2)
        var oppoId
        for(var i=0;i<list.length;i++){
          if(list[i]!=this.data.openId)
            oppoId=list[i]
        }
        this.deleteNewMessageList(this.data.openId,oppoId)
      }, '初始化失败')
    },

    
  deleteNewMessageList: function(openid,oppoid){
    const db = wx.cloud.database()
    const user = db.collection('user')
    const _ = db.command
    var list=[]
    user.where({
      _openid: openid
    }).get({
      success(res) {
        list=res.data[0].newmessagelist
        for(var i=0;i<list.length;i++){
          if(list[i]==oppoid){
            list.splice(i,1)
            user.where({
              _openid: openid
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
            break
          }
        }
      },
    })
  },
    async initOpenID() {
      return this.try(async () => {
        const openId = await this.getOpenID()

        this.setData({
          openId,
        })
      }, '初始化 openId 失败')
    },

    async initWatch(criteria) {
      this.try(() => {
        const { collection } = this.properties
        const db = this.db
        const _ = db.command
        const openId=this.data.openId

        console.warn(`开始监听`, criteria)
        // 监听1：接收消息
        this.messageListener = db.collection(collection).where(this.mergeCommonCriteria(criteria)).watch({
          onChange: this.onRealtimeMessageSnapshot.bind(this),
          onError: e => {
            if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
              this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
                this.initWatch(this.data.chats.length ? {
                  sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                } : {})
              })
            } else {
              this.initWatch(this.data.chats.length ? {
                sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
              } : {})
            }
          },
        })

        // 监听2：拼单请求变化（同意/拒绝）
        for(var i=0;i<this.data.requestChats.length;i++){
          const watcher = db.collection('chatroom').doc(this.data.requestChats[i])
          .watch({
            onChange: function(snapshot) {
              if(snapshot.type!=="init" && snapshot.docs[0]._openid===openId){
                if(snapshot.docs[0].requestStatus===1){
                  wx.showModal({
                    title: '您已加入此拼单',
                    content: snapshot.docs[0].postName,
                    showCancel: false,
                 })
                }
                else if(snapshot.docs[0].requestStatus===2){
                  wx.showModal({
                    title: '您已被拒绝加入此拼单',
                    content: snapshot.docs[0].postName,
                    showCancel: false,
                 })
                }
              }
            },
            onError: function(err) {
              console.error('the watch closed because of error', err)
            }
          })
        }
      }, '初始化监听失败')
    },

    onRealtimeMessageSnapshot(snapshot) {
      console.warn(`收到消息`, snapshot)

      if (snapshot.type === 'init') {
        this.setData({
          chats: [
            ...this.data.chats,
            ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS),
          ],
        })
        this.scrollToBottom()
        this.inited = true
      } else {
        let hasNewMessage = false
        let hasOthersMessage = false
        const chats = [...this.data.chats]
        for (const docChange of snapshot.docChanges) {
          switch (docChange.queueType) {
            case 'enqueue': {
              hasOthersMessage = docChange.doc._openid !== this.data.openId
              const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
              if (ind > -1) {
                if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                  chats.splice(ind, 1, {
                    ...docChange.doc,
                    tempFilePath: chats[ind].tempFilePath,
                  })
                } else chats.splice(ind, 1, docChange.doc)
              } else {
                hasNewMessage = true
                chats.push(docChange.doc)
              }
              break
            }
          }
        }
        this.setData({
          chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
        })
        // 添加newmessagelist
        var openid=snapshot.docChanges[0].doc._openid
        if(openid===this.data.openId){
          var list=this.data.groupId.split('/',2)
          var oppoId
          for(var i=0;i<list.length;i++){
            if(list[i]!=this.data.openId)
              oppoId=list[i]
          }
          wx.cloud.callFunction({
            name: 'addNewMessage',
            data: {
              openid:oppoId,
              oppoid:this.data.openId
            },
            success: res => {
              console.log('newmessagelist更新成功')
            },
            fail: err => {
              console.error('[云函数] [addNewMessage] 调用失败：', err)
            }
          })
        }
        this.deleteNewMessageList(this.data.openId,oppoId)
        if (hasOthersMessage || hasNewMessage) {
          this.scrollToBottom()
        }
      }
    },

    async onConfirmSendText(e) {
      this.try(async () => {
        if (!e.detail.value) {
          return
        }

        const { collection } = this.properties
        const db = this.db
        const _ = db.command

        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.name,
          msgType: 'text',  // 'request' 'answer'
          textContent: e.detail.value,
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }

        this.setData({
          textInputValue: '',
          chats: [
            ...this.data.chats,
            {
              ...doc,
              _openid: this.data.openId,
              writeStatus: 'pending',
            },
          ],
        })
        this.scrollToBottom(true)

        await db.collection(collection).add({
          data: doc,
        })

        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
        this.onAddContact()
      }, '发送文字失败')
    },

    async onChooseImage(e) {
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async res => {
          const { envId, collection } = this.properties
          const doc = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: this.data.userInfo.avatarUrl,
            nickName: this.data.userInfo.nickName,
            msgType: 'image',
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }

          this.setData({
            chats: [
              ...this.data.chats,
              {
                ...doc,
                _openid: this.data.openId,
                tempFilePath: res.tempFilePaths[0],
                writeStatus: 0,
              },
            ]
          })
          this.scrollToBottom(true)

          const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
            filePath: res.tempFilePaths[0],
            config: {
              env: envId,
            },
            success: res => {
              this.try(async () => {
                await this.db.collection(collection).add({
                  data: {
                    ...doc,
                    imgFileID: res.fileID,
                  },
                })
              }, '发送图片失败')
            },
            fail: e => {
              this.showError('发送图片失败', e)
            },
          })

          uploadTask.onProgressUpdate(({ progress }) => {
            this.setData({
              chats: this.data.chats.map(chat => {
                if (chat._id === doc._id) {
                  return {
                    ...chat,
                    writeStatus: progress,
                  }
                } else return chat
              })
            })
          })
        },
      })
      this.onAddContact()
    },

    // 如果是双方第一条消息，更新User表中contactlist字段
    onAddContact(){
      var list=this.data.groupId.split('/',2)
      var oppoId
      for(var i=0;i<list.length;i++){
        if(list[i]!=this.data.openId)
          oppoId=list[i]
      }

      //调用addContact，更新user
      wx.cloud.callFunction({
        name: 'addContact',
        data: {
          id1:this.data.openId,
          id2:oppoId
        },
        success: res => {
          console.log('联系人加入成功')
        },
        fail: err => {
          console.error('[云函数] [addContact] 调用失败：', err)
        }
      })
    },

    onMessageImageTap(e) {
      wx.previewImage({
        urls: [e.target.dataset.fileid],
      })
    },

    scrollToBottom(force) {
      if (force) {
        console.log('force scroll to bottom')
        this.setData(SETDATA_SCROLL_TO_BOTTOM)
        return
      }
      

      this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
        this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
          if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
            console.log('should scroll to bottom')
            this.setData(SETDATA_SCROLL_TO_BOTTOM)
          }
        }).exec()
      }).exec()
    },

    async onScrollToUpper() {
      if (this.db && this.data.chats.length) {
        const { collection } = this.properties
        const _ = this.db.command
        const { data } = await this.db.collection(collection).where(this.mergeCommonCriteria({
          sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
        })).orderBy('sendTimeTS', 'desc').get()
        this.data.chats.unshift(...data.reverse())
        this.setData({
          chats: this.data.chats,
          scrollToMessage: `item-${data.length}`,
          scrollWithAnimation: false,
        })
      }
    },

    async try(fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e)
      }
    },

    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: res => {
          res.confirm && confirmCallback()
        },
      })
    },

    // 优化时可以考虑这一部分的代码复用，三个函数合并
    // 同意后要更新数据库中数据，如拼单人数，个人已拼单
    async onClickAccept(event){
      const db = wx.cloud.database()
      await db.collection('chatroom').doc(event.currentTarget.dataset.request._id).update({
        data: {
         requestStatus: 1
        },
      })
      var postid=event.currentTarget.dataset.request.textContent
      var applyid=event.currentTarget.dataset.request._openid
      this.joinAndUpdate(postid,applyid)
      this.initRoom()
    },

    async onClickReject(event){
      const db = wx.cloud.database()
      await db.collection('chatroom').doc(event.currentTarget.dataset.request._id).update({
        data: {
         requestStatus: 2
        },
       })
      this.initRoom()
    },

    async onClickCancel(event){
      const db = wx.cloud.database()
      await db.collection('chatroom').doc(event.currentTarget.dataset.request._id).update({
        data: {
         requestStatus: 3
        },
       })
      this.initRoom()
    },
     //跳转详情
    detail(e) {
      var detailID=e.currentTarget.dataset.id;
      wx.navigateTo({
            url: '/pages/detail/detail?scene=' + detailID,
      })
    },
    // 加入拼单
    async joinAndUpdate(postid, applyid){
      wx.showModal({
        title:'提示',
        content:'同意此人加入拼单？',
        cancelColor: 'cancelColor',
        success: function(res) {
          if (res.confirm) {
            const db = wx.cloud.database()
            const _ = db.command
            db.collection('user').where({
              _openid:applyid
            }).update({
              data:{
                addidlist:_.push([postid]),
              }
            })
            db.collection('post').doc(postid).update({
              data:{
                status:_.inc(1),
                openidList:_.push([applyid]),
                need:_.inc(-1)
              }
            })
            wx.showToast({
              title: '加入成功',
              duration:2000,
              mask:true
            })       
          } else if (res.cancel) {
            console.log('用户点击取消同意');
          }
        }
      })
    },
  },

  ready() {
    global.chatroom = this
    this.initRoom()
    this.fatalRebuildCount = 0
  },
})
