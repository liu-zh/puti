// 融云实现聊天功能
// 聊天输入框
function UIChatBox() {
    var UIChatBox = api.require('UIChatBox');
    UIChatBox.open({
        placeholder: '',
        autoFocus: false,
        emotionPath: 'widget://res/ChatBox/emotion',
        styles: {
            emotionBtn: {
                normalImg: 'widget://res/ChatBox/emotion/face1.png'
            },
            inputBox: {
                topMargin: 5,
                borderColor: 'rgba(0,0,0,0)'
            },
            indicator: {
                target: 'emotionPanel',
                color: '#c4c4c4',
                activeColor: '#9e9e9e'
            },
            sendBtn: {
                titleColor: '#606060',
                bg: '#B3B3B3',
                activeBg: '#606060',
                titleSize: 14
            }
        },
    }, function(ret, err) {
        if (ret.eventType == 'send') {
            sendMsg(ret.msg); //发送消息
        }
    });
}
// 接入融云
function rongyun() {
    var rong = api.require('rongCloud2');
    rong.init(function(ret, err) {
        if (ret.status == 'success') {
          // console.log(JSON.stringify(m))
            // 监听接收消息
            receiveMsg();
            rong.connect({
                token: $api.getStorage('rong_token')
            }, function(ret, err) {
              //rong.configurationParameter({});//消息推送
                // if (ret.status == 'success') api.toast({ msg: ret.result.userId });
            });
        } else {
            api.toast({
                msg: err.code
            });
        }
    });

}
// 监听接收消息
function receiveMsg() {
    var rong = api.require('rongCloud2');
    rong.setOnReceiveMessageListener(function(ret, err) {
      var msg = ret.result.message.content.text.replace(reg, function(a, b) {
          return face[a] ? face[a] : a;
      });
        api.sendEvent({
            name: 'receiveMsg',
            extra: {
                msg: msg,
                id:ret.result.message.targetId
            }
        });
    })
}
// 发送消息
function sendMsg(msg) {
    if ($api.trimAll(msg) == '') {
        api.toast({
            msg: '不能发送空消息',
            duration: 2000,
            location: 'bottom'
        });
    } else {
        var rong = api.require('rongCloud2');
        var sendMsg;
        rong.sendTextMessage({
            conversationType: 'PRIVATE',
            targetId: api.pageParam.id.user_id, // 接收方用户的id
            text: msg,
        }, function(ret, err) {
            if (ret.status == 'prepare') {
                // 获取发送的消息内容
                sendMsg = ret.result.message.content.text.replace(reg, function(a, b) {
                    return face[a] ? face[a] : a;
                });
            } else if (ret.status == 'success') {
                // 广播发送消息事件
                api.sendEvent({
                    name: 'sendMsg',
                    extra: {
                        msg: sendMsg,
                        id:ret.result.message.targetId,
                        person: {username: $api.getStorage('username'), userid: $api.getStorage('userid'), tx: $api.getStorage('usertx')}
                    }
                });
            } else if (ret.status == 'error') {
                api.toast({
                    msg: '网络错误',
                    duration: 2000,
                    location: 'bottom'
                });

            }
        });
    }
}
// 滚动到页面底部
function slideBut() {
    $api.dom('.main').scrollIntoView(false);
}
// 接收消息后新建消息
function addReceMsg(msg) {
    $api.append($api.dom('.main'), '<div class="left-box"><img src="' + api.pageParam.id.avatar + '" onclick="left()"/><div class="left">' + msg + '</div></div>');
    slideBut();
}
// 发送消息后新建消息
function addSendMsg(msg) {
    $api.append($api.dom('.main'), '<div class="right-box"><div class="right">' + msg + ' </div><img src="' + $api.getStorage('usertx') + '" onclick="right()"/></div>');
    slideBut();
}
// 添加聊天记录(接收), 放在顶部
function addReceMsgTop(msg) {
    $api.prepend($api.dom('.main'), '<div class="left-box"><img src="' + api.pageParam.id.avatar + '" /><div class="left">' + msg + '</div></div>');
    // slideBut();
}
// 添加聊天记录(发送),放在顶部
function addSendMsgTop(msg) {
    $api.prepend($api.dom('.main'), '<div class="right-box"><div class="right">' + msg + ' </div><img src="' + $api.getStorage('usertx') + '" /></div>');
    // slideBut();
}
var chatmsg_num = 40;// 每次获取的聊天数(刚开始就已获取20条)
var chatmsg_id = 0;// 总的聊天记录数
var slice_num = 20; //每次截取的条数
// 获取最近的聊天记录
function getLatestMessages() {
    var rong = api.require('rongCloud2');
    rong.getLatestMessages({
        conversationType: 'PRIVATE',
        targetId: api.pageParam.id.user_id,
        count: 20
    }, function(ret, err) {
        // chatmsg_id = ret.result[0].messageId;
        // console.log(JSON.stringify(ret))
        for (var i = ret.result.length - 1; i >= 0; i--) {
            if (ret.result[i].messageDirection == 'RECEIVE') {
                // 消息方向：SEND(发送) 或者 RECEIVE(接受)
                var msg = ret.result[i].content.text.replace(reg, function(a, b) {
                    return face[a] ? face[a] : a;
                });
                addReceMsg(msg)
            } else {
                var msg = ret.result[i].content.text.replace(reg, function(a, b) {
                    return face[a] ? face[a] : a;
                });
                addSendMsg(msg);
            }
        }
    })
}
//下滑获取更多聊天记录
function getLatestMessages1() {
    var rong = api.require('rongCloud2');
    rong.getLatestMessages({
        conversationType: 'PRIVATE',
        targetId: api.pageParam.id.user_id,
        count: chatmsg_num
    }, function(ret, err) {
        chatmsg_num += 20;
        var data = ret.result.slice(slice_num);
        slice_num += 20;
        for (var i = data.length - 1; i >= 0; i--) {
            if (data[i].messageDirection == 'RECEIVE') {
                // 消息方向：SEND(发送) 或者 RECEIVE(接受)
                var msg = data[i].content.text.replace(reg, function(a, b) {
                    return face[a] ? face[a] : a;
                });
                addReceMsgTop(msg)
            } else {
                var msg = data[i].content.text.replace(reg, function(a, b) {
                    return face[a] ? face[a] : a;
                });
                addSendMsgTop(msg);
            }
        }
    })
}
// 退出登录 断开融云链接  不再接收融云的消息
function logout(){
  var rong = api.require('rongCloud2');
  rong.init(function(ret, err) {
      if (ret.status == 'success') {
          rong.connect({
              token: $api.getStorage('rong_token')
          }, function(ret, err) {
            rong.logout(function(ret, err) {});
          });
      } else {
          api.toast({
              msg: err.code
          });
      }
  });
}


//表情符号
var reg = /\[.+?\]/g;
var face = {
  '[微笑]' : '<span><img src="../../res/ChatBox/emotion/Expression_1.png"  width="28" class="icon" /></span>',
  '[撇嘴]' : '<span><img src="../../res/ChatBox/emotion/Expression_2.png"  width="28" class="icon" /></span>',
  '[色]' : '<span><img src="../../res/ChatBox/emotion/Expression_3.png"  width="28" class="icon" /></span>',
  '[发呆]' : '<span><img src="../../res/ChatBox/emotion/Expression_4.png"  width="28" class="icon" /></span>',
  '[得意]' : '<span><img src="../../res/ChatBox/emotion/Expression_5.png"  width="28" class="icon" /></span>',
  '[流泪]' : '<span><img src="../../res/ChatBox/emotion/Expression_6.png"  width="28" class="icon" /></span>',
  '[害羞]' : '<span><img src="../../res/ChatBox/emotion/Expression_7.png"  width="28" class="icon" /></span>',
  '[闭嘴]' : '<span><img src="../../res/ChatBox/emotion/Expression_8.png"  width="28" class="icon" /></span>',
  '[睡]' : '<span><img src="../../res/ChatBox/emotion/Expression_9.png"  width="28" class="icon" /></span>',
  '[大哭]' : '<span><img src="../../res/ChatBox/emotion/Expression_10.png"  width="28" class="icon" /></span>',
  '[尴尬]' : '<span><img src="../../res/ChatBox/emotion/Expression_11.png"  width="28" class="icon" /></span>',
  '[发怒]' : '<span><img src="../../res/ChatBox/emotion/Expression_12.png"  width="28" class="icon" /></span>',
  '[调皮]' : '<span><img src="../../res/ChatBox/emotion/Expression_13.png"  width="28" class="icon" /></span>',
  '[呲牙]' : '<span><img src="../../res/ChatBox/emotion/Expression_14.png"  width="28" class="icon" /></span>',
  '[惊讶]' : '<span><img src="../../res/ChatBox/emotion/Expression_15.png"  width="28" class="icon" /></span>',
  '[难过]' : '<span><img src="../../res/ChatBox/emotion/Expression_16.png"  width="28" class="icon" /></span>',
  '[酷]' : '<span><img src="../../res/ChatBox/emotion/Expression_17.png"  width="28" class="icon" /></span>',
  '[冷汗]' : '<span><img src="../../res/ChatBox/emotion/Expression_18.png"  width="28" class="icon" /></span>',
  '[抓狂]' : '<span><img src="../../res/ChatBox/emotion/Expression_19.png"  width="28" class="icon" /></span>',
  '[吐]' : '<span><img src="../../res/ChatBox/emotion/Expression_20.png"  width="28" class="icon" /></span>',
  '[偷笑]' : '<span><img src="../../res/ChatBox/emotion/Expression_21.png"  width="28" class="icon" /></span>',
  '[愉快]' : '<span><img src="../../res/ChatBox/emotion/Expression_22.png"  width="28" class="icon" /></span>',
  '[白眼]' : '<span><img src="../../res/ChatBox/emotion/Expression_23.png"  width="28" class="icon" /></span>',
  '[傲慢]' : '<span><img src="../../res/ChatBox/emotion/Expression_24.png"  width="28" class="icon" /></span>',
  '[饥饿]' : '<span><img src="../../res/ChatBox/emotion/Expression_25.png"  width="28" class="icon" /></span>',
  '[困]' : '<span><img src="../../res/ChatBox/emotion/Expression_26.png"  width="28" class="icon" /></span>',
  '[恐惧]' : '<span><img src="../../res/ChatBox/emotion/Expression_27.png"  width="28" class="icon" /></span>',
  '[流汗]' : '<span><img src="../../res/ChatBox/emotion/Expression_28.png"  width="28" class="icon" /></span>',
  '[憨笑]' : '<span><img src="../../res/ChatBox/emotion/Expression_29.png"  width="28" class="icon" /></span>',
  /*从这*/
  '[悠闲]' : '<span><img src="../../res/ChatBox/emotion/Expression_30.png"  width="28" class="icon" /></span>',
  '[奋斗]' : '<span><img src="../../res/ChatBox/emotion/Expression_31.png"  width="28" class="icon" /></span>',
  '[咒骂]' : '<span><img src="../../res/ChatBox/emotion/Expression_32.png"  width="28" class="icon" /></span>',
  '[疑问]' : '<span><img src="../../res/ChatBox/emotion/Expression_33.png"  width="28" class="icon" /></span>',
  '[嘘]' : '<span><img src="../../res/ChatBox/emotion/Expression_34.png"  width="28" class="icon" /></span>',
  '[晕]' : '<span><img src="../../res/ChatBox/emotion/Expression_35.png"  width="28" class="icon" /></span>',
  '[疯了]' : '<span><img src="../../res/ChatBox/emotion/Expression_36.png"  width="28" class="icon" /></span>',
  '[衰]' : '<span><img src="../../res/ChatBox/emotion/Expression_37.png"  width="28" class="icon" /></span>',
  '[骷髅]' : '<span><img src="../../res/ChatBox/emotion/Expression_38.png"  width="28" class="icon" /></span>',
  '[敲打]' : '<span><img src="../../res/ChatBox/emotion/Expression_39.png"  width="28" class="icon" /></span>',
  '[再见]' : '<span><img src="../../res/ChatBox/emotion/Expression_40.png"  width="28" class="icon" /></span>',
  '[擦汗]' : '<span><img src="../../res/ChatBox/emotion/Expression_41.png"  width="28" class="icon" /></span>',
  '[抠鼻]' : '<span><img src="../../res/ChatBox/emotion/Expression_42.png"  width="28" class="icon" /></span>',
  '[鼓掌]' : '<span><img src="../../res/ChatBox/emotion/Expression_43.png"  width="28" class="icon" /></span>',
  '[糗大了]' : '<span><img src="../../res/ChatBox/emotion/Expression_44.png"  width="28" class="icon" /></span>',
  '[坏笑]' : '<span><img src="../../res/ChatBox/emotion/Expression_45.png"  width="28" class="icon" /></span>',
  '[左哼哼]' : '<span><img src="../../res/ChatBox/emotion/Expression_46.png"  width="28" class="icon" /></span>',
  '[右哼哼]' : '<span><img src="../../res/ChatBox/emotion/Expression_47.png"  width="28" class="icon" /></span>',
  '[哈欠]' : '<span><img src="../../res/ChatBox/emotion/Expression_48.png"  width="28" class="icon" /></span>',
  '[鄙视]' : '<span><img src="../../res/ChatBox/emotion/Expression_49.png"  width="28" class="icon" /></span>',
  '[委屈]' : '<span><img src="../../res/ChatBox/emotion/Expression_50.png"  width="28" class="icon" /></span>',
  '[快哭了]' : '<span><img src="../../res/ChatBox/emotion/Expression_51.png"  width="28" class="icon" /></span>',
  '[阴险]' : '<span><img src="../../res/ChatBox/emotion/Expression_52.png"  width="28" class="icon" /></span>',
  '[亲亲]' : '<span><img src="../../res/ChatBox/emotion/Expression_53.png"  width="28" class="icon" /></span>',
  '[吓]' : '<span><img src="../../res/ChatBox/emotion/Expression_54.png"  width="28" class="icon" /></span>',
  '[可怜]' : '<span><img src="../../res/ChatBox/emotion/Expression_55.png"  width="28" class="icon" /></span>',
  '[菜刀]' : '<span><img src="../../res/ChatBox/emotion/Expression_56.png"  width="28" class="icon" /></span>',
  '[西瓜]' : '<span><img src="../../res/ChatBox/emotion/Expression_57.png"  width="28" class="icon" /></span>',
  '[啤酒]' : '<span><img src="../../res/ChatBox/emotion/Expression_58.png"  width="28" class="icon" /></span>',
  '[篮球]' : '<span><img src="../../res/ChatBox/emotion/Expression_59.png"  width="28" class="icon" /></span>',
  '[乒乓]' : '<span><img src="../../res/ChatBox/emotion/Expression_60.png"  width="28" class="icon" /></span>',
  '[咖啡]' : '<span><img src="../../res/ChatBox/emotion/Expression_61.png"  width="28" class="icon" /></span>',
  '[饭]' : '<span><img src="../../res/ChatBox/emotion/Expression_62.png"  width="28" class="icon" /></span>',
  '[猪头]' : '<span><img src="../../res/ChatBox/emotion/Expression_63.png"  width="28" class="icon" /></span>',
  '[玫瑰]' : '<span><img src="../../res/ChatBox/emotion/Expression_64.png"  width="28" class="icon" /></span>',
  '[凋谢]' : '<span><img src="../../res/ChatBox/emotion/Expression_65.png"  width="28" class="icon" /></span>',
  '[嘴唇]' : '<span><img src="../../res/ChatBox/emotion/Expression_66.png"  width="28" class="icon" /></span>',
  '[爱心]' : '<span><img src="../../res/ChatBox/emotion/Expression_67.png"  width="28" class="icon" /></span>',
  '[心碎]' : '<span><img src="../../res/ChatBox/emotion/Expression_68.png"  width="28" class="icon" /></span>',
  '[蛋糕]' : '<span><img src="../../res/ChatBox/emotion/Expression_69.png"  width="28" class="icon" /></span>',
  '[闪电]' : '<span><img src="../../res/ChatBox/emotion/Expression_70.png"  width="28" class="icon" /></span>',
  '[炸弹]' : '<span><img src="../../res/ChatBox/emotion/Expression_71.png"  width="28" class="icon" /></span>',
  '[刀]' : '<span><img src="../../res/ChatBox/emotion/Expression_72.png"  width="28" class="icon" /></span>',
  '[足球]' : '<span><img src="../../res/ChatBox/emotion/Expression_73.png"  width="28" class="icon" /></span>',
  '[瓢虫]' : '<span><img src="../../res/ChatBox/emotion/Expression_74.png"  width="28" class="icon" /></span>',
  '[便便]' : '<span><img src="../../res/ChatBox/emotion/Expression_75.png"  width="28" class="icon" /></span>',
  '[月亮]' : '<span><img src="../../res/ChatBox/emotion/Expression_76.png"  width="28" class="icon" /></span>',
  '[太阳]' : '<span><img src="../../res/ChatBox/emotion/Expression_77.png"  width="28" class="icon" /></span>',
  '[礼物]' : '<span><img src="../../res/ChatBox/emotion/Expression_78.png"  width="28" class="icon" /></span>',
  '[拥抱]' : '<span><img src="../../res/ChatBox/emotion/Expression_79.png"  width="28" class="icon" /></span>',
  '[强]' : '<span><img src="../../res/ChatBox/emotion/Expression_80.png"  width="28" class="icon" /></span>',
  '[弱]' : '<span><img src="../../res/ChatBox/emotion/Expression_81.png"  width="28" class="icon" /></span>',
  '[握手]' : '<span><img src="../../res/ChatBox/emotion/Expression_82.png"  width="28" class="icon" /></span>',
  '[胜利]' : '<span><img src="../../res/ChatBox/emotion/Expression_83.png"  width="28" class="icon" /></span>',
  '[抱拳]' : '<span><img src="../../res/ChatBox/emotion/Expression_84.png"  width="28" class="icon" /></span>',
  '[勾引]' : '<span><img src="../../res/ChatBox/emotion/Expression_85.png"  width="28" class="icon" /></span>',
  '[拳头]' : '<span><img src="../../res/ChatBox/emotion/Expression_86.png"  width="28" class="icon" /></span>',
  '[差劲]' : '<span><img src="../../res/ChatBox/emotion/Expression_87.png"  width="28" class="icon" /></span>',
  '[爱你]' : '<span><img src="../../res/ChatBox/emotion/Expression_88.png"  width="28" class="icon" /></span>',
  '[NO]' : '<span><img src="../../res/ChatBox/emotion/Expression_89.png"  width="28" class="icon" /></span>',
  '[OK]' : '<span><img src="../../res/ChatBox/emotion/Expression_90.png"  width="28" class="icon" /></span>',
  '[爱情]' : '<span><img src="../../res/ChatBox/emotion/Expression_91.png"  width="28" class="icon" /></span>',
  '[飞吻]' : '<span><img src="../../res/ChatBox/emotion/Expression_92.png"  width="28" class="icon" /></span>',
  '[跳跳]' : '<span><img src="../../res/ChatBox/emotion/Expression_93.png"  width="28" class="icon" /></span>',
  '[发抖]' : '<span><img src="../../res/ChatBox/emotion/Expression_94.png"  width="28" class="icon" /></span>',
  '[怄火]' : '<span><img src="../../res/ChatBox/emotion/Expression_95.png"  width="28" class="icon" /></span>',
  '[转圈]' : '<span><img src="../../res/ChatBox/emotion/Expression_96.png"  width="28" class="icon" /></span>',
  '[磕头]' : '<span><img src="../../res/ChatBox/emotion/Expression_97.png"  width="28" class="icon" /></span>',
  '[回头]' : '<span><img src="../../res/ChatBox/emotion/Expression_98.png"  width="28" class="icon" /></span>',
  '[跳绳]' : '<span><img src="../../res/ChatBox/emotion/Expression_99.png"  width="28" class="icon" /></span>',
  '[投降]' : '<span><img src="../../res/ChatBox/emotion/Expression_100.png"  width="28" class="icon" /></span>',
  '[激动]' : '<span><img src="../../res/ChatBox/emotion/Expression_101.png"  width="28" class="icon" /></span>',
  '[街舞]' : '<span><img src="../../res/ChatBox/emotion/Expression_102.png"  width="28" class="icon" /></span>',
  '[献吻]' : '<span><img src="../../res/ChatBox/emotion/Expression_103.png"  width="28" class="icon" /></span>',
  '[左太极]' : '<span><img src="../../res/ChatBox/emotion/Expression_104.png"  width="28" class="icon" /></span>',
  '[右太极]' : '<span><img src="../../res/ChatBox/emotion/Expression_105.png"  width="28" class="icon" /></span>'
};
