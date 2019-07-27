// 检测是否登录
function openWin1(name,isTrue, params) {
    //需要先登陆
    if ($api.getStorage('token') === undefined && isTrue) {
      api.openWin({
          name: name,
          url: 'widget://html/login.html',
          pageParam: params,
      });
    } else {
      api.openWin({
          name: name,
          url: 'widget://html/' + name + '.html',
          pageParam: params,
      });
    }
}
//极光推送
var jpush = null;
function noticePush() {
    var token = $api.getStorage('token');
    jpush = api.require('ajpush');
    //初始化
    jpush.init();
    jpush.setListener(function(ret) {
        var id = ret.id; //消息ID
        var title = ret.title; //消息标题
        var content = ret.content; //消息内容
        var extra = ret.extra; //额外键值对
    });
    jpush.getRegistrationId(function(ret) {
        var param = {
            alias: ret.id
        };
        jpush.bindAliasAndTags(param, function(ret1) {
            if (token && ret1.statusCode == 0) {
                // console.log(ret.id)
                // 将设备id传到后台
                post('login/jg', {jg_id: ret.id}).then(res=>{})
            }
        });
    });
    //监听状态栏上消息被点击的事件
    			api.addEventListener({
    				name: 'appintent'
    			}, function(ret, err) {
            // alert(JSON.stringify(ret.appParam.ajpush.extra.tongzhi))
            //判断通知栏内容是通知 还是 转出成功
            // 通知
            if(ret.appParam.ajpush.extra.tongzhi){
              openWin('notice', false, {data: ret.appParam.ajpush.extra.tongzhi, type: 1});
            } else {
              openWin1('putili', true);
            }
            // 转出
            // if(ret.appParam.ajpush.extra.tongzhi){
            //   openWin1('putili', true);
            // }
    			});
    // api.addEventListener({
    //     name: 'pause'
    // }, function(ret, err) {
    //     onPause(); //监听应用进入后台，通知jpush暂停事件
    // });
    //
    // api.addEventListener({
    //     name: 'resume'
    // }, function(ret, err) {
    //     onResume(); //监听应用恢复到前台，通知jpush恢复事件
    // });
}

//统计-app恢复
// function onResume() {
//     jpush.onResume();
//     console.log('JPush onResume');
// }
//
// //统计-app暂停
// function onPause() {
//     jpush.onPause();
//     console.log('JPush onPause');
// }
