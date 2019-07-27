function uploadHeadPic(valueId,imgId) {
        // var _this = this;
         api.actionSheet({
             title : '上传照片',
             cancelTitle : '取消',
             buttons : ['拍照', '手机相册']
         }, function(ret, err) {
             if (ret) {
                 if (ret.buttonIndex == 1) {
                     api.getPicture({
                         sourceType : 'camera',
                         encodingType : 'jpg',
                         mediaValue : 'pic',
                         destinationType : 'url',
                         allowEdit : false,
                         quality : 100,
                         saveToPhotoAlbum : false
                     }, function(ret, err) {
                          alert(JSON.stringify(ret));
                         if (ret) {
                            //  saveImg(ret.data,valueId,imgId);
                         } else {
                             api.toast({
                                 msg : '图像获取失败',
                                 duration : 3000,
                                 location : 'bottom'
                             });
                         }
                     });
                 } else if (ret.buttonIndex == 2) {
                     //手机相册选图片
                     api.getPicture({
                         sourceType : 'library',
                         encodingType : 'png',
                         mediaValue : 'pic',
                         destinationType : 'url',
                         allowEdit : true,
                         quality : 100,
                         preview:true,
                         saveToPhotoAlbum : false
                     }, function(ret, err) {
                          //  alert(JSON.stringify(ret.data));

                         if (ret) {
                          //  saveImg(ret.data,valueId,imgId);
                         } else {
                             api.toast({
                                 msg : '图像获取失败',
                                 duration : 3000,
                                 location : 'bottom'
                             });
                         }
                     });
                 }
             }
         });
     };
     //保存剪辑图像
    function saveImg(path,valueId,imgId) {
         api.showProgress({
             title: '上传中...',
             text: '先喝杯茶...',
         });
         //上传剪辑后的图像到服务器
         api.ajax({
             // report : false,
             url : URL_API + 'upload/upload/dir/images',
             //这里是我们约定好的后台上传图片的位置 ，你可以根据你的需求来改
             method : 'post',
             cache : 'false',
             timeout : 30,
             dataTpye : 'json',
             headers:{
               'token': $api.getStorage('token');
             }
             data : {
                 files : {
                     file : path
                 }
             }
         }, function(ret, err) {
              // alert(JSON.stringify(ret));
             api.hideProgress();
             if (ret.code == 1) {
               api.toast({
                   msg : ret.msg
               });
             }
             //上传进度
            //  if (ret.status == 0) {
            //      api.toast({
            //          msg : '上传错误',
            //          duration : 3000,
            //          location : 'bottom'
            //      });
            //  } else if (ret.status == 1) {
            //      $api.byId(valueId).value = ret.id;
            //      $api.byId(imgId).src = ret.path;
            //   }
         });
     };

  // 修改用户名
