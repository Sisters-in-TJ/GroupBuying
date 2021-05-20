var data = {
      //云开发环境id
      env: 'cloud-group-0grmohzw06a018ef',
      //分享配置
      share_title: 'groupbuying',
      kind: [
            {
                  name: '拼车',
                  id: 0
            },
            {
                  name: '娱乐',
                  id: 1
            },
            {
                  name: '网购',
                  id: 2
            },
            {
                  name: '外卖',
                  id: 3
            },
            {
                  name: '其他',
                  id: 4
            },
      ],
}
//下面的就别动了
function formTime(creatTime) {
      let date = new Date(creatTime),
            Y = date.getFullYear(),
            M = date.getMonth() + 1,
            D = date.getDate(),
            H = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();
      if (M < 10) {
            M = '0' + M;
      }
      if (D < 10) {
            D = '0' + D;
      }
      if (H < 10) {
            H = '0' + H;
      }
      if (m < 10) {
            m = '0' + m;
      }
      if (s < 10) {
            s = '0' + s;
      }
      return Y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s;
}

function days() {
      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();
      if (month < 10) {
            month = '0' + month;
      }
      if (day < 10) {
            day = '0' + day;
      }
      let date = year + "" + month + day;
      return date;
}
module.exports = {
      data: JSON.stringify(data),
      formTime: formTime,
      days: days
}